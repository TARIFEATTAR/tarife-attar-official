/**
 * Cleanup Incomplete Products in Sanity
 * 
 * Identifies and optionally fixes/removes products with missing critical data:
 * - Products with null/empty titles
 * - Products missing required fields
 * 
 * Usage:
 *   node scripts/cleanup-incomplete-products.mjs --dry-run    # Preview issues
 *   node scripts/cleanup-incomplete-products.mjs --delete     # Delete incomplete products
 *   node scripts/cleanup-incomplete-products.mjs              # Just report (safe)
 */

// Load environment variables from .env.local
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env.local');

try {
  const envFile = readFileSync(envPath, 'utf-8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match && !match[1].startsWith('#')) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
} catch (error) {
  // .env.local might not exist, that's okay
}

import { createClient } from '@sanity/client';

const client = createClient({
  projectId: '8h5l91ut',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

const isDryRun = process.argv.includes('--dry-run');
const shouldDelete = process.argv.includes('--delete');

async function main() {
  console.log('\n🧹 CLEANUP INCOMPLETE PRODUCTS\n');
  console.log(isDryRun ? '📋 DRY RUN MODE\n' : shouldDelete ? '🗑️  DELETE MODE\n' : '📊 REPORT MODE\n');
  console.log('═'.repeat(70));
  
  // Fetch all products
  const products = await client.fetch(`
    *[_type == "product" && !(_id in path("drafts.**"))] {
      _id,
      title,
      "slug": slug.current,
      collectionType,
      "territory": atlasData.atmosphere,
      sku,
      sku6ml,
      sku12ml,
      "shopifyHandle": store.slug.current,
      "shopifyProductId": coalesce(shopifyProductId, store.id)
    }
  `);
  
  console.log(`\n📚 Found ${products.length} total products\n`);
  
  // Identify issues
  const issues = {
    nullTitle: [],
    emptySlug: [],
    missingCollectionType: [],
    atlasMissingTerritory: [],
    generatingUnknownSku: [],
  };
  
  for (const product of products) {
    // Check for null/empty title
    if (!product.title || product.title.trim() === '') {
      issues.nullTitle.push(product);
      if (product.sku && product.sku.includes('UNKNOWN')) {
        issues.generatingUnknownSku.push(product);
      }
    }
    
    // Check for empty slug
    if (!product.slug || product.slug.trim() === '') {
      issues.emptySlug.push(product);
    }
    
    // Check for missing collection type
    if (!product.collectionType) {
      issues.missingCollectionType.push(product);
    }
    
    // Check Atlas products missing territory
    if (product.collectionType === 'atlas' && !product.territory) {
      issues.atlasMissingTerritory.push(product);
    }
  }
  
  // Report issues
  console.log('═'.repeat(70));
  console.log('\n📊 ISSUES FOUND:\n');
  
  console.log(`❌ Products with null/empty titles: ${issues.nullTitle.length}`);
  if (issues.nullTitle.length > 0) {
    console.log('\n   These products:');
    for (const p of issues.nullTitle) {
      console.log(`      - _id: ${p._id}`);
      console.log(`        slug: ${p.slug || '(empty)'}`);
      console.log(`        sku: ${p.sku || '(not set)'}`);
      console.log(`        collectionType: ${p.collectionType || '(not set)'}`);
    }
  }
  
  console.log(`\n⚠️  Products generating UNKNOWN SKUs: ${issues.generatingUnknownSku.length}`);
  if (issues.generatingUnknownSku.length > 0) {
    console.log('\n   These are causing "RELIC-UNKNOWN" or similar:');
    for (const p of issues.generatingUnknownSku) {
      console.log(`      - _id: ${p._id}`);
      console.log(`        slug: ${p.slug || '(empty)'}`);
      console.log(`        sku: ${p.sku}`);
    }
  }
  
  console.log(`\n⚠️  Products with empty slugs: ${issues.emptySlug.length}`);
  console.log(`\n⚠️  Products missing collectionType: ${issues.missingCollectionType.length}`);
  console.log(`\n⚠️  Atlas products missing territory: ${issues.atlasMissingTerritory.length}`);
  
  // Recommendations
  console.log('\n' + '═'.repeat(70));
  console.log('\n💡 RECOMMENDATIONS:\n');
  
  if (issues.nullTitle.length > 0) {
    console.log('1. Products with null titles should be:');
    console.log('   - Fixed: Add proper titles in Sanity Studio, OR');
    console.log('   - Deleted: If they are duplicates or test records');
    console.log('\n   To delete them, run:');
    console.log('   node scripts/cleanup-incomplete-products.mjs --delete\n');
  }
  
  if (issues.atlasMissingTerritory.length > 0) {
    console.log('2. Atlas products missing territory need territory set in atlasData.atmosphere\n');
  }
  
  // Delete if requested
  if (shouldDelete && issues.nullTitle.length > 0) {
    console.log('═'.repeat(70));
    console.log('\n🗑️  DELETING INCOMPLETE PRODUCTS\n');
    
    if (isDryRun) {
      console.log('   [DRY RUN] Would delete:');
      for (const p of issues.nullTitle) {
        console.log(`      - ${p._id} (slug: ${p.slug || 'empty'})`);
      }
      console.log('\n   Run without --dry-run to actually delete');
    } else {
      console.log('   Deleting products with null titles...\n');
      
      let deleted = 0;
      let errors = 0;
      
      for (const product of issues.nullTitle) {
        try {
          await client.delete(product._id);
          console.log(`   ✅ Deleted: ${product._id} (slug: ${product.slug || 'empty'})`);
          deleted++;
        } catch (error) {
          console.log(`   ❌ Error deleting ${product._id}: ${error.message}`);
          errors++;
        }
      }
      
      console.log('\n' + '═'.repeat(70));
      console.log('\n📊 SUMMARY:\n');
      console.log(`   Deleted: ${deleted}`);
      console.log(`   Errors: ${errors}`);
      console.log('\n✅ Cleanup complete!\n');
    }
  }
  
  console.log('═'.repeat(70));
  console.log('\n✅ Report complete!\n');
}

main().catch(console.error);
