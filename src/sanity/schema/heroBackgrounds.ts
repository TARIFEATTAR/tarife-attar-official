/**
 * Sanity Schema: Hero Backgrounds
 *
 * Minimal singleton schema for Two Roads hero background textures.
 * Allows editorial control over background images without code changes.
 */

import { defineField } from 'sanity'

// NOTE: Defined as a plain object (not `defineType`) to allow `__experimental_actions`
// without fighting Sanity's TS types / eslint ban-ts-comment rules.
export const heroBackgroundsSchema = {
    name: 'heroBackgrounds',
    title: 'Hero Backgrounds',
    type: 'document',
    
    // Singleton pattern - only one instance
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
            description: 'How much of the cream overlay covers the texture. Lower = more visible image. (Default: 55)',
            initialValue: 55,
            validation: (Rule) => Rule.min(30).max(98),
            options: {
                list: [
                    { title: '50% (Very visible)', value: 50 },
                    { title: '55% (Recommended)', value: 55 },
                    { title: '60%', value: 60 },
                    { title: '65%', value: 65 },
                    { title: '70%', value: 70 },
                    { title: '75%', value: 75 },
                    { title: '80%', value: 80 },
                    { title: '85% (Subtle)', value: 85 },
                    { title: '90% (Very subtle)', value: 90 },
                    { title: '95% (Almost solid)', value: 95 },
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
            description: 'How much of the charcoal overlay covers the texture. Lower = more visible image. (Default: 50)',
            initialValue: 50,
            validation: (Rule) => Rule.min(30).max(98),
            options: {
                list: [
                    { title: '45% (Very visible)', value: 45 },
                    { title: '50% (Recommended)', value: 50 },
                    { title: '55%', value: 55 },
                    { title: '60%', value: 60 },
                    { title: '65%', value: 65 },
                    { title: '70%', value: 70 },
                    { title: '75%', value: 75 },
                    { title: '80% (Subtle)', value: 80 },
                    { title: '85% (Very subtle)', value: 85 },
                    { title: '90% (Almost solid)', value: 90 },
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
}
