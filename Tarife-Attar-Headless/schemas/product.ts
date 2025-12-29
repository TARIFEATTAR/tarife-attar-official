
import { validateScientificLexicon } from './lib/lexiconValidation';

/**
 * SANITY SCHEMA DEFINITION: Unified Product Specimen
 * Enforces the "Two Roads" Nomenclature logic.
 */
export const productSchema = {
  name: 'product',
  title: 'Unified Product Specimen',
  type: 'document',
  fields: [
    // PRIMARY DISCRIMINATOR
    { 
      name: 'collectionType', 
      type: 'string', 
      title: 'Collection Path', 
      options: { list: ['atlas', 'relic'] },
      validation: (Rule: any) => Rule.required()
    },

    // BASE IDENTITY
    { 
      name: 'title', 
      type: 'string', 
      title: 'Specimen Name',
      validation: (Rule: any) => Rule.custom((title: string, context: any) => {
        const { collectionType } = context.document;
        if (collectionType === 'atlas' && title?.toLowerCase().includes('attar')) {
          return "NOMENCLATURE ERROR: Atlas products are 'Perfume Oils' for the journey. They cannot use the term 'Attar'.";
        }
        return true;
      })
    },
    { name: 'slug', type: 'slug', title: 'Archive ID', options: { source: 'title' } },
    
    // NOMENCLATURE & FORMAT
    {
      name: 'productFormat',
      type: 'string',
      title: 'Product Format',
      options: {
        list: [
          { title: 'Perfume Oil (Atlas)', value: 'Perfume Oil' },
          { title: 'Atmosphere Mist (Atlas)', value: 'Atmosphere Mist' },
          { title: 'Traditional Attar (Relic)', value: 'Traditional Attar' },
          { title: 'Pure Distillate (Relic)', value: 'Pure Distillate' }
        ]
      },
      validation: (Rule: any) => Rule.custom((format: string, context: any) => {
        const { collectionType } = context.document;
        const atlasFormats = ['Perfume Oil', 'Atmosphere Mist'];
        const relicFormats = ['Traditional Attar', 'Pure Distillate'];

        if (collectionType === 'atlas' && !atlasFormats.includes(format)) {
          return `Atlas products must use Atlas-specific nomenclature: ${atlasFormats.join(', ')}.`;
        }
        if (collectionType === 'relic' && !relicFormats.includes(format)) {
          return `Relic products must use Relic-specific nomenclature: ${relicFormats.join(', ')}.`;
        }
        return true;
      })
    },

    // VOLUME & HARDWARE (Flexible for 9ml, 2ml, 15ml)
    {
      name: 'volume',
      type: 'string',
      title: 'Vessel Volume',
      initialValue: '9ml',
      options: { list: ['2ml', '9ml', '15ml', '30ml'] }
    },
    {
      name: 'hardware',
      type: 'string',
      title: 'Application Hardware',
      options: {
        list: [
          { title: 'Roller (Atlas)', value: 'Roller' },
          { title: 'Spray (Atlas)', value: 'Spray' },
          { title: 'Dropper (Atlas)', value: 'Dropper' },
          { title: 'Dip Stick (Relic)', value: 'Dip Stick' },
          { title: 'Vial (Relic)', value: 'Vial' }
        ]
      },
      validation: (Rule: any) => Rule.custom((hardware: string, context: any) => {
        const { collectionType } = context.document;
        const atlasHardware = ['Roller', 'Spray', 'Dropper'];
        const relicHardware = ['Dip Stick', 'Vial'];

        if (collectionType === 'atlas' && !atlasHardware.includes(hardware)) return "Atlas hardware must be Roller, Spray, or Dropper.";
        if (collectionType === 'relic' && !relicHardware.includes(hardware)) return "Relic hardware must be Dip Stick or Vial.";
        return true;
      })
    },

    { name: 'mainImage', type: 'image', title: 'Primary Media' },
    { name: 'price', type: 'string', title: 'Retail Price (DTC)' },

    // STORYTELLING MODULES
    { name: 'fieldReport', type: 'shoppableImage', title: 'The Atlas: Field Report' },
    { name: 'museumExhibit', type: 'museumExhibit', title: 'The Relic: Digital Vitrine' },

    // NARRATIVE LOG (The "Travel Log" Validation)
    {
      name: 'fieldJournalEntry',
      type: 'array',
      of: [{ type: 'block' }],
      title: 'Narrative Log',
      validation: (Rule: any) => Rule.custom((blocks: any, context: any) => {
        if (!blocks) return true;
        const text = blocks.map((b: any) => b.children.map((c: any) => c.text).join('')).join(' ');
        const { collectionType } = context.document;
        
        if (collectionType === 'atlas') {
          const travelKeywords = ['coordinates', 'travel', 'journey', 'destination', 'atmosphere', 'altitude'];
          const hasTravelContext = travelKeywords.some(k => text.toLowerCase().includes(k));
          if (!hasTravelContext) {
            return {
              message: "Atlas copy should evoke movement and coordinates. Consider adding travel-focused language.",
              level: 'warning'
            };
          }
        }
        return validateScientificLexicon(text);
      })
    }
  ]
};
