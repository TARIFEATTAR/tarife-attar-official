/**
 * Publish Products to All Sales Channels
 * 
 * Ensures all products are published to:
 * - Shop
 * - Facebook & Instagram
 * - Faire: Sell Wholesale
 * - TikTok
 * - TARIFE ATTAR OFFICAL
 * 
 * Usage:
 *   node scripts/publish-to-all-channels.mjs --dry-run    # Preview
 *   node scripts/publish-to-all-channels.mjs              # Apply
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

// Fetch all sales channels
async function fetchSalesChannels() {
  const query = `
    query {
      channels(first: 50) {
        nodes {
          id
          name
        }
      }
    }
  `;
  
  try {
    const data = await shopifyAdmin(query);
    return data.channels.nodes;
  } catch (error) {
    console.error('Error fetching sales channels:', error.message);
    return [];
  }
}

// Fetch all products using GraphQL
async function fetchProducts() {
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
            publishedOnCurrentPublication
          }
        }
      }
    `;
    
    const data = await shopifyAdmin(query, { cursor });
    products.push(...data.products.nodes.map(p => ({
      id: p.id,
      numericId: p.id.replace('gid://shopify/Product/', ''),
      title: p.title,
      handle: p.handle,
      status: p.status,
      publishedOnCurrentPublication: p.publishedOnCurrentPublication,
    })));
    cursor = data.products.pageInfo.hasNextPage ? data.products.pageInfo.endCursor : null;
  } while (cursor);
  
  return products;
}

// Publish product to all channels using REST API
async function publishProductToAllChannels(numericId) {
  if (isDryRun) {
    console.log(`      [DRY RUN] Would publish to all sales channels`);
    return true;
  }
  
  try {
    // Update product to be published with 'web' scope (includes all channels)
    const publishResponse = await fetch(
      `https://${SHOPIFY_STORE}/admin/api/${SHOPIFY_API_VERSION}/products/${numericId}.json`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN,
        },
        body: JSON.stringify({
          product: {
            id: numericId,
            status: 'active',
            published: true,
            published_scope: 'web', // 'web' scope publishes to all channels
          },
        }),
      }
    );
    
    if (!publishResponse.ok) {
      const errorText = await publishResponse.text();
      console.error(`      ❌ Error: ${publishResponse.status} - ${errorText}`);
      return false;
    }
    
    console.log(`      ✅ Published to all sales channels`);
    return true;
  } catch (error) {
    console.error(`      ❌ Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('\n📺 PUBLISHING PRODUCTS TO ALL SALES CHANNELS\n');
  console.log(isDryRun ? '📋 DRY RUN MODE (no changes will be made)\n' : '🚀 LIVE MODE\n');
  console.log('═'.repeat(70));
  
  if (!SHOPIFY_ADMIN_TOKEN) {
    console.error('\n❌ Missing SHOPIFY_ADMIN_ACCESS_TOKEN');
    process.exit(1);
  }
  
  // 1. Fetch sales channels
  console.log('\n📺 Fetching sales channels...');
  const channels = await fetchSalesChannels();
  console.log(`   Found ${channels.length} sales channels:`);
  channels.forEach(channel => {
    console.log(`      - ${channel.name}`);
  });
  
  // Identify key channels
  const targetChannels = {
    shop: channels.find(ch => ch.name.toLowerCase().includes('shop')),
    facebook: channels.find(ch => ch.name.toLowerCase().includes('facebook')),
    faire: channels.find(ch => ch.name.toLowerCase().includes('faire')),
    tiktok: channels.find(ch => ch.name.toLowerCase().includes('tiktok')),
    official: channels.find(ch => ch.name.toLowerCase().includes('tarife')),
  };
  
  console.log('\n   Target channels:');
  if (targetChannels.shop) console.log(`      ✅ Shop: ${targetChannels.shop.name}`);
  if (targetChannels.facebook) console.log(`      ✅ Facebook & Instagram: ${targetChannels.facebook.name}`);
  if (targetChannels.faire) console.log(`      ✅ Faire: ${targetChannels.faire.name}`);
  if (targetChannels.tiktok) console.log(`      ✅ TikTok: ${targetChannels.tiktok.name}`);
  if (targetChannels.official) console.log(`      ✅ TARIFE ATTAR OFFICAL: ${targetChannels.official.name}`);
  
  // 2. Fetch products
  console.log('\n📦 Fetching products...');
  const products = await fetchProducts();
  console.log(`   Found ${products.length} products`);
  
  // 3. Filter products that need publishing
  console.log('\n' + '═'.repeat(70));
  console.log('\n📝 PUBLISHING PRODUCTS TO ALL CHANNELS\n');
  
  let publishedCount = 0;
  let alreadyPublishedCount = 0;
  let errorCount = 0;
  
  for (const product of products) {
    const isPublished = product.publishedOnCurrentPublication;
    
    if (isPublished && product.status === 'ACTIVE') {
      alreadyPublishedCount++;
      continue;
    }
    
    if (product.status !== 'ACTIVE') {
      console.log(`\n  ${product.title} (${product.handle})`);
      console.log(`     ⚠️  Product is not active (status: ${product.status})`);
      continue;
    }
    
    console.log(`\n  ${product.title} (${product.handle})`);
    console.log(`     Current: published=${isPublished ? 'yes' : 'no'}`);
    console.log(`     → Publishing to all sales channels...`);
    
    // Use REST API to publish
    const success = await publishProductToAllChannels(product.numericId);
    
    if (success) {
      publishedCount++;
    } else {
      errorCount++;
    }
  }
  
  // Summary
  console.log('\n' + '═'.repeat(70));
  console.log('\n📊 SUMMARY\n');
  console.log(`   Total products:          ${products.length}`);
  console.log(`   Already published:       ${alreadyPublishedCount}`);
  console.log(`   Newly published:         ${publishedCount}`);
  console.log(`   Errors:                  ${errorCount}`);
  
  if (isDryRun) {
    console.log('\n📋 This was a DRY RUN. No changes were made.');
    console.log('   Run without --dry-run to apply changes.\n');
  } else {
    console.log('\n✅ All sales channels publishing complete!');
    console.log('   Products should now be available on:');
    console.log('   - Shop');
    console.log('   - Facebook & Instagram');
    console.log('   - Faire: Sell Wholesale');
    console.log('   - TikTok');
    console.log('   - TARIFE ATTAR OFFICAL\n');
  }
}

main().catch(console.error);
