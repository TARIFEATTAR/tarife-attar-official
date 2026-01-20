"use client";

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, User, Navigation, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PortableText } from '@portabletext/react';
import { urlForImage } from '@/sanity/lib/image';
import { GlobalFooter } from '@/components/navigation';

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

interface FeaturedProduct {
    _id: string;
    title: string;
    slug: { current: string };
    mainImage?: any;
    price?: number;
    collectionType?: string;
    atmosphere?: string;
}

interface RelatedEntry {
    _id: string;
    title: string;
    slug: { current: string };
    excerpt?: string;
    coverImage?: any;
    territory?: string;
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
    featuredProducts?: FeaturedProduct[];
    relatedEntries?: RelatedEntry[];
}

interface Props {
    entry: FieldJournalEntry;
}

const TERRITORY_STYLES: Record<string, { icon: string; label: string; color: string; bg: string }> = {
    tidal: { icon: '🌊', label: 'Tidal', color: 'text-cyan-700', bg: 'bg-cyan-600/10' },
    ember: { icon: '🔥', label: 'Ember', color: 'text-amber-700', bg: 'bg-amber-600/10' },
    petal: { icon: '🌸', label: 'Petal', color: 'text-pink-700', bg: 'bg-pink-600/10' },
    terra: { icon: '🌲', label: 'Terra', color: 'text-emerald-700', bg: 'bg-emerald-700/10' },
};

const AUTHOR_LABELS: Record<string, string> = {
    archivist: 'The Archivist',
    quartermaster: 'The Quartermaster',
    navigator: 'The Navigator',
    correspondent: 'Field Correspondent',
};

const CATEGORY_LABELS: Record<string, { icon: string; label: string }> = {
    dispatch: { icon: '📡', label: 'Field Dispatch' },
    distillation: { icon: '⚗️', label: 'Distillation Log' },
    material: { icon: '🔬', label: 'Material Study' },
    territory: { icon: '🗺️', label: 'Territory Guide' },
    archive: { icon: '📜', label: 'Archive Note' },
};

const SEASON_LABELS: Record<string, string> = {
    spring: 'Spring Equinox',
    summer: 'Summer Solstice',
    autumn: 'Autumn Equinox',
    winter: 'Winter Solstice',
};

