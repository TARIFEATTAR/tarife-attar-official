#!/usr/bin/env node

/**
 * Fix Incomplete Products
 * 
 * Options:
 * 1. DELETE incomplete Shopify products (recommended for legacy products)
 * 2. FIX them by adding default values (if they should be kept)
 * 
 * Usage:
 *   node scripts/fix-incomplete-products.mjs --dry-run    # Preview what will be deleted/fixed
 *   node scripts/fix-incomplete-products.mjs --delete    # Delete incomplete products
 *   node scripts/fix-incomplete-products.mjs --fix       # Fix by adding default values (NOT RECOMMENDED)
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
                    const value = valueParts.join('=').replace(/^["']|["']$/g, '');
                    process.env[key.trim()] = value.trim();
                }
            }
        }
    } catch (e) {
        // File doesn't exist, that's okay
    }
}

loadEnvFile(join(projectRoot, '.env'));
loadEnvFile(join(projectRoot, '.env.local'));

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
    token: process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_WRITE_TOKEN,
    useCdn: false,
});

async function findIncompleteProducts() {
    console.log('🔍 Finding incomplete products...\n');

    const products = await client.fetch(`
        *[_type == "product" && (
            !defined(title) || 
            !defined(internalName) || 
            !defined(collectionType)
        )] {
            _id,
            title,
            internalName,
            collectionType,
            shopifyHandle,
            shopifyProductId,
            "store": store.title,
            "isShopifyProduct": _id match "shopifyProduct-*",
            "missingFields": {
                "title": !defined(title),
                "internalName": !defined(internalName),
                "collectionType": !defined(collectionType)
            }
        }
    `);

    return products;
}

async function checkIfUsedInQueries(productIds) {
    console.log('🔍 Checking if products are used in any queries...\n');

    // Check if they appear in published products queries
    const usedProducts = await client.fetch(`
        *[_type == "product" && 
          _id in $productIds && 
          !(_id in path("drafts.**")) &&
          defined(collectionType) &&
          collectionType in ["atlas", "relic"]
        ] {
            _id,
            title,
            collectionType
        }
    `, { productIds });

    return usedProducts;
}

async function deleteIncompleteProducts(products, dryRun = true) {
    console.log(`\n${dryRun ? '🔍 DRY RUN: Would delete' : '🗑️  Deleting'} ${products.length} incomplete products...\n`);

    let deleted = 0;
    let errors = 0;

    for (const product of products) {
        try {
            if (dryRun) {
                console.log(`   Would delete: ${product._id}${product.store ? ` (${product.store})` : ''}`);
            } else {
                await client.delete(product._id);
                console.log(`   ✅ Deleted: ${product._id}${product.store ? ` (${product.store})` : ''}`);
                deleted++;
            }
        } catch (error) {
            console.error(`   ❌ Error deleting ${product._id}:`, error.message);
            errors++;
        }
    }

    if (dryRun) {
        console.log(`\n📊 Summary: Would delete ${products.length} products`);
        console.log(`\n⚠️  To actually delete, run: node scripts/fix-incomplete-products.mjs --delete`);
    } else {
        console.log(`\n📊 Summary: Deleted ${deleted} products, ${errors} errors`);
    }
}

async function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run') || (!args.includes('--delete') && !args.includes('--fix'));
    const shouldDelete = args.includes('--delete');
    const shouldFix = args.includes('--fix');

    try {
        // Find incomplete products
        const incompleteProducts = await findIncompleteProducts();
        
        if (incompleteProducts.length === 0) {
            console.log('✅ No incomplete products found!');
            return;
        }

        console.log(`Found ${incompleteProducts.length} incomplete products:\n`);

        // Group by type
        const shopifyProducts = incompleteProducts.filter(p => p.isShopifyProduct);
        const otherProducts = incompleteProducts.filter(p => !p.isShopifyProduct);

        console.log(`📦 Shopify-synced products: ${shopifyProducts.length}`);
        console.log(`📦 Other products: ${otherProducts.length}\n`);

        // Show sample
        console.log('Sample incomplete products:');
        incompleteProducts.slice(0, 5).forEach(p => {
            console.log(`   - ${p._id}`);
            console.log(`     Missing: ${Object.entries(p.missingFields).filter(([_, v]) => v).map(([k]) => k).join(', ')}`);
            if (p.store) console.log(`     Shopify title: ${p.store}`);
            console.log('');
        });

        // Check if any are actually being used
        const productIds = incompleteProducts.map(p => p._id);
        const usedProducts = await checkIfUsedInQueries(productIds);
        
        if (usedProducts.length > 0) {
            console.log(`⚠️  WARNING: ${usedProducts.length} incomplete products are marked as published:`);
            usedProducts.forEach(p => {
                console.log(`   - ${p._id} (${p.title || 'no title'}, ${p.collectionType})`);
            });
            console.log('');
        }

        // Recommendation
        console.log('💡 Recommendation:');
        console.log('   - Shopify-synced products without required fields are likely legacy products');
        console.log('   - These should be DELETED (they\'re not on the new site anyway)');
        console.log('   - They\'re causing validation errors and build issues\n');

        // Execute action
        if (shouldDelete) {
            if (dryRun) {
                await deleteIncompleteProducts(incompleteProducts, true);
            } else {
                console.log('⚠️  This will PERMANENTLY DELETE products. Are you sure?');
                console.log('   Run with --dry-run first to preview, then remove --dry-run to execute\n');
                await deleteIncompleteProducts(incompleteProducts, false);
            }
        } else if (shouldFix) {
            console.log('⚠️  --fix option is NOT RECOMMENDED');
            console.log('   Incomplete products should be deleted, not fixed with placeholder values');
            console.log('   If you really need to fix them, do it manually in Sanity Studio\n');
        } else {
            // Default: show what would be deleted
            await deleteIncompleteProducts(incompleteProducts, true);
        }

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

main();
