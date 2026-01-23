/**
 * Set Inventory Location to TARIFE ATTAR HQ
 * 
 * Ensures all product variants are assigned to the correct inventory location.
 * This is critical for inventory management.
 * 
 * Usage:
 *   node scripts/set-inventory-location.mjs --dry-run    # Preview
 *   node scripts/set-inventory-location.mjs              # Apply
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

const SHOPIFY_STORE = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || 'vasana-perfumes.myshopify.com';
const SHOPIFY_ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const SHOPIFY_API_VERSION = '2024-10';
const TARGET_LOCATION = 'TARIFE ATTAR HQ';

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

// Fetch all inventory locations
async function fetchInventoryLocations() {
  const query = `
    query {
      locations(first: 50) {
        nodes {
          id
          name
        }
      }
    }
  `;
  
  const data = await shopifyAdmin(query);
  return data.locations.nodes;
}

// Fetch all products with variants and their inventory
async function fetchProductsWithInventory() {
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
                sku
                title
                inventoryItem {
                  id
                  tracked
                }
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

// Fetch Sanity products to get inStock status
async function fetchSanityProducts() {
  const { createClient } = await import('@sanity/client');
  const sanityClient = createClient({
    projectId: '8h5l91ut',
    dataset: 'production',
    apiVersion: '2024-01-01',
    token: process.env.SANITY_WRITE_TOKEN,
    useCdn: false,
  });
  
  return await sanityClient.fetch(`
    *[_type == "product" && !(_id in path("drafts.**")) && defined(title) && title != ""] {
      _id,
      title,
      "slug": slug.current,
      sku,
      sku6ml,
      sku12ml,
      inStock
    }
  `);
}

// Get inventory levels for a variant at a specific location
async function getInventoryLevels(inventoryItemId, locationId) {
  const query = `
    query GetInventoryLevels($inventoryItemId: ID!) {
      inventoryItem(id: $inventoryItemId) {
        id
        inventoryLevels(first: 10) {
          nodes {
            id
            location {
              id
              name
            }
            quantities(names: ["available", "on_hand"]) {
              name
              quantity
            }
          }
        }
      }
    }
  `;
  
  try {
    const data = await shopifyAdmin(query, { inventoryItemId });
    const levels = data.inventoryItem?.inventoryLevels?.nodes || [];
    // Filter to only the target location
    return levels.filter(level => level.location.id === locationId);
  } catch (error) {
    console.error(`      Error fetching inventory levels: ${error.message}`);
    return [];
  }
}

// Set inventory level at a specific location
async function setInventoryLevel(inventoryItemId, locationId, quantity) {
  if (isDryRun) {
    console.log(`      [DRY RUN] Would set inventory to ${quantity} at location`);
    return true;
  }
  
  const mutation = `
    mutation SetInventoryLevel($inventoryItemId: ID!, $locationId: ID!, $quantity: Int!) {
      inventorySetOnHandQuantities(
        input: {
          reason: "correction"
          setQuantities: [
            {
              inventoryItemId: $inventoryItemId
              locationId: $locationId
              quantity: $quantity
            }
          ]
        }
      ) {
        userErrors {
          field
          message
        }
        inventoryAdjustmentGroup {
          reason
          changes {
            name
            delta
          }
        }
      }
    }
  `;
  
  try {
    const data = await shopifyAdmin(mutation, {
      inventoryItemId,
      locationId,
      quantity,
    });
    
    if (data.inventorySetOnHandQuantities.userErrors?.length > 0) {
      console.error(`      ❌ Errors:`, data.inventorySetOnHandQuantities.userErrors);
      return false;
    }
    
    console.log(`      ✅ Set inventory to ${quantity}`);
    return true;
  } catch (error) {
    console.error(`      ❌ Error: ${error.message}`);
    return false;
  }
}

// Activate inventory tracking for a variant
async function activateInventoryTracking(inventoryItemId) {
  if (isDryRun) {
    console.log(`      [DRY RUN] Would activate inventory tracking`);
    return true;
  }
  
  const mutation = `
    mutation ActivateInventoryTracking($inventoryItemId: ID!) {
      inventoryActivate(inventoryItemId: $inventoryItemId) {
        userErrors {
          field
          message
        }
        inventoryItem {
          id
          tracked
        }
      }
    }
  `;
  
  try {
    const data = await shopifyAdmin(mutation, { inventoryItemId });
    
    if (data.inventoryActivate.userErrors?.length > 0) {
      console.error(`      ❌ Errors:`, data.inventoryActivate.userErrors);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`      ❌ Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('\n📍 SETTING INVENTORY LOCATION: TARIFE ATTAR HQ\n');
  console.log(isDryRun ? '📋 DRY RUN MODE (no changes will be made)\n' : '🚀 LIVE MODE\n');
  console.log('═'.repeat(70));
  
  if (!SHOPIFY_ADMIN_TOKEN) {
    console.error('\n❌ Missing SHOPIFY_ADMIN_ACCESS_TOKEN');
    process.exit(1);
  }
  
  // 1. Fetch inventory locations
  console.log('\n📍 Fetching inventory locations...');
  const locations = await fetchInventoryLocations();
  console.log(`   Found ${locations.length} locations:`);
  locations.forEach(loc => {
    console.log(`      - ${loc.name}`);
  });
  
  const targetLocation = locations.find(loc => 
    loc.name.toUpperCase() === TARGET_LOCATION.toUpperCase()
  );
  
  if (!targetLocation) {
    console.error(`\n❌ Location "${TARGET_LOCATION}" not found!`);
    console.log('\nAvailable locations:');
    locations.forEach(loc => console.log(`   - ${loc.name}`));
    process.exit(1);
  }
  
  console.log(`\n   ✅ Target location: ${targetLocation.name} (ID: ${targetLocation.id})`);
  
  // 2. Fetch products
  console.log('\n📦 Fetching products from Shopify...');
  const products = await fetchProductsWithInventory();
  console.log(`   Found ${products.length} products`);
  
  console.log('\n📚 Fetching products from Sanity...');
  const sanityProducts = await fetchSanityProducts();
  console.log(`   Found ${sanityProducts.length} products`);
  
  // Create lookup map by SKU
  const sanityBySku = new Map();
  sanityProducts.forEach(p => {
    if (p.sku) sanityBySku.set(p.sku, p);
    if (p.sku6ml) sanityBySku.set(p.sku6ml, p);
    if (p.sku12ml) sanityBySku.set(p.sku12ml, p);
  });
  
  // 3. Process each product
  console.log('\n' + '═'.repeat(70));
  console.log('\n🔧 SETTING INVENTORY LOCATION\n');
  
  let totalVariants = 0;
  let activatedTracking = 0;
  let setInventory = 0;
  let alreadySet = 0;
  
  for (const product of products) {
    console.log(`\n  ${product.title} (${product.handle})`);
    
    for (const variant of product.variants.nodes) {
      totalVariants++;
      
      if (!variant.inventoryItem) {
        console.log(`     ⚠️  Variant ${variant.sku || variant.title}: No inventory item`);
        continue;
      }
      
      const inventoryItemId = variant.inventoryItem.id;
      const isTracked = variant.inventoryItem.tracked;
      
      // Activate tracking if not already tracked
      if (!isTracked) {
        console.log(`     → Activating inventory tracking for ${variant.sku || variant.title}...`);
        await activateInventoryTracking(inventoryItemId);
        activatedTracking++;
      }
      
      // Check current inventory levels
      const currentLevels = await getInventoryLevels(inventoryItemId, targetLocation.id);
      const hasLocation = currentLevels.length > 0;
      const availableQty = hasLocation 
        ? currentLevels[0].quantities.find(q => q.name === 'available')?.quantity || 0
        : 0;
      const currentQty = availableQty;
      
      // Get inventory quantity from Sanity's inStock field
      const sanityProduct = sanityBySku.get(variant.sku);
      const targetQty = sanityProduct?.inStock ? 100 : 0;
      
      if (!hasLocation || currentQty !== targetQty) {
        console.log(`     → Setting inventory for ${variant.sku || variant.title}...`);
        console.log(`        Location: ${targetLocation.name}`);
        console.log(`        Quantity: ${currentQty} → ${targetQty}`);
        await setInventoryLevel(inventoryItemId, targetLocation.id, targetQty);
        setInventory++;
      } else {
        console.log(`     ✓ ${variant.sku || variant.title}: Already set to ${currentQty} at ${targetLocation.name}`);
        alreadySet++;
      }
    }
  }
  
  // Summary
  console.log('\n' + '═'.repeat(70));
  console.log('\n📊 SUMMARY\n');
  console.log(`   Total variants processed:  ${totalVariants}`);
  console.log(`   Tracking activated:        ${activatedTracking}`);
  console.log(`   Inventory set:             ${setInventory}`);
  console.log(`   Already set correctly:     ${alreadySet}`);
  console.log(`   Target location:          ${targetLocation.name}`);
  
  if (isDryRun) {
    console.log('\n📋 This was a DRY RUN. No changes were made.');
    console.log('   Run without --dry-run to apply changes.\n');
  } else {
    console.log('\n✅ Inventory location setup complete!');
    console.log(`   All products are now mapped to "${targetLocation.name}"\n`);
  }
}

main().catch(console.error);
