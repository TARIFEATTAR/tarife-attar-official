#!/usr/bin/env node
/**
 * Seed Additional Field Journal Entries
 * 
 * Creates 2 more demo Field Journal entries to populate the journal.
 * Run with: SANITY_WRITE_TOKEN=xxx node scripts/seed-more-field-journals.mjs
 */

import { createClient } from '@sanity/client';

const projectId = '8h5l91ut';
const dataset = 'production';
const apiVersion = '2025-12-31';
const token = process.env.SANITY_WRITE_TOKEN;

if (!token) {
    console.error('❌ SANITY_WRITE_TOKEN required');
    process.exit(1);
}

const client = createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
});

// Entry 2: Rosa Damascena Material Study (Petal Territory)
const rosaDamascenaEntry = {
    _type: 'fieldJournal',
    _id: 'fieldJournal-rosa-damascena-study',
    title: 'The Rose That Blooms at Dawn',
    slug: { _type: 'slug', current: 'rosa-damascena-study' },
    subtitle: 'A material study of Bulgarian Rosa Damascena',
    excerpt: 'In the Valley of Roses, a single bloom contains multitudes. We trace the journey from pre-dawn harvest to precious attar.',
    author: 'archivist',
    category: 'material',
    publishedAt: '2026-01-15T00:00:00Z',

    expeditionData: {
        territory: 'petal',
        locationName: 'Kazanlak, Valley of Roses',
        gpsCoordinates: {
            latitude: 42.6191,
            longitude: 25.3986,
            display: '42.6191° N, 25.3986° E',
        },
        region: 'Eastern Europe',
        season: 'spring',
    },

    seo: {
        metaTitle: 'Rosa Damascena Material Study | Bulgarian Rose Attar | Tarife Attär',
        metaDescription: 'Deep dive into Bulgarian Rosa Damascena—the queen of flowers. Learn about pre-dawn harvesting, hydrodistillation, and why true rose attar is liquid gold.',
        keywords: [
            'rosa damascena',
            'bulgarian rose',
            'rose attar',
            'rose absolute',
            'valley of roses',
            'hydrodistillation',
            'natural perfumery',
            'floral notes',
        ],
    },

    body: [
        {
            _type: 'block',
            _key: 'intro-1',
            style: 'normal',
            markDefs: [],
            children: [{
                _type: 'span',
                _key: 'intro-1-span',
                text: 'Before the sun crests the Balkan mountains, the pickers are already at work. Fingers move through the dew-laden bushes, selecting only blooms that opened in the last hour—petals still holding the concentrated essence of the night.',
                marks: [],
            }],
        },
        {
            _type: 'block',
            _key: 'intro-2',
            style: 'normal',
            markDefs: [],
            children: [{
                _type: 'span',
                _key: 'intro-2-span',
                text: 'This is Rosa Damascena. The queen of flowers. A material so precious that it takes approximately 10,000 pounds of petals to yield a single pound of rose otto.',
                marks: [],
            }],
        },
        {
            _type: 'block',
            _key: 'h2-harvest',
            style: 'h2',
            markDefs: [],
            children: [{
                _type: 'span',
                _key: 'h2-harvest-span',
                text: 'The Pre-Dawn Ritual',
                marks: [],
            }],
        },
        {
            _type: 'block',
            _key: 'harvest-1',
            style: 'normal',
            markDefs: [],
            children: [{
                _type: 'span',
                _key: 'harvest-1-span',
                text: 'The harvest window is impossibly narrow. Between 4:30 and 9:00 AM, before the morning sun begins to evaporate the volatile compounds. Each picker carries woven baskets, hands moving in practiced rhythm, generations of accumulated knowledge in every gesture.',
                marks: [],
            }],
        },
        {
            _type: 'block',
            _key: 'harvest-2',
            style: 'blockquote',
            markDefs: [],
            children: [{
                _type: 'span',
                _key: 'harvest-2-span',
                text: '"The rose speaks loudest in the silence before dawn. By noon, she has nothing left to say."',
                marks: [],
            }],
        },
        {
            _type: 'block',
            _key: 'h2-distillation',
            style: 'h2',
            markDefs: [],
            children: [{
                _type: 'span',
                _key: 'h2-distillation-span',
                text: 'Hydrodistillation: Water and Fire',
                marks: [],
            }],
        },
        {
            _type: 'block',
            _key: 'distillation-1',
            style: 'normal',
            markDefs: [],
            children: [{
                _type: 'span',
                _key: 'distillation-1-span',
                text: 'Within hours of harvest, the petals enter the copper alembics. Water heated to just below boiling. Steam carrying the soul of the flower upward, condensing into the miraculous separation: rose water below, precious otto floating above.',
                marks: [],
            }],
        },
        {
            _type: 'block',
            _key: 'note-profile',
            style: 'normal',
            markDefs: [],
            children: [
                { _type: 'span', _key: 'note-1', text: 'The olfactory profile reveals itself in layers: ', marks: [] },
                { _type: 'span', _key: 'note-2', text: 'honey-sweet top notes', marks: ['strong'] },
                { _type: 'span', _key: 'note-3', text: ', a ', marks: [] },
                { _type: 'span', _key: 'note-4', text: 'complex spicy heart', marks: ['strong'] },
                { _type: 'span', _key: 'note-5', text: ', and a ', marks: [] },
                { _type: 'span', _key: 'note-6', text: 'deep, almost tea-like base', marks: ['strong'] },
                { _type: 'span', _key: 'note-7', text: ' that speaks of terroir and tradition.', marks: [] },
            ],
        },
        {
            _type: 'block',
            _key: 'footer',
            style: 'blockquote',
            markDefs: [],
            children: [{
                _type: 'span',
                _key: 'footer-span',
                text: 'Filed from the Petal archive. Clean. Skin-safe. Cruelty-free.',
                marks: [],
            }],
        },
    ],
};

