/**
 * Generate SKUs for Tarife Attär Products
 * 
 * Format: TERRITORY-PRODUCTNAME-SIZE
 * Example: TERRA-ONYX-006ML, EMBER-CAIRO-012ML
 * 
 * Usage:
 *   node scripts/generate-skus.mjs
 */

import { createClient } from '@sanity/client';

const client = createClient({
  projectId: '8h5l91ut',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

// Territory mapping
const TERRITORY_MAP = {
  'ember': 'EMBER',
  'petal': 'PETAL',
  'tidal': 'TIDAL',
  'terra': 'TERRA',
};

// Format size to 3 digits + ML (e.g., 6ml → 006ML, 12ml → 012ML)
function formatSize(size) {
  if (!size) return '006ML'; // default to 6ml
  const num = parseInt(size.replace(/[^0-9]/g, ''), 10);
  return String(num).padStart(3, '0') + 'ML';
}

// Clean product name for SKU (uppercase, remove special chars, replace spaces with nothing)
function cleanProductName(name) {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 12); // Max 12 chars for readability
}

async function main() {
  console.log('\n📋 TARIFE ATTÄR SKU GENERATOR\n');
  console.log('Format: TERRITORY-PRODUCTNAME-SIZE');
  console.log('Example: TERRA-ONYX-006ML\n');
  console.log('═'.repeat(70));
  
  // Fetch Atlas products with territory data
  const atlasProducts = await client.fetch(`
    *[_type == "product" && collectionType == "atlas"] | order(atlasData.atmosphere asc, title asc) {
      _id,
      title,
      "slug": slug.current,
      "territory": atlasData.atmosphere,
      inStock
    }
  `);
  
  // Fetch Relic products
  const relicProducts = await client.fetch(`
    *[_type == "product" && collectionType == "relic"] | order(title asc) {
      _id,
      title,
      "slug": slug.current,
      volume,
      inStock
    }
  `);

  console.log('\n🗺️  ATLAS COLLECTION SKUs\n');
  
  // Group by territory
  const byTerritory = { ember: [], petal: [], tidal: [], terra: [] };
  
  for (const product of atlasProducts) {
    const territory = product.territory || 'ember';
    if (byTerritory[territory]) {
      byTerritory[territory].push(product);
    }
  }
  
  // Generate and display SKUs by territory
  const allSkus = [];
  
  for (const [territory, products] of Object.entries(byTerritory)) {
    if (products.length === 0) continue;
    
    const territoryCode = TERRITORY_MAP[territory];
    console.log(`\n  ${territoryCode} TERRITORY (${products.length} products):`);
    console.log('  ' + '─'.repeat(60));
    
    for (const product of products) {
      const productName = cleanProductName(product.title);
      const sku6ml = `${territoryCode}-${productName}-006ML`;
      const sku12ml = `${territoryCode}-${productName}-012ML`;
      const stock = product.inStock ? '✓' : '○';
      
      console.log(`  ${stock} ${product.title}`);
      console.log(`      6ml:  ${sku6ml}`);
      console.log(`      12ml: ${sku12ml}`);
      
      allSkus.push({
        product: product.title,
        slug: product.slug,
        territory: territoryCode,
        sku6ml,
        sku12ml,
        collection: 'atlas'
      });
    }
  }
  
  console.log('\n\n🏛️  RELIC COLLECTION SKUs\n');
  console.log('  ' + '─'.repeat(60));
  
  for (const product of relicProducts) {
    if (!product.title) continue;
    
    const productName = cleanProductName(product.title);
    const volume = product.volume || '3ml';
    const size = formatSize(volume);
    const sku = `RELIC-${productName}-${size}`;
    const stock = product.inStock ? '✓' : '○';
    
    console.log(`  ${stock} ${product.title}`);
    console.log(`      SKU: ${sku}`);
    
    allSkus.push({
      product: product.title,
      slug: product.slug,
      territory: 'RELIC',
      sku: sku,
      collection: 'relic'
    });
  }
  
  // Summary table for easy copy
  console.log('\n\n═'.repeat(70));
  console.log('\n📊 FULL SKU LIST (Copy for Shopify)\n');
  console.log('Product | 6ml SKU | 12ml SKU');
  console.log('─'.repeat(70));
  
  for (const item of allSkus.filter(s => s.collection === 'atlas')) {
    console.log(`${item.product.padEnd(25)} | ${item.sku6ml.padEnd(22)} | ${item.sku12ml}`);
  }
  
  console.log('\n─'.repeat(70));
  console.log('RELIC PRODUCTS:');
  console.log('─'.repeat(70));
  
  for (const item of allSkus.filter(s => s.collection === 'relic')) {
    console.log(`${item.product.padEnd(25)} | ${item.sku}`);
  }
  
  console.log('\n═'.repeat(70));
  console.log(`\n✅ Generated ${allSkus.length} product SKUs`);
  console.log('   Update these in Shopify Admin → Products → Edit → Variants → SKU\n');
}

main().catch(console.error);
