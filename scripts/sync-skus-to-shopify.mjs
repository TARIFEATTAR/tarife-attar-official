/**
 * Sync SKUs from Sanity to Shopify
 * 
 * SAFE: Only updates products that exist in BOTH Sanity AND Shopify
 * Legacy Shopify products not in Sanity will NOT be touched
 * 
 * SKU Format:
 *   Primary: TERRITORY-PRODUCTNAME (e.g., TERRA-ONYX)
 *   6ml:     TERRITORY-PRODUCTNAME-6ML
 *   12ml:    TERRITORY-PRODUCTNAME-12ML
 *   Relic:   RELIC-PRODUCTNAME
 * 
 * Usage:
 *   node scripts/sync-skus-to-shopify.mjs --dry-run    # Preview changes (RECOMMENDED FIRST)
 *   node scripts/sync-skus-to-shopify.mjs              # Apply changes to Shopify
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
const SHOPIFY_STORE = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || 'tarife-attar.myshopify.com';
const SHOPIFY_ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const SHOPIFY_API_VERSION = '2024-10';

const sanityClient = createClient({
  projectId: '8h5l91ut',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

const isDryRun = process.argv.includes('--dry-run');

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

// Generate SKUs for a product
function generateSkus(product) {
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
    throw new Error('SHOPIFY_ADMIN_ACCESS_TOKEN not set. Get it from Shopify Admin → Settings → Apps → Develop apps');
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

// Fetch all products from Shopify
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

// Update variant SKU in Shopify using REST API (more reliable)
async function updateVariantSku(variantId, sku, productTitle, variantTitle) {
  if (isDryRun) {
    console.log(`      [DRY RUN] Would set SKU: ${sku}`);
    return true;
  }
  
  // Extract numeric ID from GID
  const numericId = variantId.replace('gid://shopify/ProductVariant/', '');
  
  try {
    const response = await fetch(
      `https://${SHOPIFY_STORE}/admin/api/${SHOPIFY_API_VERSION}/variants/${numericId}.json`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN,
        },
        body: JSON.stringify({
          variant: {
            id: numericId,
            sku: sku,
          },
        }),
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`      ❌ Error: ${response.status} - ${errorText}`);
      return false;
    }
    
    const data = await response.json();
    console.log(`      ✅ Updated to: ${data.variant.sku}`);
    return true;
  } catch (error) {
    console.error(`      ❌ Error updating: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('\n🔄 SYNC SKUs: SANITY → SHOPIFY\n');
  console.log(isDryRun ? '📋 DRY RUN MODE (no changes will be made)\n' : '🚀 LIVE MODE\n');
  console.log('═'.repeat(70));
  
  if (!SHOPIFY_ADMIN_TOKEN) {
    console.error('\n❌ Missing SHOPIFY_ADMIN_ACCESS_TOKEN');
    console.log('\nTo get this token:');
    console.log('1. Go to Shopify Admin → Settings → Apps and sales channels');
    console.log('2. Click "Develop apps" → "Create an app"');
    console.log('3. Configure Admin API scopes: write_products, read_products');
    console.log('4. Install the app and copy the Admin API access token');
    console.log('5. Set it as environment variable: export SHOPIFY_ADMIN_ACCESS_TOKEN="shpat_xxx"');
    process.exit(1);
  }
  
  // 1. Fetch products from Sanity (source of truth for new website)
  console.log('\n📚 Fetching products from Sanity...');
  
  const sanityProducts = await sanityClient.fetch(`
    *[_type == "product" && !(_id in path("drafts.**"))] {
      _id,
      title,
      "slug": slug.current,
      collectionType,
      "territory": atlasData.atmosphere,
      "shopifyHandle": store.slug.current,
      "shopifyProductId": coalesce(shopifyProductId, store.id)
    }
  `);
  
  console.log(`   Found ${sanityProducts.length} products in Sanity`);
  
  // 2. Fetch products from Shopify
  console.log('\n🛒 Fetching products from Shopify...');
  
  const shopifyProducts = await fetchShopifyProducts();
  console.log(`   Found ${shopifyProducts.length} products in Shopify`);
  
  // 3. Match Sanity products to Shopify products
  console.log('\n🔗 Matching products...\n');
  
  const matched = [];
  const unmatched = [];
  
  for (const sanityProduct of sanityProducts) {
    // Try to match by Shopify handle/slug
    let shopifyProduct = shopifyProducts.find(sp => 
      sp.handle === sanityProduct.slug || 
      sp.handle === sanityProduct.shopifyHandle
    );
    
    // If not found, try matching by title (normalized)
    if (!shopifyProduct) {
      const normalizedTitle = sanityProduct.title?.toLowerCase().replace(/[^a-z0-9]/g, '');
      shopifyProduct = shopifyProducts.find(sp => 
        sp.title?.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedTitle
      );
    }
    
    if (shopifyProduct) {
      matched.push({
        sanity: sanityProduct,
        shopify: shopifyProduct,
      });
    } else {
      unmatched.push(sanityProduct);
    }
  }
  
  // Count Shopify products NOT in Sanity (legacy products - won't be touched)
  const sanityHandles = new Set(sanityProducts.map(p => p.slug).concat(sanityProducts.map(p => p.shopifyHandle)));
  const legacyShopifyProducts = shopifyProducts.filter(sp => !sanityHandles.has(sp.handle));
  
  console.log(`   ✅ Matched: ${matched.length} products (will be updated)`);
  console.log(`   ⚠️  Unmatched Sanity products: ${unmatched.length}`);
  console.log(`   🛡️  Legacy Shopify products: ${legacyShopifyProducts.length} (will NOT be touched)`);
  
  if (unmatched.length > 0) {
    console.log('\n   Unmatched Sanity products (no Shopify match found):');
    for (const p of unmatched) {
      console.log(`      - ${p.title} (slug: ${p.slug})`);
    }
  }
  
  if (legacyShopifyProducts.length > 0) {
    console.log('\n   Legacy Shopify products (safe, won\'t be changed):');
    for (const p of legacyShopifyProducts.slice(0, 10)) {
      console.log(`      - ${p.title}`);
    }
    if (legacyShopifyProducts.length > 10) {
      console.log(`      ... and ${legacyShopifyProducts.length - 10} more`);
    }
  }
  
  // 4. Update SKUs for matched products
  console.log('\n' + '═'.repeat(70));
  console.log('\n📝 UPDATING SKUs\n');
  
  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  
  for (const { sanity, shopify } of matched) {
    // Skip products with null/missing titles (incomplete Sanity records)
    if (!sanity.title) {
      console.log(`\n  ⚠️  SKIPPING: No title (Shopify: ${shopify.handle}) - incomplete Sanity record`);
      skippedCount++;
      continue;
    }
    
    const skus = generateSkus(sanity);
    console.log(`\n  ${sanity.title} (${sanity.collectionType})`);
    console.log(`     Shopify: ${shopify.handle}`);
    console.log(`     SKUs: ${skus.primary}${skus.sku6ml ? `, ${skus.sku6ml}, ${skus.sku12ml}` : ''}`);
    
    // Get variants
    const variants = shopify.variants.nodes;
    
    if (variants.length === 0) {
      console.log(`     ⚠️  No variants found`);
      continue;
    }
    
    // For Atlas products with 6ml/12ml variants
    if (sanity.collectionType === 'atlas' && variants.length >= 2) {
      for (const variant of variants) {
        const variantTitle = variant.title?.toLowerCase() || '';
        let targetSku;
        
        if (variantTitle.includes('6') || variantTitle.includes('6ml')) {
          targetSku = skus.sku6ml;
        } else if (variantTitle.includes('12') || variantTitle.includes('12ml')) {
          targetSku = skus.sku12ml;
        } else {
          // Default to primary for unknown variants
          targetSku = skus.primary;
        }
        
        if (variant.sku === targetSku) {
          console.log(`     ✓ ${variant.title}: ${variant.sku} (already correct)`);
          skippedCount++;
        } else {
          console.log(`     → ${variant.title}: ${variant.sku || '(empty)'} → ${targetSku}`);
          const success = await updateVariantSku(variant.id, targetSku, sanity.title, variant.title);
          if (success) {
            updatedCount++;
          } else {
            errorCount++;
          }
        }
      }
    } 
    // For single-variant products or Relic
    else {
      const variant = variants[0];
      const targetSku = skus.primary;
      
      if (variant.sku === targetSku) {
        console.log(`     ✓ SKU: ${variant.sku} (already correct)`);
        skippedCount++;
      } else {
        console.log(`     → SKU: ${variant.sku || '(empty)'} → ${targetSku}`);
        const success = await updateVariantSku(variant.id, targetSku, sanity.title, variant.title);
        if (success) {
          updatedCount++;
        } else {
          errorCount++;
        }
      }
    }
  }
  
  // Summary
  console.log('\n' + '═'.repeat(70));
  console.log('\n📊 SUMMARY\n');
  console.log(`   Products matched:     ${matched.length}`);
  console.log(`   Variants updated:     ${updatedCount}`);
  console.log(`   Variants skipped:     ${skippedCount} (already correct)`);
  console.log(`   Errors:               ${errorCount}`);
  console.log(`   Legacy products safe: ${legacyShopifyProducts.length}`);
  
  if (isDryRun) {
    console.log('\n📋 This was a DRY RUN. No changes were made.');
    console.log('   Run without --dry-run to apply changes.\n');
  } else {
    console.log('\n✅ SKU sync complete!\n');
  }
}

main().catch(console.error);
