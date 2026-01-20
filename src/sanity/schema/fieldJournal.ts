import { BookOpenIcon } from 'lucide-react';
import { sensoryLexiconValidation } from '../validation/sensoryLexicon';

export const fieldJournalSchema = {
    name: 'fieldJournal',
    title: 'Field Journal',
    type: 'document',
    icon: BookOpenIcon, // lucide-react
    groups: [
        { name: 'content', title: 'Content', default: true },
        { name: 'expedition', title: 'Expedition Data' },
        { name: 'seo', title: 'SEO & Meta' },
        { name: 'relations', title: 'Relations' },
    ],
    fields: [
        // ═══════════════════════════════════════════════════════
        // CONTENT GROUP
        // ═══════════════════════════════════════════════════════
        {
            name: 'title',
            title: 'Title',
            type: 'string',
            group: 'content',
            description: 'The headline (aim for 50-60 characters for SEO)',
            validation: (Rule: any) => Rule.required().max(70),
        },
        {
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            group: 'content',
            options: { source: 'title', maxLength: 96 },
            validation: (Rule: any) => Rule.required(),
        },
        {
            name: 'subtitle',
            title: 'Subtitle / Deck',
            type: 'string',
            group: 'content',
            description: 'The supporting headline beneath the title',
        },
        {
            name: 'excerpt',
            title: 'Excerpt',
            type: 'text',
            group: 'content',
            rows: 3,
            description: 'Brief summary for cards and previews (150-160 characters ideal for meta description)',
            validation: (Rule: any) => Rule.max(200),
        },
        {
            name: 'coverImage',
            title: 'Cover Image',
            type: 'image',
            group: 'content',
            options: { hotspot: true },
            fields: [
                { name: 'alt', title: 'Alt Text', type: 'string', description: 'Describe the image for accessibility and SEO' },
                { name: 'caption', title: 'Caption', type: 'string' },
            ],
        },
        {
            name: 'body',
            title: 'Body',
            type: 'array',
            group: 'content',
            of: [
                { type: 'block' },
                { type: 'image', options: { hotspot: true } },
                { type: 'fieldReport' }, // Reuse shoppable image component
            ],
            validation: (Rule: any) => sensoryLexiconValidation(Rule, 'Body'),
        },
        {
            name: 'publishedAt',
            title: 'Published Date',
            type: 'datetime',
            group: 'content',
            initialValue: () => new Date().toISOString(),
        },
        {
            name: 'author',
            title: 'Author / Voice',
            type: 'string',
            group: 'content',
            options: {
                list: [
                    { title: 'The Archivist', value: 'archivist' },
                    { title: 'The Quartermaster', value: 'quartermaster' },
                    { title: 'The Navigator', value: 'navigator' },
                    { title: 'Field Correspondent', value: 'correspondent' },
                ],
            },
            description: 'The narrative voice for this entry',
        },

        // ═══════════════════════════════════════════════════════
        // EXPEDITION DATA GROUP (The SEO-Rich Geographic Layer)
        // ═══════════════════════════════════════════════════════
        {
            name: 'expeditionData',
            title: 'Expedition Data',
            type: 'object',
            group: 'expedition',
            description: 'Geographic and atmospheric metadata for the expedition',
            fields: [
                {
                    name: 'territory',
                    title: 'Territory',
                    type: 'string',
                    options: {
                        list: [
                            { title: 'Tidal — Salt. Mist. Open Water.', value: 'tidal' },
                            { title: 'Ember — Spice. Warmth. Ancient Routes.', value: 'ember' },
                            { title: 'Petal — Bloom. Herb. Living Gardens.', value: 'petal' },
                            { title: 'Terra — Wood. Oud. Deep Forests.', value: 'terra' },
                        ],
                    },
                    description: 'Primary territory association',
                },
                {
                    name: 'locationName',
                    title: 'Location Name',
                    type: 'string',
                    description: 'Human-readable location (e.g., "Grasse, Provence", "The Boardroom, Manhattan")',
                },
                {
                    name: 'gpsCoordinates',
                    title: 'GPS Coordinates',
                    type: 'object',
                    description: 'Precise coordinates for the expedition origin',
                    fields: [
                        { name: 'latitude', title: 'Latitude', type: 'number', description: 'e.g., 43.6599' },
                        { name: 'longitude', title: 'Longitude', type: 'number', description: 'e.g., 6.9273' },
                        { name: 'display', title: 'Display Format', type: 'string', description: 'e.g., "43.6599° N, 6.9273° E"' },
                    ],
                },
                {
                    name: 'region',
                    title: 'Region',
                    type: 'string',
                    description: 'Broader region for taxonomy (e.g., "Mediterranean", "South Asia", "The Americas")',
                },
                {
                    name: 'season',
                    title: 'Season',
                    type: 'string',
                    options: {
                        list: [
                            { title: 'Spring Equinox', value: 'spring' },
                            { title: 'Summer Solstice', value: 'summer' },
                            { title: 'Autumn Equinox', value: 'autumn' },
                            { title: 'Winter Solstice', value: 'winter' },
                        ],
                    },
                },
            ],
        },

        // ═══════════════════════════════════════════════════════
        // SEO & META GROUP
        // ═══════════════════════════════════════════════════════
        {
            name: 'seo',
            title: 'SEO & Meta',
            type: 'object',
            group: 'seo',
            fields: [
                {
                    name: 'metaTitle',
                    title: 'Meta Title',
                    type: 'string',
                    description: 'Override title for search engines (50-60 characters)',
                    validation: (Rule: any) => Rule.max(70),
                },
                {
                    name: 'metaDescription',
                    title: 'Meta Description',
                    type: 'text',
                    rows: 2,
                    description: 'Search engine description (150-160 characters)',
                    validation: (Rule: any) => Rule.max(160),
                },
                {
                    name: 'ogImage',
                    title: 'Open Graph Image',
                    type: 'image',
                    description: 'Social sharing image (1200x630 recommended)',
                },
                {
                    name: 'keywords',
                    title: 'Keywords / Tags',
                    type: 'array',
                    of: [{ type: 'string' }],
                    options: { layout: 'tags' },
                    description: 'SEO keywords and content tags',
                },
                {
                    name: 'canonicalUrl',
                    title: 'Canonical URL',
                    type: 'url',
                    description: 'If republished elsewhere, point to the original',
                },
            ],
        },

        // ═══════════════════════════════════════════════════════
        // RELATIONS GROUP
        // ═══════════════════════════════════════════════════════
        {
            name: 'featuredProducts',
            title: 'Featured Products',
            type: 'array',
            group: 'relations',
            of: [{ type: 'reference', to: [{ type: 'product' }] }],
            description: 'Products referenced or featured in this entry',
        },
        {
            name: 'relatedEntries',
            title: 'Related Journal Entries',
            type: 'array',
            group: 'relations',
            of: [{ type: 'reference', to: [{ type: 'fieldJournal' }] }],
            description: 'Other journal entries to cross-link',
        },
        {
            name: 'category',
            title: 'Category',
            type: 'string',
            group: 'relations',
            options: {
                list: [
                    { title: 'Field Dispatch', value: 'dispatch' },
                    { title: 'Distillation Log', value: 'distillation' },
                    { title: 'Material Study', value: 'material' },
                    { title: 'Territory Guide', value: 'territory' },
                    { title: 'Archive Note', value: 'archive' },
                ],
            },
        },
    ],
    preview: {
        select: {
            title: 'title',
            subtitle: 'expeditionData.territory',
            media: 'coverImage',
            date: 'publishedAt',
        },
        prepare({ title, subtitle, media, date }: any) {
            const territoryMap: { [key: string]: string } = {
                tidal: '🌊 Tidal',
                ember: '🔥 Ember',
                petal: '🌸 Petal',
                terra: '🌲 Terra',
            };
            return {
                title,
                subtitle: `${territoryMap[subtitle] || 'Uncharted'} • ${new Date(date).toLocaleDateString()}`,
                media,
            };
        },
    },
    orderings: [
        { title: 'Published (Newest)', name: 'publishedDesc', by: [{ field: 'publishedAt', direction: 'desc' }] },
        { title: 'Territory', name: 'territory', by: [{ field: 'expeditionData.territory', direction: 'asc' }] },
    ],
};
