"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GlobalFooter } from "@/components/navigation";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { urlForImage } from "@/sanity/lib/image";
import { getItemLabel } from "@/lib/brandSystem";
import { LegacyName } from "@/components/product/LegacyName";

// Territory-based pricing for Atlas Collection (same as ProductDetailClient)
const TERRITORY_PRICING: Record<string, { '6ml': number; '12ml': number }> = {
  ember: { '6ml': 28, '12ml': 48 },
  petal: { '6ml': 30, '12ml': 50 },
  tidal: { '6ml': 30, '12ml': 50 },
  terra: { '6ml': 33, '12ml': 55 },
};

// Helper to format price range for display
const getTerritoryPriceRange = (territoryId: string): string => {
  const pricing = TERRITORY_PRICING[territoryId];
  if (!pricing) return '';
  return `$${pricing['6ml']} – $${pricing['12ml']}`;
};

// Helper to get starting price for a territory
const getTerritoryStartingPrice = (territoryId: string): number | null => {
  const pricing = TERRITORY_PRICING[territoryId];
  return pricing ? pricing['6ml'] : null;
};

interface Territory {
  id: string;
  name: string;
  tagline: string;
  description: string;
  color: string;
  count: number;
  products: Array<{
    _id: string;
    title: string;
    slug: { current: string };
    price?: number;
    volume?: string;
    productFormat?: string;
    mainImage?: any;
    fieldReport?: {
      image?: any;
    };
    inStock?: boolean;
    legacyName?: string;
    showLegacyName?: boolean;
    legacyNameStyle?: 'formerly' | 'once-known' | 'previously';
    scentProfile?: string;
  }>;
}

interface Props {
  territories: Territory[];
  totalCount: number;
}

