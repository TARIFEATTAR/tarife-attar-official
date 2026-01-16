#!/usr/bin/env node
/**
 * Find Orphan Atlas Products
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
    console.log('🔍 Finding Orphans...');

    const orphans = await client.fetch(
        `*[_type == "product" && collectionType == "atlas" && !(atlasData.atmosphere in ["tidal", "ember", "petal", "terra"])] { _id, title, atlasData }`
    );

    console.log(`Orphans found: ${orphans.length}`);
    orphans.forEach(p => {
        console.log(`❌ ${p.title} (${p._id}) - Atmosphere: ${p.atlasData?.atmosphere}`);
    });
}

main().catch(console.error);
