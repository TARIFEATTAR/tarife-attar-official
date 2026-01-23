#!/usr/bin/env node
/**
 * Cleanup Terra Territory - Remove Incorrect Products
 * 
 * Removes 21 products that were incorrectly synced from Shopify into Terra territory.
 * These are all shopifyProduct-* IDs that don't belong in Atlas.
 * 
 * Keeps only: HAVANA, MARRAKESH, ONYX, REGALIA, RIYADH, SICILY
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

const CORRECT_TERRA_PRODUCTS = ['havana', 'marrakesh', 'onyx', 'regalia', 'riyadh', 'sicily'];

function normalizeTitle(title) {
    return title
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

const isDryRun = process.argv.includes('--dry-run');

async function cleanupTerra() {
    console.log('\n🧹 CLEANUP TERRA TERRITORY\n');
    console.log(isDryRun ? '📋 DRY RUN MODE (no changes will be made)\n' : '🚀 LIVE MODE - Will delete products!\n');
    console.log('═'.repeat(70));

    // Fetch all Terra products
    const terraProducts = await client.fetch(`
        *[_type == "product" && collectionType == "atlas" && atlasData.atmosphere == "terra" && !(_id in path("drafts.**"))] {
            _id,
            title,
            "slug": slug.current,
            shopifyProductId
        } | order(title asc)
    `);

    console.log(`\n📊 Found ${terraProducts.length} Terra products\n`);

    // Identify products to keep and delete
    const toKeep = [];
    const toDelete = [];

    terraProducts.forEach(product => {
        const normalizedSlug = normalizeTitle(product.title);
        const shouldKeep = CORRECT_TERRA_PRODUCTS.includes(normalizedSlug);
        
        if (shouldKeep) {
            toKeep.push(product);
        } else {
            toDelete.push(product);
        }
    });

    console.log(`\n✅ Products to KEEP (${toKeep.length}):`);
    toKeep.forEach(product => {
        console.log(`   - ${product.title} (${product._id})`);
    });

    console.log(`\n\n🗑️  Products to DELETE (${toDelete.length}):`);
    toDelete.forEach(product => {
        console.log(`   - ${product.title}`);
        console.log(`     ID: ${product._id}`);
        console.log(`     Slug: ${product.slug || 'N/A'}`);
        console.log(``);
    });

    if (toDelete.length === 0) {
        console.log('\n✅ No products to delete! Terra territory is already clean.');
        return;
    }

    if (!isDryRun) {
        console.log(`\n\n🗑️  Deleting ${toDelete.length} products...\n`);
        
        let deleted = 0;
        let errors = 0;
        
        for (const product of toDelete) {
            try {
                await client.delete(product._id);
                console.log(`   ✅ Deleted: ${product.title} (${product._id})`);
                deleted++;
            } catch (error) {
                console.error(`   ❌ Error deleting ${product._id}:`, error.message);
                errors++;
            }
        }
        
        console.log(`\n\n✅ Cleanup complete:`);
        console.log(`   Deleted: ${deleted}`);
        console.log(`   Errors: ${errors}`);
        console.log(`   Remaining Terra products: ${toKeep.length}`);
    } else {
        console.log(`\n\n💡 Run without --dry-run to actually delete these products.`);
    }
}

cleanupTerra().catch(console.error);
