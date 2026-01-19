#!/usr/bin/env node
/**
 * Launch Readiness Checker
 * 
 * This script checks all configurations needed for launching the Tarife Attar site
 * and provides clear guidance on what's missing.
 * 
 * Usage:
 *   node scripts/launch-readiness.mjs
 */

import { createClient } from '@sanity/client';

// Configuration
const SANITY_PROJECT_ID = '8h5l91ut';
const SANITY_DATASET = 'production';
const EXPECTED_SHOPIFY_DOMAIN = 'vasana-perfumes.myshopify.com';
const PRODUCTION_DOMAIN = 'tarifeattar.com';

// Environment variables to check
const ENV_VARS = {
  SANITY_WRITE_TOKEN: process.env.SANITY_WRITE_TOKEN,
  NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN,
  NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
  NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
  SANITY_REVALIDATE_SECRET: process.env.SANITY_REVALIDATE_SECRET,
};

// Territory pricing
const TERRITORY_PRICING = {
  ember: { '6ml': 28, '12ml': 48 },
  petal: { '6ml': 30, '12ml': 50 },
  tidal: { '6ml': 30, '12ml': 50 },
  terra: { '6ml': 33, '12ml': 55 },
};

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
};

function log(message, color = '') {
  console.log(`${color}${message}${colors.reset}`);
}

function header(title) {
  console.log('\n' + '═'.repeat(60));
  log(title, colors.bold + colors.cyan);
  console.log('═'.repeat(60));
}

function check(condition, pass, fail) {
  if (condition) {
    log(`  ✅ ${pass}`, colors.green);
    return true;
  } else {
    log(`  ❌ ${fail}`, colors.red);
    return false;
  }
}

function warn(message) {
  log(`  ⚠️  ${message}`, colors.yellow);
}

function info(message) {
  log(`  ℹ️  ${message}`, colors.dim);
}

async function shopifyFetch(query) {
  const domain = ENV_VARS.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  const token = ENV_VARS.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  
  if (!domain || !token) return null;
  
  try {
    const endpoint = `https://${domain}/api/2026-01/graphql.json`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token,
      },
      body: JSON.stringify({ query }),
    });
    return await response.json();
  } catch (error) {
    return { error: error.message };
  }
}

