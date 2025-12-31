/**
 * Sanity-Shopify ID Mapping & Helpers
 */

/**
 * Ensures variant IDs are in the correct Shopify GID format
 * e.g. gid://shopify/ProductVariant/123456789
 */
export function formatVariantId(id: string): string {
  if (id.startsWith('gid://shopify/ProductVariant/')) {
    return id;
  }
  return `gid://shopify/ProductVariant/${id}`;
}

/**
 * Extracts the numeric ID from a Shopify GID
 */
export function extractId(gid: string): string {
  return gid.split('/').pop() || gid;
}

/**
 * Type guard for checking if a product is purchasable (has Shopify data)
 */
export function isPurchasable(product: any): boolean {
  return !!(product.shopifyHandle || product.shopifyVariantId);
}
