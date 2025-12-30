// Exhibit schema type definition
// This defines the structure for curated exhibits / editorial content

import { sensoryLexiconValidation } from '../validation/sensoryLexicon';

type SanityRule = {
  required: () => SanityRule;
  min: (n: number) => SanityRule;
  max: (n: number) => SanityRule;
  custom: (validator: (value: unknown) => true | string | { message: string; level?: 'error' | 'warning' }) => SanityRule;
};

export const exhibitSchema = {
  name: "exhibit",
  title: "Exhibit",
  type: "document",
  // Disable releases for exhibits - allow direct publishing
  __experimental_actions: [
    'create',
    'update',
    'publish',
    'delete',
  ],
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
      description: "The exhibit title (e.g., 'The Green Sacra')",
      validation: (Rule: SanityRule) => Rule.required(),
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule: SanityRule) => Rule.required(),
    },
    {
      name: "internalSku",
      title: "Internal SKU",
      type: "string",
      description: "Internal inventory identifier (e.g., 'RELIC-004-RESIN')",
    },
    {
      name: "subtitle",
      title: "Subtitle",
      type: "string",
      description: "A brief tagline for the exhibit",
    },
    // I. SPECIMEN DATA (The Metadata)
    {
      name: "specimenData",
      title: "Specimen Data",
      type: "object",
      description: "Technical metadata for the specimen sidebar or HUD overlay",
      fields: [
        {
          name: "binomial",
          title: "Binomial",
          type: "string",
          description: "Scientific name (e.g., 'Boswellia sacra')",
        },
        {
          name: "origin",
          title: "Origin",
          type: "string",
          description: "Geographic origin (e.g., 'Dhofar Governorate, Sultanate of Oman')",
        },
        {
          name: "coordinates",
          title: "Coordinates",
          type: "string",
          description: "GPS coordinates (e.g., '17.0151° N, 54.0924° E')",
        },
        {
          name: "harvestStratum",
          title: "Harvest Stratum",
          type: "string",
          description: "Harvest information (e.g., 'Pre-Monsoon (High Altitude)')",
        },
        {
          name: "viscosity",
          title: "Viscosity",
          type: "number",
          description: "Viscosity rating (0-100, e.g., 100 = Crystalline / Solid State)",
          validation: (Rule: SanityRule) => Rule.min(0).max(100),
        },
        {
          name: "profile",
          title: "Profile",
          type: "string",
          description: "Scent profile (e.g., 'Mineral, Citrus, Aerated')",
        },
      ],
    },
    // II. THE CURATOR'S LOG (The Narrative)
    {
      name: "curatorsLog",
      title: "Curator's Log",
      type: "array",
      of: [{ type: "block" }],
      description: "Narrative description that replaces standard product description. Adheres to Sensory Lexicon.",
      validation: (Rule: SanityRule) =>
        sensoryLexiconValidation(Rule, "Curator's Log"),
    },
    {
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: {
        hotspot: true,
      },
    },
    {
      name: "body",
      title: "Body",
      type: "array",
      of: [
        { type: "block" },
        {
          type: "image",
          options: {
            hotspot: true,
          },
        },
      ],
    },
    {
      name: "featuredProducts",
      title: "Featured Products",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "product" }],
        },
      ],
      description: "Products featured in this exhibit",
    },
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "subtitle",
      media: "coverImage",
    },
  },
};
