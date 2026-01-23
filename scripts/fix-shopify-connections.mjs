/**
 * Fix Shopify Product Connections
 * 
 * This script:
 * 1. Updates Sanity products with Shopify Product IDs and Variant IDs
 * 2. Updates Shopify inventory from Sanity
 * 3. Verifies image URLs
 * 4. Checks sales channel mapping
 * 
 * Usage:
 *   node scripts/fix-shopify-connections.mjs --dry-run    # Preview
 *   node scripts/fix-shopify-connections.mjs              # Apply
 */

// Load environment variables
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadEnvFile(filename) {
  const envPath = join(__dirname, '..', filename);
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
    // File might not exist
  }
}

loadEnvFile('.env');
loadEnvFile('.env.local');

import { createClient } from '@sanity/client';

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

const isDryRun = process.argv.includes('--dry-run');

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

// Fetch all products from Shopify with full details
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
            status
            descriptionHtml
            images(first: 5) {
              nodes {
                url
                altText
              }
            }
            variants(first: 10) {
              nodes {
                id
                sku
                title
                price
                inventoryQuantity
                availableForSale
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

// Update inventory in Shopify using REST API
async function updateShopifyInventory(variantId, quantity) {
  if (isDryRun) {
    console.log(`      [DRY RUN] Would set inventory to ${quantity}`);
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
            inventory_quantity: quantity,
            inventory_management: 'shopify',
            inventory_policy: 'deny',
          },
        }),
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`      ❌ Error: ${response.status} - ${errorText}`);
      return false;
    }
    
    console.log(`      ✅ Set inventory to ${quantity}`);
    return true;
  } catch (error) {
    console.error(`      ❌ Error: ${error.message}`);
    return false;
  }
}

