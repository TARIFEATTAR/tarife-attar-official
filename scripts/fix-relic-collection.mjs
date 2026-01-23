#!/usr/bin/env node
/**
 * Fix Relic Collection - Delete Incorrect Shopify Products
 *
 * These products were accidentally pushed from Shopify into the Relic collection.
 * They are legacy/discontinued products that should NOT be in Relic.
 * Atlas already has the correct 26 products - we're only deleting from Relic.
 *
 * Usage:
 *   SANITY_WRITE_TOKEN=your_token node scripts/fix-relic-collection.mjs
 *
 * Options:
 *   --dry-run    Preview what will be deleted without actually deleting
 */

import { createClient } from '@sanity/client';

const token = process.env.SANITY_WRITE_TOKEN;
if (!token) {
    console.error('❌ SANITY_WRITE_TOKEN environment variable is required');
    console.error('   Get your token from: https://www.sanity.io/manage/project/8h5l91ut/api#tokens');
    process.exit(1);
}

const client = createClient({
    projectId: '8h5l91ut',
    dataset: 'production',
    apiVersion: '2025-12-31',
    token,
    useCdn: false,
});

const isDryRun = process.argv.includes('--dry-run');

async function main() {
    console.log('🔧 Fixing Relic Collection - Deleting Incorrect Products\n');

    // Get all products currently in Relic
    const relicProducts = await client.fetch(
        `*[_type == "product" && collectionType == "relic"] {
            _id,
            title,
            internalName,
            productFormat,
            inStock,
            "isShopifyProduct": _id match "shopifyProduct-*"
        }`
    );

    if (relicProducts.length === 0) {
        console.log('✅ Relic collection is already empty. Nothing to delete.');
        return;
    }

    console.log(`Found ${relicProducts.length} product(s) in Relic collection:\n`);
    relicProducts.forEach(p => {
        const tag = p.isShopifyProduct ? '🛒 Shopify' : '📝 Manual';
        console.log(`   ${tag} ${p.title}`);
        console.log(`      ID: ${p._id}`);
        console.log(`      In Stock: ${p.inStock ? 'Yes' : 'No'}`);
        console.log('');
    });

    console.log('=== ACTION: DELETE ALL RELIC PRODUCTS ===\n');

    if (isDryRun) {
        console.log('🔸 DRY RUN - No changes made');
        console.log(`\n   Would delete ${relicProducts.length} product(s)`);
        console.log('\nTo apply changes, run without --dry-run flag:');
        console.log('   SANITY_WRITE_TOKEN=your_token node scripts/fix-relic-collection.mjs');
        return;
    }

    // Confirm before deleting
    console.log(`⚠️  About to DELETE ${relicProducts.length} product(s) from Relic collection.\n`);

    // Delete all Relic products
    console.log('🗑️  Deleting products...\n');
    let deleted = 0;
    let failed = 0;

    for (const product of relicProducts) {
        try {
            await client.delete(product._id);
            console.log(`   ✅ Deleted: ${product.title}`);
            deleted++;
        } catch (err) {
            console.error(`   ❌ Failed to delete ${product.title}:`, err.message);
            failed++;
        }
    }

    // Verify final counts
    console.log('\n📊 Final counts...');
    const counts = await client.fetch(`{
        "atlas": count(*[_type == "product" && collectionType == "atlas"]),
        "relic": count(*[_type == "product" && collectionType == "relic"]),
        "total": count(*[_type == "product"])
    }`);

    console.log(`   Atlas: ${counts.atlas}`);
    console.log(`   Relic: ${counts.relic}`);
    console.log(`   Total: ${counts.total}`);

    console.log(`\n✅ Done! Deleted ${deleted} product(s), ${failed} failed.`);
    console.log('   Refresh your Relic page to verify the changes.');
}

main().catch(console.error);
