import { Metadata } from 'next';
import { sanityFetch } from '@/sanity/lib/client';
import { allJournalEntriesQuery } from '@/sanity/lib/queries';
import { JournalClient } from './JournalClient';

export const metadata: Metadata = {
  title: 'The Journal | Tarife Attär',
  description: 'Field notes, behind-the-blend stories, and territory spotlights from the Tarife Attär archive.',
};

interface JournalEntry {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  coverImage?: unknown;
  author?: string;
  publishedAt?: string;
  category?: string;
  territory?: string;
  featured?: boolean;
}

export default async function JournalPage() {
  const entries = await sanityFetch<JournalEntry[]>({
    query: allJournalEntriesQuery,
    tags: ['journal'],
    revalidate: 0,
  }) || [];

  return <JournalClient entries={entries} />;
}