async function main() {
  console.clear();
  log('\n🚀 TARIFE ATTÄR LAUNCH READINESS CHECK\n', colors.bold + colors.cyan);
  
  let allPassed = true;
  const issues = [];
  const actions = [];
  
  // ============================================================
  // PHASE 1: Environment Variables
  // ============================================================
  header('Phase 1: Environment Variables');
  
  // Sanity
  if (!check(ENV_VARS.NEXT_PUBLIC_SANITY_PROJECT_ID, 
    'NEXT_PUBLIC_SANITY_PROJECT_ID is set',
    'NEXT_PUBLIC_SANITY_PROJECT_ID is missing')) {
    allPassed = false;
    actions.push('Add NEXT_PUBLIC_SANITY_PROJECT_ID=8h5l91ut to .env.local and Vercel');
  }
  
  if (!check(ENV_VARS.NEXT_PUBLIC_SANITY_DATASET,
    'NEXT_PUBLIC_SANITY_DATASET is set',
    'NEXT_PUBLIC_SANITY_DATASET is missing')) {
    allPassed = false;
    actions.push('Add NEXT_PUBLIC_SANITY_DATASET=production to .env.local and Vercel');
  }
  
  if (!check(ENV_VARS.SANITY_WRITE_TOKEN,
    'SANITY_WRITE_TOKEN is set (for scripts)',
    'SANITY_WRITE_TOKEN is missing (needed for sync scripts)')) {
    allPassed = false;
    actions.push('Add SANITY_WRITE_TOKEN to .env.local (get from sanity.io/manage → API → Tokens)');
  }
  
  // Shopify
  if (!check(ENV_VARS.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN,
    `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN is set (${ENV_VARS.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN})`,
    'NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN is missing')) {
    allPassed = false;
    actions.push(`Add NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=${EXPECTED_SHOPIFY_DOMAIN} to .env.local and Vercel`);
  }
  
  if (!check(ENV_VARS.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
    'NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN is set',
    'NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN is missing')) {
    allPassed = false;
    issues.push('No Shopify Storefront API token');
    actions.push('Create Storefront API token in Shopify Admin → Settings → Apps → Develop apps');
  }
  
  // Optional webhook secret
  if (!ENV_VARS.SANITY_REVALIDATE_SECRET) {
    warn('SANITY_REVALIDATE_SECRET is not set (optional but recommended for webhook security)');
  } else {
    check(true, 'SANITY_REVALIDATE_SECRET is set', '');
  }
  
  // ============================================================
  // PHASE 2: Shopify Connection
  // ============================================================
  header('Phase 2: Shopify Connection');
  
  if (ENV_VARS.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN && ENV_VARS.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
    log('  Testing Shopify API connection...', colors.dim);
    
    const testQuery = `{ shop { name } }`;
    const result = await shopifyFetch(testQuery);
    
    if (result?.data?.shop?.name) {
      check(true, `Connected to Shopify store: ${result.data.shop.name}`, '');
      
      // Fetch products and variants
      log('\n  Checking product variants...', colors.dim);
      const productsQuery = `{
        products(first: 100) {
          edges {
            node {
              title
              variants(first: 10) {
                edges {
                  node {
                    id
                    title
                    price { amount }
                  }
                }
              }
            }
          }
        }
      }`;
      
      const productsResult = await shopifyFetch(productsQuery);
      const products = productsResult?.data?.products?.edges || [];
      
      log(`  Found ${products.length} products in Shopify`, colors.dim);
      
      // Check for 6ml/12ml variants
      let productsWithBothVariants = 0;
      let productsWithMissingVariants = [];
      
      for (const { node: product } of products) {
        const variants = product.variants.edges.map(e => e.node);
        const has6ml = variants.some(v => v.title?.toLowerCase().includes('6ml') || v.title === '6ml');
        const has12ml = variants.some(v => v.title?.toLowerCase().includes('12ml') || v.title === '12ml');
        
        if (has6ml && has12ml) {
          productsWithBothVariants++;
        } else if (variants.length === 1 && variants[0].title === 'Default Title') {
          // Single variant product - might be Relic or special
        } else {
          productsWithMissingVariants.push(product.title);
        }
      }
      
      if (productsWithBothVariants > 0) {
        check(true, `${productsWithBothVariants} products have 6ml/12ml variants`, '');
      }
      
      if (productsWithMissingVariants.length > 0 && productsWithMissingVariants.length < 10) {
        warn(`Some products may be missing variants: ${productsWithMissingVariants.slice(0, 5).join(', ')}...`);
      }
      
    } else if (result?.error) {
      check(false, '', `Shopify API error: ${result.error}`);
      allPassed = false;
    } else {
      check(false, '', 'Could not connect to Shopify (invalid token or domain?)');
      allPassed = false;
      actions.push('Verify your Storefront API token has correct permissions');
    }
  } else {
    warn('Skipping Shopify connection test (missing credentials)');
  }
  
  // ============================================================
  // PHASE 3: Sanity Products
  // ============================================================
  header('Phase 3: Sanity Products');
  
  const sanityClient = createClient({
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    apiVersion: '2024-01-01',
    useCdn: false,
  });
  
  try {
    // Count Atlas products
    const atlasProducts = await sanityClient.fetch(`
      *[_type == "product" && collectionType == "atlas"] {
        _id,
        title,
        "slug": slug.current,
        "atmosphere": atlasData.atmosphere,
        shopifyVariantId,
        shopifyVariant6mlId,
        shopifyVariant12mlId,
        inStock
      }
    `);
    
    check(atlasProducts.length > 0, `Found ${atlasProducts.length} Atlas products in Sanity`, 'No Atlas products found in Sanity');
    
    // Check for Shopify variant links
    const linked = atlasProducts.filter(p => p.shopifyVariantId || p.shopifyVariant6mlId);
    const linkedWith6ml = atlasProducts.filter(p => p.shopifyVariant6mlId);
    const linkedWith12ml = atlasProducts.filter(p => p.shopifyVariant12mlId);
    
    if (linked.length === atlasProducts.length) {
      check(true, `All ${linked.length} Atlas products have Shopify variant IDs`, '');
    } else {
      check(false, '', `Only ${linked.length}/${atlasProducts.length} Atlas products have Shopify variant IDs`);
      allPassed = false;
      actions.push('Run: node scripts/sync-shopify-to-atlas.mjs');
    }
    
    if (linkedWith6ml.length > 0) {
      log(`  📦 ${linkedWith6ml.length} products have 6ml variant ID`, colors.dim);
    }
    if (linkedWith12ml.length > 0) {
      log(`  📦 ${linkedWith12ml.length} products have 12ml variant ID`, colors.dim);
    }
    
    // Check territory distribution
    const territories = { ember: 0, petal: 0, tidal: 0, terra: 0 };
    for (const p of atlasProducts) {
      if (p.atmosphere && territories[p.atmosphere] !== undefined) {
        territories[p.atmosphere]++;
      }
    }
    
    log('\n  Territory distribution:', colors.dim);
    for (const [t, count] of Object.entries(territories)) {
      log(`    ${t.toUpperCase()}: ${count} products`, colors.dim);
    }
    
    // Count Relic products
    const relicProducts = await sanityClient.fetch(`
      count(*[_type == "product" && collectionType == "relic"])
    `);
    log(`\n  Found ${relicProducts} Relic products in Sanity`, colors.dim);
    
  } catch (error) {
    check(false, '', `Sanity query failed: ${error.message}`);
    allPassed = false;
  }
  
  // ============================================================
  // SUMMARY
  // ============================================================
  header('Summary');
  
  if (allPassed) {
    log('\n  🎉 ALL CHECKS PASSED! You\'re ready to launch!\n', colors.green + colors.bold);
  } else {
    log('\n  ⚠️  Some items need attention before launch:\n', colors.yellow + colors.bold);
    
    if (actions.length > 0) {
      log('  ACTION ITEMS:', colors.bold);
      actions.forEach((action, i) => {
        log(`    ${i + 1}. ${action}`, colors.yellow);
      });
    }
  }
  
  // ============================================================
  // NEXT STEPS
  // ============================================================
  header('Next Steps');
  
  if (!ENV_VARS.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
    log(`
  1. CREATE SHOPIFY STOREFRONT TOKEN:
     - Go to Shopify Admin → Settings → Apps and sales channels
     - Click "Develop apps" → Create an app named "Tarife Attar Website"
     - Under Configuration, enable "Storefront API access"
     - Select scopes: unauthenticated_read_product_listings, 
       unauthenticated_read_checkouts, unauthenticated_write_checkouts
     - Click "Install app" and copy the token
`, colors.cyan);
  }
  
  if (!ENV_VARS.SANITY_WRITE_TOKEN) {
    log(`
  2. GET SANITY WRITE TOKEN:
     - Go to sanity.io/manage → Your project → API → Tokens
     - Create a new token with "Editor" permissions
     - Copy the token
`, colors.cyan);
  }
  
  log(`
  3. ADD TO .env.local:
     Create/edit .env.local with:
     
     NEXT_PUBLIC_SANITY_PROJECT_ID=8h5l91ut
     NEXT_PUBLIC_SANITY_DATASET=production
     NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
     NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=${EXPECTED_SHOPIFY_DOMAIN}
     NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=<your_token>
     SANITY_WRITE_TOKEN=<your_token>
     SANITY_REVALIDATE_SECRET=<random_string>
`, colors.cyan);

  log(`
  4. SYNC PRODUCTS (after adding tokens):
     node scripts/sync-shopify-to-atlas.mjs --dry-run
     node scripts/sync-shopify-to-atlas.mjs
`, colors.cyan);

  log(`
  5. TEST CART:
     node scripts/test-cart.mjs
`, colors.cyan);

  console.log('\n' + '═'.repeat(60) + '\n');
}

main().catch(console.error);
