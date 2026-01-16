#!/usr/bin/env node
/**
 * Manual Connect & Image Sync
 * 
 * Connects specific Sanity products to Shopify Variants manually.
 * Also fetches and uploads the image.
 */

import { createClient } from '@sanity/client';
// Using native fetch

const sanityToken = process.env.SANITY_WRITE_TOKEN;
const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const shopifyToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

const client = createClient({
    projectId: '8h5l91ut',
    dataset: 'production',
    apiVersion: '2025-12-31',
    token: sanityToken,
    useCdn: false,
});

async function shopifyFetch({ query }) {
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

async function uploadImageToSanity(imageUrl, filename) {
    try {
        const res = await fetch(imageUrl);
        if (!res.ok) throw new Error(`Failed to fetch image: ${res.statusText}`);
        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const asset = await client.assets.upload('image', buffer, { filename });
        return asset;
    } catch (err) {
        console.error(`   Error uploading ${filename}:`, err.message);
        return null;
    }
}

async function connect(sanityTitle, shopifyVariantId, shopifyTitleForImage) {
    console.log(`🔌 Connecting ${sanityTitle}...`);

    // 1. Get Sanity Product
    const product = await client.fetch(
        `*[_type == "product" && title == $title][0]`,
        { title: sanityTitle }
    );

    if (!product) {
        console.error(`   ❌ Sanity product "${sanityTitle}" not found`);
        return;
    }

    // 2. Get Shopify Image URL
    const query = `
    query($id: ID!) {
      node(id: $id) {
        ... on ProductVariant {
          image { url }
          price { amount }
        }
      }
    }
  `;
    const data = await shopifyFetch({ query, variables: { id: shopifyVariantId } });
    const variant = data.data?.node;

    if (!variant) {
        console.error(`   ❌ Shopify variant ${shopifyVariantId} not found`);
        return;
    }

    // 3. Upload Image
    let imageAssetId = null;
    if (variant.image?.url) {
        console.log(`   ⬇️  Downloading image for ${shopifyTitleForImage}...`);
        const asset = await uploadImageToSanity(variant.image.url, `${sanityTitle}.jpg`);
        if (asset) imageAssetId = asset._id;
    }

    // 4. Update Sanity
    const patch = client.patch(product._id).set({
        shopifyVariantId: shopifyVariantId,
        price: parseFloat(variant.price?.amount || 0)
    });

    if (imageAssetId) {
        patch.set({
            mainImage: {
                _type: 'image',
                asset: { _type: 'reference', _ref: imageAssetId }
            }
        });
    }

    await patch.commit();
    console.log(`   ✅ Connected! Price: ${variant.price?.amount}, Image: ${imageAssetId ? 'Updated' : 'No Image'}`);
}

async function main() {
    console.log('🛠️  Manual Connections Starting...');

    // White Musk -> Musk Tahara
    await connect('White Musk', 'gid://shopify/ProductVariant/51098087129370', 'Musk Tahara');

    // Mukhallat Shifa -> Mukhallat Al-Shifa
    await connect('Mukhallat Shifa', 'gid://shopify/ProductVariant/51098071597338', 'Mukhallat Al-Shifa');

    // Himalyan Musk -> Himalayan Musk (Fixing spelling connection)
    await connect('Himalyan Musk', 'gid://shopify/ProductVariant/51098085785882', 'Himalayan Musk');

    // Note: Dubai Musk not found in list.
}

main().catch(console.error);
