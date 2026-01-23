#!/usr/bin/env node
/**
 * Set Hero Background Overlay Opacity in Sanity
 * 
 * Updates the heroBackgrounds singleton document with new opacity values.
 * 
 * Usage:
 *   node scripts/set-hero-opacity.mjs --atlas 30 --relic 50
 *   node scripts/set-hero-opacity.mjs --atlas 35
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

// Parse command line arguments
function getArg(name) {
    const index = process.argv.indexOf(`--${name}`);
    if (index !== -1 && index + 1 < process.argv.length) {
        const value = parseInt(process.argv[index + 1], 10);
        if (!isNaN(value) && value >= 0 && value <= 100) {
            return value;
        }
    }
    return null;
}

async function setHeroOpacity() {
    const atlasOpacity = getArg('atlas');
    const relicOpacity = getArg('relic');
    
    if (!atlasOpacity && !relicOpacity) {
        console.log('Usage: node scripts/set-hero-opacity.mjs --atlas <0-100> [--relic <0-100>]');
        console.log('\nExample:');
        console.log('  node scripts/set-hero-opacity.mjs --atlas 30 --relic 50');
        process.exit(1);
    }

    console.log('\n🎨 SETTING HERO BACKGROUND OPACITY\n');
    console.log('═'.repeat(70));

    // Fetch current heroBackgrounds document
    const current = await client.fetch(`
        *[_type == "heroBackgrounds"][0] {
            _id,
            _rev,
            atlasOverlayOpacity,
            relicOverlayOpacity
        }
    `);

    if (!current) {
        console.error('❌ Hero Backgrounds document not found in Sanity!');
        console.error('   Please create it in Sanity Studio first: Settings → Hero Backgrounds');
        process.exit(1);
    }

    console.log('\n📊 Current Values:');
    console.log(`   Atlas Overlay Opacity: ${current.atlasOverlayOpacity ?? 'Not set'}%`);
    console.log(`   Relic Overlay Opacity: ${current.relicOverlayOpacity ?? 'Not set'}%`);

    // Prepare updates
    const updates = {};
    if (atlasOpacity !== null) {
        updates.atlasOverlayOpacity = atlasOpacity;
        console.log(`\n✏️  Setting Atlas Overlay Opacity to: ${atlasOpacity}%`);
    }
    if (relicOpacity !== null) {
        updates.relicOverlayOpacity = relicOpacity;
        console.log(`\n✏️  Setting Relic Overlay Opacity to: ${relicOpacity}%`);
    }

    if (Object.keys(updates).length === 0) {
        console.log('\n⚠️  No updates to make');
        return;
    }

    // Update the document
    try {
        await client
            .patch(current._id)
            .set(updates)
            .commit();

        console.log('\n✅ Successfully updated Hero Backgrounds document!');
        console.log('\n📝 Note: The document is now a draft. You need to publish it in Sanity Studio:');
        console.log('   1. Go to Sanity Studio → Settings → Hero Backgrounds');
        console.log('   2. Click "Publish" to make the changes live');
        
        // Try to publish automatically
        try {
            await client
                .patch(current._id)
                .set({ _id: current._id.replace('drafts.', '') })
                .commit();
            
            // Fetch the published document ID
            const publishedId = current._id.startsWith('drafts.') 
                ? current._id.replace('drafts.', '')
                : current._id;
            
            // Publish by creating a new revision
            await client
                .patch(publishedId)
                .set(updates)
                .commit();
            
            console.log('   ✅ Auto-published successfully!');
        } catch (publishError) {
            console.log('   ⚠️  Could not auto-publish. Please publish manually in Sanity Studio.');
        }
    } catch (error) {
        console.error('\n❌ Error updating document:', error.message);
        process.exit(1);
    }
}

setHeroOpacity().catch(console.error);
