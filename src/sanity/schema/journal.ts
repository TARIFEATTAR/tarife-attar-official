import { defineField, defineType } from 'sanity';

/**
 * Journal Entry Schema
 * 
 * Blog/content posts that can be created in Sanity Studio or pushed from Madison Studio.
 * Categories align with Tarife Attär's brand storytelling:
 * - field-notes: Travel and sourcing stories
 * - behind-the-blend: Product creation and formulation
 * - territory-spotlight: Deep dives into scent territories
 * - collector-archives: Rare material discoveries
 */
export const journalSchema = defineType({
  name: 'journalEntry',
  title: 'Journal Entry',
  type: 'document',
  icon: () => '📓',
  fields: [
    // === BASIC INFO ===
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required().max(100),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      description: 'A brief summary for previews and SEO (max 200 characters)',
      validation: (Rule) => Rule.max(200),
    }),

    // === CONTENT ===
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'Quote', value: 'blockquote' },
          ],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                  },
                ],
              },
            ],
          },
        },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alt Text',
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
            },
          ],
        },
      ],
    }),

    // === MEDIA ===
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt Text',
        },
      ],
    }),

    // === METADATA ===
    defineField({
      name: 'author',
      title: 'Author',
      type: 'string',
      initialValue: 'Tarife Attär',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Field Notes', value: 'field-notes' },
          { title: 'Behind the Blend', value: 'behind-the-blend' },
          { title: 'Territory Spotlight', value: 'territory-spotlight' },
          { title: 'Collector Archives', value: 'collector-archives' },
        ],
        layout: 'radio',
      },
      initialValue: 'field-notes',
    }),
    defineField({
      name: 'territory',
      title: 'Related Territory',
      type: 'string',
      description: 'If this post relates to a specific territory',
      options: {
        list: [
          { title: 'Ember', value: 'ember' },
          { title: 'Petal', value: 'petal' },
          { title: 'Tidal', value: 'tidal' },
          { title: 'Terra', value: 'terra' },
        ],
      },
    }),

    // === RELATIONSHIPS ===
    defineField({
      name: 'relatedProducts',
      title: 'Related Products',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'product' }],
        },
      ],
      description: 'Products mentioned or featured in this post',
    }),

    // === SYSTEM ===
    defineField({
      name: 'generationSource',
      title: 'Generation Source',
      type: 'string',
      description: 'Where this content was created',
      options: {
        list: [
          { title: 'Sanity Studio', value: 'sanity-studio' },
          { title: 'Madison Studio', value: 'madison-studio' },
          { title: 'Notion', value: 'notion' },
        ],
      },
      initialValue: 'sanity-studio',
      readOnly: true,
    }),
    defineField({
      name: 'featured',
      title: 'Featured Post',
      type: 'boolean',
      description: 'Show this post prominently on the journal page',
      initialValue: false,
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'text',
      rows: 2,
      description: 'Meta description for search engines (max 160 characters)',
      validation: (Rule) => Rule.max(160),
    }),

    // === NOTION SYNC (SYSTEM) ===
    defineField({
      name: 'notionPageId',
      title: 'Notion Page ID',
      type: 'string',
      description: 'Stable identifier used to sync updates from Notion',
      readOnly: true,
    }),
    defineField({
      name: 'notionUrl',
      title: 'Notion URL',
      type: 'url',
      readOnly: true,
    }),
    defineField({
      name: 'notionLastEditedAt',
      title: 'Notion Last Edited At',
      type: 'datetime',
      readOnly: true,
    }),
  ],

  preview: {
    select: {
      title: 'title',
      category: 'category',
      media: 'coverImage',
      publishedAt: 'publishedAt',
    },
    prepare({ title, category, media, publishedAt }) {
      const categoryLabels: Record<string, string> = {
        'field-notes': '📍 Field Notes',
        'behind-the-blend': '🧪 Behind the Blend',
        'territory-spotlight': '🗺️ Territory Spotlight',
        'collector-archives': '📦 Collector Archives',
      };
      const date = publishedAt ? new Date(publishedAt).toLocaleDateString() : 'No date';
      return {
        title,
        subtitle: `${categoryLabels[category] || category} · ${date}`,
        media,
      };
    },
  },

  orderings: [
    {
      title: 'Published Date, New',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
    {
      title: 'Published Date, Old',
      name: 'publishedAtAsc',
      by: [{ field: 'publishedAt', direction: 'asc' }],
    },
  ],
});
