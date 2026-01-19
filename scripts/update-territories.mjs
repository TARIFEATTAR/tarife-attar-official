#!/usr/bin/env node
/**
 * Update Territory Assignments
 * 
 * Moves products between territories:
 * - DUBAI → TIDAL
 * - CLARITY (Himalayan Musk) → PETAL (from EMBER)
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

const UPDATES = [
  {
    slug: 'dubai',
    title: 'DUBAI',
    newTerritory: 'tidal',
    reason: 'Reassigned to Tidal territory'
  },
  {
    slug: 'clarity',
    title: 'CLARITY',
    legacyName: 'Himalayan Musk',
    newTerritory: 'petal',
    reason: 'Moved from Ember to Petal territory'
  }
];

const TERRITORY_PRICING = {
  ember: { '6ml': 28, '12ml': 48 },
  petal: { '6ml': 30, '12ml': 50 },
  tidal: { '6ml': 30, '12ml': 50 },
  terra: { '6ml': 33, '12ml': 55 },
};

async function main() {
  console.log('\n🗺️  TERRITORY REASSIGNMENT\n');
  console.log(isDryRun ? '📋 DRY RUN MODE\n' : '🚀 LIVE MODE\n');
  console.log('═'.repeat(50));

  for (const update of UPDATES) {
    console.log(`\n📍 ${update.title} (${update.legacyName || update.slug})`);
    console.log(`   → Moving to ${update.newTerritory.toUpperCase()}`);
    console.log(`   Reason: ${update.reason}`);
    
    const pricing = TERRITORY_PRICING[update.newTerritory];
    console.log(`   New pricing: $${pricing['6ml']} / $${pricing['12ml']}`);

    // Find the product
    const product = await client.fetch(
      `*[_type == "product" && slug.current == $slug][0] {
        _id,
        title,
        "currentTerritory": atlasData.atmosphere
      }`,
      { slug: update.slug }
    );

    if (!product) {
      console.log(`   ❌ Product not found with slug: ${update.slug}`);
      continue;
    }

    console.log(`   Current territory: ${product.currentTerritory?.toUpperCase() || 'NONE'}`);

    if (!isDryRun) {
      try {
        await client
          .patch(product._id)
          .set({
            'atlasData.atmosphere': update.newTerritory
          })
          .commit();
        
        console.log(`   ✅ Updated successfully!`);
      } catch (error) {
        console.log(`   ❌ Failed: ${error.message}`);
      }
    } else {
      console.log(`   📋 Would update atlasData.atmosphere → ${update.newTerritory}`);
    }
  }

  console.log('\n' + '═'.repeat(50));
  
  if (isDryRun) {
    console.log('\n📋 DRY RUN COMPLETE - Run without --dry-run to apply changes\n');
  } else {
    console.log('\n✅ Territory updates complete!\n');
    console.log('Note: Pricing is calculated dynamically based on territory.');
    console.log('The website will automatically show the correct prices.\n');
  }
}

main().catch(console.error);
