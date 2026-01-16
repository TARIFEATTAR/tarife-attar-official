#!/usr/bin/env node
/**
 * Manual Connect v2
 * 
 * Instead of querying by ID (which failed), we fetch all products
 * and match by the KNOWN valid Shopify titles.
 */

import { createClient } from '@sanity/client';
// Using native fetch

const sanityToken = process.env.SANITY_WRITE_TOKEN;
const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const shopifyToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

const client = createClient({
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

        const asset = await client.assets.upload('image', buffer, { filename });
        return asset;
    } catch (err) {
        console.error(`   Error uploading ${filename}:`, err.message);
        return null;
    }
}

async function main() {
    console.log('🛠️  Manual Connections (Search Strategy)...');

    // 1. Fetch ALL Shopify Products
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
                  price { amount }
                  image { url }
                }
              }
            }
          }
        }
      }
    }
  `;

    const data = await shopifyFetch({ query });
    const shopifyProducts = data.data?.products?.edges || [];
    console.log(`   Fetched ${shopifyProducts.length} Shopify products.`);

    // 2. Define Mappings (Sanity Title -> Shopify Title)
    const mappings = [
        { sanity: 'White Musk', shopify: 'Musk Tahara' },
        { sanity: 'Mukhallat Shifa', shopify: 'Mukhallat Al-Shifa' },
        { sanity: 'Himalyan Musk', shopify: 'Himalayan Musk' } // Spelling Fix
    ];

    for (const map of mappings) {
        console.log(`\n🔌 Connecting ${map.sanity} -> ${map.shopify}...`);

        // Find Shopify Product
        const shopifyMatch = shopifyProducts.find(p =>
            p.node.title.toLowerCase() === map.shopify.toLowerCase()
        );

        if (!shopifyMatch) {
            console.error(`   ❌ Could not find Shopify product "${map.shopify}"`);
            continue;
        }

        const variant = shopifyMatch.node.variants.edges[0]?.node;
        if (!variant) {
            console.error(`   ❌ No variant found for "${map.shopify}"`);
            continue;
        }

        // Connect in Sanity
        const sanityProduct = await client.fetch(
            `*[_type == "product" && title == $title][0]`,
            { title: map.sanity }
        );

        if (!sanityProduct) {
            console.error(`   ❌ Sanity product "${map.sanity}" not found`);
            continue;
        }

        // Upload Image
        let imageAssetId = null;
        if (variant.image?.url) {
            console.log(`   ⬇️  Downloading image...`);
            const asset = await uploadImageToSanity(variant.image.url, `${map.sanity}.jpg`);
            if (asset) imageAssetId = asset._id;
        }

        // Patch
        const patch = client.patch(sanityProduct._id).set({
            shopifyVariantId: variant.id,
            price: parseFloat(variant.price?.amount || 0)
        });

        if (imageAssetId) {
            patch.set({
                mainImage: {
                    _type: 'image',
                    asset: { _type: 'reference', _ref: imageAssetId }
                }
            });
        }

        await patch.commit();
        console.log(`   ✅ Connected! Variant: ${variant.id}`);
    }

    // Check for Dubai Musk
    // console.log('\n🔎 Searching for "Dubai Musk"...');
    // shopifyProducts.forEach(p => {
    //   if (p.node.title.toLowerCase().includes('dubai')) {
    //     console.log(`   Found: ${p.node.title}`);
    //   }
    // });
}

main().catch(console.error);
