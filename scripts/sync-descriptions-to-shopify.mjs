/**
 * Sync Product Descriptions from Sanity to Shopify
 * 
 * Combines Evocation Story, On Skin Story, and Travel Log into a rich HTML description
 * and updates Shopify product descriptions to match Sanity content.
 * 
 * Description Structure:
 * - Title + Legacy Name (if applicable)
 * - Evocation Story (if available)
 * - On Skin Story (if available)
 * - Travel Log / Museum Description (if available)
 * 
 * Usage:
 *   node scripts/sync-descriptions-to-shopify.mjs --dry-run    # Preview changes
 *   node scripts/sync-descriptions-to-shopify.mjs              # Apply changes
 */

// Load environment variables from .env.local and .env
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
    // File might not exist, that's okay
  }
}

// Load .env.local first (takes precedence), then .env
loadEnvFile('.env');
loadEnvFile('.env.local');

import { createClient } from '@sanity/client';
import { PortableText } from '@portabletext/react';

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

// Convert PortableText blocks to HTML
function portableTextToHtml(blocks) {
  if (!blocks || !Array.isArray(blocks)) return '';
  
  return blocks.map(block => {
    if (block._type === 'block') {
      const text = block.children?.map(child => {
        if (child._type === 'span') {
          let content = child.text || '';
          if (child.marks) {
            child.marks.forEach(mark => {
              if (mark === 'strong' || mark === 'b') {
                content = `<strong>${content}</strong>`;
              } else if (mark === 'em' || mark === 'i') {
                content = `<em>${content}</em>`;
              }
            });
          }
          return content;
        }
        return '';
      }).join('') || '';
      
      if (block.style === 'h2') {
        return `<h2>${text}</h2>`;
      } else if (block.style === 'h3') {
        return `<h3>${text}</h3>`;
      } else if (block.style === 'blockquote') {
        return `<blockquote>${text}</blockquote>`;
      } else {
        return `<p>${text}</p>`;
      }
    }
    return '';
  }).join('');
}

// Build HTML description from Sanity product data
function buildShopifyDescription(product) {
  const parts = [];
  
  // Title + Legacy Name
  const legacyName = product.legacyName && product.showLegacyName 
    ? ` (formerly ${product.legacyName})` 
    : '';
  parts.push(`<p><strong>${product.title}${legacyName}</strong></p>`);
  
  // Evocation Story (Atlas only)
  if (product.collectionType === 'atlas' && product.atlasData?.evocationStory && product.atlasData.evocationStory.length > 0) {
    parts.push('<h3>Evocation</h3>');
    product.atlasData.evocationStory.forEach(paragraph => {
      if (paragraph && paragraph.trim()) {
        parts.push(`<p>${paragraph}</p>`);
      }
    });
  }
  
  // On Skin Story (Atlas only)
  if (product.collectionType === 'atlas' && product.atlasData?.onSkinStory && product.atlasData.onSkinStory.length > 0) {
    parts.push('<h3>On Skin</h3>');
    product.atlasData.onSkinStory.forEach(paragraph => {
      if (paragraph && paragraph.trim()) {
        parts.push(`<p>${paragraph}</p>`);
      }
    });
  }
  
  // Travel Log (Atlas) or Museum Description (Relic)
  if (product.collectionType === 'atlas' && product.atlasData?.travelLog) {
    const travelLogHtml = portableTextToHtml(product.atlasData.travelLog);
    if (travelLogHtml) {
      parts.push('<h3>The Journey</h3>');
      parts.push(travelLogHtml);
    }
  } else if (product.collectionType === 'relic' && product.relicData?.museumDescription) {
    const museumHtml = portableTextToHtml(product.relicData.museumDescription);
    if (museumHtml) {
      parts.push('<h3>Curator\'s Notes</h3>');
      parts.push(museumHtml);
    }
  }
  
  return parts.join('\n');
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
            descriptionHtml
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

// Update product description in Shopify using REST API
async function updateProductDescription(productId, descriptionHtml, productTitle) {
  if (isDryRun) {
    console.log(`      [DRY RUN] Would update description (${descriptionHtml.length} chars)`);
    return true;
  }
  
  // Extract numeric ID from GID
  const numericId = productId.replace('gid://shopify/Product/', '');
  
  try {
    const response = await fetch(
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
            body_html: descriptionHtml,
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
    console.log(`      ✅ Updated description (${descriptionHtml.length} chars)`);
    return true;
  } catch (error) {
    console.error(`      ❌ Error updating: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('\n📝 SYNC DESCRIPTIONS: SANITY → SHOPIFY\n');
  console.log(isDryRun ? '📋 DRY RUN MODE (no changes will be made)\n' : '🚀 LIVE MODE\n');
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
      "slug": slug.current,
      collectionType,
      legacyName,
      showLegacyName,
      "shopifyHandle": store.slug.current,
      "shopifyProductId": coalesce(shopifyProductId, store.id),
      atlasData {
        evocationStory,
        onSkinStory,
        travelLog
      },
      relicData {
        museumDescription
      }
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
      sp.handle === sanityProduct.slug || 
      sp.handle === sanityProduct.shopifyHandle
    );
    
    if (shopifyProduct) {
      matched.push({
        sanity: sanityProduct,
        shopify: shopifyProduct,
      });
    } else {
      unmatched.push(sanityProduct);
    }
  }
  
  console.log(`   ✅ Matched: ${matched.length} products`);
  console.log(`   ⚠️  Unmatched: ${unmatched.length} products`);
  
  if (unmatched.length > 0) {
    console.log('\n   Unmatched products (won\'t be updated):');
    for (const p of unmatched.slice(0, 5)) {
      console.log(`      - ${p.title} (slug: ${p.slug})`);
    }
    if (unmatched.length > 5) {
      console.log(`      ... and ${unmatched.length - 5} more`);
    }
  }
  
  // 4. Build and update descriptions
  console.log('\n' + '═'.repeat(70));
  console.log('\n📝 UPDATING DESCRIPTIONS\n');
  
  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  
  for (const { sanity, shopify } of matched) {
    const newDescription = buildShopifyDescription(sanity);
    const currentDescription = shopify.descriptionHtml || '';
    
    // Normalize for comparison (remove extra whitespace)
    const normalizedNew = newDescription.replace(/\s+/g, ' ').trim();
    const normalizedCurrent = currentDescription.replace(/\s+/g, ' ').trim();
    
    console.log(`\n  ${sanity.title}`);
    console.log(`     Shopify: ${shopify.handle}`);
    
    if (normalizedNew === normalizedCurrent) {
      console.log(`     ✓ Description already matches`);
      skippedCount++;
      continue;
    }
    
    console.log(`     → Updating description...`);
    console.log(`        Current: ${currentDescription.length} chars`);
    console.log(`        New: ${newDescription.length} chars`);
    
    if (isDryRun) {
      console.log(`        Preview (first 200 chars): ${newDescription.substring(0, 200)}...`);
    }
    
    const success = await updateProductDescription(
      shopify.id,
      newDescription,
      sanity.title
    );
    
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
  console.log(`   Descriptions updated: ${updatedCount}`);
  console.log(`   Descriptions skipped: ${skippedCount} (already match)`);
  console.log(`   Errors:               ${errorCount}`);
  
  if (isDryRun) {
    console.log('\n📋 This was a DRY RUN. No changes were made.');
    console.log('   Run without --dry-run to apply changes.\n');
  } else {
    console.log('\n✅ Description sync complete!\n');
  }
}

main().catch(console.error);
