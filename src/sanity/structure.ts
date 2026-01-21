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
            .filter('(_type == "product" || _type == "journalEntry" || _type == "fieldJournal") && generationSource == "madison-studio"')
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

      // Group 5: Journal (Blog/Content)
      S.listItem()
        .title('📓 The Journal')
        .id('journal')
        .child(
          S.list()
            .title('The Journal')
            .items([
              // All Journal Entries
              S.listItem()
                .title('All Entries')
                .id('all-journal')
                .child(
                  S.documentList()
                    .title('All Journal Entries')
                    .filter('_type == "journalEntry"')
                    .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])
                ),
              // Featured
              S.listItem()
                .title('⭐ Featured')
                .id('featured-journal')
                .child(
                  S.documentList()
                    .title('Featured Posts')
                    .filter('_type == "journalEntry" && featured == true')
                    .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])
                ),
              S.divider(),
              // By Category
              S.listItem()
                .title('📍 Field Notes')
                .id('field-notes')
                .child(
                  S.documentList()
                    .title('Field Notes')
                    .filter('_type == "journalEntry" && category == "field-notes"')
                    .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])
                ),
              S.listItem()
                .title('🧪 Behind the Blend')
                .id('behind-the-blend')
                .child(
                  S.documentList()
                    .title('Behind the Blend')
                    .filter('_type == "journalEntry" && category == "behind-the-blend"')
                    .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])
                ),
              S.listItem()
                .title('🗺️ Territory Spotlight')
                .id('territory-spotlight')
                .child(
                  S.documentList()
                    .title('Territory Spotlight')
                    .filter('_type == "journalEntry" && category == "territory-spotlight"')
                    .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])
                ),
              S.listItem()
                .title('📦 Collector Archives')
                .id('collector-archives')
                .child(
                  S.documentList()
                    .title('Collector Archives')
                    .filter('_type == "journalEntry" && category == "collector-archives"')
                    .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])
                ),
              S.divider(),
              // Madison Studio Submissions
              S.listItem()
                .title('✨ From Madison Studio')
                .id('madison-journal')
                .child(
                  S.documentList()
                    .title('Madison Studio Submissions')
                    .filter('_type == "journalEntry" && generationSource == "madison-studio"')
                    .defaultOrdering([{ field: '_createdAt', direction: 'desc' }])
                ),
            ])
        ),

      // Group 6: Field Journal
      S.listItem()
        .title('📔 Field Journal')
        .id('field-journal')
        .icon(() => '📔')
        .child(
          S.documentList()
            .title('Field Journal')
            .filter('_type == "fieldJournal"')
            .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])
        ),

      // Divider
      S.divider(),

      // Other document types (Exhibits, etc.)
      ...S.documentTypeListItems().filter(
        (listItem) => !['product', 'journalEntry', 'fieldJournal'].includes(listItem.getId() || '')
      ),
    ]);
};
