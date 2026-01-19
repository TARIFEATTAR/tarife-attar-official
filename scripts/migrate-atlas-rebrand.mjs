#!/usr/bin/env node
/**
 * Atlas Collection Rebrand Migration Script
 * 
 * Updates existing Sanity products with new Atlas Collection names,
 * legacy name references, territory assignments, and scent profiles.
 * 
 * Run with: SANITY_WRITE_TOKEN=your-token node scripts/migrate-atlas-rebrand.mjs
 * 
 * Options:
 *   --dry-run    Preview changes without writing to Sanity
 *   --create     Create new products (default: update existing only)
 *   --verbose    Show detailed output
 */

import { createClient } from '@sanity/client';
import {
  ALL_ATLAS_PRODUCTS,
  RELIC_PRODUCTS,
  TERRITORIES,
  COLLECTION_SUMMARY,
} from './atlas-rebrand-data.mjs';

// ============================================================================
// CONFIGURATION
// ============================================================================

const projectId = '8h5l91ut';
const dataset = 'production';
const apiVersion = '2025-12-31';

const token = process.env.SANITY_WRITE_TOKEN;
const isDryRun = process.argv.includes('--dry-run');
const shouldCreate = process.argv.includes('--create');
const isVerbose = process.argv.includes('--verbose');

// ============================================================================
// SANITY CLIENT
// ============================================================================

if (!token && !isDryRun) {
  console.error('❌ ERROR: SANITY_WRITE_TOKEN environment variable is required.');
  console.error('');
  console.error('Get a write token from:');
  console.error(`https://www.sanity.io/manage/project/${projectId}/api`);
  console.error('');
  console.error('Or run with --dry-run to preview changes:');
  console.error('node scripts/migrate-atlas-rebrand.mjs --dry-run');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token: token || 'dry-run-token',
  useCdn: false,
});

// ============================================================================
// HELPERS
// ============================================================================

function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function log(message, type = 'info') {
  const icons = {
    info: '📋',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    update: '🔄',
    create: '➕',
    skip: '⏭️',
  };
  console.log(`${icons[type] || '•'} ${message}`);
}

function verbose(message) {
  if (isVerbose) {
    console.log(`   ${message}`);
  }
}

// ============================================================================
// QUERY EXISTING PRODUCTS
// ============================================================================

async function fetchExistingProducts() {
  log('Fetching existing products from Sanity...');
  
  const query = `*[_type == "product"] {
    _id,
    _rev,
    title,
    internalName,
    "slugCurrent": slug.current,
    collectionType,
    "atmosphere": atlasData.atmosphere,
    legacyName,
    scentProfile
  }`;
  
  const products = await client.fetch(query);
  log(`Found ${products.length} existing products`, 'info');
  return products;
}

// ============================================================================
// MATCH PRODUCTS
// ============================================================================

function findExistingProduct(rebrandProduct, existingProducts) {
  // Try to match by former name (case-insensitive)
  const formerNameMatch = existingProducts.find((p) => {
    const title = (p.title || '').toLowerCase().trim();
    const formerName = (rebrandProduct.formerName || '').toLowerCase().trim();
    return title === formerName;
  });
  
  if (formerNameMatch) return formerNameMatch;
  
  // Try to match by slug
  const slugMatch = existingProducts.find((p) => {
    const existingSlug = (p.slugCurrent || '').toLowerCase();
    const formerSlug = createSlug(rebrandProduct.formerName || '');
    return existingSlug === formerSlug;
  });
  
  if (slugMatch) return slugMatch;
  
  // Try to match by new name (in case already migrated)
  const newNameMatch = existingProducts.find((p) => {
    const title = (p.title || '').toLowerCase().trim();
    const newName = rebrandProduct.newName.toLowerCase().trim();
    return title === newName;
  });
  
  return newNameMatch;
}

// ============================================================================
// BUILD PATCH OPERATIONS
// ============================================================================

