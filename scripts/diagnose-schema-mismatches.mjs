#!/usr/bin/env node

/**
 * Diagnose Schema Mismatches
 * 
 * Checks for potential mismatches between:
 * - Madison Studio payloads and Sanity schema
 * - Shopify data and Sanity schema
 * - Missing required fields
 */

import { createClient } from '@sanity/client';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env.local
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

// Load .env.local first, then .env (local overrides)
loadEnvFile(join(projectRoot, '.env'));
loadEnvFile(join(projectRoot, '.env.local'));

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
    useCdn: false,
});

async function checkProductSchema() {
    console.log('🔍 Checking Product Schema Issues...\n');

    // Get all products
    const products = await client.fetch(`
        *[_type == "product"] {
            _id,
            title,
            collectionType,
            generationSource,
            internalName,
            "missingFields": {
                "missingTitle": !defined(title),
                "missingInternalName": !defined(internalName),
                "missingCollectionType": !defined(collectionType),
                "atlasMissingAtmosphere": collectionType == "atlas" && !defined(atlasData.atmosphere),
                "relicMissingFormat": collectionType == "relic" && !defined(productFormat)
            }
        }
    `);

    console.log(`Found ${products.length} products\n`);

    // Check for missing required fields
    const issues = {
        missingTitle: [],
        missingInternalName: [],
        missingCollectionType: [],
        atlasMissingAtmosphere: [],
        relicMissingFormat: [],
    };

    products.forEach((product) => {
        if (product.missingFields.missingTitle) issues.missingTitle.push(product._id);
        if (product.missingFields.missingInternalName) issues.missingInternalName.push(product._id);
        if (product.missingFields.missingCollectionType) issues.missingCollectionType.push(product._id);
        if (product.missingFields.atlasMissingAtmosphere) issues.atlasMissingAtmosphere.push(product._id);
        if (product.missingFields.relicMissingFormat) issues.relicMissingFormat.push(product._id);
    });

    // Report issues
    if (issues.missingTitle.length > 0) {
        console.log(`❌ ${issues.missingTitle.length} products missing title:`, issues.missingTitle.slice(0, 5));
    }
    if (issues.missingInternalName.length > 0) {
        console.log(`❌ ${issues.missingInternalName.length} products missing internalName:`, issues.missingInternalName.slice(0, 5));
    }
    if (issues.missingCollectionType.length > 0) {
        console.log(`❌ ${issues.missingCollectionType.length} products missing collectionType:`, issues.missingCollectionType.slice(0, 5));
    }
    if (issues.atlasMissingAtmosphere.length > 0) {
        console.log(`⚠️  ${issues.atlasMissingAtmosphere.length} Atlas products missing atmosphere:`, issues.atlasMissingAtmosphere.slice(0, 5));
    }
    if (issues.relicMissingFormat.length > 0) {
        console.log(`⚠️  ${issues.relicMissingFormat.length} Relic products missing productFormat:`, issues.relicMissingFormat.slice(0, 5));
    }

    // Check Madison Studio products
    const madisonProducts = products.filter(p => p.generationSource === 'madison-studio');
    console.log(`\n📊 Madison Studio Products: ${madisonProducts.length}`);
    if (madisonProducts.length > 0) {
        const madisonIssues = madisonProducts.filter(p => 
            !p.title || !p.internalName || !p.collectionType
        );
        if (madisonIssues.length > 0) {
            console.log(`⚠️  ${madisonIssues.length} Madison products have missing required fields`);
        }
    }

    return issues;
}

async function checkShopifyConnections() {
    console.log('\n🔍 Checking Shopify Connection Issues...\n');

    const products = await client.fetch(`
        *[_type == "product"] {
            _id,
            title,
            shopifyHandle,
            shopifyProductId,
            shopifyVariantId,
            "hasShopifyConnection": defined(shopifyProductId) || defined(shopifyHandle),
            "missingVariantIds": collectionType == "atlas" && (!defined(shopifyVariant6mlId) || !defined(shopifyVariant12mlId))
        }
    `);

    const withConnection = products.filter(p => p.hasShopifyConnection);
    const missingVariants = products.filter(p => p.missingVariantIds);

    console.log(`📊 Products with Shopify connection: ${withConnection.length}/${products.length}`);
    console.log(`⚠️  Atlas products missing variant IDs: ${missingVariants.length}`);

    if (missingVariants.length > 0) {
        console.log(`   Examples:`, missingVariants.slice(0, 3).map(p => p.title || p._id));
    }
}

async function main() {
    try {
        await checkProductSchema();
        await checkShopifyConnections();
        console.log('\n✅ Schema check complete');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

main();
