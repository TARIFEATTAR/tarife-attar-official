#!/usr/bin/env node
/**
 * Sync Inventory from Shopify to Sanity
 * 
 * Updates the inStock field in Sanity based on Shopify's availableForSale status.
 * 
 * Usage:
 *   node scripts/sync-inventory.mjs
 */

import { createClient } from '@sanity/client';

const sanityClient = createClient({
  projectId: '8h5l91ut',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const shopifyToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

if (!shopifyDomain || !shopifyToken) {
  console.error('❌ Missing Shopify environment variables');
  process.exit(1);
}

if (!process.env.SANITY_WRITE_TOKEN) {
  console.error('❌ Missing SANITY_WRITE_TOKEN');
  process.exit(1);
}

// Mapping of Shopify titles to Sanity slugs
const SHOPIFY_TO_SANITY = {
  // EMBER
  'Granada Amber': 'granada',
  'Cairo Musk': 'cairo',
  'Honey Oudh': 'caravan',
  'Teeb Musk': 'close',
  'Frankincense & Myrrh': 'devotion',
  'Vanilla Sands': 'dune',
  'Black Musk': 'obsidian',
  'Oudh Fire': 'aden',
  
  // PETAL
  'Peach Memoir': 'cherish',
  'Himalayan Musk': 'clarity',
  'Turkish Rose': 'damascus',
  'Arabian Jasmine': 'jasmine',
  'White Egyptian Musk': 'ritual',
  'Musk Tahara': 'tahara',
  
  // TIDAL
  'Coconut Jasmine': 'bahia',
  'Del Mare': 'delmar',
  'DUBAI': 'dubai',
  'Blue Oud Elixir': 'fathom',
  'China Rain': 'kyoto',
  'Regatta': 'regatta',
  
  // TERRA
  'Oud & Tobacco': 'havana',
  'Marrakesh': 'marrakesh',
  'Black Ambergris': 'onyx',
  'Oudh Aura': 'regalia',
  'RIYADH': 'riyadh',
  'Sicilian Oudh': 'sicily',
  
  // RELIC
  'Kashmiri Saffron': 'kashmiri-saffron',
  'Mukhallat Emirates': 'mukhallat',
  'Royal Green Frankincense': 'sacred-hojari',
  'Aged Mysore Sandalwood': 'mysore-sandalwood',
};

async function shopifyFetch(query) {
  const res = await fetch(`https://${shopifyDomain}/api/2026-01/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': shopifyToken,
    },
    body: JSON.stringify({ query }),
  });
  return await res.json();
}

async function main() {
  console.log('\n🔄 SYNCING INVENTORY FROM SHOPIFY TO SANITY\n');
  console.log('═'.repeat(50));
  
  // Fetch all products from Shopify
  const query = `{
    products(first: 100) {
      edges {
        node {
          title
          availableForSale
          totalInventory
        }
      }
    }
  }`;
  
  const data = await shopifyFetch(query);
  const shopifyProducts = data.data?.products?.edges || [];
  
  console.log(`Found ${shopifyProducts.length} Shopify products\n`);
  
  let updated = 0;
  let inStockCount = 0;
  let outOfStockCount = 0;
  
  for (const {node: shopify} of shopifyProducts) {
    const sanitySlug = SHOPIFY_TO_SANITY[shopify.title];
    if (!sanitySlug) continue;
    
    const inStock = shopify.availableForSale;
    
    // Find Sanity product
    const sanityProduct = await sanityClient.fetch(
      `*[_type == 'product' && slug.current == $slug][0] { _id, title, inStock }`,
      { slug: sanitySlug }
    );
    
    if (!sanityProduct) {
      console.log(`⚠️  Sanity product not found: ${sanitySlug}`);
      continue;
    }
    
    // Update if different
    if (sanityProduct.inStock !== inStock) {
      await sanityClient.patch(sanityProduct._id).set({ inStock }).commit();
      const status = inStock ? '✅ Now In Stock' : '❌ Now Out of Stock';
      console.log(`${status}: ${sanityProduct.title}`);
      updated++;
    }
    
    if (inStock) {
      inStockCount++;
    } else {
      outOfStockCount++;
    }
  }
  
  console.log('\n' + '═'.repeat(50));
  console.log('\n📊 SUMMARY:\n');
  console.log(`   Products checked: ${Object.keys(SHOPIFY_TO_SANITY).length}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   In stock: ${inStockCount}`);
  console.log(`   Out of stock: ${outOfStockCount}`);
  console.log('\n✅ Inventory sync complete!\n');
}

main().catch(console.error);
