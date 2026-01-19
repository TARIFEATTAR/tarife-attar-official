#!/usr/bin/env node
/**
 * Site Health Check & Diagnostic Test
 * 
 * Comprehensive test of all basic shopping functionality:
 * - Environment variables
 * - Shopify connection & products
 * - Sanity connection & products
 * - Product linking (Sanity ↔ Shopify)
 * - Cart functionality
 * - Image availability
 * - Basic navigation
 * 
 * Usage:
 *   node scripts/health-check.mjs
 */

import { createClient } from '@sanity/client';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

function log(message, color = '') {
  console.log(`${color}${message}${colors.reset}`);
}

function header(title) {
  console.log('\n' + '═'.repeat(60));
  log(`  ${title}`, colors.cyan);
  console.log('═'.repeat(60) + '\n');
}

function check(condition, successMsg, errorMsg) {
  if (condition) {
    log(`  ✅ ${successMsg}`, colors.green);
    return true;
  } else {
    log(`  ❌ ${errorMsg}`, colors.red);
    return false;
  }
}

function warn(message) {
  log(`  ⚠️  ${message}`, colors.yellow);
}

function info(message) {
  log(`  ℹ️  ${message}`, colors.dim);
}

// Environment Variables
const ENV_VARS = {
  NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
  NEXT_PUBLIC_SANITY_API_VERSION: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN,
  NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
  SANITY_REVALIDATE_SECRET: process.env.SANITY_REVALIDATE_SECRET,
};

// Initialize Sanity Client
const sanityClient = createClient({
  projectId: ENV_VARS.NEXT_PUBLIC_SANITY_PROJECT_ID || '8h5l91ut',
  dataset: ENV_VARS.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: ENV_VARS.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: false,
});

// Shopify Fetch Function
async function shopifyFetch(query, variables = {}) {
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
      body: JSON.stringify({ query, variables }),
    });
    return await response.json();
  } catch (error) {
    return { error: error.message };
  }
}

