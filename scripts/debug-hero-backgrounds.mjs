#!/usr/bin/env node
/**
 * Debug Hero Backgrounds
 * 
 * Checks what hero background data exists in Sanity and validates the query.
 */

import { createClient } from '@sanity/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

// Load environment variables manually
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, ...values] = line.split('=');
        if (key && values.length > 0) {
            const val = values.join('=').trim();
            process.env[key.trim()] = val;
        }
    });
}

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '8h5l91ut',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    useCdn: false,
});

async function debugHeroBackgrounds() {
    console.log('🔍 Checking Hero Backgrounds in Sanity...\n');

    // Check if document exists (including drafts)
    const allDocs = await client.fetch(`
        *[_type == "heroBackgrounds"] {
            _id,
            _rev,
            _createdAt,
            _updatedAt,
            atlasBackground {
                asset-> {
                    _id,
                    url,
                    originalFilename,
                    mimeType,
                    size
                },
                hotspot,
                crop
            },
            atlasOverlayOpacity,
            relicBackground {
                asset-> {
                    _id,
                    url,
                    originalFilename,
                    mimeType,
                    size
                },
                hotspot,
                crop
            },
            relicOverlayOpacity
        }
    `);

    console.log(`Found ${allDocs.length} heroBackgrounds document(s)\n`);

    if (allDocs.length === 0) {
        console.log('❌ No heroBackgrounds document found!');
        console.log('\n📝 To create one:');
        console.log('   1. Go to Sanity Studio → Settings → Hero Backgrounds');
        console.log('   2. Click "Create" (if it exists) or the document should auto-create');
        console.log('   3. Upload images and publish\n');
        return;
    }

    const doc = allDocs[0];
    console.log('📄 Document Details:');
    console.log(`   ID: ${doc._id}`);
    console.log(`   Created: ${doc._createdAt}`);
    console.log(`   Updated: ${doc._updatedAt}`);
    console.log(`   Atlas Overlay Opacity: ${doc.atlasOverlayOpacity ?? 'not set'}`);
    console.log(`   Relic Overlay Opacity: ${doc.relicOverlayOpacity ?? 'not set'}\n`);

    // Check Atlas Background
    console.log('🎨 Atlas Background:');
    if (doc.atlasBackground?.asset) {
        console.log(`   ✅ Image uploaded: ${doc.atlasBackground.asset.originalFilename}`);
        console.log(`   URL: ${doc.atlasBackground.asset.url}`);
        console.log(`   Size: ${(doc.atlasBackground.asset.size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   Type: ${doc.atlasBackground.asset.mimeType}`);
        if (doc.atlasBackground.hotspot) {
            console.log(`   ✅ Hotspot set:`, doc.atlasBackground.hotspot);
        } else {
            console.log(`   ⚠️  No hotspot set (click image in Studio to set focus point)`);
        }
    } else {
        console.log(`   ❌ No image uploaded`);
    }
    console.log('');

    // Check Relic Background
    console.log('🎨 Relic Background:');
    if (doc.relicBackground?.asset) {
        console.log(`   ✅ Image uploaded: ${doc.relicBackground.asset.originalFilename}`);
        console.log(`   URL: ${doc.relicBackground.asset.url}`);
        console.log(`   Size: ${(doc.relicBackground.asset.size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   Type: ${doc.relicBackground.asset.mimeType}`);
        if (doc.relicBackground.hotspot) {
            console.log(`   ✅ Hotspot set:`, doc.relicBackground.hotspot);
        } else {
            console.log(`   ⚠️  No hotspot set (click image in Studio to set focus point)`);
        }
    } else {
        console.log(`   ❌ No image uploaded`);
    }
    console.log('');

    // Test the actual query used by the site
    console.log('🔍 Testing Site Query:');
    const siteQuery = `
        *[_type == "heroBackgrounds"][0] {
            "atlasBackground": atlasBackground.asset->url,
            "atlasHotspot": atlasBackground.hotspot,
            atlasOverlayOpacity,
            "relicBackground": relicBackground.asset->url,
            "relicHotspot": relicBackground.hotspot,
            relicOverlayOpacity
        }
    `;
    
    const siteData = await client.fetch(siteQuery);
    console.log('Query Result:');
    console.log(JSON.stringify(siteData, null, 2));
    console.log('');

    // Check if published
    const publishedDoc = await client.fetch(`
        *[_type == "heroBackgrounds" && !(_id in path("drafts.**"))][0]
    `);

    if (publishedDoc) {
        console.log('✅ Document is PUBLISHED');
    } else {
        console.log('⚠️  Document is NOT PUBLISHED (only draft exists)');
        console.log('   → Publish the document in Sanity Studio for it to appear on the site');
    }
}

debugHeroBackgrounds().catch(console.error);
