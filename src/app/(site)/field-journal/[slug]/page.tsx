import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { sanityFetch } from '@/sanity/lib/client';
import { fieldJournalBySlugQuery, allFieldJournalEntriesQuery } from '@/sanity/lib/queries';
import { FieldJournalEntryClient } from './FieldJournalEntryClient';

interface ExpeditionData {
    territory?: string;
    locationName?: string;
    gpsCoordinates?: {
        latitude?: number;
        longitude?: number;
        display?: string;
    };
    region?: string;
    season?: string;
}

interface SEOData {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: any;
    keywords?: string[];
    canonicalUrl?: string;
}

interface FieldJournalEntry {
    _id: string;
    title: string;
    slug: { current: string };
    subtitle?: string;
    excerpt?: string;
    body?: any[];
    coverImage?: any;
    author?: string;
    publishedAt?: string;
    category?: string;
    expeditionData?: ExpeditionData;
    seo?: SEOData;
    featuredProducts?: any[];
    relatedEntries?: any[];
}

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const entry = await sanityFetch<FieldJournalEntry>({
        query: fieldJournalBySlugQuery,
        params: { slug },
        tags: ['fieldJournal'],
        revalidate: 0,
    });

    if (!entry) {
        return {
            title: 'Entry Not Found | Tarife Attär Field Journal',
        };
    }

    const title = entry.seo?.metaTitle || `${entry.title} | Tarife Attär Field Journal`;
    const description = entry.seo?.metaDescription || entry.excerpt || 'A dispatch from the Tarife Attär field journal.';

    return {
        title,
        description,
        keywords: entry.seo?.keywords,
        openGraph: {
            title,
            description,
            type: 'article',
            publishedTime: entry.publishedAt,
            authors: entry.author ? [entry.author] : undefined,
        },
        alternates: entry.seo?.canonicalUrl ? {
            canonical: entry.seo.canonicalUrl,
        } : undefined,
    };
}

export async function generateStaticParams() {
    const entries = await sanityFetch<FieldJournalEntry[]>({
        query: allFieldJournalEntriesQuery,
        tags: ['fieldJournal'],
        revalidate: 0,
    });

    return (entries || []).map((entry) => ({
        slug: entry.slug.current,
    }));
}

export default async function FieldJournalEntryPage({ params }: PageProps) {
    const { slug } = await params;
    const entry = await sanityFetch<FieldJournalEntry>({
        query: fieldJournalBySlugQuery,
        params: { slug },
        tags: ['fieldJournal'],
        revalidate: 0,
    });

    if (!entry) {
        notFound();
    }

    return <FieldJournalEntryClient entry={entry} />;
}
