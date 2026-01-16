#!/usr/bin/env node
/**
 * Delete Extra Atlas Products
 * 
 * Deletes:
 * - Havana Leaf
 * - Black Musk (with trailing space)
 * - Frankincense & Myrrh (with trailing space)
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
    console.log('🗑️  Deleting Extra Products...');

    const extras = [
        'shopifyProduct-10002039472410', // Havana Leaf
        'shopifyProduct-10002040324378', // Black Musk 
        'shopifyProduct-10002044223770'  // Frankincense & Myrrh 
    ];

    for (const id of extras) {
        try {
            await client.delete(id);
            console.log(`   ✅ Deleted ${id}`);
        } catch (err) {
            console.error(`   ❌ Failed to delete ${id}:`, err.message);
        }
    }

    console.log('');
    console.log('📊 Verifying Counts...');
    const counts = await client.fetch(`{
    "tidal": count(*[_type == "product" && collectionType == "atlas" && atlasData.atmosphere == "tidal"]),
    "ember": count(*[_type == "product" && collectionType == "atlas" && atlasData.atmosphere == "ember"]),
    "petal": count(*[_type == "product" && collectionType == "atlas" && atlasData.atmosphere == "petal"]),
    "terra": count(*[_type == "product" && collectionType == "atlas" && atlasData.atmosphere == "terra"]),
    "total": count(*[_type == "product" && collectionType == "atlas"])
  }`);

    console.log(counts);
}

main().catch(console.error);