function buildPatchForProduct(rebrandProduct, existingProduct) {
  const patches = {};
  const changes = [];
  
  // Update title to new name
  if (existingProduct.title !== rebrandProduct.newName) {
    patches.title = rebrandProduct.newName;
    changes.push(`title: "${existingProduct.title}" → "${rebrandProduct.newName}"`);
  }
  
  // Set legacy name if product had a different former name
  if (rebrandProduct.formerName && rebrandProduct.formerName !== rebrandProduct.newName) {
    if (existingProduct.legacyName !== rebrandProduct.formerName) {
      patches.legacyName = rebrandProduct.formerName;
      patches.showLegacyName = true;
      patches.legacyNameStyle = 'formerly';
      changes.push(`legacyName: "${rebrandProduct.formerName}"`);
    }
  }
  
  // Update slug
  const newSlug = rebrandProduct.slug;
  if (existingProduct.slugCurrent !== newSlug) {
    patches.slug = { _type: 'slug', current: newSlug };
    changes.push(`slug: "${existingProduct.slugCurrent}" → "${newSlug}"`);
  }
  
  // Set scent profile
  if (existingProduct.scentProfile !== rebrandProduct.scentProfile) {
    patches.scentProfile = rebrandProduct.scentProfile;
    changes.push(`scentProfile: "${rebrandProduct.scentProfile}"`);
  }
  
  // Set territory (atmosphere)
  if (existingProduct.atmosphere !== rebrandProduct.territory) {
    patches['atlasData.atmosphere'] = rebrandProduct.territory;
    changes.push(`territory: "${rebrandProduct.territory}"`);
  }
  
  // Ensure collection type is atlas
  if (existingProduct.collectionType !== 'atlas') {
    patches.collectionType = 'atlas';
    changes.push(`collectionType: "atlas"`);
  }
  
  return { patches, changes };
}

// ============================================================================
// BUILD NEW PRODUCT DOCUMENT
// ============================================================================

function buildNewProductDocument(rebrandProduct) {
  const doc = {
    _type: 'product',
    _id: `product-${rebrandProduct.slug}`,
    collectionType: 'atlas',
    internalName: rebrandProduct.slug.toUpperCase(),
    title: rebrandProduct.newName,
    slug: {
      _type: 'slug',
      current: rebrandProduct.slug,
    },
    scentProfile: rebrandProduct.scentProfile,
    atlasData: {
      atmosphere: rebrandProduct.territory,
    },
    productFormat: 'Perfume Oil',
    inStock: true,
    generationSource: 'manual',
  };
  
  // Add legacy name if different from new name
  if (rebrandProduct.formerName && rebrandProduct.formerName !== rebrandProduct.newName) {
    doc.legacyName = rebrandProduct.formerName;
    doc.showLegacyName = true;
    doc.legacyNameStyle = 'formerly';
  }
  
  return doc;
}

// ============================================================================
// MAIN MIGRATION
// ============================================================================

