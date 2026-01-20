import { Metadata } from 'next';
import { sanityFetch } from '@/sanity/lib/client';
import { allFieldJournalEntriesQuery } from '@/sanity/lib/queries';
import { FieldJournalClient } from './FieldJournalClient';

export const metadata: Metadata = {
    title: 'Field Journal | Tarife Attär',
    description: 'Field notes, distillation logs, and archival dispatches from laboratory expeditions. Explore rare materials and territory guides from the olfactory world.',
    openGraph: {
        title: 'Field Journal | Tarife Attär',
        description: 'Field notes, distillation logs, and archival dispatches from laboratory expeditions.',
        type: 'website',
    },
};

interface FieldJournalEntry {
    _id: string;
    title: string;
    slug: { current: string };
    subtitle?: string;
    excerpt?: string;
    coverImage?: any;
    author?: string;
    publishedAt?: string;
    category?: string;
    territory?: string;
    locationName?: string;
    region?: string;
    season?: string;
}

export default async function FieldJournalPage() {
    const entries = await sanityFetch<FieldJournalEntry[]>({
        query: allFieldJournalEntriesQuery,
        tags: ['fieldJournal'],
        revalidate: 0,
    }) || [];

    return <FieldJournalClient entries={entries} />;
}
