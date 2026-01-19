#!/usr/bin/env node
/**
 * Test Shopify Cart (No Sanity Required)
 * 
 * Tests the Shopify Storefront API cart functionality
 * using a known product variant ID.
 */

const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const shopifyToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

if (!shopifyDomain || !shopifyToken) {
  console.error('❌ Missing Shopify environment variables');
  console.error('   Required: NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN');
  console.error('   Required: NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN');
  process.exit(1);
}

async function shopifyFetch({ query, variables = {} }) {
  const endpoint = `https://${shopifyDomain}/api/2026-01/graphql.json`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': shopifyToken,
    },
    body: JSON.stringify({ query, variables }),
  });
  return await response.json();
}

async function main() {
  console.log('\n🛒 SHOPIFY CART TEST\n');
  console.log('═'.repeat(50));
  console.log(`Store: ${shopifyDomain}`);
  console.log('═'.repeat(50));
  
  // Step 1: Get a product with variants
  console.log('\n📦 Step 1: Fetching a test product...');
  
  const productsQuery = `{
    products(first: 10) {
      edges {
        node {
          title
          variants(first: 2) {
            edges {
              node {
                id
                title
                price { amount currencyCode }
                availableForSale
              }
            }
          }
        }
      }
    }
  }`;
  
  const productsResult = await shopifyFetch({ query: productsQuery });
  
  if (productsResult.errors) {
    console.error('❌ Error fetching products:', productsResult.errors);
    process.exit(1);
  }
  
  const products = productsResult.data?.products?.edges || [];
  if (products.length === 0) {
    console.error('❌ No products found');
    process.exit(1);
  }
  
  const testProduct = products[0].node;
  const testVariant = testProduct.variants.edges[0]?.node;
  
  if (!testVariant) {
    console.error('❌ No variants found');
    process.exit(1);
  }
  
  console.log(`   ✅ Found: ${testProduct.title}`);
  console.log(`   Variant: ${testVariant.title} - $${testVariant.price.amount}`);
  console.log(`   ID: ${testVariant.id}`);
  
  // Step 2: Create cart
  console.log('\n🆕 Step 2: Creating cart...');
  
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
  
  const cartResult = await shopifyFetch({ query: createCartQuery });
  
  if (cartResult.errors || cartResult.data?.cartCreate?.userErrors?.length > 0) {
    console.error('❌ Error creating cart:', cartResult.errors || cartResult.data?.cartCreate?.userErrors);
    process.exit(1);
  }
  
  const cart = cartResult.data?.cartCreate?.cart;
  console.log(`   ✅ Cart created: ${cart.id.slice(0, 50)}...`);
  
  // Step 3: Add item to cart
  console.log('\n➕ Step 3: Adding item to cart...');
  
  const addLinesQuery = `
    mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          id
          totalQuantity
          lines(first: 10) {
            edges {
              node {
                quantity
                merchandise {
                  ... on ProductVariant {
                    title
                    price { amount currencyCode }
                    product { title }
                  }
                }
              }
            }
          }
          cost {
            totalAmount { amount currencyCode }
            subtotalAmount { amount currencyCode }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;
  
  const addResult = await shopifyFetch({
    query: addLinesQuery,
    variables: {
      cartId: cart.id,
      lines: [{ merchandiseId: testVariant.id, quantity: 1 }]
    }
  });
  
  if (addResult.errors || addResult.data?.cartLinesAdd?.userErrors?.length > 0) {
    console.error('❌ Error adding to cart:', addResult.errors || addResult.data?.cartLinesAdd?.userErrors);
    process.exit(1);
  }
  
  const updatedCart = addResult.data?.cartLinesAdd?.cart;
  const lineItem = updatedCart.lines.edges[0]?.node;
  
  console.log(`   ✅ Item added!`);
  console.log(`   Product: ${lineItem.merchandise.product.title}`);
  console.log(`   Variant: ${lineItem.merchandise.title}`);
  console.log(`   Price: $${lineItem.merchandise.price.amount} ${lineItem.merchandise.price.currencyCode}`);
  console.log(`   Quantity: ${lineItem.quantity}`);
  
  // Step 4: Summary
  console.log('\n' + '═'.repeat(50));
  console.log('📊 CART SUMMARY');
  console.log('═'.repeat(50));
  console.log(`   Items: ${updatedCart.totalQuantity}`);
  console.log(`   Subtotal: $${updatedCart.cost.subtotalAmount.amount} ${updatedCart.cost.subtotalAmount.currencyCode}`);
  console.log(`   Total: $${updatedCart.cost.totalAmount.amount} ${updatedCart.cost.totalAmount.currencyCode}`);
  
  console.log('\n✅ CHECKOUT URL (test this in browser):');
  console.log(`   ${cart.checkoutUrl}\n`);
  
  console.log('🎉 All cart operations successful!\n');
}

main().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
