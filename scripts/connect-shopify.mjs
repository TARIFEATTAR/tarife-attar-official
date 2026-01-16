#!/usr/bin/env node
/**
 * Remove Caravan Gold and Connect Products to Shopify
 * 
 * 1. Deletes the "Caravan Gold" product
 * 2. Fetches all products from Shopify
 * 3. Matches them to Sanity products by name
 * 4. Updates Sanity products with Shopify Variant IDs
 */

import { createClient } from '@sanity/client';

const token = process.env.SANITY_WRITE_TOKEN;
const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || 'tarifeattarshop.myshopify.com';
const shopifyToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

if (!token) {
    console.error('❌ SANITY_WRITE_TOKEN required');
    process.exit(1);
}

const sanity = createClient({
    projectId: '8h5l91ut',
    dataset: 'production',
    apiVersion: '2025-12-31',
    token,
    useCdn: false,
});

// Shopify Storefront API query
async function fetchShopifyProducts() {
    if (!shopifyToken) {
        console.warn('⚠️  No Shopify token - skipping Shopify sync');
        return [];
    }

    const query = `{
    products(first: 100) {
      edges {
        node {
          id
          title
          handle
          variants(first: 1) {
            edges {
              node {
                id
                title
                price {
                  amount
                }
              }
            }
          }
        }
      }
    }
  }`;

    try {
        const response = await fetch(`https://${shopifyDomain}/api/2026-01/graphql.json`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Storefront-Access-Token': shopifyToken,
            },
            body: JSON.stringify({ query }),
        });

        const data = await response.json();
        if (data.errors) {
            console.error('Shopify errors:', data.errors);
            return [];
        }

        return data.data?.products?.edges?.map(e => ({
            title: e.node.title,
            handle: e.node.handle,
            variantId: e.node.variants.edges[0]?.node?.id,
            price: parseFloat(e.node.variants.edges[0]?.node?.price?.amount || 0),
        })) || [];
    } catch (err) {
        console.error('Failed to fetch Shopify products:', err.message);
        return [];
    }
}

// Normalize product name for matching
function normalize(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .replace(/oudh/g, 'oud')
        .replace(/lavender/g, 'lavendar');
}

async function main() {
    console.log('🔗 Connecting Sanity Products to Shopify');
    console.log('==========================================');
    console.log('');

    // Step 1: Delete Caravan Gold
    console.log('🗑️  Removing duplicate "Caravan Gold"...');
    try {
        const caravanGold = await sanity.fetch(
            `*[_type == "product" && title == "Caravan Gold"][0]._id`
        );
        if (caravanGold) {
            await sanity.delete(caravanGold);
            console.log('   ✅ Deleted Caravan Gold');
        } else {
            console.log('   ℹ️  Caravan Gold not found');
        }
    } catch (err) {
        console.log('   ⚠️  Could not delete:', err.message);
    }
    console.log('');

    // Step 2: Fetch Shopify products
    console.log('📦 Fetching Shopify products...');
    const shopifyProducts = await fetchShopifyProducts();
    console.log(`   Found ${shopifyProducts.length} products in Shopify`);
    console.log('');

    if (shopifyProducts.length === 0) {
        console.log('⚠️  No Shopify products found. Make sure:');
        console.log('   - NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN is set');
        console.log('   - NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN is set');
        console.log('');
        console.log('Products will display but "Add to Cart" won\'t work until connected.');
        return;
    }

    // Step 3: Fetch Sanity products
    console.log('📋 Fetching Sanity Atlas products...');
    const sanityProducts = await sanity.fetch(
        `*[_type == "product" && collectionType == "atlas"] { _id, title, shopifyVariantId }`
    );
    console.log(`   Found ${sanityProducts.length} products in Sanity`);
    console.log('');

    // Step 4: Match and update
    console.log('🔄 Matching products...');
    let matched = 0;
    let updated = 0;

    for (const sp of sanityProducts) {
        const normalizedSanity = normalize(sp.title);

        const shopifyMatch = shopifyProducts.find(shp =>
            normalize(shp.title) === normalizedSanity
        );

        if (shopifyMatch) {
            matched++;

            if (!sp.shopifyVariantId) {
                try {
                    await sanity.patch(sp._id).set({
                        shopifyVariantId: shopifyMatch.variantId,
                        price: shopifyMatch.price,
                    }).commit();
                    console.log(`   ✅ ${sp.title} → ${shopifyMatch.variantId.slice(-10)}`);
                    updated++;
                } catch (err) {
                    console.log(`   ⚠️  Failed to update ${sp.title}`);
                }
            } else {
                console.log(`   ✓ ${sp.title} (already connected)`);
            }
        } else {
            console.log(`   ❌ ${sp.title} - no Shopify match`);
        }
    }

    console.log('');
    console.log('📊 Summary:');
    console.log(`   Matched: ${matched}/${sanityProducts.length}`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Not in Shopify: ${sanityProducts.length - matched}`);
    console.log('');
    console.log('🎉 Done! Products with Shopify connections will have working "Add to Cart".');
}

main().catch(console.error);
