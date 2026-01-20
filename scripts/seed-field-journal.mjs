#!/usr/bin/env node
/**
 * Seed Field Journal Demo Entry
 * 
 * Creates the demo "The Sillage of Intent" Field Journal entry.
 * Run with: node scripts/seed-field-journal.mjs
 */

import { createClient } from '@sanity/client';

const projectId = '8h5l91ut';
const dataset = 'production';
const apiVersion = '2025-12-31';
const token = process.env.SANITY_WRITE_TOKEN;

if (!token) {
    console.error('❌ SANITY_WRITE_TOKEN required');
    console.error('   Get a token from: https://www.sanity.io/manage/project/8h5l91ut/api#tokens');
    console.error('   Run: SANITY_WRITE_TOKEN=xxx node scripts/seed-field-journal.mjs');
    process.exit(1);
}

const client = createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
});

// The Sillage of Intent - Demo Field Journal Entry
const demoEntry = {
    _type: 'fieldJournal',
    _id: 'fieldJournal-sillage-of-intent',
    title: 'The Sillage of Intent',
    slug: { _type: 'slug', current: 'sillage-of-intent' },
    subtitle: 'On wearing fragrance as a declaration of purpose',
    excerpt: 'In an age of abundance, true distinction lies not in what we consume, but in how we curate. Few choices speak as eloquently as the fragrance we choose to wear.',
    author: 'quartermaster',
    category: 'dispatch',
    publishedAt: '2026-01-19T00:00:00Z',

    expeditionData: {
        territory: 'terra',
        locationName: 'The Boardroom, Manhattan',
        gpsCoordinates: {
            latitude: 40.7589,
            longitude: -73.9851,
            display: '40.7589° N, 73.9851° W',
        },
        region: 'The Americas',
        season: 'winter',
    },

    seo: {
        metaTitle: 'The Sillage of Intent | Fragrance as Statement | Tarife Attär',
        metaDescription: 'Discover how scent becomes signature. An exploration of executive fragrance, presence, and the architecture of ambition. Clean perfume oils for the intentional.',
        keywords: [
            'executive fragrance',
            'luxury perfume oil',
            'presence',
            'bergamot',
            'agarwood',
            'oud',
            'professional scent',
            'clean fragrance',
            'phthalate-free',
        ],
    },

    body: [
        {
            _type: 'block',
            _key: 'intro-1',
            style: 'normal',
            markDefs: [],
            children: [
                {
                    _type: 'span',
                    _key: 'intro-1-span',
                    text: 'We live in an age of unprecedented access. Yet amidst this abundance, true distinction has become rare currency. The question isn\'t what we consume—it\'s how we curate.',
                    marks: [],
                },
            ],
        },
        {
            _type: 'block',
            _key: 'intro-2',
            style: 'normal',
            markDefs: [],
            children: [
                {
                    _type: 'span',
                    _key: 'intro-2-span',
                    text: 'Few choices speak as eloquently as the fragrance we choose to wear.',
                    marks: [],
                },
            ],
        },
        {
            _type: 'block',
            _key: 'intro-3',
            style: 'normal',
            markDefs: [],
            children: [
                {
                    _type: 'span',
                    _key: 'intro-3-span',
                    text: 'An invisible signature. A carefully calibrated message that lingers long after we\'ve left the room.',
                    marks: ['em'],
                },
            ],
        },
        {
            _type: 'block',
            _key: 'h2-architecture',
            style: 'h2',
            markDefs: [],
            children: [
                {
                    _type: 'span',
                    _key: 'h2-architecture-span',
                    text: 'The Architecture of Ambition',
                    marks: [],
                },
            ],
        },
        {
            _type: 'block',
            _key: 'architecture-1',
            style: 'normal',
            markDefs: [],
            children: [
                {
                    _type: 'span',
                    _key: 'architecture-1-span',
                    text: 'At the heart of this olfactory genre lies delicate balance: the invigorating freshness of citrus and spice, tempered by the grounding warmth of woods and resins. A composition that mirrors the dynamic tension of modern presence—navigating complexity with both clarity and conviction.',
                    marks: [],
                },
            ],
        },
        {
            _type: 'block',
            _key: 'architecture-2',
            style: 'normal',
            markDefs: [],
            children: [
                {
                    _type: 'span',
                    _key: 'architecture-2-span',
                    text: 'Consider the interplay:',
                    marks: [],
                },
            ],
        },
        {
            _type: 'block',
            _key: 'note-bergamot',
            style: 'normal',
            markDefs: [],
            children: [
                {
                    _type: 'span',
                    _key: 'note-bergamot-bold',
                    text: 'Bergamot',
                    marks: ['strong'],
                },
                {
                    _type: 'span',
                    _key: 'note-bergamot-text',
                    text: ' — bright, uplifting, the olfactory equivalent of a sunlit morning. A promise of productivity.',
                    marks: [],
                },
            ],
        },
        {
            _type: 'block',
            _key: 'note-pepper',
            style: 'normal',
            markDefs: [],
            children: [
                {
                    _type: 'span',
                    _key: 'note-pepper-bold',
                    text: 'Pink pepper',
                    marks: ['strong'],
                },
                {
                    _type: 'span',
                    _key: 'note-pepper-text',
                    text: ' — a subtle undercurrent of intrigue. Dancing on the edge of perception, hinting at depths beneath the surface.',
                    marks: [],
                },
            ],
        },
        {
            _type: 'block',
            _key: 'note-ambergris',
            style: 'normal',
            markDefs: [],
            children: [
                {
                    _type: 'span',
                    _key: 'note-ambergris-bold',
                    text: 'Ambergris',
                    marks: ['strong'],
                },
                {
                    _type: 'span',
                    _key: 'note-ambergris-text',
                    text: ' — marine-like salinity. The unexpected. A reminder that innovation arises from venturing beyond familiar shores.',
                    marks: [],
                },
            ],
        },
        {
            _type: 'block',
            _key: 'note-patchouli',
            style: 'normal',
            markDefs: [],
            children: [
                {
                    _type: 'span',
                    _key: 'note-patchouli-bold',
                    text: 'Patchouli',
                    marks: ['strong'],
                },
                {
                    _type: 'span',
                    _key: 'note-patchouli-text',
                    text: ' — earthy, grounding. Resilience manifest. The ability to weather storms and emerge stronger.',
                    marks: [],
                },
            ],
        },
        {
            _type: 'block',
            _key: 'note-agarwood',
            style: 'normal',
            markDefs: [],
            children: [
                {
                    _type: 'span',
                    _key: 'note-agarwood-bold',
                    text: 'Agarwood',
                    marks: ['strong'],
                },
                {
                    _type: 'span',
                    _key: 'note-agarwood-text',
                    text: ' — also known as oud. Rich, complex, speaking of heritage and deep connection to craft.',
                    marks: [],
                },
            ],
        },
        {
            _type: 'block',
            _key: 'note-musk',
            style: 'normal',
            markDefs: [],
            children: [
                {
                    _type: 'span',
                    _key: 'note-musk-bold',
                    text: 'Musk',
                    marks: ['strong'],
                },
                {
                    _type: 'span',
                    _key: 'note-musk-text',
                    text: ' — sensuality. The human element underlying all great endeavors.',
                    marks: [],
                },
            ],
        },
        {
            _type: 'block',
            _key: 'h2-trail',
            style: 'h2',
            markDefs: [],
            children: [
                {
                    _type: 'span',
                    _key: 'h2-trail-span',
                    text: 'The Trail You Leave',
                    marks: [],
                },
            ],
        },
        {
            _type: 'block',
            _key: 'trail-1',
            style: 'normal',
            markDefs: [],
            children: [
                {
                    _type: 'span',
                    _key: 'trail-1-em',
                    text: 'Sillage',
                    marks: ['em'],
                },
                {
                    _type: 'span',
                    _key: 'trail-1-text',
                    text: ' — the trail of scent lingering in the air after you\'ve passed.',
                    marks: [],
                },
            ],
        },
        {
            _type: 'block',
            _key: 'trail-2',
            style: 'normal',
            markDefs: [],
            children: [
                {
                    _type: 'span',
                    _key: 'trail-2-span',
                    text: 'A subtle but powerful form of communication. A way of leaving impression without uttering a word.',
                    marks: [],
                },
            ],
        },
        {
            _type: 'block',
            _key: 'trail-3',
            style: 'normal',
            markDefs: [],
            children: [
                {
                    _type: 'span',
                    _key: 'trail-3-span',
                    text: 'Imagine walking into the room. The air shifting as your fragrance enters the space. Not loud. Not attention-grabbing. Rather: a quiet assertion of authority. The scent of someone who has considered every detail.',
                    marks: [],
                },
            ],
        },
        {
            _type: 'block',
            _key: 'trail-4',
            style: 'normal',
            markDefs: [],
            children: [
                {
                    _type: 'span',
                    _key: 'trail-4-span',
                    text: 'Or consider networking—engaging with potential collaborators. Your fragrance becomes extension of personality. A way of conveying values and aspirations without explicit statement. Approachable and ambitious. Valuing connection as much as success.',
                    marks: [],
                },
            ],
        },
        {
            _type: 'block',
            _key: 'h2-beyond',
            style: 'h2',
            markDefs: [],
            children: [
                {
                    _type: 'span',
                    _key: 'h2-beyond-span',
                    text: 'Beyond the Bottle',
                    marks: [],
                },
            ],
        },
        {
            _type: 'block',
            _key: 'beyond-1',
            style: 'normal',
            markDefs: [],
            children: [
                {
                    _type: 'span',
                    _key: 'beyond-1-span',
                    text: 'In the end, the choice of fragrance is about more than pleasant aroma.',
                    marks: [],
                },
            ],
        },
        {
            _type: 'block',
            _key: 'beyond-2',
            style: 'normal',
            markDefs: [],
            children: [
                {
                    _type: 'span',
                    _key: 'beyond-2-span',
                    text: 'It\'s embarking on self-discovery. Aligning outer presentation with inner aspiration.',
                    marks: [],
                },
            ],
        },
        {
            _type: 'block',
            _key: 'beyond-3',
            style: 'normal',
            markDefs: [],
            children: [
                {
                    _type: 'span',
                    _key: 'beyond-3-span',
                    text: 'What does your current fragrance say about you? Does it accurately reflect your values? Your goals? Your sense of self?',
                    marks: [],
                },
            ],
        },
        {
            _type: 'block',
            _key: 'beyond-4',
            style: 'normal',
            markDefs: [],
            children: [
                {
                    _type: 'span',
                    _key: 'beyond-4-span',
                    text: 'Perhaps it\'s time to explore new territories.',
                    marks: [],
                },
            ],
        },
        {
            _type: 'block',
            _key: 'beyond-5',
            style: 'normal',
            markDefs: [],
            children: [
                {
                    _type: 'span',
                    _key: 'beyond-5-span',
                    text: 'For in the realm of fragrance, as in all aspects of life, the most meaningful choices are those made with purpose and intention.',
                    marks: ['em'],
                },
            ],
        },
        {
            _type: 'block',
            _key: 'footer',
            style: 'blockquote',
            markDefs: [],
            children: [
                {
                    _type: 'span',
                    _key: 'footer-span',
                    text: 'Filed from the Terra archive. Clean. Skin-safe. Cruelty-free.',
                    marks: [],
                },
            ],
        },
    ],
};

async function main() {
    console.log('📔 Seeding Field Journal demo entry...');
    console.log('');

    try {
        // Check if it already exists
        const existing = await client.getDocument(demoEntry._id);
        if (existing) {
            console.log('⚠️  Entry already exists. Updating...');
            await client.createOrReplace(demoEntry);
            console.log('✅ Updated: "The Sillage of Intent"');
        } else {
            await client.create(demoEntry);
            console.log('✅ Created: "The Sillage of Intent"');
        }

        console.log('');
        console.log('📊 Entry details:');
        console.log(`   Title: ${demoEntry.title}`);
        console.log(`   Slug: /journal/${demoEntry.slug.current}`);
        console.log(`   Territory: 🌲 Terra`);
        console.log(`   Location: ${demoEntry.expeditionData.locationName}`);
        console.log(`   Author: The Quartermaster`);
        console.log('');
        console.log('🎉 Done! Check Sanity Studio → 📔 Field Journal');
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

main();
