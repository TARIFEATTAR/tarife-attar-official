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
    name: 'shopifyVariantId',
    title: 'Shopify Variant ID',
    type: 'string',
    description: 'The numeric ID or GID of the default variant in Shopify',
    group: 'commerce',
  },
  {
    name: 'shopifyProductId',
    title: 'Shopify Product ID',
    type: 'string',
    description: 'The numeric ID or GID of the product in Shopify',
    group: 'commerce',
  },
];
