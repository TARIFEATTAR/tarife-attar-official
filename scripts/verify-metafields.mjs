/**
 * Verify Metafields Are Visible
 * 
 * Checks if preview_url metafields are set and visible in Shopify Admin.
 * 
 * Usage:
 *   node scripts/verify-metafields.mjs
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

// Fetch products with metafields
async function fetchProductsWithMetafields() {
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
            metafields(first: 10, namespace: "custom") {
              nodes {
                key
                value
                type
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
  console.log('\n🔍 VERIFYING METAFIELDS\n');
  console.log('═'.repeat(70));
  
  if (!SHOPIFY_ADMIN_TOKEN) {
    console.error('\n❌ Missing SHOPIFY_ADMIN_ACCESS_TOKEN');
    process.exit(1);
  }
  
  console.log('\n📦 Fetching products with metafields...');
  const products = await fetchProductsWithMetafields();
  console.log(`   Found ${products.length} products\n`);
  
  console.log('🔍 Checking preview_url metafields...\n');
  
  let withPreviewUrl = 0;
  let withoutPreviewUrl = 0;
  
  for (const product of products) {
    const previewUrlMetafield = product.metafields.nodes.find(
      m => m.key === 'preview_url'
    );
    
    if (previewUrlMetafield) {
      withPreviewUrl++;
      if (withPreviewUrl <= 5) {
        console.log(`  ✅ ${product.title} (${product.handle})`);
        console.log(`     Preview URL: ${previewUrlMetafield.value}`);
      }
    } else {
      withoutPreviewUrl++;
      if (withoutPreviewUrl <= 5) {
        console.log(`  ❌ ${product.title} (${product.handle})`);
        console.log(`     Missing preview_url metafield`);
      }
    }
  }
  
  console.log('\n' + '═'.repeat(70));
  console.log('\n📊 SUMMARY\n');
  console.log(`   Total products:          ${products.length}`);
  console.log(`   With preview_url:       ${withPreviewUrl}`);
  console.log(`   Without preview_url:     ${withoutPreviewUrl}`);
  
  if (withoutPreviewUrl > 0) {
    console.log('\n⚠️  Some products are missing preview_url metafields.');
    console.log('   Run: node scripts/set-shopify-preview-urls.mjs\n');
  } else {
    console.log('\n✅ All products have preview_url metafields!');
    console.log('\n📝 To view metafields in Shopify Admin:');
    console.log('   1. Go to Products → Select a product');
    console.log('   2. Scroll to "Metafields" section');
    console.log('   3. Look for "Preview URL" metafield');
    console.log('   4. If not visible, check Settings → Custom data → Metafields\n');
  }
}

main().catch(console.error);
