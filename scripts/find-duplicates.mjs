#!/usr/bin/env node
/**
 * Find Duplicate Products in Sanity
 * 
 * Identifies duplicate products by:
 * - Same title
 * - Same slug
 * - Same Shopify Product ID
 * - Same Shopify Handle
 */

import { createClient } from '@sanity/client';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env.local
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

async function findDuplicates() {
    console.log('🔍 Searching for duplicate products...\n');

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
            internalName
        } | order(title asc)
    `);

    console.log(`Found ${products.length} total products\n`);

    // Find duplicates by title
    const duplicatesByTitle = new Map();
    products.forEach(product => {
        if (product.title) {
            const key = product.title.toLowerCase().trim();
            if (!duplicatesByTitle.has(key)) {
                duplicatesByTitle.set(key, []);
            }
            duplicatesByTitle.get(key).push(product);
        }
    });

    // Find duplicates by slug
    const duplicatesBySlug = new Map();
    products.forEach(product => {
        if (product.slug) {
            const key = product.slug.toLowerCase().trim();
            if (!duplicatesBySlug.has(key)) {
                duplicatesBySlug.set(key, []);
            }
            duplicatesBySlug.get(key).push(product);
        }
    });

    // Find duplicates by Shopify Product ID
    const duplicatesByShopifyId = new Map();
    products.forEach(product => {
        if (product.shopifyProductId) {
            const key = product.shopifyProductId;
            if (!duplicatesByShopifyId.has(key)) {
                duplicatesByShopifyId.set(key, []);
            }
            duplicatesByShopifyId.get(key).push(product);
        }
    });

    // Find duplicates by Shopify Handle
    const duplicatesByHandle = new Map();
    products.forEach(product => {
        if (product.shopifyHandle) {
            const key = product.shopifyHandle.toLowerCase().trim();
            if (!duplicatesByHandle.has(key)) {
                duplicatesByHandle.set(key, []);
            }
            duplicatesByHandle.get(key).push(product);
        }
    });

    // Report duplicates
    let hasDuplicates = false;

    // By Title
    console.log('📋 Duplicates by Title:');
    duplicatesByTitle.forEach((dups, title) => {
        if (dups.length > 1) {
            hasDuplicates = true;
            console.log(`\n  "${title}" (${dups.length} duplicates):`);
            dups.forEach(dup => {
                console.log(`    - ${dup._id}`);
                console.log(`      Title: ${dup.title}`);
                console.log(`      Slug: ${dup.slug || 'N/A'}`);
                console.log(`      Collection: ${dup.collectionType || 'N/A'}`);
                console.log(`      Shopify ID: ${dup.shopifyProductId || 'N/A'}`);
            });
        }
    });

    // By Slug
    console.log('\n\n📋 Duplicates by Slug:');
    duplicatesBySlug.forEach((dups, slug) => {
        if (dups.length > 1) {
            hasDuplicates = true;
            console.log(`\n  "${slug}" (${dups.length} duplicates):`);
            dups.forEach(dup => {
                console.log(`    - ${dup._id}`);
                console.log(`      Title: ${dup.title || 'N/A'}`);
                console.log(`      Slug: ${dup.slug}`);
                console.log(`      Collection: ${dup.collectionType || 'N/A'}`);
                console.log(`      Shopify ID: ${dup.shopifyProductId || 'N/A'}`);
            });
        }
    });

    // By Shopify Product ID
    console.log('\n\n📋 Duplicates by Shopify Product ID:');
    duplicatesByShopifyId.forEach((dups, shopifyId) => {
        if (dups.length > 1) {
            hasDuplicates = true;
            console.log(`\n  "${shopifyId}" (${dups.length} duplicates):`);
            dups.forEach(dup => {
                console.log(`    - ${dup._id}`);
                console.log(`      Title: ${dup.title || 'N/A'}`);
                console.log(`      Slug: ${dup.slug || 'N/A'}`);
                console.log(`      Collection: ${dup.collectionType || 'N/A'}`);
            });
        }
    });

    // By Shopify Handle
    console.log('\n\n📋 Duplicates by Shopify Handle:');
    duplicatesByHandle.forEach((dups, handle) => {
        if (dups.length > 1) {
            hasDuplicates = true;
            console.log(`\n  "${handle}" (${dups.length} duplicates):`);
            dups.forEach(dup => {
                console.log(`    - ${dup._id}`);
                console.log(`      Title: ${dup.title || 'N/A'}`);
                console.log(`      Slug: ${dup.slug || 'N/A'}`);
                console.log(`      Collection: ${dup.collectionType || 'N/A'}`);
            });
        }
    });

    if (!hasDuplicates) {
        console.log('\n✅ No duplicates found!');
    } else {
        console.log('\n\n⚠️  Duplicates detected! Review the above and decide which records to keep.');
    }
}

findDuplicates().catch(console.error);
