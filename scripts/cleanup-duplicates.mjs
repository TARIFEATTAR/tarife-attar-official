#!/usr/bin/env node
/**
 * Cleanup Duplicate Products in Sanity
 * 
 * Removes duplicate products, keeping the best version:
 * - Prefers products with proper IDs (product-*) over shopifyProduct-*
 * - Keeps published over drafts
 * - Keeps products with more complete data
 * 
 * Usage:
 *   node scripts/cleanup-duplicates.mjs --dry-run    # List what would be deleted
 *   node scripts/cleanup-duplicates.mjs              # Actually delete
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

const isDryRun = process.argv.includes('--dry-run');

function scoreProduct(product) {
    let score = 0;
    
    // Prefer products with proper IDs (product-*) over shopifyProduct-*
    if (product._id.startsWith('product-') && !product._id.startsWith('shopifyProduct-')) {
        score += 100;
    }
    
    // Prefer published over drafts
    if (!product._id.startsWith('drafts.')) {
        score += 50;
    }
    
    // Prefer products with more complete data
    if (product.slug) score += 10;
    if (product.title) score += 10;
    if (product.collectionType) score += 10;
    if (product.shopifyProductId) score += 5;
    if (product.shopifyHandle) score += 5;
    
    return score;
}

async function cleanupDuplicates() {
    console.log('\n🧹 CLEANUP DUPLICATE PRODUCTS\n');
    console.log(isDryRun ? '📋 DRY RUN MODE (no changes will be made)\n' : '🚀 LIVE MODE - Will delete duplicates!\n');
    console.log('═'.repeat(70));

    // Fetch all products
    const products = await client.fetch(`
        *[_type == "product"] {
            _id,
            _rev,
            title,
            "slug": slug.current,
            shopifyProductId,
            shopifyHandle,
            collectionType,
            internalName,
            mainImage,
            _createdAt
        }
    `);

    console.log(`\n📊 Found ${products.length} total products\n`);

    // Group by title (case-insensitive)
    const byTitle = new Map();
    products.forEach(product => {
        if (product.title) {
            const key = product.title.toLowerCase().trim();
            if (!byTitle.has(key)) {
                byTitle.set(key, []);
            }
            byTitle.get(key).push(product);
        }
    });

    // Find duplicates
    const duplicates = [];
    byTitle.forEach((group, title) => {
        if (group.length > 1) {
            // Sort by score (highest first)
            group.sort((a, b) => scoreProduct(b) - scoreProduct(a));
            
            // Keep the best one, mark others for deletion
            const keep = group[0];
            const remove = group.slice(1);
            
            duplicates.push({
                title,
                keep,
                remove,
            });
        }
    });

    console.log(`\n🔍 Found ${duplicates.length} sets of duplicates\n`);

    if (duplicates.length === 0) {
        console.log('✅ No duplicates found!');
        return;
    }

    // Show what will be kept/removed
    let totalToDelete = 0;
    duplicates.forEach(({ title, keep, remove }) => {
        console.log(`\n📦 "${title}" (${1 + remove.length} total):`);
        console.log(`   ✅ KEEP: ${keep._id}`);
        console.log(`      - Title: ${keep.title}`);
        console.log(`      - Slug: ${keep.slug || 'N/A'}`);
        console.log(`      - Collection: ${keep.collectionType || 'N/A'}`);
        remove.forEach(dup => {
            console.log(`   🗑️  DELETE: ${dup._id}`);
            console.log(`      - Title: ${dup.title}`);
            console.log(`      - Slug: ${dup.slug || 'N/A'}`);
            console.log(`      - Collection: ${dup.collectionType || 'N/A'}`);
            totalToDelete++;
        });
    });

    console.log(`\n\n📊 Summary:`);
    console.log(`   Duplicate sets: ${duplicates.length}`);
    console.log(`   Products to delete: ${totalToDelete}`);
    console.log(`   Products to keep: ${duplicates.length}`);

    if (!isDryRun && totalToDelete > 0) {
        console.log(`\n\n🗑️  Deleting ${totalToDelete} duplicate products...\n`);
        
        let deleted = 0;
        let errors = 0;
        
        for (const { remove } of duplicates) {
            for (const product of remove) {
                try {
                    await client.delete(product._id);
                    console.log(`   ✅ Deleted: ${product._id}`);
                    deleted++;
                } catch (error) {
                    console.error(`   ❌ Error deleting ${product._id}:`, error.message);
                    errors++;
                }
            }
        }
        
        console.log(`\n\n✅ Cleanup complete:`);
        console.log(`   Deleted: ${deleted}`);
        console.log(`   Errors: ${errors}`);
    } else if (isDryRun) {
        console.log(`\n\n💡 Run without --dry-run to actually delete these duplicates.`);
    }
}

cleanupDuplicates().catch(console.error);
