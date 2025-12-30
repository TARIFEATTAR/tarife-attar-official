/**
 * Field Report Object Schema
 * 
 * Enables "Kinfolk" shoppable lifestyle images for "The Atlas" collection.
 * Allows placing product hotspots on lifestyle photography.
 */

type SanityRule = {
  required: () => SanityRule;
  min: (n: number) => SanityRule;
  max: (n: number) => SanityRule;
  custom: (validator: (value: unknown) => true | string) => SanityRule;
};

export const fieldReportSchema = {
  name: 'fieldReport',
  title: 'Field Report',
  type: 'object',
  description: 'Shoppable lifestyle image with product hotspots',
  fields: [
    {
      name: 'image',
      title: 'Lifestyle Image',
      type: 'image',
      description: 'The lifestyle photo with hotspot support',
      options: {
        hotspot: true,
      },
      validation: (Rule: SanityRule) => Rule.required(),
    },
    {
      name: 'hotspots',
      title: 'Product Hotspots',
      type: 'array',
      description: 'Clickable product references on the image',
      of: [
        {
          type: 'object',
          name: 'hotspot',
          title: 'Hotspot',
          fields: [
            {
              name: 'product',
              title: 'Product',
              type: 'reference',
              to: [{ type: 'product' }],
              validation: (Rule: SanityRule) => Rule.required(),
            },
            {
              name: 'x',
              title: 'X Position (%)',
              type: 'number',
              description: 'Horizontal position (0-100)',
              validation: (Rule: SanityRule) =>
                Rule.required()
                  .min(0)
                  .max(100)
                  .custom((val: unknown) => {
                    if (typeof val !== 'number' || val < 0 || val > 100) {
                      return 'X position must be between 0 and 100';
                    }
                    return true;
                  }),
            },
            {
              name: 'y',
              title: 'Y Position (%)',
              type: 'number',
              description: 'Vertical position (0-100)',
              validation: (Rule: SanityRule) =>
                Rule.required()
                  .min(0)
                  .max(100)
                  .custom((val: unknown) => {
                    if (typeof val !== 'number' || val < 0 || val > 100) {
                      return 'Y position must be between 0 and 100';
                    }
                    return true;
                  }),
            },
            {
              name: 'note',
              title: 'Note',
              type: 'string',
              description: 'Contextual note (e.g., "The travel essential")',
              validation: (Rule: SanityRule) => Rule.max(200),
            },
          ],
          preview: {
            select: {
              productTitle: 'product.title',
              x: 'x',
              y: 'y',
              note: 'note',
            },
            prepare({
              productTitle,
              x,
              y,
              note,
            }: {
              productTitle?: string;
              x?: number;
              y?: number;
              note?: string;
            }) {
              return {
                title: productTitle || 'Unnamed Product',
                subtitle: `(${x || 0}%, ${y || 0}%)${note ? ` - ${note}` : ''}`,
              };
            },
          },
        },
      ],
    },
  ],
  preview: {
    select: {
      image: 'image',
      hotspotCount: 'hotspots.length',
    },
    prepare({
      image,
      hotspotCount,
    }: {
      image?: { asset?: { _ref?: string } };
      hotspotCount?: number;
    }) {
      return {
        title: 'Field Report',
        subtitle: `${hotspotCount || 0} hotspot${hotspotCount !== 1 ? 's' : ''}`,
        media: image,
      };
    },
  },
};
