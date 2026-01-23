/**
 * Placeholder Image Utility
 * 
 * Provides a placeholder image for products without images (coming soon, etc.)
 */

// Placeholder image URL - update this once you upload the image
// Options:
// 1. Upload to Sanity and use Sanity CDN URL
// 2. Put in /public/images/ and use relative path
// 3. Use external CDN URL
export const PLACEHOLDER_PRODUCT_IMAGE = 
  process.env.NEXT_PUBLIC_PLACEHOLDER_IMAGE_URL || 
  '/images/placeholder-coming-soon.jpg';

/**
 * Get placeholder image URL
 * Returns the placeholder image URL for products without images
 */
export function getPlaceholderImageUrl(): string {
  return PLACEHOLDER_PRODUCT_IMAGE;
}

/**
 * Check if an image URL is the placeholder
 */
export function isPlaceholderImage(url: string | undefined | null): boolean {
  if (!url) return false;
  return url.includes('placeholder-coming-soon') || url === PLACEHOLDER_PRODUCT_IMAGE;
}