async function main() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  🌿 TARIFE ATTÄR — ATLAS COLLECTION REBRAND MIGRATION');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  
  if (isDryRun) {
    log('DRY RUN MODE — No changes will be made', 'warning');
    console.log('');
  }
  
  console.log(`📊 Migration Summary:`);
  console.log(`   Total Atlas products to migrate: ${COLLECTION_SUMMARY.atlas.total}`);
  console.log(`   - Ember: ${COLLECTION_SUMMARY.atlas.ember} products`);
  console.log(`   - Petal: ${COLLECTION_SUMMARY.atlas.petal} products`);
  console.log(`   - Tidal: ${COLLECTION_SUMMARY.atlas.tidal} products`);
  console.log(`   - Terra: ${COLLECTION_SUMMARY.atlas.terra} products`);
  console.log('');
  
  // Fetch existing products
  const existingProducts = await fetchExistingProducts();
  console.log('');
  
  // Track results
  const results = {
    updated: [],
    created: [],
    skipped: [],
    errors: [],
  };
  
  // Process each rebrand product
  console.log('─────────────────────────────────────────────────────────────────');
  console.log('  PROCESSING PRODUCTS');
  console.log('─────────────────────────────────────────────────────────────────');
  console.log('');
  
  const transaction = client.transaction();
  
  for (const rebrandProduct of ALL_ATLAS_PRODUCTS) {
    const existing = findExistingProduct(rebrandProduct, existingProducts);
    
    if (existing) {
      // Update existing product
      const { patches, changes } = buildPatchForProduct(rebrandProduct, existing);
      
      if (Object.keys(patches).length > 0) {
        log(`${rebrandProduct.newName} (updating from "${rebrandProduct.formerName}")`, 'update');
        
        for (const change of changes) {
          verbose(change);
        }
        
        if (!isDryRun) {
          transaction.patch(existing._id, (p) => p.set(patches));
        }
        
        results.updated.push({
          newName: rebrandProduct.newName,
          formerName: rebrandProduct.formerName,
          id: existing._id,
          changes,
        });
      } else {
        log(`${rebrandProduct.newName} — already up to date`, 'skip');
        results.skipped.push(rebrandProduct.newName);
      }
    } else if (shouldCreate) {
      // Create new product
      log(`${rebrandProduct.newName} — creating new product`, 'create');
      
      const doc = buildNewProductDocument(rebrandProduct);
      
      if (!isDryRun) {
        transaction.createOrReplace(doc);
      }
      
      results.created.push({
        newName: rebrandProduct.newName,
        formerName: rebrandProduct.formerName,
        slug: rebrandProduct.slug,
      });
    } else {
      // Product not found and --create not specified
      log(`${rebrandProduct.newName} (was "${rebrandProduct.formerName}") — NOT FOUND`, 'warning');
      verbose('Use --create flag to create new products');
      results.skipped.push({
        newName: rebrandProduct.newName,
        formerName: rebrandProduct.formerName,
        reason: 'not found',
      });
    }
  }
  
  // Commit transaction
  console.log('');
  console.log('─────────────────────────────────────────────────────────────────');
  console.log('  MIGRATION RESULTS');
  console.log('─────────────────────────────────────────────────────────────────');
  console.log('');
  
  if (!isDryRun && (results.updated.length > 0 || results.created.length > 0)) {
    try {
      log('Committing changes to Sanity...', 'info');
      await transaction.commit();
      log('All changes committed successfully!', 'success');
    } catch (error) {
      log(`Failed to commit: ${error.message}`, 'error');
      if (error.details) {
        console.error('Details:', JSON.stringify(error.details, null, 2));
      }
      process.exit(1);
    }
  }
  
  console.log('');
  console.log(`📊 Final Summary:`);
  console.log(`   ✅ Updated: ${results.updated.length} products`);
  console.log(`   ➕ Created: ${results.created.length} products`);
  console.log(`   ⏭️  Skipped: ${results.skipped.length} products`);
  
  if (results.updated.length > 0) {
    console.log('');
    console.log('📝 Updated Products:');
    for (const product of results.updated) {
      console.log(`   • ${product.newName} (was "${product.formerName}")`);
    }
  }
  
  if (results.created.length > 0) {
    console.log('');
    console.log('🆕 Created Products:');
    for (const product of results.created) {
      console.log(`   • ${product.newName} → /product/${product.slug}`);
    }
  }
  
  console.log('');
  console.log('─────────────────────────────────────────────────────────────────');
  console.log('  NEXT STEPS');
  console.log('─────────────────────────────────────────────────────────────────');
  console.log('');
  console.log('1. Open Sanity Studio and verify the changes');
  console.log('2. Publish updated products to make them live');
  console.log('3. Update Shopify product names/handles to match');
  console.log('4. Set up URL redirects (already configured in next.config.js)');
  console.log('5. Test the site to verify legacy names display correctly');
  console.log('');
  
  if (isDryRun) {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  This was a DRY RUN. To apply changes, run without --dry-run:');
    console.log('  SANITY_WRITE_TOKEN=your-token node scripts/migrate-atlas-rebrand.mjs');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
  }
}

main().catch((error) => {
  console.error('');
  log(`Migration failed: ${error.message}`, 'error');
  console.error(error);
  process.exit(1);
});
