#!/usr/bin/env node
/**
 * Remove Shopify Products from Relic Collection
 *
 * This script removes products that were incorrectly synced
 * from Shopify into the Relic collection.
 *
 * Run audit-relic-products.mjs first to see what will be affected.
 *
 * Usage:
 *   SANITY_WRITE_TOKEN=your_token node scripts/remove-relic-shopify.mjs
 *
 * Options:
 *   --dry-run    Show what would be deleted without actually deleting
 *   --delete     Actually delete the products (default: changes to atlas)
 */

import { createClient } from '@sanity/client';

const token = process.env.SANITY_WRITE_TOKEN;
if (!token) {
    console.error('❌ SANITY_WRITE_TOKEN environment variable is required');
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
const shouldDelete = process.argv.includes('--delete');

async function main() {
    console.log('🔍 Finding Shopify products in Relic collection...\n');

    // Find all Shopify-synced products that are incorrectly in Relic
    const shopifyRelicProducts = await client.fetch(
        `*[_type == "product" && collectionType == "relic" && _id match "shopifyProduct-*"] {
            _id,
            title,
            internalName,
            productFormat
        }`
    );

    if (shopifyRelicProducts.length === 0) {
        console.log('✅ No Shopify products found in Relic collection. All good!');
        return;
    }

    console.log(`Found ${shopifyRelicProducts.length} Shopify product(s) in Relic:\n`);
    shopifyRelicProducts.forEach(p => {
        console.log(`   • ${p.title} (${p._id})`);
    });
    console.log('');

    if (isDryRun) {
        console.log('🔸 DRY RUN - No changes made');
        console.log('\nTo apply changes, run without --dry-run flag');
        return;
    }

    if (shouldDelete) {
        // DELETE the products entirely
        console.log('🗑️  DELETING products...\n');
        for (const product of shopifyRelicProducts) {
            try {
                await client.delete(product._id);
                console.log(`   ✅ Deleted: ${product.title}`);
            } catch (err) {
                console.error(`   ❌ Failed to delete ${product.title}:`, err.message);
            }
        }
    } else {
        // MOVE to Atlas collection (safer option)
        console.log('📦 Moving products to Atlas collection...\n');
        for (const product of shopifyRelicProducts) {
            try {
                await client
                    .patch(product._id)
                    .set({ collectionType: 'atlas' })
                    .unset(['relicData']) // Remove relic-specific data
                    .commit();
                console.log(`   ✅ Moved to Atlas: ${product.title}`);
            } catch (err) {
                console.error(`   ❌ Failed to move ${product.title}:`, err.message);
            }
        }
    }

    console.log('\n📊 Verifying counts...');
    const counts = await client.fetch(`{
        "atlas": count(*[_type == "product" && collectionType == "atlas"]),
        "relic": count(*[_type == "product" && collectionType == "relic"]),
        "total": count(*[_type == "product"])
    }`);

    console.log(`   Atlas: ${counts.atlas}`);
    console.log(`   Relic: ${counts.relic}`);
    console.log(`   Total: ${counts.total}`);
    console.log('\n✅ Done!');
}

main().catch(console.error);