async function main() {
  console.clear();
  header('🏥 SITE HEALTH CHECK & DIAGNOSTIC TEST');
  
  let totalChecks = 0;
  let passedChecks = 0;
  const issues = [];
  const warnings = [];

  // ==========================================
  // 1. ENVIRONMENT VARIABLES
  // ==========================================
  header('1. Environment Variables');
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_SANITY_PROJECT_ID',
    'NEXT_PUBLIC_SANITY_DATASET',
    'NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN',
    'NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN',
  ];
  
  requiredEnvVars.forEach(key => {
    totalChecks++;
    const value = ENV_VARS[key];
    if (check(!!value, `${key} is set`, `${key} is missing`)) {
      passedChecks++;
    } else {
      issues.push(`Missing environment variable: ${key}`);
    }
  });

  // ==========================================
  // 2. SANITY CONNECTION
  // ==========================================
  header('2. Sanity CMS Connection');
  
  totalChecks++;
  try {
    const testQuery = `*[_type == "product" && !(_id in path("drafts.**"))] | order(_createdAt desc) [0...1] { _id, title }`;
    const sanityTest = await sanityClient.fetch(testQuery);
    if (check(Array.isArray(sanityTest), 'Sanity connection successful', 'Sanity connection failed')) {
      passedChecks++;
    } else {
      issues.push('Sanity connection failed');
    }
  } catch (error) {
    check(false, '', `Sanity connection error: ${error.message}`);
    issues.push(`Sanity error: ${error.message}`);
  }

  // ==========================================
  // 3. SHOPIFY CONNECTION
  // ==========================================
  header('3. Shopify Storefront API Connection');
  
  totalChecks++;
  const shopifyTest = await shopifyFetch(`{
    shop {
      name
    }
  }`);
  
  if (shopifyTest?.data?.shop) {
    if (check(true, `Connected to Shopify store: ${shopifyTest.data.shop.name}`, '')) {
      passedChecks++;
    }
  } else {
    const errorMsg = shopifyTest?.errors?.[0]?.message || shopifyTest?.error || 'Unknown error';
    check(false, '', `Shopify connection failed: ${errorMsg}`);
    issues.push(`Shopify connection failed: ${errorMsg}`);
  }

  // ==========================================
  // 4. PRODUCT DATA INTEGRITY
  // ==========================================
  header('4. Product Data Integrity');
  
  // Fetch Atlas products from Sanity
  totalChecks++;
  let atlasProducts = [];
  try {
    const atlasQuery = `*[_type == "product" && collectionType == "atlas" && !(_id in path("drafts.**"))] {
      _id,
      title,
      slug,
      shopifyVariantId,
      shopifyVariant6mlId,
      shopifyVariant12mlId,
      shopifyProductId,
      inStock,
      mainImage,
      "shopifyPreviewImageUrl": store.previewImageUrl,
      atlasData
    }`;
    atlasProducts = await sanityClient.fetch(atlasQuery) || [];
    
    if (check(atlasProducts.length > 0, `Found ${atlasProducts.length} Atlas products`, 'No Atlas products found')) {
      passedChecks++;
    } else {
      issues.push('No Atlas products found in Sanity');
    }
  } catch (error) {
    check(false, '', `Error fetching Atlas products: ${error.message}`);
    issues.push(`Error fetching Atlas products: ${error.message}`);
  }

  // Check product linking
  if (atlasProducts.length > 0) {
    const productsWithShopify = atlasProducts.filter(p => 
      p.shopifyVariantId || p.shopifyVariant6mlId || p.shopifyVariant12mlId || p.shopifyProductId
    );
    const productsWithoutShopify = atlasProducts.length - productsWithShopify.length;
    
    info(`Products linked to Shopify: ${productsWithShopify.length}/${atlasProducts.length}`);
    if (productsWithoutShopify > 0) {
      warn(`${productsWithoutShopify} products not linked to Shopify`);
      warnings.push(`${productsWithoutShopify} Atlas products missing Shopify links`);
    }

    // Check for variant IDs
    const productsWithVariants = atlasProducts.filter(p => 
      p.shopifyVariant6mlId || p.shopifyVariant12mlId
    );
    info(`Products with 6ml/12ml variants: ${productsWithVariants.length}/${atlasProducts.length}`);
    if (productsWithVariants.length < atlasProducts.length) {
      warn('Some products missing variant IDs (6ml/12ml)');
    }

    // Check stock status
    const inStockCount = atlasProducts.filter(p => p.inStock !== false).length;
    const outOfStockCount = atlasProducts.length - inStockCount;
    info(`In stock: ${inStockCount}, Out of stock: ${outOfStockCount}`);
  }

  // ==========================================
  // 5. SHOPIFY PRODUCTS
  // ==========================================
  header('5. Shopify Products');
  
  totalChecks++;
  let shopifyProducts = [];
  try {
    const shopifyQuery = `{
      products(first: 50) {
        edges {
          node {
            id
            title
            handle
            availableForSale
            variants(first: 5) {
              edges {
                node {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  availableForSale
                }
              }
            }
          }
        }
      }
    }`;
    
    const shopifyResult = await shopifyFetch(shopifyQuery);
    if (shopifyResult?.data?.products) {
      shopifyProducts = shopifyResult.data.products.edges.map(e => e.node);
      if (check(shopifyProducts.length > 0, `Found ${shopifyProducts.length} Shopify products`, 'No Shopify products found')) {
        passedChecks++;
      } else {
        issues.push('No products found in Shopify');
      }
    } else {
      check(false, '', 'Failed to fetch Shopify products');
      issues.push('Failed to fetch Shopify products');
    }
  } catch (error) {
    check(false, '', `Error fetching Shopify products: ${error.message}`);
    issues.push(`Error fetching Shopify products: ${error.message}`);
  }

  if (shopifyProducts.length > 0) {
    const availableProducts = shopifyProducts.filter(p => p.availableForSale);
    info(`Available for sale: ${availableProducts.length}/${shopifyProducts.length}`);
    
    // Check for variants
    const productsWithVariants = shopifyProducts.filter(p => 
      p.variants.edges.length > 0
    );
    info(`Products with variants: ${productsWithVariants.length}/${shopifyProducts.length}`);
  }

  // ==========================================
  // 6. CART FUNCTIONALITY TEST
  // ==========================================
  header('6. Cart Functionality Test');
  
  totalChecks++;
  try {
    // Create a test cart
    const createCartQuery = `
      mutation cartCreate {
        cartCreate(input: {}) {
          cart {
            id
            checkoutUrl
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
    
    const cartResult = await shopifyFetch(createCartQuery);
    if (cartResult?.data?.cartCreate?.cart) {
      const cartId = cartResult.data.cartCreate.cart.id;
      const checkoutUrl = cartResult.data.cartCreate.cart.checkoutUrl;
      
      if (check(!!cartId, 'Cart creation successful', 'Cart creation failed')) {
        passedChecks++;
        info(`Test cart ID: ${cartId.substring(0, 20)}...`);
        
        // Check checkout URL
        if (checkoutUrl) {
          if (checkoutUrl.includes('tarifeattar.com')) {
            warn('Checkout URL contains tarifeattar.com (should use myshopify.com)');
            warnings.push('Checkout URL may need transformation');
          } else {
            info('Checkout URL uses correct domain');
          }
        }
      } else {
        issues.push('Cart creation failed');
      }
    } else {
      const errors = cartResult?.data?.cartCreate?.userErrors || [];
      check(false, '', `Cart creation failed: ${errors.map(e => e.message).join(', ')}`);
      issues.push(`Cart creation failed: ${errors.map(e => e.message).join(', ')}`);
    }
  } catch (error) {
    check(false, '', `Cart test error: ${error.message}`);
    issues.push(`Cart test error: ${error.message}`);
  }

  // ==========================================
  // 7. IMAGE AVAILABILITY
  // ==========================================
  header('7. Product Image Availability');
  
  if (atlasProducts.length > 0) {
    const productsWithImages = atlasProducts.filter(p => 
      p.mainImage || p.shopifyPreviewImageUrl
    );
    const productsWithoutImages = atlasProducts.length - productsWithImages.length;
    
    totalChecks++;
    if (check(productsWithImages.length > 0, `${productsWithImages.length}/${atlasProducts.length} products have images`, 'No products have images')) {
      passedChecks++;
    }
    
    if (productsWithoutImages > 0) {
      warn(`${productsWithoutImages} products missing images`);
      warnings.push(`${productsWithoutImages} products missing images`);
    }
    
    // Check Sanity vs Shopify images
    const sanityImages = atlasProducts.filter(p => p.mainImage).length;
    const shopifyImages = atlasProducts.filter(p => p.shopifyPreviewImageUrl && !p.mainImage).length;
    info(`Sanity images: ${sanityImages}, Shopify fallback images: ${shopifyImages}`);
  }

  // ==========================================
  // 8. BASIC NAVIGATION CHECK
  // ==========================================
  header('8. Basic Navigation Check');
  
  // Check if key pages have products
  totalChecks++;
  try {
    const relicQuery = `count(*[_type == "product" && collectionType == "relic" && !(_id in path("drafts.**"))])`;
    const relicCount = await sanityClient.fetch(relicQuery) || 0;
    
    if (check(relicCount > 0, `Relic collection has ${relicCount} products`, 'Relic collection is empty')) {
      passedChecks++;
    } else {
      warnings.push('Relic collection is empty');
    }
  } catch (error) {
    check(false, '', `Error checking Relic collection: ${error.message}`);
    issues.push(`Relic collection check failed: ${error.message}`);
  }

  // ==========================================
  // SUMMARY
  // ==========================================
  header('📊 HEALTH CHECK SUMMARY');
  
  const passRate = ((passedChecks / totalChecks) * 100).toFixed(1);
  
  log(`Total Checks: ${totalChecks}`, colors.cyan);
  log(`Passed: ${passedChecks}`, colors.green);
  log(`Failed: ${totalChecks - passedChecks}`, colors.red);
  log(`Pass Rate: ${passRate}%`, passRate >= 80 ? colors.green : colors.yellow);
  
  if (warnings.length > 0) {
    console.log('\n');
    log('⚠️  WARNINGS:', colors.yellow);
    warnings.forEach(w => warn(w));
  }
  
  if (issues.length > 0) {
    console.log('\n');
    log('❌ CRITICAL ISSUES:', colors.red);
    issues.forEach(i => log(`  • ${i}`, colors.red));
  }
  
  console.log('\n');
  
  // Final verdict
  if (passedChecks === totalChecks) {
    log('✅ ALL CHECKS PASSED - Site is ready for shopping!', colors.green);
  } else if (passRate >= 80) {
    log('⚠️  MOSTLY HEALTHY - Some issues to address', colors.yellow);
  } else {
    log('❌ CRITICAL ISSUES FOUND - Fix before launch', colors.red);
  }
  
  console.log('\n');
  
  // Recommendations
  if (issues.length === 0 && warnings.length === 0) {
    log('🎉 Excellent! Your site is ready for customers.', colors.green);
  } else {
    log('📋 RECOMMENDATIONS:', colors.cyan);
    if (warnings.some(w => w.includes('Shopify links'))) {
      log('  • Run: node scripts/sync-shopify-to-atlas.mjs', colors.dim);
    }
    if (warnings.some(w => w.includes('images'))) {
      log('  • Run: node scripts/sync-shopify-images.mjs', colors.dim);
    }
    if (warnings.some(w => w.includes('variant'))) {
      log('  • Ensure all products have 6ml and 12ml variants in Shopify', colors.dim);
    }
  }
  
  console.log('\n');
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
