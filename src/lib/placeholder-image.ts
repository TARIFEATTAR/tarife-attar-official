/**
 * Placeholder Image Utility
 * 
 * Provides placeholder images for products without images (coming soon, etc.)
 * Supports collection-specific placeholders (Relic, Atlas, etc.)
 */

// General placeholder image URL - for Atlas and other collections
// Options:
// 1. Upload to Sanity and use Sanity CDN URL
// 2. Put in /public/images/ and use relative path
// 3. Use external CDN URL
export const PLACEHOLDER_PRODUCT_IMAGE = 
  process.env.NEXT_PUBLIC_PLACEHOLDER_IMAGE_URL || 
  '/images/placeholder-coming-soon.jpg';

// Relic collection-specific placeholder image URL
// Default: Uses the dark charcoal stone pedestal image from Shopify CDN
export const PLACEHOLDER_RELIC_IMAGE = 
  process.env.NEXT_PUBLIC_PLACEHOLDER_RELIC_IMAGE_URL || 
  '/images/placeholder-relic-coming-soon.png';

/**
 * Get placeholder image URL based on collection type
 * @param collectionType - 'relic' | 'atlas' | undefined
 * @returns Placeholder image URL for the specified collection
 */
export function getPlaceholderImageUrl(collectionType?: 'relic' | 'atlas'): string {
  if (collectionType === 'relic') {
    return PLACEHOLDER_RELIC_IMAGE;
  }
  return PLACEHOLDER_PRODUCT_IMAGE;
}

/**
 * Check if an image URL is a placeholder
 */
export function isPlaceholderImage(url: string | undefined | null): boolean {
  if (!url) return false;
  return url.includes('placeholder-coming-soon') || 
         url.includes('placeholder-relic-coming-soon') ||
         url === PLACEHOLDER_PRODUCT_IMAGE ||
         url === PLACEHOLDER_RELIC_IMAGE;
}
