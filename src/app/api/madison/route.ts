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
 * 
 * This endpoint allows Madison Studio to push AI-generated content drafts
 * directly to the Tarife Attär Sanity "Inbox".
 */

export async function POST(req: NextRequest) {
    try {
        // 1. Basic Security Check
        const authHeader = req.headers.get('Authorization');
        const secret = process.env.MADISON_API_SECRET;

        // In dev, we might want to skip this or use a default
        if (secret && authHeader !== `Bearer ${secret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { type, data } = body;

        if (!type || !data) {
            return NextResponse.json({ error: 'Missing type or data' }, { status: 400 });
        }

        let draftId: string;

        // 2. Route to appropriate push function
        switch (type) {
            case 'product':
            case 'atlas':
            case 'relic':
                draftId = await pushDraft(data as MadisonPayload);
                break;

            case 'journal':
            case 'blog':
            case 'blog_article':
                draftId = await pushJournalEntry(data as JournalPayload);
                break;

            case 'fieldJournal':
            case 'editorial':
            case 'field_journal':
                draftId = await pushFieldJournal(data as FieldJournalPayload);
                break;

            default:
                return NextResponse.json({ error: `Unsupported content type: ${type}` }, { status: 400 });
        }

        // 3. Success Response
        return NextResponse.json({
            success: true,
            message: `${type} draft created successfully`,
            draftId,
            studioUrl: `https://${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}.sanity.studio/desk/inbox;${draftId}`
        });

    } catch (error) {
        console.error('Madison API Error:', error);
        return NextResponse.json({
            error: 'Failed to process Madison Studio request',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
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
    });
}
