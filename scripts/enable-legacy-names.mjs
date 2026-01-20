/**
 * Enable showLegacyName for all products with legacy names
 * Run: node scripts/enable-legacy-names.mjs
 */

import { createClient } from '@sanity/client';

const client = createClient({
  projectId: '8h5l91ut',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

async function enableLegacyNames() {
  console.log('🔍 Fetching products with legacy names...\n');

  const products = await client.fetch(`
    *[_type == "product" && defined(legacyName) && showLegacyName != true]{
      _id, title, legacyName, showLegacyName
    }
  `);

  console.log(`Found ${products.length} products to update:\n`);
  
  for (const product of products) {
    console.log(`  • ${product.title} → "${product.legacyName}"`);
  }

  if (products.length === 0) {
    console.log('✅ All products already have showLegacyName enabled!');
    return;
  }

  console.log('\n📝 Updating products...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const product of products) {
    try {
      await client
        .patch(product._id)
        .set({ showLegacyName: true })
        .commit();
      
      console.log(`  ✅ ${product.title}`);
      successCount++;
    } catch (error) {
      console.error(`  ❌ ${product.title}: ${error.message}`);
      errorCount++;
    }
  }

  console.log(`\n✨ Done! Updated ${successCount} products.`);
  if (errorCount > 0) {
    console.log(`⚠️  ${errorCount} products failed to update.`);
  }
}

// Check for token
if (!process.env.SANITY_WRITE_TOKEN) {
  console.error('❌ Missing SANITY_WRITE_TOKEN environment variable');
  console.log('\nRun with:');
  console.log('  SANITY_WRITE_TOKEN=your-token node scripts/enable-legacy-names.mjs');
  process.exit(1);
}

enableLegacyNames().catch(console.error);
