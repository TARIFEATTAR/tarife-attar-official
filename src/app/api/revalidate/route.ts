import { revalidateTag, revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Sanity Webhook Revalidation
 * 
 * This endpoint receives webhooks from Sanity when content is published/updated.
 * It revalidates the Next.js cache so changes appear instantly on production.
 * 
 * Setup in Sanity:
 * 1. Go to https://sanity.io/manage
 * 2. Select your project
 * 3. Go to API → Webhooks
 * 4. Create new webhook:
 *    - URL: https://your-domain.com/api/revalidate
 *    - Dataset: production
 *    - Trigger on: Create, Update, Delete
 *    - Filter: _type == "product" || _type == "exhibit"
 *    - Secret: (generate a random string, add to Vercel env vars)
 */

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret (optional but recommended)
    const secret = request.headers.get('x-sanity-secret');
    const expectedSecret = process.env.SANITY_REVALIDATE_SECRET;

    if (expectedSecret && secret !== expectedSecret) {
      return NextResponse.json(
        { message: 'Invalid secret' },
        { status: 401 }
      );
    }

    // Parse webhook payload
    const body = await request.json();
    const { _type, slug } = body;

    // Revalidate based on document type
    if (_type === 'product') {
      // Revalidate product tags
      revalidateTag('atlas-products');
      revalidateTag('relic-products');
      revalidateTag('atlas-counts');
      revalidateTag('featured-products');

      // Revalidate product pages
      if (slug?.current) {
        revalidatePath(`/product/${slug.current}`);
      }

      // Revalidate collection pages
      revalidatePath('/atlas');
      revalidatePath('/relic');
      revalidatePath('/'); // Homepage (if showing featured products)

      return NextResponse.json({
        revalidated: true,
        message: `Product ${slug?.current || 'updated'} revalidated`,
        timestamp: new Date().toISOString(),
      });
    }

    if (_type === 'exhibit') {
      revalidateTag('exhibits');
      if (slug?.current) {
        revalidatePath(`/journal/${slug.current}`);
      }
      revalidatePath('/journal');

      return NextResponse.json({
        revalidated: true,
        message: `Exhibit ${slug?.current || 'updated'} revalidated`,
        timestamp: new Date().toISOString(),
      });
    }

    // Default: revalidate all
    revalidatePath('/', 'layout');
    return NextResponse.json({
      revalidated: true,
      message: 'All pages revalidated',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { message: 'Error revalidating', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Allow GET for testing
export async function GET() {
  return NextResponse.json({
    message: 'Sanity revalidation webhook endpoint',
    status: 'active',
    timestamp: new Date().toISOString(),
  });
}
