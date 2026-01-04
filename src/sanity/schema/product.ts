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
          title: 'GPS Coordinates',
          type: 'string',
          description: 'Optional geographic coordinates (e.g., "45.5017° N, 73.5673° W")',
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
          type: 'fieldReport',
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
          title: 'GPS Coordinates',
          type: 'string',
          description: 'Optional geographic coordinates for the origin (e.g., "12.5657° N, 102.5065° E" for Trat, Thailand)',
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
          name: 'fieldReport',
          title: 'Field Report',
          type: 'fieldReport',
          description: 'Shoppable lifestyle image showcasing the material origin, distillation process, or collector context',
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
