import { createClient, type QueryParams } from "next-sanity";

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
  useCdn: process.env.NODE_ENV === 'production', // Use CDN in production, direct API in development
});

// Optimized fetch function with caching strategies
export async function sanityFetch<QueryResponse>({
  query,
  params = {},
  revalidate = process.env.NODE_ENV === 'production' ? 60 : 10, // 60s in production, 10s in development
  tags = [],
}: {
  query: string;
  params?: QueryParams;
  revalidate?: number | false;
  tags?: string[];
}): Promise<QueryResponse> {
  return client.fetch<QueryResponse>(query, params, {
    next: {
      revalidate: tags.length ? false : revalidate, // Disable time-based revalidation if using tags
      tags,
    },
  });
}
