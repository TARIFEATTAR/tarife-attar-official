import { NextRequest, NextResponse } from 'next/server';

/**
 * Omnisend Email Subscription API
 * 
 * Handles email signups from:
 * - Territory Quiz (with territory tag)
 * - Save Your Satchel (with cart abandonment tag)
 * - Footer newsletter
 */

const OMNISEND_API_KEY = process.env.OMNISEND_API_KEY;
const OMNISEND_API_URL = 'https://api.omnisend.com/v3/contacts';

interface SubscribeRequest {
  email: string;
  firstName?: string;
  source: 'quiz' | 'satchel' | 'newsletter';
  territory?: 'ember' | 'petal' | 'tidal' | 'terra';
  cartItems?: Array<{
    title: string;
    price: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body: SubscribeRequest = await request.json();
    const { email, firstName, source, territory, cartItems } = body;

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Validate source
    if (!source || !['quiz', 'satchel', 'newsletter'].includes(source)) {
      return NextResponse.json(
        { error: 'Valid source is required (quiz, satchel, or newsletter)' },
        { status: 400 }
      );
    }

    // Check API key
    if (!OMNISEND_API_KEY) {
      console.error('OMNISEND_API_KEY not configured');
      // Still return success to user, but log the error
      return NextResponse.json(
        { success: true, message: 'Subscription received' },
        { status: 200 }
      );
    }

    // Build tags based on source
    const tags: string[] = [`source:${source}`, 'tarife-attar'];
    
    if (source === 'quiz' && territory) {
      tags.push(`territory:${territory}`);
      tags.push('quiz-completed');
    }
    
    if (source === 'satchel') {
      tags.push('satchel-abandonment');
      if (cartItems && cartItems.length > 0) {
        tags.push(`cart-items:${cartItems.length}`);
      }
    }

    if (source === 'newsletter') {
      tags.push('newsletter-signup');
    }

    // Build custom properties
    const customProperties: Record<string, string> = {
      signupSource: source,
      signupDate: new Date().toISOString(),
    };

    if (territory) {
      customProperties.territory = territory;
      customProperties.territoryName = territory.charAt(0).toUpperCase() + territory.slice(1);
    }

    if (cartItems && cartItems.length > 0) {
      customProperties.cartContents = cartItems.map(item => item.title).join(', ');
      customProperties.cartTotal = cartItems.reduce((sum, item) => sum + parseFloat(item.price || '0'), 0).toFixed(2);
    }

    // Create/update contact in Omnisend
    const omnisendPayload: Record<string, unknown> = {
      identifiers: [
        {
          type: 'email',
          id: email.toLowerCase(),
          channels: {
            email: {
              status: 'subscribed',
              statusDate: new Date().toISOString(),
            },
          },
        },
      ],
      tags,
      customProperties,
    };

    // Add first name if provided
    if (firstName) {
      omnisendPayload.firstName = firstName;
    }

    const response = await fetch(OMNISEND_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': OMNISEND_API_KEY,
      },
      body: JSON.stringify(omnisendPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Omnisend API error:', response.status, errorText);
      
      // Still return success to user - don't block UX for API issues
      return NextResponse.json(
        { success: true, message: 'Subscription received' },
        { status: 200 }
      );
    }

    const result = await response.json();
    console.log('✅ Omnisend subscription successful:', email, tags);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Successfully subscribed',
        contactId: result.contactID,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Subscription error:', error);
    
    // Return success to user even on error - don't block UX
    return NextResponse.json(
      { success: true, message: 'Subscription received' },
      { status: 200 }
    );
  }
}
