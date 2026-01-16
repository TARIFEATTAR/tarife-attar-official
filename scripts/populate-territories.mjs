#!/usr/bin/env node
/**
 * Sanity Product Population Script
 * 
 * Creates 24 Atlas products with territory assignments.
 * Run with: node scripts/populate-territories.mjs
 * 
 * IMPORTANT: Set SANITY_WRITE_TOKEN environment variable before running.
 * Get a write token from: https://www.sanity.io/manage/project/<projectId>/api
 */

import { createClient } from '@sanity/client';

// Sanity configuration - HARDCODED from sanity.config.ts
const projectId = '8h5l91ut';
const dataset = 'production';
const apiVersion = '2025-12-31';

// Write token must be provided via environment variable
const token = process.env.SANITY_WRITE_TOKEN;

if (!token) {
    console.error('❌ ERROR: SANITY_WRITE_TOKEN environment variable is required.');
    console.error('');
    console.error('Get a write token from:');
    console.error(`https://www.sanity.io/manage/project/${projectId}/api`);
    console.error('');
    console.error('Then run:');
    console.error('SANITY_WRITE_TOKEN=your-token-here node scripts/populate-territories.mjs');
    process.exit(1);
}

const client = createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
});

// Product definitions by territory
const PRODUCTS = {
    ember: [
        { name: 'Honey Oudh', internal: 'HONEY-OUDH' },
        { name: 'Granada Amber', internal: 'GRANADA-AMBER' },
        { name: 'Vanilla Sands', internal: 'VANILLA-SANDS' },
        { name: 'Teeb Musk', internal: 'TEEB-MUSK' },
        { name: 'White Musk', internal: 'WHITE-MUSK' },
        { name: 'Dubai Musk', internal: 'DUBAI-MUSK-EMBER' },
    ],
    tidal: [
        { name: 'Himalyan Musk', internal: 'HIMALYAN-MUSK' },
        { name: 'Blue Oudh', internal: 'BLUE-OUDH' },
        { name: 'Del Mare', internal: 'DEL-MARE' },
        { name: 'Peach Memoir', internal: 'PEACH-MEMOIR' },
        { name: 'Dubai Musk', internal: 'DUBAI-MUSK-TIDAL' },
        { name: 'China Rain', internal: 'CHINA-RAIN' },
    ],
    petal: [
        { name: 'Turkish Rose', internal: 'TURKISH-ROSE' },
        { name: 'Arabian Jasmine', internal: 'ARABIAN-JASMINE' },
        { name: 'Mukhallat Shifa', internal: 'MUKHALLAT-SHIFA' },
        { name: 'Sandalwood Rose', internal: 'SANDALWOOD-ROSE' },
        { name: 'Oudh & Lavender', internal: 'OUDH-LAVENDER' },
        { name: 'White Egyptian Musk', internal: 'WHITE-EGYPTIAN-MUSK' },
    ],
    terra: [
        { name: 'Black Musk', internal: 'BLACK-MUSK' },
        { name: 'Frankincense & Myrrh', internal: 'FRANKINCENSE-MYRRH' },
        { name: 'Oudh & Tobacco', internal: 'OUDH-TOBACCO' },
        { name: 'Moroccan Leather', internal: 'MOROCCAN-LEATHER' },
        { name: 'Majmua', internal: 'MAJMUA' },
        { name: 'Wild Wood Forest', internal: 'WILD-WOOD-FOREST' },
    ],
};

// Helper to create a slug from product name
function createSlug(name) {
    return name
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

// Create a single product document
function createProductDocument(product, territory) {
    return {
        _type: 'product',
        _id: `product-${product.internal.toLowerCase()}`,
        collectionType: 'atlas',
        internalName: product.internal,
        title: product.name,
        slug: {
            _type: 'slug',
            current: createSlug(product.name),
        },
        atlasData: {
            atmosphere: territory,
        },
        productFormat: 'Perfume Oil',
        inStock: true,
        generationSource: 'manual',
    };
}

async function main() {
    console.log('🌿 Tarife Attär - Territory Product Population');
    console.log('================================================');
    console.log(`Project: ${projectId}`);
    console.log(`Dataset: ${dataset}`);
    console.log('');

    const allProducts = [];

    // Build all product documents
    for (const [territory, products] of Object.entries(PRODUCTS)) {
        console.log(`📍 ${territory.toUpperCase()} territory: ${products.length} products`);
        for (const product of products) {
            allProducts.push(createProductDocument(product, territory));
        }
    }

    console.log('');
    console.log(`📦 Total products to create: ${allProducts.length}`);
    console.log('');

    // Create products using transaction
    const transaction = client.transaction();

    for (const productDoc of allProducts) {
        // Use createOrReplace to update if exists
        transaction.createOrReplace(productDoc);
    }

    try {
        console.log('⏳ Creating products in Sanity...');
        const result = await transaction.commit();
        console.log('');
        console.log('✅ SUCCESS! All products created.');
        console.log('');
        console.log('📋 Summary:');
        console.log(`   - Ember: 6 products`);
        console.log(`   - Tidal: 6 products`);
        console.log(`   - Petal: 6 products`);
        console.log(`   - Terra: 6 products`);
        console.log('');
        console.log('🔗 Next Steps:');
        console.log('   1. Open Sanity Studio: npm run dev → http://localhost:3000/studio');
        console.log('   2. Navigate to "Products" → "The Atlas (Voyage)"');
        console.log('   3. Click "Publish" on each product to make them live');
        console.log('   4. Link Shopify Variant IDs for cart functionality');
        console.log('');
    } catch (error) {
        console.error('❌ ERROR:', error.message);
        if (error.details) {
            console.error('Details:', JSON.stringify(error.details, null, 2));
        }
        process.exit(1);
    }
}

main();
