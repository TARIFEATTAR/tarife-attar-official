/**
 * Shopify Integration Fields for Sanity
 */

export const shopifyFields = [
  {
    name: 'shopifyHandle',
    title: 'Shopify Product Handle',
    type: 'string',
    description: 'The slug of the product in Shopify (e.g. "corsican-driftwood")',
    group: 'commerce',
  },
  {
    name: 'shopifyProductId',
    title: 'Shopify Product ID',
    type: 'string',
    description: 'The numeric ID or GID of the product in Shopify',
    group: 'commerce',
  },
  {
    name: 'shopifyVariantId',
    title: 'Shopify Variant ID (Default)',
    type: 'string',
    description: 'The GID of the default variant. Used for Relic products or single-variant products.',
    group: 'commerce',
  },
  {
    name: 'shopifyVariant6mlId',
    title: 'Shopify Variant ID (6ml)',
    type: 'string',
    description: 'The GID for the 6ml variant. Required for Atlas products with size variants.',
    group: 'commerce',
  },
  {
    name: 'shopifyVariant12mlId',
    title: 'Shopify Variant ID (12ml)',
    type: 'string',
    description: 'The GID for the 12ml variant. Required for Atlas products with size variants.',
    group: 'commerce',
  },
];
