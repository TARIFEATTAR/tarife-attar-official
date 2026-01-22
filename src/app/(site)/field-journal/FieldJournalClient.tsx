"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Compass } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { urlForImage } from '@/sanity/lib/image';
import { GlobalFooter } from '@/components/navigation';

interface FieldJournalEntry {
    _id: string;
    title: string;
    slug: { current: string };
    subtitle?: string;
    excerpt?: string;
    coverImage?: unknown;
    author?: string;
    publishedAt?: string;
    category?: string;
    territory?: string;
    locationName?: string;
    region?: string;
    season?: string;
}

interface Props {
    entries: FieldJournalEntry[];
}

const TERRITORIES = [
    { id: 'all', label: 'All Territories', icon: '🧭' },
    { id: 'tidal', label: 'Tidal', icon: '🌊', desc: 'Salt. Mist. Open Water.' },
    { id: 'ember', label: 'Ember', icon: '🔥', desc: 'Spice. Warmth. Ancient Routes.' },
    { id: 'petal', label: 'Petal', icon: '🌸', desc: 'Bloom. Herb. Living Gardens.' },
    { id: 'terra', label: 'Terra', icon: '🌲', desc: 'Wood. Oud. Deep Forests.' },
];

const CATEGORIES = [
    { id: 'dispatch', label: 'Field Dispatch', icon: '📡' },
    { id: 'distillation', label: 'Distillation Log', icon: '⚗️' },
    { id: 'material', label: 'Material Study', icon: '🔬' },
    { id: 'territory', label: 'Territory Guide', icon: '🗺️' },
    { id: 'archive', label: 'Archive Note', icon: '📜' },
];

const TERRITORY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
    tidal: { bg: 'bg-cyan-600/10', border: 'border-cyan-600/30', text: 'text-cyan-700' },
    ember: { bg: 'bg-amber-600/10', border: 'border-amber-600/30', text: 'text-amber-700' },
    petal: { bg: 'bg-pink-600/10', border: 'border-pink-600/30', text: 'text-pink-700' },
    terra: { bg: 'bg-emerald-700/10', border: 'border-emerald-700/30', text: 'text-emerald-700' },
};

const AUTHOR_LABELS: Record<string, string> = {
    archivist: 'The Archivist',
    quartermaster: 'The Quartermaster',
    navigator: 'The Navigator',
    correspondent: 'Field Correspondent',
};


export function FieldJournalClient({ entries }: Props) {
    const router = useRouter();
    const [activeTerritory, setActiveTerritory] = useState('all');

    const filteredEntries = activeTerritory === 'all'
        ? entries
        : entries.filter((e) => e.territory === activeTerritory);

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getCategoryInfo = (categoryId?: string) => {
        return CATEGORIES.find(c => c.id === categoryId);
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
                        Field Journal
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
                        className="max-w-3xl"
                    >
                        <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-theme-gold block mb-4">
                            Field Notes · Distillation Logs · Archival Dispatches
                        </span>
                        <h1 className="text-4xl md:text-6xl font-serif italic tracking-tighter leading-tight mb-6">
                            The Field Journal
                        </h1>
                        <p className="font-serif text-lg md:text-xl text-theme-charcoal/60 leading-relaxed">
                            Dispatches from laboratory expeditions. Deep dives into rare materials.
                            Territory guides from the four corners of the olfactory world.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Territory Filter */}
            <section className="px-4 md:px-8 pb-8">
                <div className="max-w-[1400px] mx-auto">
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                        {TERRITORIES.map((territory) => (
                            <button
                                key={territory.id}
                                onClick={() => setActiveTerritory(territory.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-mono text-[10px] uppercase tracking-[0.15em] whitespace-nowrap transition-all ${activeTerritory === territory.id
                                        ? 'bg-theme-charcoal text-theme-alabaster'
                                        : 'bg-theme-charcoal/5 text-theme-charcoal/60 hover:bg-theme-charcoal/10'
                                    }`}
                            >
                                <span>{territory.icon}</span>
                                <span>{territory.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Entries Grid */}
            <section className="px-4 md:px-8 pb-20">
                <div className="max-w-[1400px] mx-auto">
                    {filteredEntries.length === 0 ? (
                        <div className="py-20 text-center">
                            <Compass className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p className="font-serif italic text-xl text-theme-charcoal/40">
                                No dispatches from this territory yet.
                            </p>
                            <p className="font-mono text-[10px] uppercase tracking-widest text-theme-charcoal/30 mt-4">
                                Expeditions in progress
                            </p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-8">
                            {filteredEntries.map((entry, index) => {
                                const territoryStyle = TERRITORY_COLORS[entry.territory || ''] || {};
                                const categoryInfo = getCategoryInfo(entry.category);

                                return (
                                    <motion.div
                                        key={entry._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                    >
                                        <Link href={`/field-journal/${entry.slug.current}`} className="group block">
                                            <article className={`p-6 rounded-2xl border transition-all duration-300 ${territoryStyle.border || 'border-theme-charcoal/10'} ${territoryStyle.bg || 'bg-theme-charcoal/[0.02]'} hover:shadow-lg`}>
                                                {/* Cover Image */}
                                                {entry.coverImage && (
                                                    <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-6">
                                                        <Image
                                                            src={urlForImage(entry.coverImage)?.width(800)?.height(450)?.url() || ''}
                                                            alt={entry.title}
                                                            fill
                                                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                                                        />
                                                    </div>
                                                )}

                                                {/* Meta Row */}
                                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                                    {/* Territory Badge */}
                                                    {entry.territory && (
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[9px] uppercase tracking-[0.15em] ${territoryStyle.bg} ${territoryStyle.text}`}>
                                                            {TERRITORIES.find(t => t.id === entry.territory)?.icon}
                                                            {entry.territory}
                                                        </span>
                                                    )}
                                                    {/* Category */}
                                                    {categoryInfo && (
                                                        <span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.15em] text-theme-charcoal/40">
                                                            {categoryInfo.icon} {categoryInfo.label}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Title & Subtitle */}
                                                <h2 className="text-2xl md:text-3xl font-serif italic tracking-tight leading-tight mb-2 group-hover:text-theme-gold transition-colors">
                                                    {entry.title}
                                                </h2>
                                                {entry.subtitle && (
                                                    <p className="font-serif text-theme-charcoal/50 mb-4">
                                                        {entry.subtitle}
                                                    </p>
                                                )}

                                                {/* Excerpt */}
                                                {entry.excerpt && (
                                                    <p className="font-serif text-sm text-theme-charcoal/60 leading-relaxed line-clamp-2 mb-5">
                                                        {entry.excerpt}
                                                    </p>
                                                )}

                                                {/* Footer Meta */}
                                                <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-theme-charcoal/5 text-theme-charcoal/40">
                                                    {entry.locationName && (
                                                        <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest">
                                                            <MapPin className="w-3 h-3" />
                                                            {entry.locationName}
                                                        </span>
                                                    )}
                                                    {entry.publishedAt && (
                                                        <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest">
                                                            <Calendar className="w-3 h-3" />
                                                            {formatDate(entry.publishedAt)}
                                                        </span>
                                                    )}
                                                    {entry.author && (
                                                        <span className="font-mono text-[9px] uppercase tracking-widest ml-auto">
                                                            {AUTHOR_LABELS[entry.author] || entry.author}
                                                        </span>
                                                    )}
                                                </div>
                                            </article>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            <GlobalFooter />
        </div>
    );
}
