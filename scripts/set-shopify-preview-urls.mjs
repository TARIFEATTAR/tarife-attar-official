/**
 * Set Shopify Preview URLs to Headless Site
 * 
 * Updates Shopify products with custom preview URLs that point to the headless site.
 * This allows "Preview" button in Shopify Admin to open products on tarifeattar.com
 * instead of the default Shopify storefront.
 * 
 * Usage:
 *   node scripts/set-shopify-preview-urls.mjs --dry-run    # Preview
 *   node scripts/set-shopify-preview-urls.mjs              # Apply
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
const HEADLESS_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tarifeattar.com';

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

// Set preview URL using metafield
async function setPreviewUrl(productId, previewUrl) {
  if (isDryRun) {
    console.log(`      [DRY RUN] Would set preview URL: ${previewUrl}`);
    return true;
  }
  
  // Extract numeric ID from GID
  const numericId = productId.replace('gid://shopify/Product/', '');
  
  try {
    // Use REST API to set metafield for preview URL
    // First, check if metafield exists
    const getResponse = await fetch(
      `https://${SHOPIFY_STORE}/admin/api/${SHOPIFY_API_VERSION}/products/${numericId}/metafields.json?namespace=custom&key=preview_url`,
      {
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN,
        },
      }
    );
    
    let metafieldId = null;
    if (getResponse.ok) {
      const data = await getResponse.json();
      if (data.metafields && data.metafields.length > 0) {
        metafieldId = data.metafields[0].id;
      }
    }
    
    // Create or update metafield
    const metafieldData = {
      metafield: {
        namespace: 'custom',
        key: 'preview_url',
        value: previewUrl,
        type: 'url',
      },
    };
    
    let response;
    if (metafieldId) {
      // Update existing metafield
      response = await fetch(
        `https://${SHOPIFY_STORE}/admin/api/${SHOPIFY_API_VERSION}/metafields/${metafieldId}.json`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN,
          },
          body: JSON.stringify(metafieldData),
        }
      );
    } else {
      // Create new metafield
      response = await fetch(
        `https://${SHOPIFY_STORE}/admin/api/${SHOPIFY_API_VERSION}/products/${numericId}/metafields.json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN,
          },
          body: JSON.stringify(metafieldData),
        }
      );
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`      ❌ Error: ${response.status} - ${errorText}`);
      return false;
    }
    
    console.log(`      ✅ Set preview URL: ${previewUrl}`);
    return true;
  } catch (error) {
    console.error(`      ❌ Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('\n🔗 SETTING SHOPIFY PREVIEW URLS\n');
  console.log(isDryRun ? '📋 DRY RUN MODE (no changes will be made)\n' : '🚀 LIVE MODE\n');
  console.log('═'.repeat(70));
  console.log(`\n   Headless Site URL: ${HEADLESS_SITE_URL}`);
  console.log(`   Preview URLs will point to: ${HEADLESS_SITE_URL}/product/[slug]\n`);
  console.log('═'.repeat(70));
  
  if (!SHOPIFY_ADMIN_TOKEN) {
    console.error('\n❌ Missing SHOPIFY_ADMIN_ACCESS_TOKEN');
    process.exit(1);
  }
  
  // 1. Fetch products from Sanity
  console.log('\n📚 Fetching products from Sanity...');
  const sanityProducts = await sanityClient.fetch(`
    *[_type == "product" && !(_id in path("drafts.**")) && defined(title) && title != ""] {
      _id,
      title,
      "slug": slug.current
    }
  `);
  console.log(`   Found ${sanityProducts.length} products in Sanity`);
  
  // 2. Fetch products from Shopify
  console.log('\n🛒 Fetching products from Shopify...');
  const shopifyProducts = await fetchShopifyProducts();
  console.log(`   Found ${shopifyProducts.length} products in Shopify`);
  
  // 3. Match products
  console.log('\n🔗 Matching products...\n');
  
  const matched = [];
  const unmatched = [];
  
  for (const sanityProduct of sanityProducts) {
    const shopifyProduct = shopifyProducts.find(sp => 
      sp.handle === sanityProduct.slug
    );
    
    if (shopifyProduct) {
      matched.push({ 
        sanity: sanityProduct, 
        shopify: shopifyProduct,
        previewUrl: `${HEADLESS_SITE_URL}/product/${sanityProduct.slug}`
      });
    } else {
      unmatched.push(sanityProduct);
    }
  }
  
  console.log(`   ✅ Matched: ${matched.length} products`);
  console.log(`   ⚠️  Unmatched: ${unmatched.length} products`);
  
  // 4. Set preview URLs
  console.log('\n' + '═'.repeat(70));
  console.log('\n🔗 SETTING PREVIEW URLS\n');
  
  let updatedCount = 0;
  let errorCount = 0;
  
  for (const { sanity, shopify, previewUrl } of matched) {
    console.log(`\n  ${sanity.title} (${sanity.slug})`);
    console.log(`     Shopify handle: ${shopify.handle}`);
    console.log(`     Preview URL: ${previewUrl}`);
    console.log(`     → Setting preview URL...`);
    
    const success = await setPreviewUrl(shopify.id, previewUrl);
    
    if (success) {
      updatedCount++;
    } else {
      errorCount++;
    }
  }
  
  // Summary
  console.log('\n' + '═'.repeat(70));
  console.log('\n📊 SUMMARY\n');
  console.log(`   Products matched:     ${matched.length}`);
  console.log(`   Preview URLs set:     ${updatedCount}`);
  console.log(`   Errors:               ${errorCount}`);
  
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
    console.log('\n✅ Preview URLs set!');
    console.log('\n📝 IMPORTANT: Shopify Admin Preview Button');
    console.log('   The "Preview" button in Shopify Admin may still use the default storefront.');
    console.log('   To preview on your headless site:');
    console.log(`   1. Copy the preview URL from the metafield: ${HEADLESS_SITE_URL}/product/[slug]`);
    console.log('   2. Or use the "View" button and manually navigate');
    console.log('   3. Or install a Shopify app that supports custom preview URLs\n');
  }
}

main().catch(console.error);
