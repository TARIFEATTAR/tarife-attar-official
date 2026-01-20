import { NextRequest, NextResponse } from 'next/server';
import {
    pushDraft,
    pushJournalEntry,
    pushFieldJournal,
    type MadisonPayload,
    type JournalPayload,
    type FieldJournalPayload
} from '@/lib/madison';

/**
 * Madison Studio Integration Endpoint
 */

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
    try {
        // 1. Basic Security Check
        const authHeader = req.headers.get('Authorization');
        const secret = process.env.MADISON_API_SECRET;

        console.log(`[Madison] Incoming request with Content-Type: ${req.headers.get('content-type')}`);

        if (!secret) {
            console.error('[Madison] CRITICAL: MADISON_API_SECRET is missing from environment variables');
            return NextResponse.json({
                success: false,
                error: 'Server configuration error',
                details: 'API Secret not configured'
            }, { status: 200, headers: CORS_HEADERS });
        }

        console.log(`[Madison] Server secret configured (starts with: ${secret.substring(0, 4)}...)`);

        // Handle Bearer or plain token
        const providedToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

        if (providedToken !== secret) {
            console.warn(`[Madison] Unauthorized. Provided: ${providedToken?.substring(0, 4)}...`);
            return NextResponse.json({
                success: false,
                error: 'Unauthorized',
                details: 'Invalid or missing API secret'
            }, { status: 200, headers: CORS_HEADERS });
        }

        let body;
        try {
            body = await req.json();
        } catch (e) {
            console.error('[Madison] Failed to parse JSON body');
            return NextResponse.json({
                success: false,
                error: 'Invalid JSON',
                details: 'Request body must be valid JSON'
            }, { status: 200, headers: CORS_HEADERS });
        }

        const { type, data } = body;

        console.log(`[Madison] Received push request of type: ${type}`);
        console.log(`[Madison] Data:`, JSON.stringify(data, null, 2).slice(0, 500) + '...');

        if (!type || !data) {
            console.error('[Madison] Missing type or data in payload');
            return NextResponse.json({
                success: false,
                error: 'Missing type or data'
            }, { status: 200, headers: CORS_HEADERS });
        }

        let draftId: string;

        // 2. Route to appropriate push function
        switch (type) {
            case 'product':
            case 'atlas':
            case 'relic':
                console.log('[Madison] Routing to pushDraft');
                draftId = await pushDraft(data as MadisonPayload);
                break;

            case 'journal':
            case 'blog':
            case 'blog_article':
                console.log('[Madison] Routing to pushJournalEntry');
                draftId = await pushJournalEntry(data as JournalPayload);
                break;

            case 'fieldJournal':
            case 'editorial':
            case 'field_journal':
                console.log('[Madison] Routing to pushFieldJournal');
                draftId = await pushFieldJournal(data as FieldJournalPayload);
                break;

            default:
                console.error(`[Madison] Unsupported content type: ${type}`);
                return NextResponse.json({
                    success: false,
                    error: `Unsupported content type: ${type}`
                }, { status: 200, headers: CORS_HEADERS });
        }

        // 3. Success Response
        console.log(`[Madison] Request processed successfully. Draft ID: ${draftId}`);
        return NextResponse.json({
            success: true,
            message: `${type} draft created successfully`,
            draftId,
            studioUrl: `https://${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}.sanity.studio/desk/inbox;${draftId}`
        }, { headers: CORS_HEADERS });

    } catch (error) {
        console.error('[Madison API Error]:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to process Madison Studio request',
            details: error instanceof Error ? error.message : 'Unknown error',
            stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
        }, { status: 200, headers: CORS_HEADERS });
    }
}

/**
 * Health check for Madison Studio
 */
export async function GET() {
    return NextResponse.json({
        status: 'active',
        version: '1.0.0',
        capabilities: ['product', 'journal', 'fieldJournal'],
        inboxUrl: `https://${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}.sanity.studio/desk/inbox`
    }, { headers: CORS_HEADERS });
}
