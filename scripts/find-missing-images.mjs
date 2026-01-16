#!/usr/bin/env node
/**
 * Find Products Missing Images and Suggest Matches
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

async function main() {
    console.log('🔍 Analyzing Missing Images...');

    // 1. Get Sanity products without mainImage
    const sanityProducts = await client.fetch(
        `*[_type == "product" && !defined(mainImage)] { _id, title, collectionType }`
    );

    console.log(`Found ${sanityProducts.length} products without images in Sanity:`);
    sanityProducts.forEach(p => console.log(`   - ${p.title} (${p.collectionType})`));
    console.log('');

    // 2. Get All Shopify Products
    const query = `
    {
      products(first: 100) {
        edges {
          node {
            title
            id
            variants(first: 1) {
              edges {
                node {
                  id
                  image {
                    url
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

    console.log('🤝 Potential Matches in Shopify:');

    for (const sp of sanityProducts) {
        // Simple fuzzy match: check if Shopify title contains Sanity title or vice versa (case insensitive)
        const matches = shopifyProducts.filter(p => {
            const sTitle = sp.title.toLowerCase().trim();
            const shopTitle = p.node.title.toLowerCase().trim();
            return shopTitle.includes(sTitle) || sTitle.includes(shopTitle);
        });

        if (matches.length > 0) {
            console.log(`   ${sp.title} matches:`);
            matches.forEach(m => {
                const hasImage = !!m.node.variants.edges[0]?.node?.image;
                console.log(`     -> ${m.node.title} (ID: ${m.node.variants.edges[0]?.node?.id}) [Image: ${hasImage ? 'Yes' : 'No'}]`);
            });
        } else {
            console.log(`   ⚠️  No fuzzy match found for ${sp.title}`);
        }
    }
}

main().catch(console.error);
