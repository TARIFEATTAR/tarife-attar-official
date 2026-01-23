#!/usr/bin/env node
/**
 * Audit Relic Collection Products
 *
 * Lists all products in the Relic collection and identifies
 * which ones might be Shopify-synced products that don't belong.
 */

import { createClient } from '@sanity/client';

const token = process.env.SANITY_WRITE_TOKEN;
const client = createClient({
    projectId: '8h5l91ut',
    dataset: 'production',
    apiVersion: '2025-12-31',
    token,
    useCdn: false,
});

async function main() {
    console.log('🔍 Auditing Relic Collection Products...\n');

    const products = await client.fetch(
        `*[_type == "product" && collectionType == "relic"] | order(title asc) {
            _id,
            title,
            internalName,
            productFormat,
            inStock,
            "hasRelicData": defined(relicData),
            "distillationYear": relicData.distillationYear,
            "originRegion": relicData.originRegion,
            "viscosity": relicData.viscosity,
            "isShopifyProduct": _id match "shopifyProduct-*"
        }`
    );

    console.log(`Total Relic Products: ${products.length}\n`);

    // Separate into categories
    const shopifyProducts = products.filter(p => p.isShopifyProduct);
    const manualProducts = products.filter(p => !p.isShopifyProduct);

    console.log('=== SHOPIFY-SYNCED PRODUCTS (likely don\'t belong) ===');
    if (shopifyProducts.length === 0) {
        console.log('   None found ✅\n');
    } else {
        shopifyProducts.forEach(p => {
            console.log(`❌ ${p.title}`);
            console.log(`   ID: ${p._id}`);
            console.log(`   Format: ${p.productFormat || 'not set'}`);
            console.log(`   Has Relic Data: ${p.hasRelicData ? 'Yes' : 'No'}`);
            console.log('');
        });
    }

    console.log('=== MANUAL/LEGITIMATE RELIC PRODUCTS ===');
    if (manualProducts.length === 0) {
        console.log('   None found\n');
    } else {
        manualProducts.forEach(p => {
            console.log(`✅ ${p.title}`);
            console.log(`   ID: ${p._id}`);
            console.log(`   Format: ${p.productFormat || 'not set'}`);
            console.log(`   Origin: ${p.originRegion || 'not set'}`);
            console.log(`   Year: ${p.distillationYear || 'not set'}`);
            console.log(`   Viscosity: ${p.viscosity ?? 'not set'}`);
            console.log('');
        });
    }

    // Summary
    console.log('=== SUMMARY ===');
    console.log(`Total Relic Products: ${products.length}`);
    console.log(`Shopify-synced (to review): ${shopifyProducts.length}`);
    console.log(`Manual/Legitimate: ${manualProducts.length}`);

    if (shopifyProducts.length > 0) {
        console.log('\n⚠️  The Shopify-synced products above likely don\'t belong in Relic.');
        console.log('   They may have been accidentally assigned collectionType: "relic"');
        console.log('\n   To remove them, you can either:');
        console.log('   1. Change their collectionType to "atlas" in Sanity Studio');
        console.log('   2. Delete them if they\'re duplicates');
        console.log('\n   Run: node scripts/remove-relic-shopify.mjs');
    }
}

main().catch(console.error);
