/**
 * Bifurcated Desk Structure Builder
 * 
 * Configures the Sanity Studio desk to show curated groups instead of
 * the default "Product" list. Creates three distinct workspaces:
 * 1. The Inbox (Madison Studio submissions)
 * 2. The Atlas (Journey)
 * 3. The Relic (Vault)
 */

import { StructureBuilder, StructureResolverContext } from 'sanity/structure';

export const structure = (S: StructureBuilder, _context: StructureResolverContext) => {
  return S.list()
    .title('Content')
    .items([
      // Group 1: The Inbox (Critical for Madison Studio)
      S.listItem()
        .title('The Inbox')
        .id('inbox')
        .icon(() => {
          // Inbox icon
          return null; // Icons can be added via Sanity's icon system or as React components
        })
        .child(
          S.documentList()
            .title('The Inbox')
            .filter('_type == "product" && generationSource == "madison-studio"')
            .defaultOrdering([{ field: '_createdAt', direction: 'desc' }])
        ),

      // Divider
      S.divider(),

      // Group 2: The Atlas (Journey)
      S.listItem()
        .title('The Atlas (Journey)')
        .id('atlas')
        .icon(() => {
          // Map/Atlas icon
          return null;
        })
        .child(
          S.documentList()
            .title('The Atlas')
            .filter('_type == "product" && collectionType == "atlas"')
            .defaultOrdering([{ field: 'title', direction: 'asc' }])
        ),

      // Group 3: The Relic (Vault)
      S.listItem()
        .title('The Relic (Vault)')
        .id('relic')
        .icon(() => {
          // Lock/Vault icon
          return null;
        })
        .child(
          S.documentList()
            .title('The Relic')
            .filter('_type == "product" && collectionType == "relic"')
            .defaultOrdering([{ field: 'title', direction: 'asc' }])
        ),

      // Divider
      S.divider(),

      // Group 4: Shopify Products (Synced from Shopify Connect)
      S.listItem()
        .title('🛒 Shopify Products (Synced)')
        .id('shopify-products')
        .child(
          S.documentList()
            .title('Shopify Products')
            .filter('_type == "product" && defined(store) && !defined(collectionType)')
            .defaultOrdering([{ field: 'store.title', direction: 'asc' }])
            .canHandleIntent(() => false) // Prevent creating new Shopify products
        ),

      // Divider
      S.divider(),

      // Other document types (Exhibits, etc.)
      ...S.documentTypeListItems().filter(
        (listItem) => !['product'].includes(listItem.getId() || '')
      ),
    ]);
};
