#!/usr/bin/env node

/**
 * Smart Fix for Incomplete Products
 * 
 * Strategy:
 * 1. DELETE draft versions of incomplete products (safe cleanup)
 * 2. FIX published products by adding missing fields from Shopify data
 * 
 * Usage:
 *   node scripts/fix-incomplete-products-smart.mjs --dry-run    # Preview changes
 *   node scripts/fix-incomplete-products-smart.mjs              # Apply fixes
 */

import { createClient } from '@sanity/client';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

function loadEnvFile(filePath) {
    try {
        const content = readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const [key, ...valueParts] = trimmed.split('=');
                if (key && valueParts.length > 0) {
                    const value = valueParts.join('=').replace(/^["']|["']$/g, '');
                    process.env[key.trim()] = value.trim();
                }
            }
        }
    } catch (e) {
        // File doesn't exist, that's okay
    }
}

loadEnvFile(join(projectRoot, '.env'));
loadEnvFile(join(projectRoot, '.env.local'));

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
    token: process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_WRITE_TOKEN,
    useCdn: false,
});

// Known product mappings (products that should be on the new site)
const KNOWN_PRODUCTS = {
    'ONYX': { collectionType: 'atlas', territory: 'terra' },
    'DUNE': { collectionType: 'atlas', territory: 'tidal' },
    'JASMINE': { collectionType: 'atlas', territory: 'petal' },
    'BAHRAIN': { collectionType: 'atlas', territory: 'tidal' },
    'SACRED HOJARI': { collectionType: 'relic', format: 'Aged Resin' },
    'DUBAI': { collectionType: 'atlas', territory: 'ember' },
    'RIYADH': { collectionType: 'atlas', territory: 'ember' },
    'BAHIA': { collectionType: 'atlas', territory: 'petal' },
    'OBSIDIAN': { collectionType: 'relic', format: 'Pure Oud' },
    'KYOTO': { collectionType: 'atlas', territory: 'petal' },
    'CLARITY': { collectionType: 'atlas', territory: 'tidal' },
    'DELMAR': { collectionType: 'atlas', territory: 'tidal' },
    'ETHIOPIA': { collectionType: 'atlas', territory: 'ember' },
    'GRANADA': { collectionType: 'atlas', territory: 'petal' },
    'HAVANA': { collectionType: 'atlas', territory: 'ember' },
    'CARAVAN': { collectionType: 'atlas', territory: 'ember' },
    'MUKHALLAT': { collectionType: 'relic', format: 'Traditional Attar' },
    'CHERISH': { collectionType: 'atlas', territory: 'petal' },
    'REGALIA': { collectionType: 'atlas', territory: 'terra' },
    'ADEN': { collectionType: 'atlas', territory: 'tidal' },
    'SICILY': { collectionType: 'atlas', territory: 'petal' },
    'TAHARA': { collectionType: 'atlas', territory: 'tidal' },
    'OMAN': { collectionType: 'atlas', territory: 'ember' },
    'DAMASCUS': { collectionType: 'atlas', territory: 'ember' },
    'RITUAL': { collectionType: 'relic', format: 'Traditional Attar' },
};

function inferCollectionType(shopifyTitle) {
    const upperTitle = shopifyTitle.toUpperCase().trim();
    
    // Check known products first
    if (KNOWN_PRODUCTS[upperTitle]) {
        return KNOWN_PRODUCTS[upperTitle];
    }
    
    // Heuristics for unknown products
    const relicKeywords = ['OUD', 'OUDH', 'RESIN', 'AMBER', 'MUSK', 'ATTAR', 'FRANKINCENSE', 'MYRRH', 'SANDALWOOD'];
    const isRelic = relicKeywords.some(keyword => upperTitle.includes(keyword));
    
    return {
        collectionType: isRelic ? 'relic' : 'atlas',
        territory: isRelic ? null : 'terra', // Default to terra for atlas
        format: isRelic ? 'Traditional Attar' : null,
    };
}

