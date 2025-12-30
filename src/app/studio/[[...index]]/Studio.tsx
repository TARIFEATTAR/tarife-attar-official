'use client';

/**
 * Sanity Studio Component
 * 
 * This component embeds Sanity Studio using the Studio component from sanity.
 * It uses the same configuration from sanity.config.ts
 */

import { Studio } from 'sanity';
import config from '../../../../sanity.config';

export function StudioComponent() {
  return <Studio config={config} />;
}
