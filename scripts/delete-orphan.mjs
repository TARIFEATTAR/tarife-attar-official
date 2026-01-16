#!/usr/bin/env node
/**
 * Delete Orphan Product
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
    const id = 'shopifyProduct-10002044158234';
    console.log(`🗑️  Deleting orphan: ${id}`);

    try {
        await client.delete(id);
        console.log('✅ Deleted successfully');
    } catch (err) {
        console.error('❌ Failed to delete:', err.message);
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
