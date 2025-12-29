
import { validateScientificLexicon } from '../lib/lexiconValidation';

export const shoppableImage = {
  name: 'shoppableImage',
  title: 'Field Report (Shoppable Image)',
  type: 'object',
  fields: [
    {
      name: 'image',
      type: 'image',
      title: 'Field Specimen Image',
      options: { hotspot: true }
    },
    {
      name: 'alt',
      type: 'string',
      title: 'Evocative Description',
      description: 'Describe the atmospheric context of this image.',
      validation: (Rule: any) => Rule.custom(validateScientificLexicon)
    },
    {
      name: 'hotspots',
      type: 'array',
      title: 'Product Anchors',
      of: [
        {
          type: 'object',
          name: 'hotspot',
          fields: [
            { name: 'productReference', type: 'reference', to: [{ type: 'product' }] },
            { name: 'x', type: 'number', title: 'X Coordinate (0-100)', validation: (Rule: any) => Rule.min(0).max(100) },
            { name: 'y', type: 'number', title: 'Y Coordinate (0-100)', validation: (Rule: any) => Rule.min(0).max(100) },
            { 
              name: 'annotation', 
              type: 'string', 
              title: 'Context Note', 
              description: 'e.g., "Primary extraction source"',
              validation: (Rule: any) => Rule.custom(validateScientificLexicon)
            }
          ]
        }
      ]
    }
  ]
};
