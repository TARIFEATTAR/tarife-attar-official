#!/usr/bin/env node
/**
 * Identify Extra Atlas Products
 * 
 * Lists all 28 products and identifies which ones are NOT in the official 24 list.
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

const OFFICIAL_PRODUCTS = [
    // Ember
    'Honey Oudh', 'Granada Amber', 'Vanilla Sands', 'Teeb Musk', 'White Musk', 'Dubai Musk',
    // Tidal
    'Himalyan Musk', 'Blue Oudh', 'Del Mare', 'Peach Memoir', 'Dubai Musk', 'China Rain',
    // Petal
    'Turkish Rose', 'Arabian Jasmine', 'Mukhallat Shifa', 'Sandalwood Rose', 'Oudh & Lavender', 'White Egyptian Musk',
    // Terra
    'Black Musk', 'Frankincense & Myrrh', 'Oudh & Tobacco', 'Moroccan Leather', 'Majmua', 'Wild Wood Forest'
];

async function main() {
    console.log('🔍 Auditing Atlas Products...');

    const products = await client.fetch(
        `*[_type == "product" && collectionType == "atlas"] { _id, title, atlasData }`
    );

    console.log(`Total Atlas Products: ${products.length}`);
    console.log('');

    const extras = [];
    const official = [];

    for (const p of products) {
        // Check if title is in official list
        // (Note: partial matching might be safer if spelling differs slighty)
        const isOfficial = OFFICIAL_PRODUCTS.some(op => op.toLowerCase() === p.title.toLowerCase());

        if (isOfficial) {
            official.push(p);
        } else {
            extras.push(p);
        }
    }

    console.log('--- EXTRA PRODUCTS (Not in official list) ---');
    extras.forEach(p => {
        console.log(`❌ ${p.title} (${p._id}) - Territory: ${p.atlasData?.atmosphere || 'none'}`);
    });
    console.log('');

    console.log('--- OFFICIAL PRODUCTS FOUND ---');
    console.log(`Count: ${official.length} / ${OFFICIAL_PRODUCTS.length}`);
    console.log('');

    if (extras.length > 0) {
        console.log(`To delete extras, run:`);
        console.log(`node scripts/delete-extras.mjs`);
    }
}

main().catch(console.error);
