/**
 * Sync Shopify Products to Relic Collection
 * 
 * Links Shopify product data (IDs, variant IDs) to existing Relic Collection products
 * 
 * Usage:
 *   node scripts/sync-shopify-to-relic.mjs --dry-run    # Preview changes
 *   node scripts/sync-shopify-to-relic.mjs              # Execute sync
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

// Mapping from Shopify titles to Relic product slugs/titles
const SHOPIFY_TO_RELIC_MAP = {
  'Kashmiri Saffron': 'kashmiri-saffron',
  'Mukhallat Emirates': 'mukhallat-emirates',
  'Majmua Attar': 'majmua-attar',
  'Hojari Frankincense & Yemeni Myrrh': 'hojari-frankincense-yemeni-myrrh',
  'Royal Green Frankincense': 'royal-green-frankincense',
  'Aged Mysore Sandalwood': 'aged-mysore-sandalwood',
  'Wild Vetiver (Ruh Khus)': 'wild-vetiver-ruh-khus',
};

async function main() {
  console.log('\n🔄 SHOPIFY → RELIC SYNC\n');
  console.log(isDryRun ? '📋 DRY RUN MODE - No changes will be made\n' : '🚀 LIVE MODE - Changes will be applied\n');
  
  // Fetch all Shopify-synced products
  console.log('📦 Fetching Shopify products...');
  const shopifyProducts = await client.fetch(`
    *[_type == "product" && defined(store.id)]{
      _id,
      "shopifyTitle": store.title,
      "shopifyId": store.id,
      "shopifyGid": store.gid,
      "variants": store.variants[]->{ 
        _id, 
        "title": store.title, 
        "price": store.price, 
        "gid": store.gid,
        "sku": store.sku
      }
    }
  `);
  console.log(`   Found ${shopifyProducts.length} Shopify products\n`);

  // Fetch all Relic Collection products
  console.log('🏛️  Fetching Relic Collection products...');
  const relicProducts = await client.fetch(`
    *[_type == "product" && collectionType == "relic"]{
      _id,
      title,
      "slug": slug.current,
      shopifyProductId,
      shopifyVariantId,
      inStock
    }
  `);
  console.log(`   Found ${relicProducts.length} Relic products\n`);

  // Create a lookup by slug
  const relicBySlug = {};
  relicProducts.forEach(p => {
    relicBySlug[p.slug] = p;
  });

  // Track results
  const linked = [];
  const alreadyLinked = [];
  const notFound = [];

  // Process each mapping
  for (const [shopifyTitle, relicSlug] of Object.entries(SHOPIFY_TO_RELIC_MAP)) {
    const shopify = shopifyProducts.find(p => p.shopifyTitle === shopifyTitle);
    
    if (!shopify) {
      console.log(`⚠️  Shopify product not found: ${shopifyTitle}`);
      continue;
    }
    
    // Try to find the Relic product
    let relicProduct = relicBySlug[relicSlug];
    
    // If not found by exact slug, try partial match
    if (!relicProduct) {
      relicProduct = relicProducts.find(p => 
        p.slug?.includes(relicSlug.split('-')[0]) || 
        p.title?.toLowerCase().includes(shopifyTitle.split(' ')[0].toLowerCase())
      );
    }
    
    if (!relicProduct) {
      notFound.push({ shopifyTitle, relicSlug });
      continue;
    }
    
    // Check if already linked
    if (relicProduct.shopifyProductId && relicProduct.shopifyVariantId) {
      alreadyLinked.push({ shopify, relic: relicProduct });
      continue;
    }
    
    // Get the default variant (Relic usually single variant)
    const defaultVariant = shopify.variants?.[0];
    
    linked.push({
      shopify,
      relic: relicProduct,
      updates: {
        shopifyProductId: shopify.shopifyGid,
        shopifyVariantId: defaultVariant?.gid,
      }
    });
  }

  // Report Results
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  console.log(`✅ TO BE LINKED (${linked.length} products):\n`);
  for (const item of linked) {
    console.log(`   ${item.shopify.shopifyTitle} → ${item.relic.title} (${item.relic.slug})`);
    console.log(`      Variant: ${item.updates.shopifyVariantId}`);
  }
  
  console.log(`\n🔗 ALREADY LINKED (${alreadyLinked.length} products):\n`);
  for (const item of alreadyLinked) {
    console.log(`   ${item.shopify.shopifyTitle} → ${item.relic.title}`);
  }
  
  if (notFound.length > 0) {
    console.log(`\n❓ RELIC PRODUCTS NOT FOUND IN SANITY (${notFound.length}):\n`);
    for (const item of notFound) {
      console.log(`   ${item.shopifyTitle} → Looking for: ${item.relicSlug}`);
    }
  }

  // Show all Relic products in Sanity for reference
  console.log(`\n📋 ALL RELIC PRODUCTS IN SANITY:\n`);
  for (const p of relicProducts) {
    const linked = p.shopifyProductId ? '✓' : '○';
    console.log(`   ${linked} ${p.title} (${p.slug})`);
  }

  // Apply updates if not dry run
  if (!isDryRun && linked.length > 0) {
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('📝 APPLYING UPDATES...\n');
    
    for (const item of linked) {
      try {
        await client
          .patch(item.relic._id)
          .set({
            shopifyProductId: item.updates.shopifyProductId,
            shopifyVariantId: item.updates.shopifyVariantId,
          })
          .commit();
        
        console.log(`   ✅ Updated: ${item.relic.title}`);
      } catch (error) {
        console.log(`   ❌ Failed: ${item.relic.title} - ${error.message}`);
      }
    }
    
    console.log('\n✅ Sync complete!');
  } else if (isDryRun) {
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('📋 DRY RUN COMPLETE - Run without --dry-run to apply changes');
  }
}

main().catch(console.error);
