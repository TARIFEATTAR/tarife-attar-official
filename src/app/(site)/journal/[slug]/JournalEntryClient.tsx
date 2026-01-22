"use client";

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PortableText } from '@portabletext/react';
import { urlForImage } from '@/sanity/lib/image';
import { GlobalFooter } from '@/components/navigation';

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
  relatedProducts?: unknown[];
}

interface Props {
  entry: JournalEntry;
}

const CATEGORY_LABELS: Record<string, string> = {
  'field-notes': '📍 Field Notes',
  'behind-the-blend': '🧪 Behind the Blend',
  'territory-spotlight': '🗺️ Territory Spotlight',
  'collector-archives': '📦 Collector Archives',
};

const TERRITORY_COLORS: Record<string, { bg: string; text: string }> = {
  ember: { bg: 'bg-amber-600', text: 'Ember' },
  petal: { bg: 'bg-pink-600', text: 'Petal' },
  tidal: { bg: 'bg-cyan-600', text: 'Tidal' },
  terra: { bg: 'bg-emerald-700', text: 'Terra' },
};

// Custom Portable Text components
const portableTextComponents = {
  types: {
    image: ({ value }: { value?: { asset?: { _ref?: string }; alt?: string; caption?: string } }) => {
      if (!value?.asset?._ref) {
        return null;
      }
      return (
        <figure className="my-10">
          <div className="relative aspect-[16/10] rounded-xl overflow-hidden">
            <Image
              src={urlForImage(value)?.width(1200)?.url() || ''}
              alt={value.alt || 'Journal image'}
              fill
              className="object-cover"
            />
          </div>
          {value.caption && (
            <figcaption className="mt-3 font-mono text-[10px] uppercase tracking-widest text-theme-charcoal/40 text-center">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },
  block: {
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="text-3xl font-serif italic tracking-tight mt-12 mb-6">{children}</h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="text-2xl font-serif italic tracking-tight mt-10 mb-4">{children}</h3>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="my-8 pl-6 border-l-2 border-theme-gold/40 font-serif italic text-xl text-theme-charcoal/70">
        {children}
      </blockquote>
    ),
    normal: ({ children }: { children?: React.ReactNode }) => (
      <p className="mb-6 font-serif text-lg leading-relaxed text-theme-charcoal/80">{children}</p>
    ),
  },
  marks: {
    link: ({ children, value }: { children?: React.ReactNode; value?: { href?: string } }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-theme-gold hover:underline"
      >
        {children}
      </a>
    ),
  },
};

export function JournalEntryClient({ entry }: Props) {
  const router = useRouter();

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
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/journal')}
            className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Journal</span>
          </button>
          <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-theme-gold">
            {entry.category ? CATEGORY_LABELS[entry.category]?.replace(/^[^\s]+\s/, '') : 'Journal'}
          </span>
        </div>
      </header>

      {/* Hero */}
      <article className="pt-24 md:pt-32">
        {/* Cover Image */}
        {entry.coverImage && (
          <div className="relative h-[40vh] md:h-[50vh] mb-12">
            <Image
              src={urlForImage(entry.coverImage)?.width(1600)?.height(900)?.url() || ''}
              alt={entry.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-theme-alabaster via-transparent to-transparent" />
          </div>
        )}

        {/* Meta & Title */}
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Category & Territory */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {entry.category && (
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-theme-charcoal/50">
                  {CATEGORY_LABELS[entry.category] || entry.category}
                </span>
              )}
              {entry.territory && (
                <span className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${TERRITORY_COLORS[entry.territory]?.bg || 'bg-theme-charcoal/20'}`} />
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-theme-charcoal/50">
                    {TERRITORY_COLORS[entry.territory]?.text || entry.territory}
                  </span>
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif italic tracking-tighter leading-tight mb-8">
              {entry.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-6 text-theme-charcoal/50 pb-8 border-b border-theme-charcoal/10">
              {entry.author && (
                <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest">
                  <User className="w-3.5 h-3.5" />
                  {entry.author}
                </span>
              )}
              {entry.publishedAt && (
                <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(entry.publishedAt)}
                </span>
              )}
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="py-12"
          >
            {entry.content && entry.content.length > 0 ? (
              <PortableText value={entry.content} components={portableTextComponents} />
            ) : (
              <p className="font-serif italic text-xl text-theme-charcoal/40 text-center py-12">
                Content coming soon...
              </p>
            )}
          </motion.div>

          {/* Related Products */}
          {entry.relatedProducts && entry.relatedProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="py-12 border-t border-theme-charcoal/10"
            >
              <h3 className="font-mono text-[11px] uppercase tracking-[0.3em] text-theme-charcoal/40 mb-8">
                Featured in This Story
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {entry.relatedProducts.map((product: { _id: string; slug?: { current?: string }; title?: string; mainImage?: unknown; collectionType?: string; price?: number }) => (
                  <Link
                    key={product._id}
                    href={`/product/${product.slug?.current}`}
                    className="group"
                  >
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-theme-charcoal/5 mb-3">
                      {product.mainImage ? (
                        <Image
                          src={urlForImage(product.mainImage)?.width(400)?.height(400)?.url() || ''}
                          alt={product.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="font-mono text-[8px] uppercase tracking-widest opacity-20">
                            {product.collectionType}
                          </span>
                        </div>
                      )}
                    </div>
                    <h4 className="font-serif italic text-sm group-hover:text-theme-gold transition-colors">
                      {product.title}
                    </h4>
                    {product.price && (
                      <span className="font-mono text-[10px] uppercase tracking-widest text-theme-charcoal/40">
                        ${product.price}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}

          {/* Back to Journal */}
          <div className="py-12 text-center">
            <Link
              href="/journal"
              className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-theme-charcoal/50 hover:text-theme-gold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Journal
            </Link>
          </div>
        </div>
      </article>

      <GlobalFooter />
    </div>
  );
}
