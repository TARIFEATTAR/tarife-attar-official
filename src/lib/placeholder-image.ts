/**
 * Placeholder Image Utility
 * 
 * Provides placeholder images for products without images (coming soon, etc.)
 * Supports collection-specific placeholders (Relic, Atlas, etc.)
 * 
 * Priority order:
 * 1. Sanity-managed placeholder (if set in Sanity Studio)
 * 2. Hardcoded placeholder from public/images/ or environment variable
 */

import type { PlaceholderImagesQueryResult } from '@/sanity/lib/queries';

// General placeholder image URL - for Atlas and other collections
// Fallback if not set in Sanity
export const PLACEHOLDER_PRODUCT_IMAGE = 
  process.env.NEXT_PUBLIC_PLACEHOLDER_IMAGE_URL || 
  '/images/placeholder-coming-soon.jpg';

// Relic collection-specific placeholder image URL
// Fallback if not set in Sanity
export const PLACEHOLDER_RELIC_IMAGE = 
  process.env.NEXT_PUBLIC_PLACEHOLDER_RELIC_IMAGE_URL || 
  '/images/placeholder-relic-coming-soon.png';

/**
 * Get placeholder image URL based on collection type
 * Checks Sanity first, then falls back to hardcoded placeholder
 * 
 * @param collectionType - 'relic' | 'atlas' | undefined
 * @param sanityPlaceholders - Optional placeholder images from Sanity query
 * @returns Placeholder image URL for the specified collection
 */
export function getPlaceholderImageUrl(
  collectionType?: 'relic' | 'atlas',
  sanityPlaceholders?: PlaceholderImagesQueryResult | null
): string {
  // Priority 1: Check Sanity-managed placeholder
  if (sanityPlaceholders) {
    if (collectionType === 'relic' && sanityPlaceholders.relicPlaceholder?.asset?.url) {
      return sanityPlaceholders.relicPlaceholder.asset.url;
    }
    if (collectionType === 'atlas' && sanityPlaceholders.atlasPlaceholder?.asset?.url) {
      return sanityPlaceholders.atlasPlaceholder.asset.url;
    }
    // Fallback to general placeholder from Sanity
    if (sanityPlaceholders.generalPlaceholder?.asset?.url) {
      return sanityPlaceholders.generalPlaceholder.asset.url;
    }
  }

  // Priority 2: Use hardcoded placeholder
  if (collectionType === 'relic') {
    return PLACEHOLDER_RELIC_IMAGE;
  }
  return PLACEHOLDER_PRODUCT_IMAGE;
}

/**
 * Get placeholder image as Sanity image source (for use with urlForImage)
 * Useful when you need to apply Sanity image transformations
 */
export function getPlaceholderImageSource(
  collectionType?: 'relic' | 'atlas',
  sanityPlaceholders?: PlaceholderImagesQueryResult | null
): { asset: { _ref: string } } | null {
  if (!sanityPlaceholders) return null;

  if (collectionType === 'relic' && sanityPlaceholders.relicPlaceholder?.asset?._id) {
    return {
      asset: {
        _ref: sanityPlaceholders.relicPlaceholder.asset._id,
      },
    };
  }
  if (collectionType === 'atlas' && sanityPlaceholders.atlasPlaceholder?.asset?._id) {
    return {
      asset: {
        _ref: sanityPlaceholders.atlasPlaceholder.asset._id,
      },
    };
  }
  if (sanityPlaceholders.generalPlaceholder?.asset?._id) {
    return {
      asset: {
        _ref: sanityPlaceholders.generalPlaceholder.asset._id,
      },
    };
  }

  return null;
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