export function AtlasClient({ territories, totalCount }: Props) {
  const router = useRouter();
  const [activeTerritory, setActiveTerritory] = useState<string | null>(null);

  const handleNavigate = (path: string) => {
    if (path === "home") router.push("/");
    else router.push(`/${path}`);
  };

  return (
    <div className="min-h-screen bg-theme-alabaster text-theme-charcoal overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-theme-alabaster/80 backdrop-blur-md border-b border-theme-charcoal/5 overflow-hidden">
        <div className="max-w-[1800px] mx-auto px-4 md:px-24 py-4 md:py-6 flex items-center justify-between min-w-0">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 md:gap-3 font-mono text-[10px] md:text-sm uppercase tracking-widest opacity-80 hover:opacity-100 transition-opacity flex-shrink-0 min-w-0"
          >
            <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
            <span className="hidden sm:inline truncate">Return to Threshold</span>
            <span className="sm:hidden truncate">Threshold</span>
          </button>
          <span className="font-mono text-[10px] md:text-sm uppercase tracking-[0.4em] md:tracking-[0.6em] text-theme-gold flex-shrink-0 whitespace-nowrap">
            The Atlas
          </span>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-24 md:pt-48 pb-12 md:pb-24 px-4 md:px-24">
        <div className="max-w-[1800px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <span className="font-mono text-[10px] md:text-sm uppercase tracking-[0.6em] md:tracking-[0.8em] text-theme-gold mb-4 md:mb-6 block leading-tight break-words">
              {totalCount} {getItemLabel('atlas', totalCount)}{'\u00A0'}·{'\u00A0'}4 Territories
            </span>
            <h1 className="text-4xl md:text-8xl font-serif italic tracking-tighter leading-[0.95] md:leading-[0.9] mb-6 md:mb-8">
              The Atlas
            </h1>
            <p className="font-serif italic text-base md:text-2xl opacity-80 leading-relaxed max-w-xl mb-4 md:mb-6 break-words">
              Clean, skin-safe perfume oils. Intentional formulations
              crafted for those who travel by scent.
            </p>
            <p className="font-mono text-[10px] md:text-sm uppercase tracking-[0.3em] md:tracking-widest opacity-70 leading-tight break-words">
              Navigate by territory. Discover by instinct.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Territory Navigation */}
      <section className="pb-6 md:pb-8 px-4 md:px-24">
        <div className="max-w-[1800px] mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-wrap gap-2 md:gap-4"
          >
            <button
              onClick={() => setActiveTerritory(null)}
              className={`px-4 md:px-6 py-2 md:py-3 font-mono text-[10px] md:text-sm uppercase tracking-[0.2em] md:tracking-widest transition-all ${activeTerritory === null
                ? "bg-theme-charcoal text-theme-alabaster"
                : "bg-theme-charcoal/5 opacity-80 hover:opacity-100"
                }`}
            >
              All Territories
            </button>
            {territories.map((territory) => (
              <button
                key={territory.id}
                onClick={() => setActiveTerritory(territory.id)}
                className={`px-4 md:px-6 py-2 md:py-3 font-mono text-[10px] md:text-sm uppercase tracking-[0.2em] md:tracking-widest transition-all ${activeTerritory === territory.id
                  ? "bg-theme-charcoal text-theme-alabaster"
                  : "bg-theme-charcoal/5 opacity-80 hover:opacity-100"
                  }`}
              >
                {territory.name}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Territories Grid */}
      <section className="pb-20 md:pb-32 px-4 md:px-24">
        <div className="max-w-[1800px] mx-auto space-y-12 md:space-y-16">
          {territories
            .filter((t) => activeTerritory === null || activeTerritory === t.id)
            .map((territory, index) => (
              <motion.div
                key={territory.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="space-y-6 md:space-y-8"
              >
                {/* Territory Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 md:gap-4 border-b border-theme-charcoal/10 pb-4 md:pb-6 min-w-0">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-3xl md:text-6xl font-serif italic tracking-tighter mb-1 md:mb-2 leading-tight break-words">
                      {territory.name}
                    </h2>
                    <p className="font-serif italic text-base md:text-xl opacity-80 leading-relaxed break-words">
                      {territory.tagline}
                    </p>
                  </div>
                  <div className="flex flex-col items-start md:items-end gap-1 flex-shrink-0">
                    <p className="font-mono text-[10px] md:text-sm uppercase tracking-[0.2em] md:tracking-widest opacity-70 whitespace-nowrap">
                      {territory.count} {getItemLabel('atlas', territory.count)}
                    </p>
                    {getTerritoryPriceRange(territory.id) && (
                      <p className="font-mono text-[9px] md:text-xs uppercase tracking-wider opacity-50 whitespace-nowrap">
                        {getTerritoryPriceRange(territory.id)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Product Grid */}
                {territory.products.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-6">
                    {territory.products.map((product) => (
                      <Link
                        key={product._id}
                        href={`/product/${product.slug.current}`}
                        className="group aspect-[4/5] bg-gradient-to-b bg-theme-charcoal/[0.03] border border-theme-charcoal/10 flex flex-col overflow-hidden hover:border-theme-charcoal/20 transition-colors"
                      >
                        {product.mainImage || product.fieldReport?.image ? (() => {
                          const displayImage = product.mainImage || product.fieldReport?.image;
                          const imageUrl = urlForImage(displayImage);
                          if (!imageUrl) {
                            return (
                              <div className="w-full h-4/5 bg-theme-charcoal/5 flex items-center justify-center">
                                <span className="font-mono text-[8px] uppercase tracking-widest opacity-20">
                                  No Image
                                </span>
                              </div>
                            );
                          }

                          try {
                            const imageSrc = imageUrl.width(400).height(500).url();
                            return (
                              <div className="relative w-full h-4/5 bg-theme-charcoal/5">
                                <Image
                                  src={imageSrc}
                                  alt={product.title || 'Product image'}
                                  fill
                                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
                                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                  onError={(e) => {
                                    // Hide broken images
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                />
                              </div>
                            );
                          } catch (error) {
                            console.warn('Failed to generate image URL for product:', product.title, error);
                            return (
                              <div className="w-full h-4/5 bg-theme-charcoal/5 flex items-center justify-center">
                                <span className="font-mono text-[8px] uppercase tracking-widest opacity-20">
                                  No Image
                                </span>
                              </div>
                            );
                          }
                        })() : (
                          <div className="w-full h-3/4 bg-theme-charcoal/5 flex items-center justify-center">
                            <span className="font-mono text-[8px] uppercase tracking-widest opacity-20">
                              No Image
                            </span>
                          </div>
                        )}
                        <div className="p-3 md:p-4 flex-1 flex flex-col justify-between min-w-0">
                          <div className="min-w-0">
                            <h3 className="font-serif italic text-sm md:text-lg mb-1 group-hover:tracking-tighter transition-all line-clamp-2 leading-tight break-words overflow-hidden">
                              {product.title}
                            </h3>
                            <LegacyName
                              legacyName={product.legacyName}
                              showLegacyName={product.showLegacyName}
                              style={product.legacyNameStyle}
                              className="text-[10px] md:text-xs opacity-60 mb-1"
                            />
                            {product.scentProfile && (
                              <p className="font-mono text-[8px] md:text-[10px] uppercase tracking-wider opacity-50 mb-1 line-clamp-1">
                                {product.scentProfile}
                              </p>
                            )}
                            {/* Territory-based pricing */}
                            {getTerritoryStartingPrice(territory.id) ? (
                              <p className="font-mono text-[10px] md:text-sm uppercase tracking-[0.1em] md:tracking-widest opacity-80 tabular-nums break-words">
                                From ${getTerritoryStartingPrice(territory.id)}
                              </p>
                            ) : product.price && (
                              <p className="font-mono text-[10px] md:text-sm uppercase tracking-[0.1em] md:tracking-widest opacity-80 tabular-nums break-words">
                                ${product.price}
                              </p>
                            )}
                          </div>
                          {!product.inStock && (
                            <span className="font-mono text-[8px] uppercase tracking-widest opacity-20 mt-1 md:mt-2 break-words">
                              Out of Stock
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
                    <div className="aspect-[4/5] bg-gradient-to-b bg-theme-charcoal/[0.03] border border-theme-charcoal/10 flex flex-col items-center justify-center p-4">
                      <span className="font-mono text-[8px] uppercase tracking-widest opacity-30 text-center">
                        No products yet
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
        </div>
      </section>

      {/* Clean Beauty Callout */}
      <section className="bg-theme-charcoal/[0.03] py-12 md:py-20 px-4 md:px-24 border-y border-theme-charcoal/5">
        <div className="max-w-[1800px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto space-y-4 md:space-y-6"
          >
            <h3 className="text-xl md:text-3xl font-serif italic leading-tight">
              Clean. Safe. Intentional.
            </h3>
            <p className="font-serif italic text-sm md:text-base opacity-60 leading-relaxed px-2">
              Every Atlas oil is clean, skin-safe, and crafted with
              transparent ingredient sourcing. No synthetics that don&apos;t serve the scent.
            </p>
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 pt-3 md:pt-4 font-mono text-[9px] uppercase tracking-[0.2em] md:tracking-widest opacity-30">
              <span>Skin-Safe</span>
              <span>·</span>
              <span>Clean</span>
              <span>·</span>
              <span>Cruelty-Free</span>
            </div>
          </motion.div>
        </div>
      </section>

      <GlobalFooter theme="dark" />
    </div>
  );
}
