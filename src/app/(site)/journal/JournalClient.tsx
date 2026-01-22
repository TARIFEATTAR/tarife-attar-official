"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { urlForImage } from '@/sanity/lib/image';
import { GlobalFooter } from '@/components/navigation';

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

interface Props {
  entries: JournalEntry[];
}

const CATEGORIES = [
  { id: 'all', label: 'All', icon: null },
  { id: 'field-notes', label: 'Field Notes', icon: '📍' },
  { id: 'behind-the-blend', label: 'Behind the Blend', icon: '🧪' },
  { id: 'territory-spotlight', label: 'Territory Spotlight', icon: '🗺️' },
  { id: 'collector-archives', label: 'Collector Archives', icon: '📦' },
];

const TERRITORY_COLORS: Record<string, string> = {
  ember: 'bg-amber-600',
  petal: 'bg-pink-600',
  tidal: 'bg-cyan-600',
  terra: 'bg-emerald-700',
};

export function JournalClient({ entries }: Props) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredEntries = activeCategory === 'all'
    ? entries
    : entries.filter((e) => e.category === activeCategory);

  const featuredEntry = entries.find((e) => e.featured);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-theme-alabaster text-theme-charcoal">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-theme-alabaster/80 backdrop-blur-md border-b border-theme-charcoal/5">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Site</span>
          </button>
          <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-theme-gold">
            The Journal
          </span>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-24 md:pt-32 pb-12 md:pb-16 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-theme-gold block mb-4">
              Field Notes · Stories · Discoveries
            </span>
            <h1 className="text-4xl md:text-6xl font-serif italic tracking-tighter leading-tight mb-6">
              The Journal
            </h1>
            <p className="font-serif text-lg md:text-xl text-theme-charcoal/60 leading-relaxed">
              Dispatches from the field. Behind-the-blend revelations. 
              Territory deep dives. Stories from the archive.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="px-4 md:px-8 pb-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono text-[10px] uppercase tracking-[0.15em] whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-theme-charcoal text-theme-alabaster'
                    : 'bg-theme-charcoal/5 text-theme-charcoal/60 hover:bg-theme-charcoal/10'
                }`}
              >
                {cat.icon && <span>{cat.icon}</span>}
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Entry */}
      {featuredEntry && activeCategory === 'all' && (
        <section className="px-4 md:px-8 pb-12">
          <div className="max-w-[1400px] mx-auto">
            <Link href={`/journal/${featuredEntry.slug.current}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="group grid md:grid-cols-2 gap-8 p-6 md:p-10 bg-theme-charcoal/[0.02] border border-theme-charcoal/5 rounded-2xl hover:bg-theme-charcoal/[0.04] transition-colors"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] md:aspect-[3/2] rounded-xl overflow-hidden bg-theme-charcoal/5">
                  {featuredEntry.coverImage ? (
                    <Image
                      src={urlForImage(featuredEntry.coverImage)?.width(800)?.height(600)?.url() || ''}
                      alt={featuredEntry.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-mono text-xs uppercase tracking-widest opacity-20">Featured</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-theme-gold px-2 py-1 bg-theme-gold/10 rounded">
                      Featured
                    </span>
                    {featuredEntry.territory && (
                      <span className={`w-2 h-2 rounded-full ${TERRITORY_COLORS[featuredEntry.territory] || 'bg-theme-charcoal/20'}`} />
                    )}
                  </div>
                  <h2 className="text-2xl md:text-4xl font-serif italic tracking-tight leading-tight mb-4 group-hover:text-theme-gold transition-colors">
                    {featuredEntry.title}
                  </h2>
                  {featuredEntry.excerpt && (
                    <p className="font-serif text-theme-charcoal/60 leading-relaxed mb-6">
                      {featuredEntry.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-theme-charcoal/40">
                    {featuredEntry.publishedAt && (
                      <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest">
                        <Calendar className="w-3 h-3" />
                        {formatDate(featuredEntry.publishedAt)}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            </Link>
          </div>
        </section>
      )}

      {/* Entries Grid */}
      <section className="px-4 md:px-8 pb-20">
        <div className="max-w-[1400px] mx-auto">
          {filteredEntries.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-serif italic text-xl text-theme-charcoal/40">
                No entries in this category yet.
              </p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-theme-charcoal/30 mt-4">
                New stories coming soon
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEntries
                .filter((e) => activeCategory !== 'all' || !e.featured)
                .map((entry, index) => (
                  <motion.div
                    key={entry._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Link href={`/journal/${entry.slug.current}`} className="group block">
                      {/* Image */}
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-theme-charcoal/5 mb-5">
                        {entry.coverImage ? (
                          <Image
                            src={urlForImage(entry.coverImage)?.width(600)?.height(450)?.url() || ''}
                            alt={entry.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="font-mono text-[9px] uppercase tracking-widest opacity-20">
                              {entry.category?.replace('-', ' ')}
                            </span>
                          </div>
                        )}

                        {/* Territory Badge */}
                        {entry.territory && (
                          <div className="absolute top-3 right-3">
                            <span className={`w-3 h-3 rounded-full block ${TERRITORY_COLORS[entry.territory] || 'bg-theme-charcoal/20'}`} />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div>
                        {entry.category && (
                          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-theme-charcoal/40 block mb-2">
                            {entry.category.replace('-', ' ')}
                          </span>
                        )}
                        <h3 className="text-xl font-serif italic tracking-tight leading-snug mb-3 group-hover:text-theme-gold transition-colors">
                          {entry.title}
                        </h3>
                        {entry.excerpt && (
                          <p className="font-serif text-sm text-theme-charcoal/50 leading-relaxed line-clamp-2 mb-4">
                            {entry.excerpt}
                          </p>
                        )}
                        {entry.publishedAt && (
                          <span className="font-mono text-[9px] uppercase tracking-widest text-theme-charcoal/30">
                            {formatDate(entry.publishedAt)}
                          </span>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))}
            </div>
          )}
        </div>
      </section>

      <GlobalFooter />
    </div>
  );
}
