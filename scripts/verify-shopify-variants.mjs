#!/usr/bin/env node
/**
 * Verify Shopify Product Variants & Pricing
 * 
 * Checks that all products have correct 6ml/12ml variants
 * and validates pricing against territory guidelines.
 */

const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const shopifyToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

if (!shopifyDomain || !shopifyToken) {
  console.error('❌ Missing Shopify environment variables');
  process.exit(1);
}

// Territory pricing guidelines
const TERRITORY_PRICING = {
  ember: { '6ml': 28, '12ml': 48 },
  petal: { '6ml': 30, '12ml': 50 },
  tidal: { '6ml': 30, '12ml': 50 },
  terra: { '6ml': 33, '12ml': 55 },
};

// Map Shopify product titles to territories (based on legacy names)
const PRODUCT_TERRITORIES = {
  // EMBER
  'Cairo Musk': 'ember',
  'Granada Amber': 'ember',
  'Honey Oudh': 'ember',
  'Himalayan Musk': 'ember',
  'Teeb Musk': 'ember',
  'Frankincense & Myrrh': 'ember',
  'Vanilla Sands': 'ember',
  'Black Musk': 'ember',
  'Oudh Fire': 'ember',
  'Dubai Musk': 'ember',
  
  // PETAL
  'Peach Memoir': 'petal',
  'Turkish Rose': 'petal',
  'Arabian Jasmine': 'petal',
  'White Egyptian Musk': 'petal',
  'Musk Tahara': 'petal',
  
  // TIDAL
  'Coconut Jasmine': 'tidal',
  'Del Mare': 'tidal',
  'Blue Oud Elixir': 'tidal',
  'China Rain': 'tidal',
  'Regatta': 'tidal',
  
  // TERRA
  'Oud & Tobacco': 'terra',
  'Marrakesh': 'terra',
  'Black Oudh': 'terra',
  'Oudh Aura': 'terra',
  'Sicilian Oudh': 'terra',
};

async function shopifyFetch(query) {
  const endpoint = `https://${shopifyDomain}/api/2026-01/graphql.json`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': shopifyToken,
    },
    body: JSON.stringify({ query }),
  });
  return await response.json();
}

async function main() {
  console.log('\n📦 SHOPIFY VARIANT & PRICING VERIFICATION\n');
  console.log('═'.repeat(70));
  
  const query = `{
    products(first: 100) {
      edges {
        node {
          title
          handle
          variants(first: 10) {
            edges {
              node {
                id
                title
                price { amount currencyCode }
                availableForSale
                quantityAvailable
              }
            }
          }
        }
      }
    }
  }`;
  
  const result = await shopifyFetch(query);
  const products = result.data?.products?.edges || [];
  
  console.log(`\nFound ${products.length} products in Shopify\n`);
  
  const issues = [];
  const perfectProducts = [];
  const unmappedProducts = [];
  
  for (const { node: product } of products) {
    const territory = PRODUCT_TERRITORIES[product.title];
    const variants = product.variants.edges.map(e => e.node);
    
    // Find 6ml and 12ml variants
    const variant6ml = variants.find(v => 
      v.title?.toLowerCase().includes('6ml') || v.title === '6ml'
    );
    const variant12ml = variants.find(v => 
      v.title?.toLowerCase().includes('12ml') || v.title === '12ml'
    );
    
    if (!territory) {
      // Not an Atlas product (might be Relic, gift set, etc.)
      unmappedProducts.push({
        title: product.title,
        variants: variants.map(v => `${v.title}: $${v.price.amount}`).join(', ')
      });
      continue;
    }
    
    const expectedPricing = TERRITORY_PRICING[territory];
    const productIssues = [];
    
    // Check 6ml variant
    if (!variant6ml) {
      productIssues.push('Missing 6ml variant');
    } else {
      const actual6ml = parseFloat(variant6ml.price.amount);
      if (actual6ml !== expectedPricing['6ml']) {
        productIssues.push(`6ml price: $${actual6ml} (expected $${expectedPricing['6ml']})`);
      }
    }
    
    // Check 12ml variant
    if (!variant12ml) {
      productIssues.push('Missing 12ml variant');
    } else {
      const actual12ml = parseFloat(variant12ml.price.amount);
      if (actual12ml !== expectedPricing['12ml']) {
        productIssues.push(`12ml price: $${actual12ml} (expected $${expectedPricing['12ml']})`);
      }
    }
    
    if (productIssues.length > 0) {
      issues.push({
        title: product.title,
        handle: product.handle,
        territory,
        issues: productIssues,
        variants: variants.map(v => ({
          title: v.title,
          price: v.price.amount,
          id: v.id
        }))
      });
    } else {
      perfectProducts.push({
        title: product.title,
        territory,
        '6ml': variant6ml?.price.amount,
        '12ml': variant12ml?.price.amount
      });
    }
  }
  
  // Report perfect products
  console.log(`\n✅ CORRECTLY CONFIGURED (${perfectProducts.length} products):\n`);
  const byTerritory = { ember: [], petal: [], tidal: [], terra: [] };
  for (const p of perfectProducts) {
    byTerritory[p.territory].push(p);
  }
  
  for (const [territory, prods] of Object.entries(byTerritory)) {
    if (prods.length > 0) {
      const pricing = TERRITORY_PRICING[territory];
      console.log(`  ${territory.toUpperCase()} ($${pricing['6ml']}/$${pricing['12ml']}):`);
      for (const p of prods) {
        console.log(`    ✓ ${p.title}`);
      }
      console.log();
    }
  }
  
  // Report issues
  if (issues.length > 0) {
    console.log(`\n⚠️  NEEDS ATTENTION (${issues.length} products):\n`);
    for (const item of issues) {
      console.log(`  ${item.title} (${item.territory.toUpperCase()}):`);
      for (const issue of item.issues) {
        console.log(`    ❌ ${issue}`);
      }
      console.log(`    Current variants:`);
      for (const v of item.variants) {
        console.log(`      - ${v.title}: $${v.price}`);
      }
      console.log();
    }
  }
  
  // Report unmapped products (not Atlas)
  if (unmappedProducts.length > 0) {
    console.log(`\n📋 OTHER PRODUCTS (not in Atlas mapping - ${unmappedProducts.length}):\n`);
    for (const p of unmappedProducts) {
      console.log(`  • ${p.title}`);
      console.log(`    ${p.variants}`);
    }
  }
  
  // Summary
  console.log('\n' + '═'.repeat(70));
  console.log('\n📊 SUMMARY:\n');
  console.log(`  Total Shopify products: ${products.length}`);
  console.log(`  Atlas products correctly configured: ${perfectProducts.length}`);
  console.log(`  Atlas products needing fixes: ${issues.length}`);
  console.log(`  Non-Atlas products: ${unmappedProducts.length}`);
  
  if (issues.length === 0) {
    console.log('\n  🎉 All Atlas products have correct variants and pricing!\n');
  } else {
    console.log('\n  ⚠️  Please fix the issues above in Shopify Admin\n');
  }
}

main().catch(console.error);
