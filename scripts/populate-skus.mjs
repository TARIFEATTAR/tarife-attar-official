/**
 * Populate SKUs in Sanity
 * 
 * SKU Architecture:
 * - Primary SKU (sku): TERRITORY-PRODUCTNAME (no size) - Product identifier
 * - Variant SKUs: TERRITORY-PRODUCTNAME-SIZE - For specific variants
 * 
 * Examples:
 *   Primary: TERRA-ONYX, EMBER-CAIRO, RELIC-MAJMUA
 *   Variants: TERRA-ONYX-6ML, TERRA-ONYX-12ML, RELIC-MAJMUA-3ML
 * 
 * Usage:
 *   node scripts/populate-skus.mjs --dry-run    # Preview changes
 *   node scripts/populate-skus.mjs              # Apply changes
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

// Territory codes
const TERRITORY_MAP = {
  'ember': 'EMBER',
  'petal': 'PETAL',
  'tidal': 'TIDAL',
  'terra': 'TERRA',
};

// Clean product name for SKU
function cleanProductName(name) {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

async function main() {
  console.log('\n📋 POPULATE SKUs IN SANITY\n');
  console.log(isDryRun ? '📋 DRY RUN MODE\n' : '🚀 LIVE MODE\n');
  console.log('═'.repeat(60));
  
  // Fetch Atlas products
  const atlasProducts = await client.fetch(`
    *[_type == "product" && collectionType == "atlas"] {
      _id,
      title,
      "territory": atlasData.atmosphere,
      sku,
      sku6ml,
      sku12ml
    }
  `);
  
  // Fetch Relic products
  const relicProducts = await client.fetch(`
    *[_type == "product" && collectionType == "relic"] {
      _id,
      title,
      volume,
      sku
    }
  `);

  console.log(`\nFound ${atlasProducts.length} Atlas products`);
  console.log(`Found ${relicProducts.length} Relic products\n`);

  const updates = [];

  // Process Atlas products
  console.log('\n🗺️  ATLAS PRODUCTS:\n');
  
  for (const product of atlasProducts) {
    if (!product.title || !product.territory) {
      console.log(`  ⚠️  Skipping ${product.title || 'Unknown'} - missing data`);
      continue;
    }
    
    const territoryCode = TERRITORY_MAP[product.territory];
    const productName = cleanProductName(product.title);
    
    // Primary SKU (no size) - Product identifier
    const skuPrimary = `${territoryCode}-${productName}`;
    // Variant SKUs (with size)
    const sku6ml = `${territoryCode}-${productName}-6ML`;
    const sku12ml = `${territoryCode}-${productName}-12ML`;
    
    // Check if already set correctly
    if (product.sku === skuPrimary && product.sku6ml === sku6ml && product.sku12ml === sku12ml) {
      console.log(`  ✓ ${product.title} - Already set`);
      continue;
    }
    
    console.log(`  → ${product.title}`);
    console.log(`      Primary: ${skuPrimary}`);
    console.log(`      6ml:     ${sku6ml}`);
    console.log(`      12ml:    ${sku12ml}`);
    
    updates.push({
      id: product._id,
      title: product.title,
      data: { sku: skuPrimary, sku6ml, sku12ml }
    });
  }

  // Process Relic products
  console.log('\n\n🏛️  RELIC PRODUCTS:\n');
  
  for (const product of relicProducts) {
    if (!product.title) {
      console.log(`  ⚠️  Skipping - no title`);
      continue;
    }
    
    const productName = cleanProductName(product.title);
    const size = product.volume ? product.volume.replace(/[^0-9]/g, '') : '3';
    
    // Primary SKU (no size) - Product identifier
    const skuPrimary = `RELIC-${productName}`;
    
    // Check if already set correctly
    if (product.sku === skuPrimary) {
      console.log(`  ✓ ${product.title} - Already set`);
      continue;
    }
    
    console.log(`  → ${product.title}`);
    console.log(`      Primary: ${skuPrimary}`);
    
    updates.push({
      id: product._id,
      title: product.title,
      data: { sku: skuPrimary }
    });
  }

  // Apply updates
  if (updates.length === 0) {
    console.log('\n✅ All SKUs already up to date!');
    return;
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`\n📝 ${updates.length} products to update\n`);

  if (!isDryRun) {
    console.log('Applying updates...\n');
    
    for (const update of updates) {
      try {
        await client
          .patch(update.id)
          .set(update.data)
          .commit();
        console.log(`  ✅ ${update.title}`);
      } catch (error) {
        console.log(`  ❌ ${update.title}: ${error.message}`);
      }
    }
    
    console.log('\n✅ SKU population complete!');
  } else {
    console.log('Run without --dry-run to apply changes');
  }
}

main().catch(console.error);
