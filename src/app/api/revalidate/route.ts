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
    // Sanity webhooks send an array of mutations
    const body = await request.json();
    const mutations = Array.isArray(body) ? body : body.mutations || [body];

    // Track what needs revalidation
    let hasProducts = false;
    let hasExhibits = false;
    let hasJournal = false;
    let hasFieldJournal = false;
    const productSlugs: string[] = [];
    const exhibitSlugs: string[] = [];
    const journalSlugs: string[] = [];
    const fieldJournalSlugs: string[] = [];

    // Process each mutation
    for (const mutation of mutations) {
      const doc = mutation.result || mutation.after || mutation;
      const _type = doc._type;
      const slug = doc.slug?.current;

      if (_type === 'product') {
        hasProducts = true;
        if (slug) productSlugs.push(slug);
      } else if (_type === 'exhibit') {
        hasExhibits = true;
        if (slug) exhibitSlugs.push(slug);
      } else if (_type === 'journalEntry') {
        hasJournal = true;
        if (slug) journalSlugs.push(slug);
      } else if (_type === 'fieldJournal') {
        hasFieldJournal = true;
        if (slug) fieldJournalSlugs.push(slug);
      }
    }

    // Revalidate based on document types found
    if (hasProducts) {
      // Revalidate product tags
      revalidateTag('atlas-products');
      revalidateTag('relic-products');
      revalidateTag('atlas-counts');
      revalidateTag('featured-products');

      // Revalidate specific product pages
      for (const slug of productSlugs) {
        revalidatePath(`/product/${slug}`);
      }

      // Revalidate collection pages
      revalidatePath('/atlas');
      revalidatePath('/relic');
      revalidatePath('/'); // Homepage (if showing featured products)

      return NextResponse.json({
        revalidated: true,
        message: `Products revalidated: ${productSlugs.length > 0 ? productSlugs.join(', ') : 'all products'}`,
        timestamp: new Date().toISOString(),
      });
    }

    if (hasExhibits) {
      revalidateTag('exhibits');
      for (const slug of exhibitSlugs) {
        revalidatePath(`/journal/${slug}`);
      }
      revalidatePath('/journal');

      return NextResponse.json({
        revalidated: true,
        message: `Exhibits revalidated: ${exhibitSlugs.length > 0 ? exhibitSlugs.join(', ') : 'all exhibits'}`,
        timestamp: new Date().toISOString(),
      });
    }

    if (hasJournal) {
      revalidateTag('journal');
      for (const slug of journalSlugs) {
        revalidatePath(`/journal/${slug}`);
      }
      revalidatePath('/journal');

      return NextResponse.json({
        revalidated: true,
        message: `Journal entries revalidated: ${journalSlugs.length > 0 ? journalSlugs.join(', ') : 'all journal entries'}`,
        timestamp: new Date().toISOString(),
      });
    }

    if (hasFieldJournal) {
      revalidateTag('fieldJournal');
      for (const slug of fieldJournalSlugs) {
        revalidatePath(`/field-journal/${slug}`);
      }
      revalidatePath('/field-journal');

      return NextResponse.json({
        revalidated: true,
        message: `Field Journal entries revalidated: ${fieldJournalSlugs.length > 0 ? fieldJournalSlugs.join(', ') : 'all field journal entries'}`,
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
