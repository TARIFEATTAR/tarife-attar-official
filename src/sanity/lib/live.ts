// Compatibility layer for next-sanity@9.x (React 18)
// The defineLive API was introduced in next-sanity@10+
// This provides a compatible sanityFetch for older versions

import { client } from './client'

interface SanityFetchOptions {
  query: string;
  params?: Record<string, unknown>;
  tags?: string[];
}

/**
 * Fetch data from Sanity with caching support
 * This is a compatibility wrapper for next-sanity@9.x
 */
export async function sanityFetch<T = unknown>({ 
  query, 
  params = {},
  tags = [] 
}: SanityFetchOptions): Promise<T> {
  return client.fetch<T>(query, params, {
    // Use Next.js cache with revalidation
    next: { 
      revalidate: 60, // Revalidate every 60 seconds
      tags: tags.length > 0 ? tags : ['sanity']
    }
  });
}

/**
 * SanityLive component placeholder
 * Live content API requires next-sanity@10+ and React 19
 * For now, this is a no-op component
 */
export function SanityLive() {
  return null;
}
