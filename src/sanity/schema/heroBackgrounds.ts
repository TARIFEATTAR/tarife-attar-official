/**
 * Sanity Schema: Hero Backgrounds
 *
 * Minimal singleton schema for Two Roads hero background textures.
 * Allows editorial control over background images without code changes.
 */

import { defineType, defineField } from 'sanity'

export const heroBackgroundsSchema = defineType({
    name: 'heroBackgrounds',
    title: 'Hero Backgrounds',
    type: 'document',
    
    // Singleton pattern - only one instance
    // @ts-expect-error - __experimental_actions is valid in Sanity v3 but not in TypeScript types yet
    __experimental_actions: ['update', 'publish'],
    
    groups: [
        { name: 'atlas', title: 'Atlas (Light Side)' },
        { name: 'relic', title: 'Relic (Dark Side)' },
    ],

    fields: [
        // ═══════════════════════════════════════════
        // ATLAS BACKGROUND
        // ═══════════════════════════════════════════
        defineField({
            name: 'atlasBackground',
            title: 'Atlas Background Texture',
            type: 'image',
            group: 'atlas',
            description: 'Subtle texture for the light (Atlas) side. Recommended: 9:16 portrait, abstract/ethereal.',
            options: {
                hotspot: true,
                accept: 'image/png, image/jpeg, image/webp',
            },
        }),

        defineField({
            name: 'atlasOverlayOpacity',
            title: 'Atlas Overlay Opacity',
            type: 'number',
            group: 'atlas',
            description: 'How much of the cream overlay covers the texture. Higher = more subtle texture. (Default: 88)',
            initialValue: 88,
            validation: (Rule) => Rule.min(50).max(98),
            options: {
                list: [
                    { title: '80% (More visible)', value: 80 },
                    { title: '85%', value: 85 },
                    { title: '88% (Recommended)', value: 88 },
                    { title: '90%', value: 90 },
                    { title: '92%', value: 92 },
                    { title: '95% (Very subtle)', value: 95 },
                ],
            },
        }),

        // ═══════════════════════════════════════════
        // RELIC BACKGROUND
        // ═══════════════════════════════════════════
        defineField({
            name: 'relicBackground',
            title: 'Relic Background Texture',
            type: 'image',
            group: 'relic',
            description: 'Atmospheric texture for the dark (Relic) side. Recommended: 9:16 portrait, smoke/patina.',
            options: {
                hotspot: true,
                accept: 'image/png, image/jpeg, image/webp',
            },
        }),

        defineField({
            name: 'relicOverlayOpacity',
            title: 'Relic Overlay Opacity',
            type: 'number',
            group: 'relic',
            description: 'How much of the charcoal overlay covers the texture. Higher = more subtle texture. (Default: 85)',
            initialValue: 85,
            validation: (Rule) => Rule.min(50).max(98),
            options: {
                list: [
                    { title: '75% (More visible)', value: 75 },
                    { title: '80%', value: 80 },
                    { title: '85% (Recommended)', value: 85 },
                    { title: '88%', value: 88 },
                    { title: '90%', value: 90 },
                    { title: '95% (Very subtle)', value: 95 },
                ],
            },
        }),
    ],

    preview: {
        prepare() {
            return {
                title: 'Hero Backgrounds',
                subtitle: 'Two Roads entry page textures',
            }
        },
    },
})
