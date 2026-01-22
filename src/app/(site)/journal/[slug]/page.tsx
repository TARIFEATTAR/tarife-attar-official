import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { sanityFetch } from '@/sanity/lib/client';
import { journalEntryBySlugQuery, allJournalEntriesQuery } from '@/sanity/lib/queries';
import { JournalEntryClient } from './JournalEntryClient';

interface JournalEntry {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  content?: unknown[];
  coverImage?: unknown;
  author?: string;
  publishedAt?: string;
  category?: string;
  territory?: string;
  seoDescription?: string;
  relatedProducts?: unknown[];
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = await sanityFetch<JournalEntry>({
    query: journalEntryBySlugQuery,
    params: { slug },
    tags: ['journal'],
    revalidate: 0,
  });

  if (!entry) {
    return {
      title: 'Entry Not Found | Tarife Attär Journal',
    };
  }

  return {
    title: `${entry.title} | Tarife Attär Journal`,
    description: entry.seoDescription || entry.excerpt || 'A journal entry from the Tarife Attär archive.',
  };
}

export async function generateStaticParams() {
  const entries = await sanityFetch<JournalEntry[]>({
    query: allJournalEntriesQuery,
    tags: ['journal'],
    revalidate: 0,
  });

  return (entries || []).map((entry) => ({
    slug: entry.slug.current,
  }));
}

export default async function JournalEntryPage({ params }: PageProps) {
  const { slug } = await params;
  const entry = await sanityFetch<JournalEntry>({
    query: journalEntryBySlugQuery,
    params: { slug },
    tags: ['journal'],
    revalidate: 0,
  });

  if (!entry) {
    notFound();
  }

  return <JournalEntryClient entry={entry} />;
}
