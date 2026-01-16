#!/usr/bin/env node
/**
 * Publish All Atlas Products in Sanity
 * 
 * This script publishes all draft Atlas products.
 * Run with: SANITY_WRITE_TOKEN=xxx node scripts/publish-products.mjs
 */

import { createClient } from '@sanity/client';

const projectId = '8h5l91ut';
const dataset = 'production';
const apiVersion = '2025-12-31';
const token = process.env.SANITY_WRITE_TOKEN;

if (!token) {
    console.error('❌ SANITY_WRITE_TOKEN required');
    process.exit(1);
}

const client = createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
});

async function main() {
    console.log('📢 Publishing all Atlas products...');
    console.log('');

    // Query all Atlas products (including drafts)
    const products = await client.fetch(
        `*[_type == "product" && collectionType == "atlas"] { _id, title }`
    );

    console.log(`Found ${products.length} Atlas products`);
    console.log('');

    let published = 0;
    for (const product of products) {
        // If it's a draft, we need to publish it
        if (product._id.startsWith('drafts.')) {
            const publishedId = product._id.replace('drafts.', '');

            try {
                // Get the draft document
                const draft = await client.getDocument(product._id);
                if (draft) {
                    // Create/update the published version
                    const { _id, ...docWithoutId } = draft;
                    await client.createOrReplace({
                        ...docWithoutId,
                        _id: publishedId,
                    });
                    // Delete the draft
                    await client.delete(product._id);
                    console.log(`✅ Published: ${product.title}`);
                    published++;
                }
            } catch (err) {
                console.log(`⚠️  Skipped ${product.title}: ${err.message}`);
            }
        } else {
            console.log(`✓ Already published: ${product.title}`);
        }
    }

    console.log('');
    console.log(`📊 Summary: ${published} products published`);
    console.log('');
    console.log('🎉 Done! Products should now be visible on the Atlas page.');
}

main().catch(console.error);