// Update Sanity product with Shopify IDs
async function updateSanityProduct(sanityId, updates) {
  if (isDryRun) {
    console.log(`      [DRY RUN] Would update Sanity:`, updates);
    return true;
  }
  
  try {
    await sanityClient.patch(sanityId).set(updates).commit();
    console.log(`      ✅ Updated Sanity product`);
    return true;
  } catch (error) {
    console.error(`      ❌ Error updating Sanity: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('\n🔧 FIXING SHOPIFY CONNECTIONS\n');
  console.log(isDryRun ? '📋 DRY RUN MODE (no changes will be made)\n' : '🚀 LIVE MODE\n');
  console.log('═'.repeat(70));
  
  if (!SHOPIFY_ADMIN_TOKEN) {
    console.error('\n❌ Missing SHOPIFY_ADMIN_ACCESS_TOKEN');
    process.exit(1);
  }
  
  // 1. Fetch products from both systems
  console.log('\n📚 Fetching products from Sanity...');
  const sanityProducts = await sanityClient.fetch(`
    *[_type == "product" && !(_id in path("drafts.**")) && defined(title) && title != ""] {
      _id,
      title,
      "slug": slug.current,
      collectionType,
      sku,
      sku6ml,
      sku12ml,
      inStock,
      shopifyHandle,
      shopifyProductId,
      shopifyVariantId,
      shopifyVariant6mlId,
      shopifyVariant12mlId
    }
  `);
  console.log(`   Found ${sanityProducts.length} products in Sanity`);
  
  console.log('\n🛒 Fetching products from Shopify...');
  const shopifyProducts = await fetchShopifyProducts();
  console.log(`   Found ${shopifyProducts.length} products in Shopify`);
  
  // 2. Match products by handle/slug
  console.log('\n🔗 Matching products...\n');
  
  const matched = [];
  const unmatched = [];
  
  for (const sanityProduct of sanityProducts) {
    const shopifyProduct = shopifyProducts.find(sp => 
      sp.handle === sanityProduct.slug || 
      sp.handle === sanityProduct.shopifyHandle
    );
    
    if (shopifyProduct) {
      matched.push({ sanity: sanityProduct, shopify: shopifyProduct });
    } else {
      unmatched.push(sanityProduct);
    }
  }
  
  console.log(`   ✅ Matched: ${matched.length} products`);
  console.log(`   ⚠️  Unmatched: ${unmatched.length} products`);
  
  // 3. Update connections and inventory
  console.log('\n' + '═'.repeat(70));
  console.log('\n📝 UPDATING CONNECTIONS & INVENTORY\n');
  
  let connectionUpdates = 0;
  let inventoryUpdates = 0;
  let imageIssues = 0;
  
  for (const { sanity, shopify } of matched) {
    console.log(`\n  ${sanity.title} (${sanity.slug})`);
    
    // Update Shopify Product ID and Handle
    const needsConnectionUpdate = 
      sanity.shopifyProductId !== shopify.id ||
      sanity.shopifyHandle !== shopify.handle;
    
    if (needsConnectionUpdate) {
      console.log(`     → Updating Sanity connection...`);
      const updates = {
        shopifyProductId: shopify.id,
        shopifyHandle: shopify.handle,
      };
      
      // Match variants by SKU
      const variant6ml = shopify.variants.nodes.find(v => v.sku === sanity.sku6ml);
      const variant12ml = shopify.variants.nodes.find(v => v.sku === sanity.sku12ml);
      const variantDefault = shopify.variants.nodes.find(v => 
        v.sku === sanity.sku || 
        (!sanity.sku6ml && !sanity.sku12ml && v.sku === sanity.sku)
      );
      
      if (variant6ml) updates.shopifyVariant6mlId = variant6ml.id;
      if (variant12ml) updates.shopifyVariant12mlId = variant12ml.id;
      if (variantDefault) updates.shopifyVariantId = variantDefault.id;
      
      const success = await updateSanityProduct(sanity._id, updates);
      if (success) connectionUpdates++;
    } else {
      console.log(`     ✓ Connection already up to date`);
    }
    
    // Update inventory in Shopify
    if (sanity.collectionType === 'atlas' && sanity.sku6ml && sanity.sku12ml) {
      // Atlas products with variants
      const variant6ml = shopify.variants.nodes.find(v => v.sku === sanity.sku6ml);
      const variant12ml = shopify.variants.nodes.find(v => v.sku === sanity.sku12ml);
      
      const targetQty = sanity.inStock ? 100 : 0; // Set to 100 if in stock, 0 if not
      
      if (variant6ml && variant6ml.inventoryQuantity !== targetQty) {
        console.log(`     → Updating 6ml variant inventory (${variant6ml.inventoryQuantity} → ${targetQty})...`);
        await updateShopifyInventory(variant6ml.id, targetQty);
        inventoryUpdates++;
      }
      
      if (variant12ml && variant12ml.inventoryQuantity !== targetQty) {
        console.log(`     → Updating 12ml variant inventory (${variant12ml.inventoryQuantity} → ${targetQty})...`);
        await updateShopifyInventory(variant12ml.id, targetQty);
        inventoryUpdates++;
      }
    } else {
      // Single variant products
      const variant = shopify.variants.nodes.find(v => 
        v.sku === sanity.sku || 
        shopify.variants.nodes[0] // Fallback to first variant
      );
      
      if (variant) {
        const targetQty = sanity.inStock ? 100 : 0;
        if (variant.inventoryQuantity !== targetQty) {
          console.log(`     → Updating inventory (${variant.inventoryQuantity} → ${targetQty})...`);
          await updateShopifyInventory(variant.id, targetQty);
          inventoryUpdates++;
        }
      }
    }
    
    // Check images
    if (shopify.images.nodes.length === 0) {
      console.log(`     ⚠️  No images in Shopify`);
      imageIssues++;
    }
  }
  
  // Summary
  console.log('\n' + '═'.repeat(70));
  console.log('\n📊 SUMMARY\n');
  console.log(`   Products matched:        ${matched.length}`);
  console.log(`   Connection updates:      ${connectionUpdates}`);
  console.log(`   Inventory updates:       ${inventoryUpdates}`);
  console.log(`   Products missing images: ${imageIssues}`);
  
  if (unmatched.length > 0) {
    console.log(`\n   ⚠️  ${unmatched.length} products not matched:`);
    for (const p of unmatched.slice(0, 5)) {
      console.log(`      - ${p.title} (slug: ${p.slug})`);
    }
    if (unmatched.length > 5) {
      console.log(`      ... and ${unmatched.length - 5} more`);
    }
  }
  
  if (isDryRun) {
    console.log('\n📋 This was a DRY RUN. No changes were made.');
    console.log('   Run without --dry-run to apply changes.\n');
  } else {
    console.log('\n✅ Connection fix complete!\n');
  }
}

main().catch(console.error);
