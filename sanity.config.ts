/**
 * Sanity Studio Configuration
 * 
 * Configures the "Bifurcated Museum" desk structure for Tarife Attär.
 * Run: npx sanity dev (or npx sanity start) to launch the Studio.
 */

import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './src/sanity/schema';
import { structure } from './src/sanity/structure';

export default defineConfig({
  name: 'tarife-attar',
  title: 'Tarife Attär Studio',
  
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '8h5l91ut',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  
  basePath: '/studio',
  
  plugins: [
    structureTool({
      structure,
    }),
  ],
  
  schema: {
    types: schemaTypes as any, // Type assertion for schema compatibility
  },
});
