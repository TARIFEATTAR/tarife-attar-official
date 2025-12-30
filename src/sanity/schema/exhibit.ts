// Exhibit schema type definition
// This defines the structure for curated exhibits / editorial content

type SanityRule = {
  required: () => SanityRule;
  min: (n: number) => SanityRule;
  max: (n: number) => SanityRule;
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
      name: "subtitle",
      title: "Subtitle",
      type: "string",
      description: "A brief tagline for the exhibit",
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
