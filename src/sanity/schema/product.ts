/**
 * Master Product Schema (Unified Discriminator)
 * 
 * Implements the "Two Roads" strategy: "The Atlas" (Voyage) and "The Relic" (Purity).
 * Single document type with conditional fields based on collectionType.
 */

import { sensoryLexiconValidation } from '../validation/sensoryLexicon';
import { ViscosityInput } from '../components/ViscosityInput';

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
  fields: [
    // Collection Type - The Bifurcation Point
    {
      name: 'collectionType',
      title: 'Collection Type',
      type: 'string',
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
      description: 'For inventory tracking and internal reference',
      validation: (Rule: SanityRule) => Rule.required(),
    },

    // Public Title
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Public-facing product name',
      validation: (Rule: SanityRule) => sensoryLexiconValidation(Rule, 'title'),
    },

    // Slug
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
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
      options: {
        hotspot: true,
      },
    },

    // Gallery
    {
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
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
      description: 'Price in USD',
      validation: (Rule: SanityRule) => Rule.min(0),
    },

    // Volume/Size
    {
      name: 'volume',
      title: 'Volume',
      type: 'string',
      description: 'e.g., "9ml", "3ml", "15ml"',
    },

    // Product Format
    {
      name: 'productFormat',
      title: 'Product Format',
      type: 'string',
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

    // ===== THE ATLAS DATA (Hidden if collectionType != 'atlas') =====
    {
      name: 'atlasData',
      title: 'Atlas Data',
      type: 'object',
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
    },

    // Shared: Year
    {
      name: 'year',
      title: 'Year',
      type: 'number',
      description: 'Year of release or creation',
    },

    // Shared: Stock Status
    {
      name: 'inStock',
      title: 'In Stock',
      type: 'boolean',
      initialValue: true,
    },
  ],

  preview: {
    select: {
      title: 'title',
      collectionType: 'collectionType',
      internalName: 'internalName',
      media: 'mainImage',
      atlasAtmosphere: 'atlasData.atmosphere',
      relicViscosity: 'relicData.viscosity',
    },
    prepare(selection: {
      title?: string;
      collectionType?: string;
      internalName?: string;
      media?: unknown;
      atlasAtmosphere?: string;
      relicViscosity?: number;
    }) {
      const { title, collectionType, internalName, media, atlasAtmosphere, relicViscosity } =
        selection;

      const subtitleParts: string[] = [];
      if (internalName) subtitleParts.push(`[${internalName}]`);
      if (collectionType === 'atlas' && atlasAtmosphere) {
        subtitleParts.push(`Atlas: ${atlasAtmosphere}`);
      } else if (collectionType === 'relic' && relicViscosity !== undefined) {
        subtitleParts.push(`Relic: Viscosity ${relicViscosity}`);
      }

      return {
        title: title || 'Untitled Product',
        subtitle: subtitleParts.join(' · '),
        media,
      };
    },
  },
};
