/**
 * Sanity Schema: Placeholder Images
 *
 * Singleton schema for product placeholder images (coming soon, etc.).
 * Allows editorial control over placeholder images without code changes.
 * If no image is set in Sanity, falls back to hardcoded placeholder.
 */

import { defineField } from 'sanity'

// NOTE: Defined as a plain object (not `defineType`) to allow `__experimental_actions`
// without fighting Sanity's TS types / eslint ban-ts-comment rules.
export const placeholderImagesSchema = {
    name: 'placeholderImages',
    title: 'Placeholder Images',
    type: 'document',
    
    // Singleton pattern - only one instance
    __experimental_actions: ['update', 'publish'],
    
    groups: [
        { name: 'relic', title: 'Relic Collection' },
        { name: 'atlas', title: 'Atlas Collection' },
        { name: 'general', title: 'General' },
    ],

    fields: [
        // ═══════════════════════════════════════════
        // RELIC PLACEHOLDER
        // ═══════════════════════════════════════════
        defineField({
            name: 'relicPlaceholder',
            title: 'Relic Placeholder Image',
            type: 'image',
            group: 'relic',
            description: 'Placeholder image for Relic products without images (coming soon, etc.). Recommended: 1024x1024px, dark/moody aesthetic.',
            options: {
                hotspot: true,
                accept: 'image/png, image/jpeg, image/webp',
            },
        }),

        // ═══════════════════════════════════════════
        // ATLAS PLACEHOLDER
        // ═══════════════════════════════════════════
        defineField({
            name: 'atlasPlaceholder',
            title: 'Atlas Placeholder Image',
            type: 'image',
            group: 'atlas',
            description: 'Placeholder image for Atlas products without images (coming soon, etc.). Recommended: 1024x1024px.',
            options: {
                hotspot: true,
                accept: 'image/png, image/jpeg, image/webp',
            },
        }),

        // ═══════════════════════════════════════════
        // GENERAL PLACEHOLDER
        // ═══════════════════════════════════════════
        defineField({
            name: 'generalPlaceholder',
            title: 'General Placeholder Image',
            type: 'image',
            group: 'general',
            description: 'Fallback placeholder image for products without images. Used if collection-specific placeholder is not set.',
            options: {
                hotspot: true,
                accept: 'image/png, image/jpeg, image/webp',
            },
        }),
    ],

    preview: {
        prepare() {
            return {
                title: 'Placeholder Images',
                subtitle: 'Product placeholder images for coming soon products',
            }
        },
    },
}
