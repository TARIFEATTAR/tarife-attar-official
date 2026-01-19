/**
 * Master Product Schema (Unified Discriminator)
 * 
 * Implements the "Two Roads" strategy: "The Atlas" (Voyage) and "The Relic" (Purity).
 * Single document type with conditional fields based on collectionType.
 */

import { sensoryLexiconValidation } from '../validation/sensoryLexicon';
import { ViscosityInput } from '../components/ViscosityInput';

import { shopifyFields } from './shopifyFields';

type SanityRule = {
  required: () => SanityRule;
  min: (n: number) => SanityRule;
  max: (n: number) => SanityRule;
  custom: (validator: (value: unknown) => true | string | { message: string; level?: 'error' | 'warning' }) => SanityRule;
};

export const productSchema = {
  name: 'product',
  title: 'Product',
  type: 'document',
  groups: [
    { name: 'general', title: 'General Info' },
    { name: 'media', title: 'Media' },
    { name: 'data', title: 'Collection Data' },
    { name: 'notes', title: 'Fragrance Architecture' },
    { name: 'commerce', title: 'Shopify Sync' },
  ],
  fields: [
    // Collection Type - The Bifurcation Point
    {
      name: 'collectionType',
      title: 'Collection Type',
      type: 'string',
      group: 'general',
      description: 'The "Two Roads" strategy: Atlas (Voyage) or Relic (Purity)',
      options: {
        list: [
          { title: 'The Atlas (Voyage)', value: 'atlas' },
          { title: 'The Relic (Vault)', value: 'relic' },
        ],
        layout: 'radio',
      },
      validation: (Rule: SanityRule) => Rule.required(),
    },

    // Hidden: Generation Source (for Madison Studio)
    {
      name: 'generationSource',
      title: 'Generation Source',
      type: 'string',
      hidden: true,
      options: {
        list: [
          { title: 'Manual', value: 'manual' },
          { title: 'Madison Studio', value: 'madison-studio' },
        ],
      },
      initialValue: 'manual',
    },

    // Internal Name (for inventory tracking)
    {
      name: 'internalName',
      title: 'Internal Name',
      type: 'string',
      group: 'general',
      description: 'For inventory tracking and internal reference',
      validation: (Rule: SanityRule) => Rule.required(),
    },

    // ===== LEGACY NAME FIELDS (Rebrand Transition) =====
    {
      name: 'legacyName',
      title: 'Legacy Name',
      type: 'string',
      group: 'general',
      description: 'Previous product name for rebrand transition (e.g., "Honey Oud"). Displays as "Formerly [name]" during transition period.',
      placeholder: 'e.g., Honey Oud',
    },
    {
      name: 'showLegacyName',
      title: 'Show Legacy Name',
      type: 'boolean',
      group: 'general',
      description: 'Display "Formerly..." notation on product cards and detail pages. Disable once customers recognize the new name.',
      initialValue: true,
    },
    {
      name: 'legacyNameStyle',
      title: 'Legacy Name Display Style',
      type: 'string',
      group: 'general',
      description: 'How to phrase the legacy name reference',
      options: {
        list: [
          { title: 'Formerly [Name]', value: 'formerly' },
          { title: 'Once known as [Name]', value: 'once-known' },
          { title: 'Previously [Name]', value: 'previously' },
        ],
        layout: 'radio',
      },
      initialValue: 'formerly',
      hidden: ({ parent }: { parent?: { legacyName?: string } }) => !parent?.legacyName,
    },

    // Public Title
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'general',
      description: 'Public-facing product name',
      validation: (Rule: SanityRule) => sensoryLexiconValidation(Rule, 'title'),
    },

    // Slug
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'general',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule: SanityRule) => Rule.required(),
    },

    // Main Image
    {
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      group: 'media',
      options: {
        hotspot: true,
      },
    },

    // Gallery
    {
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      group: 'media',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
        },
      ],
    },

    // Price
    {
      name: 'price',
      title: 'Price',
      type: 'number',
      group: 'commerce',
      description: 'Price in USD',
      validation: (Rule: SanityRule) => Rule.min(0),
    },

    // Volume/Size
    {
      name: 'volume',
      title: 'Volume',
      type: 'string',
      group: 'general',
      description: 'e.g., "9ml", "3ml", "15ml"',
    },

    // Scent Profile (Short summary for Atlas Collection)
    {
      name: 'scentProfile',
      title: 'Scent Profile',
      type: 'string',
      group: 'general',
      description: 'Brief scent summary (e.g., "Amber, warmth" or "Ocean, marine"). Displays on product cards.',
      placeholder: 'e.g., Honey, oudh',
    },

    // Inspired By (Reference to famous fragrances)
    {
      name: 'inspiredBy',
      title: 'Inspired By',
      type: 'string',
      group: 'general',
      description: 'Optional: Reference fragrance or concept (e.g., "Halfeti Leather by Penhaligon\'s"). Displays on product page.',
      placeholder: 'e.g., Megamare by Orto Parisi',
    },

    // Product Format
    {
      name: 'productFormat',
      title: 'Product Format',
      type: 'string',
      group: 'general',
      options: {
        list: [
          { title: 'Perfume Oil', value: 'Perfume Oil' },
          { title: 'Atmosphere Mist', value: 'Atmosphere Mist' },
          { title: 'Traditional Attar', value: 'Traditional Attar' },
          { title: 'Pure Oud', value: 'Pure Oud' },
          { title: 'Aged Resin', value: 'Aged Resin' },
          { title: 'Pure Distillate', value: 'Pure Distillate' },
        ],
      },
    },

    // Shopify Specific Fields
    ...shopifyFields,

    // Shopify Preview Image URL (synced from Shopify products for display)
    {
      name: 'shopifyPreviewImageUrl',
      title: 'Shopify Preview Image URL',
      type: 'url',
      group: 'media',
      description: 'Image URL from linked Shopify product. Used as fallback when no mainImage is set.',
    },

    // Shopify Store Data (read-only, synced from Shopify Connect)
    {
      name: 'store',
      title: 'Shopify Store Data',
      type: 'object',
      group: 'commerce',
      readOnly: true,
      description: 'Auto-synced from Shopify. To use this product, create a custom product and link via shopifyProductId.',
      fields: [
        {
          name: 'title',
          title: 'Shopify Title',
          type: 'string',
          readOnly: true,
        },
        {
          name: 'descriptionHtml',
          title: 'Shopify Description',
          type: 'text',
          readOnly: true,
        },
        {
          name: 'slug',
          title: 'Shopify Slug',
          type: 'slug',
          readOnly: true,
        },
        {
          name: 'priceRange',
          title: 'Price Range',
          type: 'object',
          readOnly: true,
          fields: [
            {
              name: 'minVariantPrice',
              type: 'number',
              readOnly: true,
            },
            {
              name: 'maxVariantPrice',
              type: 'number',
              readOnly: true,
            },
          ],
        },
        {
          name: 'productType',
          title: 'Product Type',
          type: 'string',
          readOnly: true,
        },
        {
          name: 'vendor',
          title: 'Vendor',
          type: 'string',
          readOnly: true,
        },
        {
          name: 'status',
          title: 'Status',
          type: 'string',
          readOnly: true,
        },
        {
          name: 'id',
          title: 'Shopify Product ID',
          type: 'number',
          readOnly: true,
        },
        {
          name: 'gid',
          title: 'Shopify GID',
          type: 'string',
          readOnly: true,
        },
        {
          name: 'createdAt',
          title: 'Created At',
          type: 'datetime',
          readOnly: true,
        },
        {
          name: 'isDeleted',
          title: 'Is Deleted',
          type: 'boolean',
          readOnly: true,
        },
        {
          name: 'options',
          title: 'Product Options',
          type: 'array',
          readOnly: true,
          of: [
            {
              type: 'object',
              fields: [
                {
                  name: 'name',
                  type: 'string',
                  readOnly: true,
                },
                {
                  name: 'values',
                  type: 'array',
                  readOnly: true,
                  of: [{ type: 'string' }],
                },
              ],
            },
          ],
        },
        {
          name: 'shop',
          title: 'Shop Info',
          type: 'object',
          readOnly: true,
          fields: [
            {
              name: 'domain',
              type: 'string',
              readOnly: true,
            },
          ],
        },
        {
          name: 'tags',
          title: 'Tags',
          type: 'string',
          readOnly: true,
        },
        {
          name: 'previewImageUrl',
          title: 'Preview Image URL',
          type: 'url',
          readOnly: true,
        },
      ],
    },

    // ===== THE ATLAS DATA (Hidden if collectionType != 'atlas') =====
    {
      name: 'atlasData',
      title: 'Atlas Data',
      type: 'object',
      group: 'data',
      description: 'Voyage-specific data for The Atlas collection',
      hidden: ({ parent }: { parent?: { collectionType?: string } }) =>
        parent?.collectionType !== 'atlas',
      fields: [
        {
          name: 'atmosphere',
          title: 'Atmosphere Territory',
          type: 'string',
          description: 'The sensory territory this product belongs to',
          options: {
            list: [
              { title: 'Tidal', value: 'tidal', description: 'Salt. Mist. The pull of open water.' },
              { title: 'Ember', value: 'ember', description: 'Spice. Warmth. The intimacy of ancient routes.' },
              { title: 'Petal', value: 'petal', description: 'Bloom. Herb. The exhale of living gardens.' },
              { title: 'Terra', value: 'terra', description: 'Wood. Oud. The gravity of deep forests.' },
            ],
          },
          validation: (Rule: SanityRule) => Rule.required(),
        },
        {
          name: 'gpsCoordinates',
          title: 'GPS Coordinates (Inspiration Point)',
          type: 'string',
          description: 'Inspiration Point: The memory or atmosphere this scent captures (e.g., "A market in Tangier"). Coordinates like "45.5017° N, 73.5673° W".',
        },
        {
          name: 'travelLog',
          title: 'Travel Log',
          type: 'array',
          of: [{ type: 'block' }],
          description: 'Narrative description of the journey and destination',
          validation: (Rule: SanityRule) =>
            sensoryLexiconValidation(Rule, 'Travel Log'),
        },
        {
          name: 'badges',
          title: 'Trust Badges',
          type: 'array',
          of: [{ type: 'string' }],
          description: 'Distinguishing factors for this Atlas product',
          options: {
            list: [
              { title: 'Skin-Safe', value: 'Skin-Safe' },
              { title: 'Clean', value: 'Clean' },
              { title: 'Cruelty-Free', value: 'Cruelty-Free' },
            ],
          },
        },
        {
          name: 'fieldReport',
          title: 'Field Report',
          type: 'shoppableImage',
          description: 'Shoppable lifestyle image with product hotspots',
        },
      ],
    },

    // ===== THE RELIC DATA (Hidden if collectionType != 'relic') =====
    {
      name: 'relicData',
      title: 'Relic Data',
      type: 'object',
      group: 'data',
      description: 'Vault-specific data for The Relic collection',
      hidden: ({ parent }: { parent?: { collectionType?: string } }) =>
        parent?.collectionType !== 'relic',
      fields: [
        {
          name: 'distillationYear',
          title: 'Distillation Year',
          type: 'number',
          description: 'Year the material was distilled',
          validation: (Rule: SanityRule) =>
            Rule.min(1900).max(new Date().getFullYear()),
        },
        {
          name: 'originRegion',
          title: 'Origin Region',
          type: 'string',
          description: 'Geographic origin of the material (e.g., "Trat, Thailand", "Assam, India")',
        },
        {
          name: 'gpsCoordinates',
          title: 'GPS Coordinates (Provenance)',
          type: 'string',
          description: 'Provenance: The exact harvest site (e.g., a specific Aquilaria grove in Laos). For Heritage Distillations, this is the Distillery (The Kiln) where the artifact was born.',
        },
        {
          name: 'viscosity',
          title: 'Viscosity',
          type: 'number',
          description: 'Oil thickness (0-100): 0 = Ethereal/Mist, 100 = Concrete/Ointment',
          validation: (Rule: SanityRule) => Rule.min(0).max(100),
          components: {
            input: ViscosityInput,
          },
          options: {
            min: 0,
            max: 100,
            step: 1,
          },
        },
        {
          name: 'museumDescription',
          title: 'Museum Description',
          type: 'array',
          of: [{ type: 'block' }],
          description: 'Curatorial description for the collector',
          validation: (Rule: SanityRule) =>
            sensoryLexiconValidation(Rule, 'Museum Description'),
        },
        {
          name: 'badges',
          title: 'Trust Badges',
          type: 'array',
          of: [{ type: 'string' }],
          description: 'Distinguishing factors for this Relic product',
          options: {
            list: [
              { title: 'Pure Origin', value: 'Pure Origin' },
              { title: 'Wild Harvested', value: 'Wild Harvested' },
            ],
          },
        },
        {
          name: 'museumExhibit',
          title: 'Purity Exhibit (Glass Box)',
          type: 'museumExhibit',
          description: 'Digital Vitrine: Macro photography with technical specimen data',
        },
        // Heritage Distillation Classification (v3.0)
        {
          name: 'isHeritageDistillation',
          title: 'Heritage Distillation',
          type: 'boolean',
          description: 'Enable for traditional co-distillations (e.g., Majmua, Shamama). Changes Class label to "Heritage Distillation" and GPS to "Distillery (The Kiln)".',
          initialValue: false,
        },
        {
          name: 'heritageType',
          title: 'Heritage Type',
          type: 'string',
          description: 'Display subtitle for Heritage Distillations.',
          options: {
            list: [
              { title: 'Traditional Hydro-Distillation', value: 'Traditional Hydro-Distillation' },
              { title: 'Ancient Co-Distillation', value: 'Ancient Co-Distillation' },
            ],
          },
          hidden: ({ parent }: { parent?: { isHeritageDistillation?: boolean } }) =>
            !parent?.isHeritageDistillation,
        },
      ],
    },

    // Shared: Notes (Top, Heart, Base)
    {
      name: 'notes',
      title: 'Fragrance Notes',
      type: 'object',
      group: 'notes',
      fields: [
        {
          name: 'top',
          title: 'Top Notes',
          type: 'array',
          of: [{ type: 'string' }],
        },
        {
          name: 'heart',
          title: 'Heart Notes',
          type: 'array',
          of: [{ type: 'string' }],
        },
        {
          name: 'base',
          title: 'Base Notes',
          type: 'array',
          of: [{ type: 'string' }],
        },
      ],
    },

    // Shared: Perfumer/Nose
    {
      name: 'perfumer',
      title: 'Perfumer / Nose',
      type: 'string',
      group: 'general',
    },

    // Shared: Year
    {
      name: 'year',
      title: 'Year',
      type: 'number',
      group: 'general',
      description: 'Year of release or creation',
    },

    // Shared: Stock Status
    {
      name: 'inStock',
      title: 'In Stock',
      type: 'boolean',
      group: 'commerce',
      initialValue: true,
    },

    // Shared: Ethical Scarcity Note
    {
      name: 'scarcityNote',
      title: 'Scarcity Note',
      type: 'string',
      group: 'commerce',
      description: 'Custom message for limited stock (e.g., "Limited Batch — 2024 Harvest")',
      placeholder: 'Limited Batch Production — Small Volume Reserve',
    },

    // Shared: Related Products (Complete the Journey)
    {
      name: 'relatedProducts',
      title: 'Related Products',
      type: 'array',
      group: 'data',
      description: 'Products to display in the "Complete the Journey" section',
      of: [{ type: 'reference', to: [{ type: 'product' }] }],
      validation: (Rule: SanityRule) => Rule.max(3),
    },
  ],

  preview: {
    select: {
      title: 'title',
      shopifyTitle: 'store.title',
      collectionType: 'collectionType',
      internalName: 'internalName',
      legacyName: 'legacyName',
      media: 'mainImage',
      shopifyImage: 'store.previewImageUrl',
      atlasAtmosphere: 'atlasData.atmosphere',
      relicViscosity: 'relicData.viscosity',
      shopifyPrice: 'store.priceRange.minVariantPrice',
      shopifyStatus: 'store.status',
    },
    prepare(selection: {
      title?: string;
      shopifyTitle?: string;
      collectionType?: string;
      internalName?: string;
      legacyName?: string;
      media?: unknown;
      shopifyImage?: string;
      atlasAtmosphere?: string;
      relicViscosity?: number;
      shopifyPrice?: number;
      shopifyStatus?: string;
    }) {
      const {
        title,
        shopifyTitle,
        collectionType,
        internalName,
        legacyName,
        media,
        shopifyImage,
        atlasAtmosphere,
        relicViscosity,
        shopifyPrice,
        shopifyStatus,
      } = selection;

      // Use Shopify title if no custom title
      const displayTitle = title || shopifyTitle || 'Untitled Product';

      // Determine if this is a Shopify-synced product
      const isShopifyProduct = !!shopifyTitle && !title;

      const subtitleParts: string[] = [];

      if (legacyName) {
        subtitleParts.push(`← ${legacyName}`);
      }

      if (isShopifyProduct) {
        subtitleParts.push('🛒 Shopify');
        if (shopifyPrice) subtitleParts.push(`$${shopifyPrice}`);
        if (shopifyStatus) subtitleParts.push(shopifyStatus);
      } else {
        if (internalName) subtitleParts.push(`[${internalName}]`);
        if (collectionType === 'atlas' && atlasAtmosphere) {
          subtitleParts.push(`Atlas: ${atlasAtmosphere}`);
        } else if (collectionType === 'relic' && relicViscosity !== undefined) {
          subtitleParts.push(`Relic: Viscosity ${relicViscosity}`);
        }
      }

      return {
        title: displayTitle,
        subtitle: subtitleParts.join(' · '),
        media: media || (shopifyImage ? { _type: 'image', asset: { _ref: shopifyImage } } : undefined),
      };
    },
  },
};
