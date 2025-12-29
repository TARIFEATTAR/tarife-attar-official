
import { validateScientificLexicon } from '../lib/lexiconValidation';

export const museumExhibit = {
  name: 'museumExhibit',
  title: 'Digital Vitrine (Museum Exhibit)',
  type: 'object',
  fields: [
    {
      name: 'exhibitImage',
      type: 'image',
      title: 'Macro Texture Shot',
      description: 'High-detail close-up of the material or relic.',
      options: { hotspot: true }
    },
    {
      name: 'caption',
      type: 'string',
      title: 'Curator Note',
      description: 'e.g., "Hojari Resin, 2019 Harvest - dhofar region"',
      validation: (Rule: any) => Rule.custom(validateScientificLexicon)
    },
    {
      name: 'artifacts',
      type: 'array',
      title: 'Artifact Tags',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'product', type: 'reference', to: [{ type: 'product' }] },
            { 
              name: 'museumLabel', 
              type: 'string', 
              title: 'Label Override', 
              description: 'e.g., "The Distillate No. 4"',
              validation: (Rule: any) => Rule.custom(validateScientificLexicon)
            },
            {
              name: 'coordinates',
              type: 'object',
              fields: [
                { name: 'x', type: 'number', validation: (Rule: any) => Rule.min(0).max(100) },
                { name: 'y', type: 'number', validation: (Rule: any) => Rule.min(0).max(100) }
              ]
            }
          ]
        }
      ]
    }
  ]
};
