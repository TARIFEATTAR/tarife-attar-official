/**
 * Sync Shopify Products to Atlas Collection
 * 
 * This script links Shopify product data (IDs, variant IDs) to existing Atlas Collection products
 * so they can be added to cart and purchased.
 * 
 * Usage:
 *   node scripts/sync-shopify-to-atlas.mjs --dry-run    # Preview changes
 *   node scripts/sync-shopify-to-atlas.mjs              # Execute sync
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

// Mapping from Shopify titles to Atlas product slugs
// Based on the legacy names in Atlas Collection
const SHOPIFY_TO_ATLAS_MAP = {
  // EMBER Territory
  'Cairo Musk': 'cairo',  // CAIRO (formerly ANCIENT)
  'Granada Amber': 'beloved',
  'Honey Oudh': 'caravan',
  'Himalayan Musk': 'clarity',
  'Teeb Musk': 'close',
  'Frankincense & Myrrh': 'devotion',
  'Vanilla Sands': 'dune',
  'Black Musk': 'obsidian',
  'Oudh Fire': 'rogue',
  
  // Additional mappings for renamed products
  'DUBAI': 'dubai',  // Renamed from Dubai Musk
  'Dubai Musk': 'dubai',  // Legacy name
  
  // PETAL Territory
  'Peach Memoir': 'cherish',
  'Turkish Rose': 'damascus',
  'Arabian Jasmine': 'jasmine',
  'White Egyptian Musk': 'ritual',
  'Musk Tahara': 'tahara',
  
  // TIDAL Territory
  'Coconut Jasmine': 'bahia',
  'Del Mare': 'delmar',
  'Blue Oud Elixir': 'fathom',
  'China Rain': 'kyoto',
  'Regatta': 'regatta',
  
  // TERRA Territory
  'Oud & Tobacco': 'havana',
  'Marrakesh': 'marrakesh',
  'Black Ambergris': 'onyx',  // Renamed from original Black Oudh
  'Black Oudh': 'riyadh',  // RIYADH (formerly Black Oudh) - TERRA
  'RIYADH': 'riyadh',  // Direct name match
  'Oudh Aura': 'regalia',
  'Sicilian Oudh': 'sicily',
};

// Products that should be in RELIC collection
const RELIC_PRODUCTS = [
  'Kashmiri Saffron',
  'Mukhallat Emirates',
  'Majmua Attar',
  'Hojari Frankincense & Yemeni Myrrh',
  'Royal Green Frankincense',
  'Aged Mysore Sandalwood',
  'Wild Vetiver (Ruh Khus)',
];

// Special products (gift sets, discovery sets, etc.)
const SPECIAL_PRODUCTS = [
  'Elegant Queen Collection-10-Piece Luxury Set',
  'Exalted King Collection- 10-Piece Luxury Fragrance Gift Set [Limited Availability]',
  'Silk Road Discovery Set',
  '25/6ml -Tarife Attär Chest',
  'TARIFE ATTAR GIFT CARD',
  'Hojari Frankincense Essential Oil',
];

// Products that could be added to Atlas Collection (suggestions)
const POTENTIAL_ATLAS = [
  'Alhambra',        // Spanish city → TERRA
  'Gibraltar',       // Spanish territory → TIDAL  
  'Seville',         // Spanish city → PETAL or TERRA
  'Taif Rose',       // Saudi rose → PETAL
  'Tuberose',        // Floral → PETAL
  'White Amber',     // Amber → EMBER
  'Red Musk',        // Musk → EMBER
  'Egyptian Musk',   // Musk → EMBER
  'Sandalwood Rose', // Floral/Wood → PETAL or TERRA
  'Lily Of The Valley', // Floral → PETAL
  'Floral Dew',      // Floral → PETAL
  'Aseel',           // Arabic → EMBER
  'Kush',            // Earthy → TERRA
  'Indonesian Patchouli', // Earthy → TERRA
  'Jannatul Firdaus', // Paradise → PETAL
  'Musk Gazelle',    // Musk → EMBER
  'Royal Tahara',    // Clean musk → PETAL
  'Arabian Shamama', // Traditional → EMBER
  'Shamama Alamgiri', // Traditional → EMBER
  'Shamamatul Amber', // Amber → EMBER
  'Attar Mitti',     // Earth → TERRA
  'Mukhallat Al-Shifa', // Traditional → EMBER
];

async function main() {
  console.log('\n🔄 SHOPIFY → ATLAS SYNC\n');
  console.log(isDryRun ? '📋 DRY RUN MODE - No changes will be made\n' : '🚀 LIVE MODE - Changes will be applied\n');
  
  // Fetch all Shopify-synced products with their variants
  console.log('📦 Fetching Shopify products...');
  const shopifyProducts = await client.fetch(`
    *[_type == "product" && defined(store.id)]{
      _id,
      "shopifyTitle": store.title,
      "shopifyId": store.id,
      "shopifyGid": store.gid,
      "status": store.status,
      "priceRange": store.priceRange,
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

  // Fetch all Atlas Collection products
  console.log('🗺️  Fetching Atlas Collection products...');
  const atlasProducts = await client.fetch(`
    *[_type == "product" && collectionType == "atlas"]{
      _id,
      title,
      legacyName,
      "slug": slug.current,
      shopifyProductId,
      shopifyVariantId,
      shopifyVariant6mlId,
      shopifyVariant12mlId
    }
  `);
  console.log(`   Found ${atlasProducts.length} Atlas products\n`);

  // Create a lookup by slug
  const atlasBySlug = {};
  atlasProducts.forEach(p => {
    atlasBySlug[p.slug] = p;
  });

  // Track results
  const linked = [];
  const alreadyLinked = [];
  const notMapped = [];
  const relicProducts = [];
  const specialProducts = [];
  const potentialAtlas = [];

  // Process each Shopify product
  for (const shopify of shopifyProducts) {
    const title = shopify.shopifyTitle;
    
    // Check if it's a RELIC product
    if (RELIC_PRODUCTS.includes(title)) {
      relicProducts.push(shopify);
      continue;
    }
    
    // Check if it's a special product
    if (SPECIAL_PRODUCTS.includes(title)) {
      specialProducts.push(shopify);
      continue;
    }
    
    // Check if it maps to an Atlas product
    const atlasSlug = SHOPIFY_TO_ATLAS_MAP[title];
    
    if (atlasSlug) {
      const atlasProduct = atlasBySlug[atlasSlug];
      
      if (!atlasProduct) {
        console.log(`⚠️  Atlas product not found for slug: ${atlasSlug}`);
        continue;
      }
      
      // Check if already fully linked (has product ID AND both variant IDs)
      if (atlasProduct.shopifyProductId && atlasProduct.shopifyVariant6mlId && atlasProduct.shopifyVariant12mlId) {
        alreadyLinked.push({ shopify, atlas: atlasProduct });
        continue;
      }
      
      // Get variant IDs (prefer 6ml variant as default)
      const variants = shopify.variants || [];
      const variant6ml = variants.find(v => v.title === '6ml' || v.title?.includes('6'));
      const variant12ml = variants.find(v => v.title === '12ml' || v.title?.includes('12'));
      const defaultVariant = variant6ml || variants[0];
      
      linked.push({
        shopify,
        atlas: atlasProduct,
        updates: {
          shopifyProductId: shopify.shopifyGid,
          shopifyVariantId: defaultVariant?.gid,
          shopifyVariantId6ml: variant6ml?.gid,
          shopifyVariantId12ml: variant12ml?.gid,
        }
      });
    } else if (POTENTIAL_ATLAS.includes(title)) {
      potentialAtlas.push(shopify);
    } else {
      notMapped.push(shopify);
    }
  }

  // Report Results
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  // Linked products
  console.log(`✅ TO BE LINKED (${linked.length} products):\n`);
  for (const item of linked) {
    console.log(`   ${item.shopify.shopifyTitle} → ${item.atlas.title} (${item.atlas.slug})`);
    if (item.updates.shopifyVariantId6ml) {
      console.log(`      6ml: ${item.updates.shopifyVariantId6ml}`);
    }
    if (item.updates.shopifyVariantId12ml) {
      console.log(`      12ml: ${item.updates.shopifyVariantId12ml}`);
    }
  }
  
  console.log(`\n🔗 ALREADY LINKED (${alreadyLinked.length} products):\n`);
  for (const item of alreadyLinked) {
    console.log(`   ${item.shopify.shopifyTitle} → ${item.atlas.title}`);
  }
  
  console.log(`\n🏛️  RELIC PRODUCTS (${relicProducts.length}):\n`);
  for (const p of relicProducts) {
    console.log(`   ${p.shopifyTitle}`);
  }
  
  console.log(`\n🎁 SPECIAL PRODUCTS (${specialProducts.length}):\n`);
  for (const p of specialProducts) {
    console.log(`   ${p.shopifyTitle}`);
  }
  
  console.log(`\n🌟 POTENTIAL ATLAS ADDITIONS (${potentialAtlas.length}):\n`);
  for (const p of potentialAtlas) {
    const price = p.priceRange ? `$${p.priceRange.minVariantPrice}-${p.priceRange.maxVariantPrice}` : 'N/A';
    console.log(`   ${p.shopifyTitle} (${price})`);
  }
  
  console.log(`\n❓ NOT MAPPED (${notMapped.length}):\n`);
  for (const p of notMapped) {
    console.log(`   ${p.shopifyTitle}`);
  }

  // Apply updates if not dry run
  if (!isDryRun && linked.length > 0) {
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('📝 APPLYING UPDATES...\n');
    
    for (const item of linked) {
      try {
        const updateData = {
          shopifyProductId: item.updates.shopifyProductId,
          shopifyVariantId: item.updates.shopifyVariantId,
        };
        
        // Add 6ml and 12ml variant IDs if available
        if (item.updates.shopifyVariantId6ml) {
          updateData.shopifyVariant6mlId = item.updates.shopifyVariantId6ml;
        }
        if (item.updates.shopifyVariantId12ml) {
          updateData.shopifyVariant12mlId = item.updates.shopifyVariantId12ml;
        }
        
        await client
          .patch(item.atlas._id)
          .set(updateData)
          .commit();
        
        console.log(`   ✅ Updated: ${item.atlas.title}`);
        if (updateData.shopifyVariant6mlId) {
          console.log(`      6ml: ${updateData.shopifyVariant6mlId}`);
        }
        if (updateData.shopifyVariant12mlId) {
          console.log(`      12ml: ${updateData.shopifyVariant12mlId}`);
        }
      } catch (error) {
        console.log(`   ❌ Failed: ${item.atlas.title} - ${error.message}`);
      }
    }
    
    console.log('\n✅ Sync complete!');
  } else if (isDryRun) {
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('📋 DRY RUN COMPLETE - Run without --dry-run to apply changes');
  }
}

main().catch(console.error);
