/**
 * Cleanup Incomplete/Duplicate Sanity Records
 * 
 * Identifies and removes Sanity product records that:
 * - Have no title (null/empty)
 * - Are duplicates of properly set up products
 * 
 * Usage:
 *   node scripts/cleanup-sanity-duplicates.mjs --dry-run    # List what would be deleted
 *   node scripts/cleanup-sanity-duplicates.mjs              # Actually delete
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
  console.log('\n🧹 SANITY CLEANUP: Find Incomplete Records\n');
  console.log(isDryRun ? '📋 DRY RUN MODE\n' : '🚀 LIVE MODE - Will delete records!\n');
  console.log('═'.repeat(60));

  // Find all products
  const allProducts = await client.fetch(`
    *[_type == "product"] {
      _id,
      title,
      "slug": slug.current,
      collectionType,
      internalName,
      _createdAt
    } | order(_createdAt asc)
  `);

  console.log(`\n📊 Total products in Sanity: ${allProducts.length}\n`);

  // Categorize products
  const complete = [];
  const incomplete = [];
  const drafts = [];

  for (const product of allProducts) {
    if (product._id.startsWith('drafts.')) {
      drafts.push(product);
    } else if (!product.title || product.title.trim() === '') {
      incomplete.push(product);
    } else {
      complete.push(product);
    }
  }

  console.log(`✅ Complete products: ${complete.length}`);
  console.log(`⚠️  Incomplete (no title): ${incomplete.length}`);
  console.log(`📝 Draft products: ${drafts.length}`);

  // Show incomplete products
  if (incomplete.length > 0) {
    console.log('\n' + '─'.repeat(60));
    console.log('\n⚠️  INCOMPLETE PRODUCTS (no title):\n');
    
    for (const product of incomplete) {
      console.log(`   • ID: ${product._id}`);
      console.log(`     Slug: ${product.slug || 'none'}`);
      console.log(`     Internal: ${product.internalName || 'none'}`);
      console.log(`     Collection: ${product.collectionType || 'unknown'}`);
      console.log('');
    }
  }

  // Check for slug duplicates among complete products
  const slugMap = new Map();
  const duplicates = [];
  
  for (const product of complete) {
    if (product.slug) {
      if (slugMap.has(product.slug)) {
        duplicates.push({ original: slugMap.get(product.slug), duplicate: product });
      } else {
        slugMap.set(product.slug, product);
      }
    }
  }

  if (duplicates.length > 0) {
    console.log('\n' + '─'.repeat(60));
    console.log('\n🔄 DUPLICATE SLUGS:\n');
    
    for (const { original, duplicate } of duplicates) {
      console.log(`   Slug: "${original.slug}"`);
      console.log(`     Original: ${original.title} (${original._id})`);
      console.log(`     Duplicate: ${duplicate.title} (${duplicate._id})`);
      console.log('');
    }
  }

  // Ask what to delete
  const toDelete = [...incomplete];
  
  console.log('\n' + '═'.repeat(60));
  console.log(`\n🗑️  WILL DELETE: ${toDelete.length} incomplete records\n`);

  if (toDelete.length === 0) {
    console.log('✨ Nothing to clean up!\n');
    return;
  }

  if (isDryRun) {
    console.log('📋 Run without --dry-run to delete these records.\n');
    return;
  }

  // Delete incomplete records
  console.log('Deleting...\n');
  
  let deleted = 0;
  let errors = 0;

  for (const product of toDelete) {
    try {
      await client.delete(product._id);
      console.log(`   ✅ Deleted: ${product._id} (slug: ${product.slug || 'none'})`);
      deleted++;
    } catch (error) {
      console.log(`   ❌ Error deleting ${product._id}: ${error.message}`);
      errors++;
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log(`\n📊 CLEANUP COMPLETE`);
  console.log(`   Deleted: ${deleted}`);
  console.log(`   Errors: ${errors}`);
  console.log(`   Remaining products: ${allProducts.length - deleted}\n`);
}

main().catch(console.error);
