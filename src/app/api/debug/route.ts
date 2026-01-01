import { NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';

/**
 * Debug endpoint to check Sanity connection and environment variables
 * 
 * Access at: /api/debug
 * 
 * This helps verify:
 * - Environment variables are set correctly
 * - Sanity client can connect
 * - Products are being fetched
 */

export async function GET() {
  const env = {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'NOT SET',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'NOT SET',
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || 'NOT SET',
    hasRevalidateSecret: !!process.env.SANITY_REVALIDATE_SECRET,
  };

  // Test Sanity connection
  let sanityTest: { 
    success: boolean; 
    error?: string; 
    productCount?: number;
    publishedCount?: number;
    draftCount?: number;
    atlasCount?: number;
    relicCount?: number;
    products?: Array<{
      _id: string;
      title?: string;
      collectionType?: string;
      isDraft: boolean;
      hasAtmosphere?: boolean;
      hasShopifyVariantId?: boolean;
    }>;
  } = { success: false };
  
  try {
    const publishedCount = await client.fetch(
      `count(*[_type == "product" && !(_id in path("drafts.**"))])`
    );
    
    const draftCount = await client.fetch(
      `count(*[_type == "product" && _id in path("drafts.**")])`
    );
    
    const atlasCount = await client.fetch(
      `count(*[_type == "product" && collectionType == "atlas" && !(_id in path("drafts.**"))])`
    );
    
    const relicCount = await client.fetch(
      `count(*[_type == "product" && collectionType == "relic" && !(_id in path("drafts.**"))])`
    );
    
    const products = await client.fetch(`
      *[_type == "product"] {
        _id,
        title,
        collectionType,
        "isDraft": _id in path("drafts.**"),
        "hasAtmosphere": defined(atlasData.atmosphere),
        "hasShopifyVariantId": defined(shopifyVariantId)
      } | order(_createdAt desc)
    `);
    
    sanityTest = {
      success: true,
      productCount: publishedCount + draftCount,
      publishedCount,
      draftCount,
      atlasCount,
      relicCount,
      products: products.slice(0, 20), // Limit to first 20 for readability
    };
  } catch (error) {
    sanityTest = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    env,
    sanity: sanityTest,
    notes: [
      'If publishedCount is 0, make sure products are PUBLISHED (not just saved as drafts) in Sanity Studio',
      'For Atlas products, make sure "Atmosphere Territory" is selected in the "Collection Data" tab',
      'Check the products array to see which products are drafts vs published',
      'Products with isDraft: true will NOT show on the website',
    ],
  }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
