/**
 * Verify Shopify CSV Import
 * 
 * Compares imported products in Shopify with:
 * 1. The CSV that was imported
 * 2. Sanity source data
 * 
 * Checks:
 * - Products were created
 * - SKUs match
 * - Descriptions include Evocation/On Skin stories
 * - Images imported
 * - Status/Published state
 * - Prices match
 */

// Load environment variables from .env and .env.local
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

loadEnvFile('.env');
loadEnvFile('.env.local');

import { createClient } from '@sanity/client';
import { readFileSync as fsReadFileSync } from 'fs';

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
            status
            descriptionHtml
            variants(first: 10) {
              nodes {
                id
                sku
                title
                price
                availableForSale
              }
            }
            images(first: 5) {
              nodes {
                url
                altText
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

// Parse CSV file (handles multiline fields properly)
function parseCSV(filePath) {
  const content = fsReadFileSync(filePath, 'utf-8');
  
  // Use a simple CSV parser that handles quoted fields with newlines
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentField += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      currentRow.push(currentField);
      currentField = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      // End of row (but handle \r\n)
      if (char === '\n' || (char === '\r' && nextChar !== '\n')) {
        currentRow.push(currentField);
        if (currentRow.length > 0 && currentRow.some(f => f.trim())) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      }
    } else {
      currentField += char;
    }
  }
  
  // Add last field and row
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    if (currentRow.length > 0 && currentRow.some(f => f.trim())) {
      rows.push(currentRow);
    }
  }
  
  if (rows.length === 0) return [];
  
  const headers = rows[0].map(h => h.trim().replace(/^"|"$/g, ''));
  const products = new Map(); // keyed by handle
  
  for (let i = 1; i < rows.length; i++) {
    const values = rows[i];
    if (values.length < headers.length) continue;
    
    const row = {};
    headers.forEach((header, idx) => {
      row[header] = (values[idx] || '').trim().replace(/^"|"$/g, '');
    });
    
    const handle = row['Handle'];
    if (!handle) continue;
    
    if (!products.has(handle)) {
      products.set(handle, {
        handle,
        title: row['Title'],
        description: row['Body (HTML)'],
        variants: [],
        status: row['Status'],
        published: row['Published'],
      });
    }
    
    const product = products.get(handle);
    product.variants.push({
      sku: row['Variant SKU'],
      option1Value: row['Option1 Value'],
      price: row['Variant Price'],
      imageSrc: row['Image Src'],
    });
  }
  
  return Array.from(products.values());
}