// Entry 3: Tidal Territory Guide (Ambergris)
const tidalGuideEntry = {
    _type: 'fieldJournal',
    _id: 'fieldJournal-tidal-territory-guide',
    title: 'Mapping the Tidal Territory',
    slug: { _type: 'slug', current: 'tidal-territory-guide' },
    subtitle: 'Salt, mist, and the treasures of open water',
    excerpt: 'Where land meets sea, a unique olfactory palette emerges. This guide charts the marine and coastal aromatics of the Tidal Territory.',
    author: 'navigator',
    category: 'territory',
    publishedAt: '2026-01-10T00:00:00Z',

    expeditionData: {
        territory: 'tidal',
        locationName: 'Zanzibar Archipelago',
        gpsCoordinates: {
            latitude: -6.1659,
            longitude: 39.2026,
            display: '6.1659° S, 39.2026° E',
        },
        region: 'East Africa',
        season: 'summer',
    },

    seo: {
        metaTitle: 'Tidal Territory Guide | Marine & Coastal Fragrances | Tarife Attär',
        metaDescription: 'Navigate the Tidal Territory—coastal aromatics, ambergris, sea salt, and the treasures of open water. A guide to marine-inspired perfumery.',
        keywords: [
            'ambergris',
            'marine fragrance',
            'coastal perfume',
            'sea salt notes',
            'aquatic perfumery',
            'oceanic scents',
            'beach fragrances',
        ],
    },

    body: [
        {
            _type: 'block',
            _key: 'intro-1',
            style: 'normal',
            markDefs: [],
            children: [{
                _type: 'span',
                _key: 'intro-1-span',
                text: 'The Tidal Territory is not a single place but a continuous edge—the liminal zone where terrestrial meets aquatic, where salt air carries stories from distant shores.',
                marks: [],
            }],
        },
        {
            _type: 'block',
            _key: 'intro-2',
            style: 'normal',
            markDefs: [],
            children: [{
                _type: 'span',
                _key: 'intro-2-span',
                text: 'Here, the palette shifts. Gone are the dense woods and heavy resins. In their place: mineral brightness, ozonic freshness, the strange sweetness of ambergris aged by decades of ocean wandering.',
                marks: [],
            }],
        },
        {
            _type: 'block',
            _key: 'h2-landmarks',
            style: 'h2',
            markDefs: [],
            children: [{
                _type: 'span',
                _key: 'h2-landmarks-span',
                text: 'Olfactory Landmarks',
                marks: [],
            }],
        },
        {
            _type: 'block',
            _key: 'landmark-ambergris',
            style: 'normal',
            markDefs: [],
            children: [
                { _type: 'span', _key: 'a1', text: 'Ambergris', marks: ['strong'] },
                { _type: 'span', _key: 'a2', text: ' — The legendary treasure of the sperm whale. Years of ocean aging transform a biological curiosity into one of perfumery\'s most prized fixatives. Sweet, salty, with an unmistakable marine animalic character.', marks: [] },
            ],
        },
        {
            _type: 'block',
            _key: 'landmark-seaweed',
            style: 'normal',
            markDefs: [],
            children: [
                { _type: 'span', _key: 's1', text: 'Seaweed Accord', marks: ['strong'] },
                { _type: 'span', _key: 's2', text: ' — Iodine-rich, with hints of umami. The smell of tidal pools and exposed rocks at low tide. Grounding in its earthiness despite its aquatic origin.', marks: [] },
            ],
        },
        {
            _type: 'block',
            _key: 'landmark-driftwood',
            style: 'normal',
            markDefs: [],
            children: [
                { _type: 'span', _key: 'd1', text: 'Salt-Bleached Driftwood', marks: ['strong'] },
                { _type: 'span', _key: 'd2', text: ' — The aromatic intersection of wood and water. Years of salt exposure strips away the green, leaving behind a mineral-woody essence.', marks: [] },
            ],
        },
        {
            _type: 'block',
            _key: 'h2-compositions',
            style: 'h2',
            markDefs: [],
            children: [{
                _type: 'span',
                _key: 'h2-comp-span',
                text: 'Composition Philosophy',
                marks: [],
            }],
        },
        {
            _type: 'block',
            _key: 'comp-1',
            style: 'normal',
            markDefs: [],
            children: [{
                _type: 'span',
                _key: 'comp-1-span',
                text: 'Tidal fragrances demand restraint. The materials speak loudly on their own. The perfumer\'s task is to create space—to let the sea air breathe through the composition, to suggest rather than saturate.',
                marks: [],
            }],
        },
        {
            _type: 'block',
            _key: 'comp-2',
            style: 'blockquote',
            markDefs: [],
            children: [{
                _type: 'span',
                _key: 'comp-2-span',
                text: 'The best Tidal compositions smell like a memory of the ocean, not a bottle of it.',
                marks: ['em'],
            }],
        },
        {
            _type: 'block',
            _key: 'footer',
            style: 'blockquote',
            markDefs: [],
            children: [{
                _type: 'span',
                _key: 'footer-span',
                text: 'Filed from the Tidal archive. Clean. Skin-safe. Cruelty-free.',
                marks: [],
            }],
        },
    ],
};

async function main() {
    console.log('📔 Seeding additional Field Journal entries...');
    console.log('');

    const entries = [rosaDamascenaEntry, tidalGuideEntry];

    for (const entry of entries) {
        try {
            const existing = await client.getDocument(entry._id);
            if (existing) {
                console.log(`⚠️  "${entry.title}" already exists. Updating...`);
                await client.createOrReplace(entry);
                console.log(`✅ Updated: "${entry.title}"`);
            } else {
                await client.create(entry);
                console.log(`✅ Created: "${entry.title}"`);
            }
        } catch (err) {
            console.error(`❌ Error with "${entry.title}":`, err.message);
        }
    }

    console.log('');
    console.log('🎉 Done! Check /field-journal to see your entries.');
}

main();
