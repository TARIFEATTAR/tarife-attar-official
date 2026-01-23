#!/usr/bin/env node
/**
 * Audit Atlas Collection Territories
 * 
 * Validates that each territory has the correct products:
 * - Ember (8): Aden, Cairo, Caravan, Dune, Ethiopia, Granada, Obsidian, Oman
 * - Tidal (6): Bahia, Bahrain, Del Mar, Dubai, Regatta, Kyoto
 * - Petal (6): Cherish, Clarity, Damascus, Jasmine, Tahara, Ritual
 * - Terra (6): Marrakesh, Onyx, Havana, Riyadh, Regalia, Sicily
 * 
 * Total: 26 products
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
                    const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
                    process.env[key.trim()] = value;
                }
            }
        }
    } catch (err) {
        // File doesn't exist, that's okay
    }
}

loadEnvFile(join(projectRoot, '.env.local'));
loadEnvFile(join(projectRoot, '.env'));

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    useCdn: false,
    apiVersion: '2024-01-01',
    token: process.env.SANITY_WRITE_TOKEN,
});

// Expected products per territory
const EXPECTED_PRODUCTS = {
    ember: ['aden', 'cairo', 'caravan', 'dune', 'ethiopia', 'granada', 'obsidian', 'oman'],
    tidal: ['bahia', 'bahrain', 'delmar', 'dubai', 'regatta', 'kyoto'],
    petal: ['cherish', 'clarity', 'damascus', 'jasmine', 'tahara', 'ritual'],
    terra: ['marrakesh', 'onyx', 'havana', 'riyadh', 'regalia', 'sicily'],
};

// Normalize product title to slug format for comparison
function normalizeTitle(title) {
    return title
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

// Get expected slug variations
function getExpectedSlugs(title) {
    const normalized = normalizeTitle(title);
    const variations = [normalized];
    
    // Handle special cases
    if (normalized === 'del-mar' || normalized === 'delmar') {
        variations.push('del-mar', 'delmar');
    }
    
    return variations;
}

async function auditAtlasTerritories() {
    console.log('\n🗺️  AUDITING ATLAS COLLECTION TERRITORIES\n');
    console.log('═'.repeat(70));
    
    // Fetch all Atlas products
    const products = await client.fetch(`
        *[_type == "product" && collectionType == "atlas" && !(_id in path("drafts.**"))] {
            _id,
            title,
            "slug": slug.current,
            "atmosphere": atlasData.atmosphere,
            shopifyProductId,
            shopifyHandle,
            _createdAt
        } | order(title asc)
    `);
    
    console.log(`\n📊 Found ${products.length} Atlas products\n`);
    
    // Group by territory
    const byTerritory = {
        ember: [],
        tidal: [],
        petal: [],
        terra: [],
        unknown: [],
    };
    
    products.forEach(product => {
        const territory = (product.atmosphere || '').toLowerCase();
        if (byTerritory[territory]) {
            byTerritory[territory].push(product);
        } else {
            byTerritory.unknown.push(product);
        }
    });
    
    // Analyze each territory
    const issues = [];
    const toDelete = [];
    
    Object.entries(EXPECTED_PRODUCTS).forEach(([territory, expectedTitles]) => {
        const actual = byTerritory[territory] || [];
        const actualSlugs = actual.map(p => normalizeTitle(p.title));
        
        console.log(`\n${'─'.repeat(70)}`);
        console.log(`\n📍 ${territory.toUpperCase()} Territory (Expected: ${expectedTitles.length}, Actual: ${actual.length})`);
        
        // Find missing products
        const missing = expectedTitles.filter(expected => {
            const expectedVariations = getExpectedSlugs(expected);
            return !actualSlugs.some(actual => expectedVariations.includes(actual));
        });
        
        // Find extra products (not in expected list)
        const extra = actual.filter(product => {
            const productSlug = normalizeTitle(product.title);
            return !expectedTitles.some(expected => {
                const expectedVariations = getExpectedSlugs(expected);
                return expectedVariations.includes(productSlug);
            });
        });
        
        // Find products in wrong territory
        const wrongTerritory = actual.filter(product => {
            const productSlug = normalizeTitle(product.title);
            // Check if this product belongs in another territory
            for (const [otherTerritory, otherExpected] of Object.entries(EXPECTED_PRODUCTS)) {
                if (otherTerritory !== territory) {
                    const matches = otherExpected.some(expected => {
                        const expectedVariations = getExpectedSlugs(expected);
                        return expectedVariations.includes(productSlug);
                    });
                    if (matches) {
                        return true;
                    }
                }
            }
            return false;
        });
        
        // Display current products
        if (actual.length > 0) {
            console.log(`\n   Current products:`);
            actual.forEach(product => {
                const isExpected = expectedTitles.some(expected => {
                    const expectedVariations = getExpectedSlugs(expected);
                    return expectedVariations.includes(normalizeTitle(product.title));
                });
                const marker = isExpected ? '✅' : '❌';
                console.log(`   ${marker} ${product.title} (${product.slug || 'no slug'})`);
            });
        }
        
        // Report issues
        if (missing.length > 0) {
            console.log(`\n   ⚠️  MISSING: ${missing.join(', ')}`);
            issues.push({ territory, type: 'missing', products: missing });
        }
        
        if (extra.length > 0) {
            console.log(`\n   ❌ EXTRA (should be removed):`);
            extra.forEach(product => {
                console.log(`      - ${product.title} (${product._id})`);
                toDelete.push(product);
            });
            issues.push({ territory, type: 'extra', products: extra });
        }
        
        if (wrongTerritory.length > 0) {
            console.log(`\n   ⚠️  WRONG TERRITORY (should be moved):`);
            wrongTerritory.forEach(product => {
                console.log(`      - ${product.title} (currently in ${territory})`);
            });
            issues.push({ territory, type: 'wrong_territory', products: wrongTerritory });
        }
    });
    
    // Check unknown territory products
    if (byTerritory.unknown.length > 0) {
        console.log(`\n${'─'.repeat(70)}`);
        console.log(`\n❓ UNKNOWN TERRITORY (${byTerritory.unknown.length} products):`);
        byTerritory.unknown.forEach(product => {
            console.log(`   - ${product.title} (${product.slug || 'no slug'}) - Territory: ${product.atmosphere || 'not set'}`);
            // Check if they should be in a territory
            const productSlug = normalizeTitle(product.title);
            for (const [territory, expectedTitles] of Object.entries(EXPECTED_PRODUCTS)) {
                const matches = expectedTitles.some(expected => {
                    const expectedVariations = getExpectedSlugs(expected);
                    return expectedVariations.includes(productSlug);
                });
                if (matches) {
                    console.log(`     → Should be in ${territory.toUpperCase()} territory`);
                    break;
                }
            }
        });
    }
    
    // Summary
    console.log(`\n${'═'.repeat(70)}`);
    console.log(`\n📊 SUMMARY:\n`);
    console.log(`   Total Atlas products: ${products.length}`);
    console.log(`   Expected total: 26`);
    console.log(`   Products to delete: ${toDelete.length}`);
    console.log(`   Issues found: ${issues.length}`);
    
    if (toDelete.length > 0) {
        console.log(`\n\n🗑️  PRODUCTS TO DELETE (${toDelete.length}):\n`);
        toDelete.forEach(product => {
            console.log(`   - ${product.title}`);
            console.log(`     ID: ${product._id}`);
            console.log(`     Slug: ${product.slug || 'N/A'}`);
            console.log(`     Territory: ${product.atmosphere || 'N/A'}`);
            console.log(``);
        });
    }
    
    return { products, byTerritory, issues, toDelete };
}

auditAtlasTerritories().catch(console.error);
