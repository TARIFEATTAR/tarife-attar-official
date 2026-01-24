#!/usr/bin/env node
/**
 * Cleanup Relic Collection - Remove Incorrectly Synced Products
 * 
 * Removes products that were accidentally synced from Shopify into the Relic collection.
 * These include products like "Shamamatul Amber", "TARIFE ATTAR GIFT CARD", "Teeb Musk", 
 * "White Amber", etc. that don't belong in the Relic collection.
 * 
 * Keeps only the correct Relic products:
 * - Kashmiri Saffron
 * - Mukhallat Emirates
 * - Majmua Attar
 * - Hojari Frankincense & Yemeni Myrrh
 * - Royal Green Frankincense
 * - Aged Mysore Sandalwood
 * - Wild Vetiver (Ruh Khus)
 */

import { createClient } from '@sanity/client';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

function loadEnvFile(filePath) {
    try {
        const content = readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const [key, ...valueParts] = trimmed.split('=');
                if (key && valueParts.length > 0) {
                    const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
                    process.env[key.trim()] = value;
                }
            }
        }
    } catch (err) {
        // File doesn't exist, that's okay
    }
}

loadEnvFile(join(projectRoot, '.env.local'));
loadEnvFile(join(projectRoot, '.env'));

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    useCdn: false,
    apiVersion: '2024-01-01',
    token: process.env.SANITY_WRITE_TOKEN,
});

// Correct Relic products (from RELIC_PRODUCTS in sync-shopify-to-atlas.mjs)
// Map of title variations and slugs to identify correct Relic products
const CORRECT_RELIC_PRODUCTS = {
    titles: [
        'Kashmiri Saffron',
        'KASHMIRI SAFFRON',
        'Mukhallat Emirates',
        'MUKHALLAT',
        'Majmua Attar',
        'MAJMUA',
        'Hojari Frankincense & Yemeni Myrrh',
        'SACRED HOJARI',
        'Royal Green Frankincense',
        'Aged Mysore Sandalwood',
        'Wild Vetiver (Ruh Khus)',
    ],
    slugs: [
        'kashmiri-saffron',
        'mukhallat-emirates',
        'mukhallat',
        'majmua-attar',
        'majmua',
        'hojari-frankincense-yemeni-myrrh',
        'sacred-hojari',
        'royal-green-frankincense',
        'aged-mysore-sandalwood',
        'wild-vetiver-ruh-khus',
    ],
};

function normalizeTitle(title) {
    return title
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ');
}

function normalizeSlug(slug) {
    return slug
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-');
}

const isDryRun = process.argv.includes('--dry-run');

async function cleanupRelic() {
    console.log('\n🧹 CLEANUP RELIC COLLECTION\n');
    console.log(isDryRun ? '📋 DRY RUN MODE (no changes will be made)\n' : '🚀 LIVE MODE - Will delete products!\n');
    console.log('═'.repeat(70));

    // Fetch all Relic products
    const relicProducts = await client.fetch(`
        *[_type == "product" && collectionType == "relic" && !(_id in path("drafts.**"))] {
            _id,
            title,
            "slug": slug.current,
            shopifyProductId,
            "shopifyTitle": store.title
        } | order(title asc)
    `);

    console.log(`\n📊 Found ${relicProducts.length} Relic products\n`);

    // Identify products to keep and delete
    const toKeep = [];
    const toDelete = [];

    relicProducts.forEach(product => {
        // Check both title and shopifyTitle
        const productTitle = product.title || product.shopifyTitle || '';
        const normalizedTitle = normalizeTitle(productTitle);
        const normalizedSlug = normalizeSlug(product.slug || '');
        
        // Check if this is a correct Relic product by title or slug
        const matchesTitle = CORRECT_RELIC_PRODUCTS.titles.some(correct => 
            normalizeTitle(correct) === normalizedTitle
        );
        const matchesSlug = CORRECT_RELIC_PRODUCTS.slugs.some(correct => 
            normalizeSlug(correct) === normalizedSlug
        );
        
        if (matchesTitle || matchesSlug) {
            toKeep.push(product);
        } else {
            toDelete.push(product);
        }
    });

    console.log(`\n✅ Products to KEEP (${toKeep.length}):`);
    toKeep.forEach(product => {
        const displayTitle = product.title || product.shopifyTitle || 'Untitled';
        console.log(`   - ${displayTitle} (${product._id})`);
    });

    console.log(`\n\n🗑️  Products to DELETE (${toDelete.length}):`);
    toDelete.forEach(product => {
        const displayTitle = product.title || product.shopifyTitle || 'Untitled';
        console.log(`   - ${displayTitle}`);
        console.log(`     ID: ${product._id}`);
        console.log(`     Slug: ${product.slug || 'N/A'}`);
        if (product.shopifyProductId) {
            console.log(`     Shopify ID: ${product.shopifyProductId}`);
        }
        console.log(``);
    });

    if (toDelete.length === 0) {
        console.log('\n✅ No products to delete! Relic collection is already clean.');
        return;
    }

    if (!isDryRun) {
        if (!process.env.SANITY_WRITE_TOKEN) {
            console.error('\n❌ ERROR: SANITY_WRITE_TOKEN is required!');
            console.error('   Set it as an environment variable:');
            console.error('   SANITY_WRITE_TOKEN=<your_token> node scripts/fix-relic-collection.mjs');
            console.error('\n   Get your token from: https://www.sanity.io/manage/project/8h5l91ut/api#tokens');
            process.exit(1);
        }

        console.log(`\n\n🗑️  Deleting ${toDelete.length} products...\n`);
        
        let deleted = 0;
        let errors = 0;
        
        for (const product of toDelete) {
            try {
                await client.delete(product._id);
                const displayTitle = product.title || product.shopifyTitle || 'Untitled';
                console.log(`   ✅ Deleted: ${displayTitle} (${product._id})`);
                deleted++;
            } catch (error) {
                console.error(`   ❌ Error deleting ${product._id}:`, error.message);
                errors++;
            }
        }
        
        console.log(`\n\n✅ Cleanup complete:`);
        console.log(`   Deleted: ${deleted}`);
        console.log(`   Errors: ${errors}`);
        console.log(`   Remaining Relic products: ${toKeep.length}`);
    } else {
        console.log(`\n\n💡 Run without --dry-run to actually delete these products:`);
        console.log(`   SANITY_WRITE_TOKEN=<your_token> node scripts/fix-relic-collection.mjs`);
    }
}

cleanupRelic().catch(console.error);