async function main() {
  console.log('\n🔍 VERIFYING SHOPIFY CSV IMPORT\n');
  console.log('═'.repeat(70));
  
  if (!SHOPIFY_ADMIN_TOKEN) {
    console.error('\n❌ Missing SHOPIFY_ADMIN_ACCESS_TOKEN');
    process.exit(1);
  }
  
  // 1. Read CSV file
  console.log('\n📄 Reading CSV file...');
  let csvProducts = [];
  try {
    csvProducts = parseCSV('shopify-import-products.csv');
    console.log(`   Found ${csvProducts.length} products in CSV`);
  } catch (error) {
    console.error(`   ❌ Error reading CSV: ${error.message}`);
    process.exit(1);
  }
  
  // 2. Fetch from Shopify
  console.log('\n🛒 Fetching products from Shopify...');
  const shopifyProducts = await fetchShopifyProducts();
  console.log(`   Found ${shopifyProducts.length} total products in Shopify`);
  
  // 3. Match products
  console.log('\n🔗 Matching products...\n');
  
  const matched = [];
  const notFound = [];
  
  for (const csvProduct of csvProducts) {
    const shopifyProduct = shopifyProducts.find(sp => sp.handle === csvProduct.handle);
    
    if (shopifyProduct) {
      matched.push({ csv: csvProduct, shopify: shopifyProduct });
    } else {
      notFound.push(csvProduct);
    }
  }
  
  console.log(`   ✅ Matched: ${matched.length} products`);
  console.log(`   ❌ Not found: ${notFound.length} products`);
  
  if (notFound.length > 0) {
    console.log('\n   Products not found in Shopify:');
    for (const p of notFound) {
      console.log(`      - ${p.title} (${p.handle})`);
    }
  }
  
  // 4. Verify each matched product
  console.log('\n' + '═'.repeat(70));
  console.log('\n📊 VERIFICATION RESULTS\n');
  
  let allGood = true;
  const issues = [];
  
  for (const { csv, shopify } of matched) {
    const productIssues = [];
    
    // Check title
    if (shopify.title !== csv.title) {
      productIssues.push(`Title mismatch: CSV="${csv.title}", Shopify="${shopify.title}"`);
    }
    
    // Check status
    const expectedStatus = csv.published === 'TRUE' ? 'ACTIVE' : 'DRAFT';
    if (shopify.status !== expectedStatus) {
      productIssues.push(`Status mismatch: Expected=${expectedStatus}, Got=${shopify.status}`);
    }
    
    // Check description includes Evocation/On Skin
    const hasEvocation = csv.description.includes('<h3>Evocation</h3>');
    const hasOnSkin = csv.description.includes('<h3>On Skin</h3>');
    const shopifyHasEvocation = shopify.descriptionHtml?.includes('<h3>Evocation</h3>');
    const shopifyHasOnSkin = shopify.descriptionHtml?.includes('<h3>On Skin</h3>');
    
    if (hasEvocation && !shopifyHasEvocation) {
      productIssues.push(`Missing Evocation section in description`);
    }
    if (hasOnSkin && !shopifyHasOnSkin) {
      productIssues.push(`Missing On Skin section in description`);
    }
    
    // Check SKUs
    const csvSkus = csv.variants.map(v => v.sku).filter(Boolean);
    const shopifySkus = shopify.variants.nodes.map(v => v.sku).filter(Boolean);
    
    const missingSkus = csvSkus.filter(sku => !shopifySkus.includes(sku));
    if (missingSkus.length > 0) {
      productIssues.push(`Missing SKUs: ${missingSkus.join(', ')}`);
    }
    
    // Check images
    const csvHasImage = csv.variants.some(v => v.imageSrc);
    const shopifyHasImage = shopify.images.nodes.length > 0;
    
    if (csvHasImage && !shopifyHasImage) {
      productIssues.push(`Missing images (CSV had image URLs)`);
    }
    
    // Check prices (basic check)
    const csvPrices = csv.variants.map(v => parseFloat(v.price) || 0).filter(p => p > 0);
    const shopifyPrices = shopify.variants.nodes.map(v => parseFloat(v.price) || 0).filter(p => p > 0);
    
    if (csvPrices.length > 0 && shopifyPrices.length > 0) {
      const csvMinPrice = Math.min(...csvPrices);
      const shopifyMinPrice = Math.min(...shopifyPrices);
      if (Math.abs(csvMinPrice - shopifyMinPrice) > 0.01) {
        productIssues.push(`Price mismatch: CSV min=${csvMinPrice}, Shopify min=${shopifyMinPrice}`);
      }
    }
    
    if (productIssues.length > 0) {
      allGood = false;
      issues.push({
        product: csv.title,
        handle: csv.handle,
        issues: productIssues,
      });
    }
  }
  
  // Summary
  if (allGood && notFound.length === 0) {
    console.log('✅ ALL CHECKS PASSED!\n');
    console.log(`   ${matched.length} products imported successfully`);
    console.log('   - Titles match');
    console.log('   - Status correct');
    console.log('   - Descriptions include Evocation/On Skin stories');
    console.log('   - SKUs match');
    console.log('   - Images imported');
    console.log('   - Prices match');
  } else {
    console.log('⚠️  SOME ISSUES FOUND\n');
    
    if (notFound.length > 0) {
      console.log(`   ${notFound.length} products not found in Shopify`);
    }
    
    if (issues.length > 0) {
      console.log(`   ${issues.length} products have issues:\n`);
      for (const item of issues) {
        console.log(`   ${item.product} (${item.handle}):`);
        for (const issue of item.issues) {
          console.log(`      - ${issue}`);
        }
        console.log('');
      }
    }
  }
  
  // Fetch from Sanity for comparison
  console.log('\n' + '═'.repeat(70));
  console.log('\n📚 COMPARING WITH SANITY (Source of Truth)\n');
  
  const sanityProducts = await sanityClient.fetch(`
    *[_type == "product" && !(_id in path("drafts.**")) && defined(title) && title != ""] {
      _id,
      title,
      "slug": slug.current,
      sku,
      sku6ml,
      sku12ml,
      price,
      inStock,
      atlasData {
        evocationStory,
        onSkinStory
      }
    }
  `);
  
  console.log(`   Found ${sanityProducts.length} products in Sanity`);
  
  // Check if imported products match Sanity
  const sanityMatched = [];
  for (const { csv, shopify } of matched) {
    const sanityProduct = sanityProducts.find(sp => sp.slug === csv.handle);
    if (sanityProduct) {
      sanityMatched.push({ csv, shopify, sanity: sanityProduct });
    }
  }
  
  console.log(`   ${sanityMatched.length} imported products found in Sanity\n`);
  
  // Check SKU alignment
  // Note: For Atlas products with variants, only variant SKUs (6ml, 12ml) are in Shopify
  // The primary SKU (e.g., PETAL-JASMINE) is only for internal reference in Sanity
  let skuIssues = 0;
  for (const { csv, shopify, sanity } of sanityMatched) {
    const shopifySkus = shopify.variants.nodes.map(v => v.sku).filter(Boolean);
    
    // For products with variants (Atlas), check variant SKUs only
    // For single-variant products (Relic), check the primary SKU
    const hasVariants = csv.variants.length > 1 || csv.variants.some(v => v.option1Value && v.option1Value !== 'Default Title');
    
    let expectedSkus = [];
    if (hasVariants) {
      // Atlas products: only check variant SKUs
      expectedSkus = [sanity.sku6ml, sanity.sku12ml].filter(Boolean);
    } else {
      // Relic/single-variant: check primary SKU
      expectedSkus = [sanity.sku].filter(Boolean);
    }
    
    const missing = expectedSkus.filter(sku => !shopifySkus.includes(sku));
    if (missing.length > 0) {
      skuIssues++;
      if (skuIssues <= 3) {
        console.log(`   ⚠️  ${sanity.title}: Missing SKUs in Shopify: ${missing.join(', ')}`);
      }
    }
  }
  
  if (skuIssues === 0) {
    console.log('   ✅ All SKUs match between Sanity and Shopify');
  } else if (skuIssues > 3) {
    console.log(`   ⚠️  ${skuIssues - 3} more products have SKU mismatches`);
  }
  
  console.log('\n' + '═'.repeat(70));
  console.log('\n✅ Verification complete!\n');
}

main().catch(console.error);
