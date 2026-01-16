#!/usr/bin/env node
/**
 * Sync Images from Shopify to Sanity
 * 
 * 1. Fetches all products from Shopify with images
 * 2. Matches to Sanity products via shopifyVariantId
 * 3. Downloads and uploads images to Sanity
 * 4. Updates product.mainImage
 * 
 * NOTE: Does NOT sync tags.
 */

import { createClient } from '@sanity/client';
// import fetch from 'node-fetch'; // Using native fetch

const sanityToken = process.env.SANITY_WRITE_TOKEN;
const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const shopifyToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

if (!sanityToken || !shopifyDomain || !shopifyToken) {
    console.error('❌ Missing environment variables.');
    process.exit(1);
}

const sanity = createClient({
    projectId: '8h5l91ut',
    dataset: 'production',
    apiVersion: '2025-12-31',
    token: sanityToken,
    useCdn: false,
});

async function shopifyFetch({ query }) {
    const endpoint = `https://${shopifyDomain}/api/2026-01/graphql.json`;
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': shopifyToken,
        },
        body: JSON.stringify({ query }),
    });
    return await response.json();
}

async function uploadImageToSanity(imageUrl, filename) {
    try {
        const res = await fetch(imageUrl);
        if (!res.ok) throw new Error(`Failed to fetch image: ${res.statusText}`);
        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Sanity
        const asset = await sanity.assets.upload('image', buffer, {
            filename: filename
        });
        return asset;
    } catch (err) {
        console.error(`   Error uploading ${filename}:`, err.message);
        return null;
    }
}

async function main() {
    console.log('🖼️  Syncing Images from Shopify');
    console.log('=============================');

    // 1. Fetch Shopify Products with Images
    console.log('📦 Fetching Shopify products...');
    const query = `
    {
      products(first: 100) {
        edges {
          node {
            title
            variants(first: 1) {
              edges {
                node {
                  id
                  image {
                    url
                    altText
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

    const shopifyData = await shopifyFetch({ query });
    const shopifyProducts = shopifyData.data?.products?.edges || [];
    console.log(`   Found ${shopifyProducts.length} Shopify products`);

    // 2. Fetch Sanity Products
    console.log('📋 Fetching connected Sanity products...');
    const sanityProducts = await sanity.fetch(
        `*[_type == "product" && defined(shopifyVariantId)] { _id, title, shopifyVariantId, mainImage }`
    );
    console.log(`   Found ${sanityProducts.length} connected Sanity products`);
    console.log('');

    // 3. Sync Images
    let updated = 0;

    for (const sp of sanityProducts) {
        // Find matching Shopify product by Variant ID
        // Note: shopifyVariantId in Sanity might be the full GID or just ID. Our previous script stored the full GID.
        const match = shopifyProducts.find(p =>
            p.node.variants.edges[0]?.node?.id === sp.shopifyVariantId
        );

        if (match) {
            const variantImage = match.node.variants.edges[0]?.node?.image;

            if (variantImage && variantImage.url) {
                // Check if image is already set (optional: stick with existing if desired, but user asked to pull in)
                // We'll overwrite to ensure sync

                console.log(`🔄 Syncing image for: ${sp.title}...`);
                const asset = await uploadImageToSanity(variantImage.url, `${sp.title}.jpg`);

                if (asset) {
                    await sanity.patch(sp._id).set({
                        mainImage: {
                            _type: 'image',
                            asset: {
                                _type: 'reference',
                                _ref: asset._id
                            }
                        }
                    }).commit();
                    console.log(`   ✅ Image updated`);
                    updated++;
                }
            } else {
                console.log(`   ⚠️  No image found on Shopify for ${sp.title}`);
            }
        }
    }

    console.log('');
    console.log(`📊 Summary: Updated images for ${updated} products`);
}

main().catch(console.error);
