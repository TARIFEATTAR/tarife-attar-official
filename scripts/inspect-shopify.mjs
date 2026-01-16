#!/usr/bin/env node
/**
 * inspect-shopify-products.mjs
 * Lists all Shopify products to find matches for:
 * - Mukhallat Shifa
 * - Dubai Musk
 * - Musk Tahara (for White Musk)
 */

const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const shopifyToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

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
    console.log('🔍 Listing Shopify Products...');

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
    const products = data.data?.products?.edges || [];

    console.log(`Found ${products.length} products total.`);
    console.log('--- Matching Candidates ---');

    products.forEach(p => {
        const t = p.node.title.toLowerCase();

        // Filter for relevant ones to reduce noise, or just print all if unsure
        if (
            t.includes('shifa') ||
            t.includes('mukhallat') ||
            t.includes('dubai') ||
            t.includes('musk') ||
            t.includes('tahara')
        ) {
            console.log(`✅ ${p.node.title}`);
            console.log(`   ID: ${p.node.variants.edges[0]?.node?.id}`);
        }
    });
}

main().catch(console.error);
