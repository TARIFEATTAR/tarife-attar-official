
import { createClient } from '@sanity/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

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
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    token: process.env.SANITY_API_WRITE_TOKEN,
    apiVersion: '2024-01-01',
    useCdn: false,
});

async function run() {
    console.log('Fetching all products...');
    const products = await client.fetch(`*[_type == "product"]{
    _id,
    title,
    slug,
    store,
    mainImage,
    _createdAt,
    sillage,
    longevity,
    season,
    notes,
    atlasData,
    legacyName,
    collectionType
  }`);

    // Base ID -> Document map
    const docMap = new Map();
    // Slug -> List of Base IDs
    const slugGroups = new Map();

    // Helper to get base ID (remove drafts.)
    const getBaseId = (id) => id.replace(/^drafts\./, '');

    // 1. Index everything
    products.forEach(p => {
        const baseId = getBaseId(p._id);

        // Index by slug
        // Ensure we handle missing slugs gracefully
        const currentSlug = p.slug?.current || 'NO_SLUG';
        if (currentSlug === 'NO_SLUG') return;

        if (!slugGroups.has(currentSlug)) {
            slugGroups.set(currentSlug, new Set());
        }
        slugGroups.get(currentSlug).add(baseId);

        // Store in docMap (prefer drafts if multiple for same base ID to get latest content to source from, 
        // BUT for Survivor target we will need special logic. Let's store array of variants per base ID)
        if (!docMap.has(baseId)) {
            docMap.set(baseId, []);
        }
        docMap.get(baseId).push(p);
    });

    // 2. Iterate Duplicate Groups
    for (const [slug, baseIds] of slugGroups.entries()) {
        if (baseIds.size > 1) {
            console.log(`\nResolving duplicates for slug "${slug}"...`);

            const candidates = [];

            // Analyze each Candidate Base ID
            baseIds.forEach(baseId => {
                const variants = docMap.get(baseId);
                // We evaluate the "Concept" of this product based on its best variant (Draft or Published)
                // Usually Draft has more recent info, Published has stable info. 
                // We look for 'store' or 'mainImage' or 'createdAt' to determine "Ancestry".

                const draft = variants.find(v => v._id.startsWith('drafts.'));
                const published = variants.find(v => !v._id.startsWith('drafts.'));
                const representative = published || draft; // Use published for metadata check like createdAt usually

                // Check for Shop connection
                const hasShop = variants.some(v => v.store && v.store.id);
                const hasImage = variants.some(v => v.mainImage && v.mainImage.asset);

                candidates.push({
                    baseId,
                    variants,
                    hasShop,
                    hasImage,
                    createdAt: representative?._createdAt || new Date().toISOString()
                });
            });

            // 3. Determine Survivor and Victim
            // Score: HasShop (100) + HasImage (10) + Age (Older is better if tie)
            candidates.sort((a, b) => {
                const scoreA = (a.hasShop ? 100 : 0) + (a.hasImage ? 10 : 0);
                const scoreB = (b.hasShop ? 100 : 0) + (b.hasImage ? 10 : 0);

                if (scoreA !== scoreB) return scoreB - scoreA; // Descending score

                // Tie-breaker: creation date (ascending = older first)
                return new Date(a.createdAt) - new Date(b.createdAt);
            });

            const survivor = candidates[0];
            const victims = candidates.slice(1);

            console.log(`   Survivor: ${survivor.baseId} (Shop:${survivor.hasShop}, Img:${survivor.hasImage})`);

            // 4. Merge Data from Victim to Survivor
            // We look for the Victim that has the fields we want (sillage, atlasData, etc.)
            // The Ingest script created new clean records, these are likely in the 'victims' list now.

            const sourceVictim = victims.find(v => {
                // Find a variant that has the 'AtlasData' populated
                return v.variants.some(varDoc => varDoc.atlasData && varDoc.atlasData.atmosphere);
            });

            if (sourceVictim) {
                // Extract data from the best variant of the source victim
                const sourceDoc = sourceVictim.variants.find(v => v.atlasData && v.atlasData.atmosphere) || sourceVictim.variants[0];

                console.log(`   copying data from Victim: ${sourceDoc._id}`);
                console.log(`   fields: sillage, longevity, season, notes, atlasData, legacyName, collectionType`);

                // Target: Draft of survivor if exists, else Published
                let targetId = survivor.baseId;
                const survivorDraft = survivor.variants.find(v => v._id.startsWith('drafts.'));
                if (survivorDraft) {
                    targetId = survivorDraft._id;
                    console.log(`   Targeting Survivor Draft: ${targetId}`);
                } else {
                    console.log(`   Targeting Survivor Published: ${targetId}`);
                }

                // Perform Merge
                const tx = client.transaction();

                tx.patch(targetId, p => p.set({
                    title: sourceDoc.title, // Enforce title match
                    legacyName: sourceDoc.legacyName,
                    collectionType: sourceDoc.collectionType,
                    sillage: sourceDoc.sillage,
                    longevity: sourceDoc.longevity,
                    season: sourceDoc.season,
                    notes: sourceDoc.notes,
                    atlasData: sourceDoc.atlasData
                }));

                // Delete ALL variants of ALL victims
                victims.forEach(v => {
                    v.variants.forEach(varDoc => {
                        // Safety: Don't delete if it somehow has shop data (though logic above put it as victim)
                        if (varDoc.store) {
                            console.log(`   ⚠️ SKIPPING DELETE of ${varDoc._id} because it has Store data. Please check manually.`);
                        } else {
                            console.log(`   Deleting: ${varDoc._id}`);
                            tx.delete(varDoc._id);
                        }
                    });
                });

                await tx.commit();
                console.log('   ✅ Merge Committed.');

            } else {
                console.log('   Duplicate found, but no Victim contained the target AtlasData to copy. Skipping merge.');
                // Still deleting duplicates? No, if we didn't merge, unsafe to delete.
            }
        }
    }

    console.log('\nDeduplication Complete.');
}

run().catch(console.error);
