#!/usr/bin/env node
/**
 * Test Cart & Price Sync
 * 
 * 1. Fetches a connected product from Sanity (e.g. Honey Oudh)
 * 2. Creates a Shopify Cart
 * 3. Adds the item to the cart
 * 4. Reports back the price, subtotal, and any discounts returned by Shopify
 */

import { createClient } from '@sanity/client';

const sanityToken = process.env.SANITY_WRITE_TOKEN;
const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const shopifyToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

if (!sanityToken || !shopifyDomain || !shopifyToken) {
    console.error('❌ Missing environment variables.');
    process.exit(1);
}

const sanity = createClient({
    projectId: '8h5l91ut',
    dataset: 'production',
    apiVersion: '2025-12-31',
    token: sanityToken,
    useCdn: false,
});

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
    console.log('🛒 Testing Shopify Cart & Price Sync');
    console.log('====================================');

    // 1. Get a connected product
    console.log('🔍 Fetching a connected product from Sanity...');
    const product = await sanity.fetch(
        `*[_type == "product" && defined(shopifyVariantId) && title match "Honey Oudh"][0] { title, shopifyVariantId }`
    );

    if (!product) {
        console.error('❌ Could not find "Honey Oudh" with a connected ID in Sanity.');
        process.exit(1);
    }

    console.log(`   Found: ${product.title}`);
    console.log(`   Variant ID: ${product.shopifyVariantId}`);
    console.log('');

    // 2. Create Cart
    console.log('🆕 Creating Shopify Cart...');
    const createCartQuery = `
    mutation cartCreate {
      cartCreate(input: {}) {
        cart {
          id
          checkoutUrl
        }
      }
    }
  `;
    const cartRes = await shopifyFetch({ query: createCartQuery });
    const cart = cartRes.data?.cartCreate?.cart;

    if (!cart) {
        console.error('❌ Failed to create cart:', JSON.stringify(cartRes));
        process.exit(1);
    }
    console.log(`   Cart ID: ${cart.id}`);
    console.log('');

    // 3. Add Item
    console.log('➕ Adding item to cart...');
    const addLinesQuery = `
    mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          lines(first: 10) {
            edges {
              node {
                merchandise {
                  ... on ProductVariant {
                    title
                    price { amount currencyCode }
                    compareAtPrice { amount currencyCode }
                  }
                }
                cost {
                  totalAmount { amount currencyCode }
                  subtotalAmount { amount currencyCode }
                }
              }
            }
          }
          cost {
            totalAmount { amount currencyCode }
            subtotalAmount { amount currencyCode }
          }
        }
      }
    }
  `;

    const addRes = await shopifyFetch({
        query: addLinesQuery,
        variables: {
            cartId: cart.id,
            lines: [{ merchandiseId: product.shopifyVariantId, quantity: 1 }]
        }
    });

    const validCart = addRes.data?.cartLinesAdd?.cart;
    if (!validCart) {
        console.error('❌ Failed to add item:', JSON.stringify(addRes));
        process.exit(1);
    }

    const lineItem = validCart.lines.edges[0].node;
    const price = lineItem.merchandise.price;
    const compareAt = lineItem.merchandise.compareAtPrice;

    console.log('');
    console.log('📊 RESULTS:');
    console.log(`   Item: ${lineItem.merchandise.title}`);
    console.log(`   Price: ${price.amount} ${price.currencyCode}`);

    if (compareAt) {
        console.log(`   Run-of-Mill Price (Compare At): ${compareAt.amount} ${compareAt.currencyCode}`);
        console.log(`   🎉 ON SALE! (Discount logic active)`);
    } else {
        console.log(`   Regular Price (No sale detected for this variant)`);
    }

    console.log(`   Cart Subtotal: ${validCart.cost.subtotalAmount.amount} ${validCart.cost.subtotalAmount.currencyCode}`);
    console.log('');
    console.log('✅ Checkout URL generated successfully:');
    console.log(`   ${cart.checkoutUrl}`);
    console.log('');
}

main().catch(console.error);
