/**
 * Sync Shopify Product Images to Atlas Collection Products
 * 
 * This script copies the previewImageUrl from Shopify-synced products
 * to the corresponding Atlas Collection products.
 * 
 * Usage:
 *   node scripts/sync-shopify-images.mjs --dry-run    # Preview changes
 *   node scripts/sync-shopify-images.mjs              # Execute sync
 */

import { createClient } from '@sanity/client';

const client = createClient({
  projectId: '8h5l91ut',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

const isDryRun = process.argv.includes('--dry-run');

async function main() {
  console.log('\n🖼️  SHOPIFY IMAGE SYNC\n');
  console.log(isDryRun ? '📋 DRY RUN MODE - No changes will be made\n' : '🚀 LIVE MODE - Changes will be applied\n');

  // Fetch all Atlas products with their Shopify product IDs
  console.log('📦 Fetching Atlas Collection products...');
  const atlasProducts = await client.fetch(`
    *[_type == "product" && collectionType == "atlas"]{
      _id,
      title,
      legacyName,
      shopifyProductId,
      "hasMainImage": defined(mainImage),
      "currentShopifyImageUrl": shopifyPreviewImageUrl
    }
  `);
  console.log(`   Found ${atlasProducts.length} Atlas products\n`);

  // Fetch all Shopify-synced products with their images
  console.log('🛒 Fetching Shopify product images...');
  const shopifyProducts = await client.fetch(`
    *[_type == "product" && defined(store.id)]{
      "shopifyGid": store.gid,
      "shopifyTitle": store.title,
      "previewImageUrl": store.previewImageUrl
    }
  `);
  console.log(`   Found ${shopifyProducts.length} Shopify products\n`);

  // Create lookup by Shopify GID
  const shopifyImagesByGid = {};
  for (const product of shopifyProducts) {
    if (product.shopifyGid && product.previewImageUrl) {
      shopifyImagesByGid[product.shopifyGid] = {
        title: product.shopifyTitle,
        imageUrl: product.previewImageUrl,
      };
    }
  }

  console.log(`   ${Object.keys(shopifyImagesByGid).length} Shopify products have images\n`);

  // Track results
  const toUpdate = [];
  const alreadyHasImage = [];
  const noShopifyLink = [];
  const noShopifyImage = [];

  // Process each Atlas product
  for (const atlas of atlasProducts) {
    // Skip if already has a mainImage in Sanity
    if (atlas.hasMainImage) {
      alreadyHasImage.push(atlas);
      continue;
    }

    // Skip if no Shopify link
    if (!atlas.shopifyProductId) {
      noShopifyLink.push(atlas);
      continue;
    }

    // Look up Shopify image
    const shopifyData = shopifyImagesByGid[atlas.shopifyProductId];
    
    if (!shopifyData || !shopifyData.imageUrl) {
      noShopifyImage.push(atlas);
      continue;
    }

    // Skip if already has this URL
    if (atlas.currentShopifyImageUrl === shopifyData.imageUrl) {
      alreadyHasImage.push(atlas);
      continue;
    }

    toUpdate.push({
      atlas,
      imageUrl: shopifyData.imageUrl,
      shopifyTitle: shopifyData.title,
    });
  }

  // Report Results
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  console.log(`✅ TO BE UPDATED (${toUpdate.length} products):\n`);
  for (const item of toUpdate) {
    console.log(`   ${item.atlas.title}`);
    console.log(`      → ${item.imageUrl.substring(0, 60)}...`);
  }
  
  console.log(`\n🖼️  ALREADY HAS IMAGE (${alreadyHasImage.length} products):\n`);
  for (const item of alreadyHasImage) {
    console.log(`   ${item.title}`);
  }
  
  console.log(`\n⚠️  NO SHOPIFY LINK (${noShopifyLink.length} products):\n`);
  for (const item of noShopifyLink) {
    console.log(`   ${item.title}`);
  }
  
  console.log(`\n❌ NO SHOPIFY IMAGE AVAILABLE (${noShopifyImage.length} products):\n`);
  for (const item of noShopifyImage) {
    console.log(`   ${item.title} (linked to: ${item.shopifyProductId})`);
  }

  // Apply updates if not dry run
  if (!isDryRun && toUpdate.length > 0) {
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('📝 APPLYING UPDATES...\n');
    
    for (const item of toUpdate) {
      try {
        await client
          .patch(item.atlas._id)
          .set({
            shopifyPreviewImageUrl: item.imageUrl,
          })
          .commit();
        
        console.log(`   ✅ Updated: ${item.atlas.title}`);
      } catch (error) {
        console.log(`   ❌ Failed: ${item.atlas.title} - ${error.message}`);
      }
    }
    
    console.log('\n✅ Image sync complete!');
  } else if (isDryRun) {
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('📋 DRY RUN COMPLETE - Run without --dry-run to apply changes');
  }
}

main().catch(console.error);
