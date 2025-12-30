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
  let sanityTest: { success: boolean; error?: string; productCount?: number } = { success: false };
  
  try {
    const allProducts = await client.fetch(
      `count(*[_type == "product" && !(_id in path("drafts.**"))])`
    );
    
    sanityTest = {
      success: true,
      productCount: allProducts,
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
    note: 'If productCount is 0, make sure products are PUBLISHED (not just saved as drafts) in Sanity Studio',
  }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
