/**
 * Diagnose SKU Sync Status
 * 
 * Compares SKUs across:
 * 1. Sanity CMS (source of truth for new website)
 * 2. Shopify (e-commerce backend)
 * 
 * Shows:
 * - Products with mismatched SKUs
 * - Products missing SKUs in either system
 * - Products that exist in one system but not the other
 * 
 * Usage:
 *   node scripts/diagnose-sku-sync.mjs
 */

// Load environment variables from .env.local
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env.local');

try {
  const envFile = readFileSync(envPath, 'utf-8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match && !match[1].startsWith('#')) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
} catch (error) {
  // .env.local might not exist, that's okay
}

import { createClient } from '@sanity/client';

// ===== CONFIGURATION =====
const SHOPIFY_STORE = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || 'vasana-perfumes.myshopify.com';
const SHOPIFY_ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const SHOPIFY_API_VERSION = '2024-10';

const sanityClient = createClient({
  projectId: '8h5l91ut',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

// Territory codes
const TERRITORY_MAP = {
  'ember': 'EMBER',
  'petal': 'PETAL',
  'tidal': 'TIDAL',
  'terra': 'TERRA',
};

// Clean product name for SKU
function cleanProductName(name) {
  if (!name) return 'UNKNOWN';
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

// Generate expected SKUs for a product
function generateExpectedSkus(product) {
  const productName = cleanProductName(product.title);
  
  if (product.collectionType === 'atlas') {
    const territoryCode = TERRITORY_MAP[product.territory] || 'ATLAS';
    return {
      primary: `${territoryCode}-${productName}`,
      sku6ml: `${territoryCode}-${productName}-6ML`,
      sku12ml: `${territoryCode}-${productName}-12ML`,
    };
  } else {
    return {
      primary: `RELIC-${productName}`,
      sku6ml: null,
      sku12ml: null,
    };
  }
}

// Shopify Admin API helper
async function shopifyAdmin(query, variables = {}) {
  if (!SHOPIFY_ADMIN_TOKEN) {
    throw new Error('SHOPIFY_ADMIN_ACCESS_TOKEN not set');
  }
  
  const response = await fetch(
    `https://${SHOPIFY_STORE}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    }
  );
  
  const json = await response.json();
  
  if (json.errors) {
    console.error('Shopify API Error:', json.errors);
    throw new Error(json.errors[0]?.message || 'Shopify API error');
  }
  
  return json.data;
}

// Fetch all products from Shopify with SKUs
async function fetchShopifyProducts() {
  const products = [];
  let cursor = null;
  
  do {
    const query = `
      query GetProducts($cursor: String) {
        products(first: 50, after: $cursor) {
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            id
            title
            handle
            variants(first: 10) {
              nodes {
                id
                title
                sku
                displayName
              }
            }
          }
        }
      }
    `;
    
    const data = await shopifyAdmin(query, { cursor });
    products.push(...data.products.nodes);
    cursor = data.products.pageInfo.hasNextPage ? data.products.pageInfo.endCursor : null;
  } while (cursor);
  
  return products;
}

async function main() {
  console.log('\n🔍 SKU SYNC DIAGNOSTIC REPORT\n');
  console.log('═'.repeat(80));
  
  if (!SHOPIFY_ADMIN_TOKEN) {
    console.error('\n❌ Missing SHOPIFY_ADMIN_ACCESS_TOKEN');
    console.log('   Set it as environment variable to run this diagnostic');
    process.exit(1);
  }
  
  // 1. Fetch products from Sanity
  console.log('\n📚 Fetching products from Sanity...');
  
  const sanityProducts = await sanityClient.fetch(`
    *[_type == "product" && !(_id in path("drafts.**"))] {
      _id,
      title,
      "slug": slug.current,
      collectionType,
      "territory": atlasData.atmosphere,
      "shopifyHandle": store.slug.current,
      "shopifyProductId": coalesce(shopifyProductId, store.id),
      sku,
      sku6ml,
      sku12ml
    }
  `);
  
  console.log(`   ✅ Found ${sanityProducts.length} products in Sanity`);
  
  // 2. Fetch products from Shopify
  console.log('\n🛒 Fetching products from Shopify...');
  
  const shopifyProducts = await fetchShopifyProducts();
  console.log(`   ✅ Found ${shopifyProducts.length} products in Shopify`);
  
  // 3. Build comparison maps
  console.log('\n🔗 Building comparison maps...\n');
  
  // Map by handle/slug for matching
  const shopifyByHandle = new Map();
  for (const sp of shopifyProducts) {
    shopifyByHandle.set(sp.handle, sp);
  }
  
  const sanityBySlug = new Map();
  for (const sp of sanityProducts) {
    sanityBySlug.set(sp.slug, sp);
    if (sp.shopifyHandle) {
      sanityBySlug.set(sp.shopifyHandle, sp);
    }
  }
  
  // 4. Analyze matches and mismatches
  const matched = [];
  const mismatchedSkus = [];
  const missingInShopify = [];
  const missingInSanity = [];
  const missingSkusInSanity = [];
  const missingSkusInShopify = [];
  
  // Check Sanity products
  for (const sanityProduct of sanityProducts) {
    const shopifyProduct = shopifyByHandle.get(sanityProduct.slug) || 
                          (sanityProduct.shopifyHandle && shopifyByHandle.get(sanityProduct.shopifyHandle));
    
    if (!shopifyProduct) {
      missingInShopify.push(sanityProduct);
      continue;
    }
    
    const expectedSkus = generateExpectedSkus(sanityProduct);
    const shopifyVariants = shopifyProduct.variants.nodes;
    
    // Check if SKUs match
    const mismatches = [];
    
    // For Atlas products with variants
    if (sanityProduct.collectionType === 'atlas' && shopifyVariants.length >= 2) {
      for (const variant of shopifyVariants) {
        const variantTitle = variant.title?.toLowerCase() || '';
        let expectedSku;
        
        if (variantTitle.includes('6') || variantTitle.includes('6ml')) {
          expectedSku = expectedSkus.sku6ml;
        } else if (variantTitle.includes('12') || variantTitle.includes('12ml')) {
          expectedSku = expectedSkus.sku12ml;
        } else {
          expectedSku = expectedSkus.primary;
        }
        
        if (variant.sku !== expectedSku) {
          mismatches.push({
            variant: variant.title,
            shopify: variant.sku || '(empty)',
            expected: expectedSku,
            sanity: variantTitle.includes('6') ? sanityProduct.sku6ml : 
                   variantTitle.includes('12') ? sanityProduct.sku12ml : 
                   sanityProduct.sku
          });
        }
      }
    } else {
      // Single variant or Relic
      const variant = shopifyVariants[0];
      if (variant && variant.sku !== expectedSkus.primary) {
        mismatches.push({
          variant: variant.title || 'Default',
          shopify: variant.sku || '(empty)',
          expected: expectedSkus.primary,
          sanity: sanityProduct.sku
        });
      }
    }
    
    // Check if Sanity has SKUs set
    if (!sanityProduct.sku) {
      missingSkusInSanity.push({
        product: sanityProduct,
        shopify: shopifyProduct
      });
    }
    
    // Check if Shopify variants have SKUs
    const shopifyMissingSkus = shopifyVariants.filter(v => !v.sku || v.sku.trim() === '');
    if (shopifyMissingSkus.length > 0) {
      missingSkusInShopify.push({
        product: sanityProduct,
        shopify: shopifyProduct,
        missingVariants: shopifyMissingSkus.map(v => v.title)
      });
    }
    
    if (mismatches.length > 0) {
      mismatchedSkus.push({
        product: sanityProduct,
        shopify: shopifyProduct,
        mismatches
      });
    } else if (sanityProduct.sku && shopifyVariants.every(v => v.sku)) {
      matched.push({
        product: sanityProduct,
        shopify: shopifyProduct
      });
    }
  }
  
  // Check for Shopify products not in Sanity (legacy products)
  for (const shopifyProduct of shopifyProducts) {
    if (!sanityBySlug.has(shopifyProduct.handle)) {
      missingInSanity.push(shopifyProduct);
    }
  }
  
  // 5. Print Report
  console.log('═'.repeat(80));
  console.log('\n📊 DIAGNOSTIC RESULTS\n');
  
  console.log(`✅ Perfectly Matched: ${matched.length} products`);
  console.log(`⚠️  SKU Mismatches: ${mismatchedSkus.length} products`);
  console.log(`❌ Missing SKUs in Sanity: ${missingSkusInSanity.length} products`);
  console.log(`❌ Missing SKUs in Shopify: ${missingSkusInShopify.length} products`);
  console.log(`🔍 Missing in Shopify: ${missingInShopify.length} products`);
  console.log(`🛡️  Legacy Shopify Products (not in Sanity): ${missingInSanity.length} products`);
  
  // Detailed mismatches
  if (mismatchedSkus.length > 0) {
    console.log('\n' + '═'.repeat(80));
    console.log('\n⚠️  SKU MISMATCHES:\n');
    
    for (const { product, shopify, mismatches } of mismatchedSkus) {
      console.log(`\n📦 ${product.title} (${product.collectionType})`);
      console.log(`   Handle: ${shopify.handle}`);
      for (const mismatch of mismatches) {
        console.log(`   Variant: ${mismatch.variant}`);
        console.log(`      Shopify:  ${mismatch.shopify}`);
        console.log(`      Expected: ${mismatch.expected}`);
        console.log(`      Sanity:   ${mismatch.sanity || '(not set)'}`);
      }
    }
  }
  
  // Missing SKUs in Sanity
  if (missingSkusInSanity.length > 0) {
    console.log('\n' + '═'.repeat(80));
    console.log('\n❌ MISSING SKUs IN SANITY:\n');
    
    for (const { product } of missingSkusInSanity) {
      const expected = generateExpectedSkus(product);
      console.log(`   ${product.title}`);
      console.log(`      Expected Primary: ${expected.primary}`);
      if (expected.sku6ml) {
        console.log(`      Expected 6ml:    ${expected.sku6ml}`);
        console.log(`      Expected 12ml:   ${expected.sku12ml}`);
      }
    }
  }
  
  // Missing SKUs in Shopify
  if (missingSkusInShopify.length > 0) {
    console.log('\n' + '═'.repeat(80));
    console.log('\n❌ MISSING SKUs IN SHOPIFY:\n');
    
    for (const { product, missingVariants } of missingSkusInShopify) {
      console.log(`   ${product.title}`);
      console.log(`      Variants without SKU: ${missingVariants.join(', ')}`);
    }
  }
  
  // Products missing in Shopify
  if (missingInShopify.length > 0) {
    console.log('\n' + '═'.repeat(80));
    console.log('\n🔍 PRODUCTS IN SANITY BUT NOT IN SHOPIFY:\n');
    
    for (const product of missingInShopify) {
      console.log(`   ${product.title} (slug: ${product.slug})`);
    }
  }
  
  // Legacy products
  if (missingInSanity.length > 0) {
    console.log('\n' + '═'.repeat(80));
    console.log('\n🛡️  LEGACY SHOPIFY PRODUCTS (not in Sanity - safe to ignore):\n');
    
    for (const product of missingInSanity.slice(0, 20)) {
      const variants = product.variants.nodes;
      const skus = variants.map(v => v.sku || '(empty)').join(', ');
      console.log(`   ${product.title} (${variants.length} variant(s), SKUs: ${skus})`);
    }
    if (missingInSanity.length > 20) {
      console.log(`   ... and ${missingInSanity.length - 20} more`);
    }
  }
  
  // Summary and recommendations
  console.log('\n' + '═'.repeat(80));
  console.log('\n💡 RECOMMENDATIONS:\n');
  
  if (missingSkusInSanity.length > 0) {
    console.log('   1. Run: node scripts/populate-skus.mjs');
    console.log('      This will populate missing SKUs in Sanity based on product names\n');
  }
  
  if (mismatchedSkus.length > 0 || missingSkusInShopify.length > 0) {
    console.log('   2. Run: node scripts/sync-skus-to-shopify.mjs --dry-run');
    console.log('      Preview SKU updates that will be pushed to Shopify\n');
    console.log('   3. Run: node scripts/sync-skus-to-shopify.mjs');
    console.log('      Apply SKU updates to Shopify (after reviewing dry-run)\n');
  }
  
  if (missingInShopify.length > 0) {
    console.log('   4. Create missing products in Shopify or update product handles in Sanity\n');
  }
  
  console.log('═'.repeat(80));
  console.log('\n✅ Diagnostic complete!\n');
}

main().catch(console.error);
