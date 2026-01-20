/**
 * Script to set showLegacyName: false for all products
 * Run with: node scripts/hide-legacy-names.mjs
 */

import { createClient } from '@sanity/client';

const client = createClient({
  projectId: '8h5l91ut',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

async function hideLegacyNames() {
  console.log('🔍 Finding products with legacy names...');

  const products = await client.fetch(
    `*[_type == "product" && defined(legacyName) && showLegacyName == true]{_id, title, legacyName}`
  );

  console.log(`Found ${products.length} products with showLegacyName: true\n`);

  for (const product of products) {
    console.log(`📝 Updating ${product.title} (${product.legacyName})...`);

    try {
      await client
        .patch(product._id)
        .set({ showLegacyName: false })
        .commit();

      console.log(`   ✅ Done`);
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }

  console.log('\n🎉 All products updated!');
}

hideLegacyNames().catch(console.error);