// Custom Portable Text components for rich content rendering
const portableTextComponents = {
    types: {
        image: ({ value }: any) => {
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
        h2: ({ children }: any) => (
            <h2 className="text-3xl font-serif italic tracking-tight mt-12 mb-6">{children}</h2>
        ),
        h3: ({ children }: any) => (
            <h3 className="text-2xl font-serif italic tracking-tight mt-10 mb-4">{children}</h3>
        ),
        blockquote: ({ children }: any) => (
            <blockquote className="my-8 pl-6 border-l-2 border-theme-gold/40 font-serif italic text-xl text-theme-charcoal/70">
                {children}
            </blockquote>
        ),
        normal: ({ children }: any) => (
            <p className="mb-6 font-serif text-lg leading-relaxed text-theme-charcoal/80">{children}</p>
        ),
    },
    marks: {
        strong: ({ children }: any) => (
            <strong className="font-semibold text-theme-charcoal">{children}</strong>
        ),
        em: ({ children }: any) => (
            <em className="italic">{children}</em>
        ),
        link: ({ children, value }: any) => (
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

export function FieldJournalEntryClient({ entry }: Props) {
    const router = useRouter();

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const territoryStyle = TERRITORY_STYLES[entry.expeditionData?.territory || ''];
    const categoryInfo = CATEGORY_LABELS[entry.category || ''];

    return (
        <div className="min-h-screen bg-theme-alabaster text-theme-charcoal">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-theme-alabaster/80 backdrop-blur-md border-b border-theme-charcoal/5">
                <div className="max-w-4xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
                    <button
                        onClick={() => router.push('/field-journal')}
                        className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Back to Journal</span>
                    </button>
                    <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-theme-gold">
                        {categoryInfo?.label || 'Field Journal'}
                    </span>
                </div>
            </header>

            <article className="pt-24 md:pt-32">
                {/* Cover Image */}
                {entry.coverImage && (
                    <div className="relative h-[40vh] md:h-[50vh] mb-12">
                        <Image
                            src={urlForImage(entry.coverImage)?.width(1600)?.height(900)?.url() || ''}
                            alt={entry.coverImage.alt || entry.title}
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-theme-alabaster via-transparent to-transparent" />
                    </div>
                )}

                {/* Content Container */}
                <div className="max-w-3xl mx-auto px-4 md:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        {/* Expedition Data Header */}
                        {entry.expeditionData && (
                            <div className={`inline-flex flex-wrap items-center gap-3 px-4 py-3 rounded-xl mb-8 ${territoryStyle?.bg || 'bg-theme-charcoal/5'}`}>
                                {territoryStyle && (
                                    <span className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.15em] ${territoryStyle.color}`}>
                                        {territoryStyle.icon} {territoryStyle.label} Territory
                                    </span>
                                )}
                                {entry.expeditionData.locationName && (
                                    <>
                                        <span className="text-theme-charcoal/20">•</span>
                                        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-theme-charcoal/50">
                                            <MapPin className="w-3 h-3" />
                                            {entry.expeditionData.locationName}
                                        </span>
                                    </>
                                )}
                                {entry.expeditionData.gpsCoordinates?.display && (
                                    <>
                                        <span className="text-theme-charcoal/20">•</span>
                                        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-theme-charcoal/40">
                                            <Navigation className="w-3 h-3" />
                                            {entry.expeditionData.gpsCoordinates.display}
                                        </span>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Category Badge */}
                        {categoryInfo && (
                            <div className="flex items-center gap-2 mb-4">
                                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-theme-charcoal/50">
                                    {categoryInfo.icon} {categoryInfo.label}
                                </span>
                            </div>
                        )}

                        {/* Title */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif italic tracking-tighter leading-tight mb-4">
                            {entry.title}
                        </h1>

                        {/* Subtitle */}
                        {entry.subtitle && (
                            <p className="text-xl md:text-2xl font-serif text-theme-charcoal/60 mb-8">
                                {entry.subtitle}
                            </p>
                        )}

                        {/* Meta */}
                        <div className="flex flex-wrap items-center gap-6 text-theme-charcoal/50 pb-8 border-b border-theme-charcoal/10">
                            {entry.author && (
                                <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest">
                                    <User className="w-3.5 h-3.5" />
                                    {AUTHOR_LABELS[entry.author] || entry.author}
                                </span>
                            )}
                            {entry.publishedAt && (
                                <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {formatDate(entry.publishedAt)}
                                </span>
                            )}
                            {entry.expeditionData?.season && (
                                <span className="font-mono text-[10px] uppercase tracking-widest">
                                    {SEASON_LABELS[entry.expeditionData.season] || entry.expeditionData.season}
                                </span>
                            )}
                        </div>
                    </motion.div>

                    {/* Body Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="py-12"
                    >
                        {entry.body && entry.body.length > 0 ? (
                            <PortableText value={entry.body} components={portableTextComponents} />
                        ) : (
                            <p className="font-serif italic text-xl text-theme-charcoal/40 text-center py-12">
                                Content coming soon...
                            </p>
                        )}
                    </motion.div>

                    {/* Keywords / Tags */}
                    {entry.seo?.keywords && entry.seo.keywords.length > 0 && (
                        <div className="py-8 border-t border-theme-charcoal/10">
                            <div className="flex flex-wrap gap-2">
                                {entry.seo.keywords.map((keyword, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1.5 rounded-full bg-theme-charcoal/5 font-mono text-[9px] uppercase tracking-widest text-theme-charcoal/50"
                                    >
                                        {keyword}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Featured Products */}
                    {entry.featuredProducts && entry.featuredProducts.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="py-12 border-t border-theme-charcoal/10"
                        >
                            <h3 className="font-mono text-[11px] uppercase tracking-[0.3em] text-theme-charcoal/40 mb-8">
                                Featured in This Dispatch
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                {entry.featuredProducts.map((product) => (
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

                    {/* Related Entries */}
                    {entry.relatedEntries && entry.relatedEntries.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="py-12 border-t border-theme-charcoal/10"
                        >
                            <h3 className="font-mono text-[11px] uppercase tracking-[0.3em] text-theme-charcoal/40 mb-8">
                                Related Dispatches
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                {entry.relatedEntries.map((related) => {
                                    const relatedTerritoryStyle = TERRITORY_STYLES[related.territory || ''];
                                    return (
                                        <Link
                                            key={related._id}
                                            href={`/field-journal/${related.slug?.current}`}
                                            className="group flex gap-4 p-4 rounded-xl border border-theme-charcoal/10 hover:border-theme-gold/30 transition-colors"
                                        >
                                            {related.coverImage && (
                                                <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                                                    <Image
                                                        src={urlForImage(related.coverImage)?.width(200)?.height(200)?.url() || ''}
                                                        alt={related.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                {relatedTerritoryStyle && (
                                                    <span className={`inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest mb-2 ${relatedTerritoryStyle.color}`}>
                                                        {relatedTerritoryStyle.icon} {relatedTerritoryStyle.label}
                                                    </span>
                                                )}
                                                <h4 className="font-serif italic text-lg group-hover:text-theme-gold transition-colors line-clamp-2">
                                                    {related.title}
                                                </h4>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {/* Back to Journal */}
                    <div className="py-12 text-center">
                        <Link
                            href="/field-journal"
                            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-theme-charcoal/50 hover:text-theme-gold transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Field Journal
                        </Link>
                    </div>
                </div>
            </article>

            <GlobalFooter />
        </div>
    );
}