function generateInternalName(shopifyTitle) {
    // Convert "ONYX" -> "Onyx", "SACRED HOJARI" -> "Sacred Hojari"
    return shopifyTitle
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

async function findIncompleteProducts() {
    const products = await client.fetch(`
        *[_type == "product" && (
            !defined(title) || 
            !defined(internalName) || 
            !defined(collectionType)
        )] {
            _id,
            title,
            internalName,
            collectionType,
            shopifyHandle,
            shopifyProductId,
            "store": store.title,
            "isDraft": _id match "drafts.*",
            "missingFields": {
                "title": !defined(title),
                "internalName": !defined(internalName),
                "collectionType": !defined(collectionType)
            }
        }
    `);

    return products;
}

async function fixProduct(product, dryRun = true) {
    const shopifyTitle = product.store || product.shopifyHandle || 'Unknown Product';
    const inferred = inferCollectionType(shopifyTitle);
    
    const updates = {};
    
    if (!product.title) {
        updates.title = shopifyTitle;
    }
    
    if (!product.internalName) {
        updates.internalName = generateInternalName(shopifyTitle);
    }
    
    if (!product.collectionType) {
        updates.collectionType = inferred.collectionType;
        
        // Add collection-specific data
        if (inferred.collectionType === 'atlas' && inferred.territory) {
            updates.atlasData = {
                atmosphere: inferred.territory,
            };
        }
        
        if (inferred.collectionType === 'relic' && inferred.format) {
            updates.productFormat = inferred.format;
        }
    }

    if (dryRun) {
        console.log(`   Would fix: ${product._id}`);
        console.log(`     Title: ${updates.title || product.title}`);
        console.log(`     Internal Name: ${updates.internalName || product.internalName}`);
        console.log(`     Collection: ${updates.collectionType || product.collectionType}`);
        if (updates.atlasData) {
            console.log(`     Atlas Territory: ${updates.atlasData.atmosphere}`);
        }
        if (updates.productFormat) {
            console.log(`     Relic Format: ${updates.productFormat}`);
        }
        return false;
    } else {
        try {
            await client.patch(product._id).set(updates).commit();
            console.log(`   ✅ Fixed: ${product._id} (${shopifyTitle})`);
            return true;
        } catch (error) {
            console.error(`   ❌ Error fixing ${product._id}:`, error.message);
            return false;
        }
    }
}

async function deleteDraft(product, dryRun = true) {
    if (dryRun) {
        console.log(`   Would delete draft: ${product._id}${product.store ? ` (${product.store})` : ''}`);
        return false;
    } else {
        try {
            await client.delete(product._id);
            console.log(`   ✅ Deleted draft: ${product._id}`);
            return true;
        } catch (error) {
            console.error(`   ❌ Error deleting ${product._id}:`, error.message);
            return false;
        }
    }
}

async function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run') || !args.includes('--execute');
    const shouldExecute = args.includes('--execute');

    try {
        const incompleteProducts = await findIncompleteProducts();
        
        if (incompleteProducts.length === 0) {
            console.log('✅ No incomplete products found!');
            return;
        }

        console.log(`Found ${incompleteProducts.length} incomplete products\n`);

        // Separate drafts from published
        const drafts = incompleteProducts.filter(p => p.isDraft);
        const published = incompleteProducts.filter(p => !p.isDraft);

        console.log(`📦 Draft products: ${drafts.length} (will be deleted)`);
        console.log(`📦 Published products: ${published.length} (will be fixed)\n`);

        // Show sample
        if (published.length > 0) {
            console.log('Sample published products to fix:');
            published.slice(0, 5).forEach(p => {
                console.log(`   - ${p._id}: ${p.store || 'no title'}`);
            });
            console.log('');
        }

        let fixed = 0;
        let deleted = 0;
        let errors = 0;

        // Fix published products
        if (published.length > 0) {
            console.log(`${dryRun ? '🔍 DRY RUN: Would fix' : '🔧 Fixing'} ${published.length} published products...\n`);
            for (const product of published) {
                const result = await fixProduct(product, dryRun);
                if (result) fixed++;
                if (!result && !dryRun) errors++;
            }
        }

        // Delete draft products
        if (drafts.length > 0) {
            console.log(`\n${dryRun ? '🔍 DRY RUN: Would delete' : '🗑️  Deleting'} ${drafts.length} draft products...\n`);
            for (const product of drafts) {
                const result = await deleteDraft(product, dryRun);
                if (result) deleted++;
                if (!result && !dryRun) errors++;
            }
        }

        // Summary
        console.log(`\n📊 Summary:`);
        if (dryRun) {
            console.log(`   Would fix: ${published.length} published products`);
            console.log(`   Would delete: ${drafts.length} draft products`);
            console.log(`\n⚠️  To apply changes, run: node scripts/fix-incomplete-products-smart.mjs --execute`);
        } else {
            console.log(`   Fixed: ${fixed} products`);
            console.log(`   Deleted: ${deleted} drafts`);
            console.log(`   Errors: ${errors}`);
        }

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

main();
