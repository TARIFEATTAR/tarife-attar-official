"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { GlobalFooter } from "@/components/navigation";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { urlForImage } from "@/sanity/lib/image";
import { getItemLabel } from "@/lib/brandSystem";
import { getPlaceholderImageUrl } from "@/lib/placeholder-image";
import { PlaceholderImagesQueryResult } from "@/sanity/lib/queries";

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
    mainImage?: unknown;
    shopifyPreviewImageUrl?: string;
    shopifyImage?: string;
    fieldReport?: {
      image?: unknown;
    };
    inStock?: boolean;
    legacyName?: string;
    showLegacyName?: boolean;
    scentProfile?: string;
  }>;
}

interface Props {
  territories: Territory[];
  totalCount: number;
  placeholderImages?: PlaceholderImagesQueryResult | null;
}

export function AtlasClient({ territories, totalCount, placeholderImages }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTerritory, setActiveTerritory] = useState<string | null>(null);
  const territoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Read territory from URL parameter on mount
  useEffect(() => {
    const territoryParam = searchParams.get('territory');
    if (territoryParam) {
      const validTerritory = territories.find(
        (t) => t.id.toLowerCase() === territoryParam.toLowerCase()
      );
      if (validTerritory) {
        setActiveTerritory(validTerritory.id);
        // Scroll to territory section after a brief delay for DOM to render
        setTimeout(() => {
          const element = territoryRefs.current[validTerritory.id];
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 300);
      }
    }
  }, [searchParams, territories]);

  // Handle territory selection with URL update
  const handleTerritorySelect = (territoryId: string | null) => {
    setActiveTerritory(territoryId);
    
    // Update URL without full navigation
    if (territoryId) {
      window.history.replaceState({}, '', `/atlas?territory=${territoryId.toLowerCase()}`);
      // Scroll to territory section
      setTimeout(() => {
        const element = territoryRefs.current[territoryId];
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      window.history.replaceState({}, '', '/atlas');
    }
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

      {/* Hero - Compact on desktop to show products faster */}
      <section className="pt-16 md:pt-28 pb-4 md:pb-8 px-4 md:px-24">
        <div className="max-w-[1800px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="flex flex-col md:flex-row md:items-end md:justify-between md:gap-8">
              <div>
                <span className="font-mono text-[10px] md:text-xs uppercase tracking-[0.6em] md:tracking-[0.4em] text-theme-gold mb-2 md:mb-3 block leading-tight break-words">
                  {totalCount} {getItemLabel('atlas', totalCount)}{'\u00A0'}·{'\u00A0'}4 Territories
                </span>
                <h1 className="text-3xl md:text-6xl font-serif italic tracking-tighter leading-[0.95] md:leading-[0.9] mb-3 md:mb-0">
                  The Atlas
                </h1>
                {/* Mobile Quiz CTA */}
                <Link
                  href="/quiz"
                  className="md:hidden inline-flex items-center gap-2 mt-3 py-2.5 px-4 border border-theme-charcoal/15 hover:border-theme-charcoal/40 bg-white/50 transition-all duration-300"
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] opacity-50">
                    Not sure?
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-theme-gold font-medium">
                    Take the Quiz →
                  </span>
                </Link>
              </div>
              <div className="hidden md:block max-w-md text-right">
                <p className="font-serif italic text-base opacity-60 leading-relaxed mb-3">
                  Clean, skin-safe perfume oils for those who travel by scent.
                </p>
                <Link
                  href="/quiz"
                  className="group inline-flex items-center gap-2 py-2.5 px-4 border border-theme-charcoal/15 hover:border-theme-charcoal/40 hover:bg-theme-charcoal/5 transition-all duration-300"
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] opacity-50 group-hover:opacity-80">
                    Not sure?
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-theme-gold font-medium">
                    Take the Quiz →
                  </span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Territory Navigation */}
      <section className="pb-4 md:pb-6 px-0 md:px-24">
        <div className="max-w-[1800px] mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-wrap gap-2 md:gap-4 overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide"
          >
            <button
              onClick={() => handleTerritorySelect(null)}
              className={`px-3 md:px-6 py-2 md:py-3 font-mono text-[9px] md:text-sm uppercase tracking-[0.15em] md:tracking-widest transition-all whitespace-nowrap flex-shrink-0 ${activeTerritory === null
                ? "bg-theme-charcoal text-theme-alabaster"
                : "bg-theme-charcoal/5 opacity-80 hover:opacity-100"
                }`}
            >
              <span className="md:hidden">All</span>
              <span className="hidden md:inline">All Territories</span>
            </button>
            {territories.map((territory) => (
              <button
                key={territory.id}
                onClick={() => handleTerritorySelect(territory.id)}
                className={`px-3 md:px-6 py-2 md:py-3 font-mono text-[9px] md:text-sm uppercase tracking-[0.15em] md:tracking-widest transition-all whitespace-nowrap flex-shrink-0 ${activeTerritory === territory.id
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
      <section className="pb-20 md:pb-24 px-4 md:px-24">
        <div className="max-w-[1800px] mx-auto space-y-8 md:space-y-12">
          {territories
            .filter((t) => activeTerritory === null || activeTerritory === t.id)
            .map((territory, index) => (
              <motion.div
                key={territory.id}
                ref={(el) => { territoryRefs.current[territory.id] = el; }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="space-y-3 md:space-y-4 scroll-mt-24"
              >
                {/* Territory Header - Compact */}
                <div className="flex flex-row items-end justify-between gap-2 md:gap-4 border-b border-theme-charcoal/10 pb-2 md:pb-4 min-w-0">
                  <div className="min-w-0 flex-1 flex items-baseline gap-3 md:gap-4">
                    <h2 className="text-2xl md:text-4xl font-serif italic tracking-tighter leading-tight break-words">
                      {territory.name}
                    </h2>
                    <p className="hidden md:block font-serif italic text-sm opacity-50 whitespace-nowrap">
                      {territory.tagline}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.2em] opacity-50 whitespace-nowrap">
                      {territory.count} {getItemLabel('atlas', territory.count)}
                    </p>
                    {getTerritoryPriceRange(territory.id) && (
                      <p className="font-mono text-[9px] md:text-[10px] uppercase tracking-wider opacity-40 whitespace-nowrap">
                        {getTerritoryPriceRange(territory.id)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Product Grid - Amouage-style clean layout */}
                {territory.products.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[1px] md:gap-[1px] bg-theme-charcoal/[0.08] -mx-4 md:mx-0">
                    {territory.products.map((product) => (
                      <Link
                        key={product._id}
                        href={`/product/${product.slug.current}`}
                        className="group flex flex-col bg-[#f8f6f3] hover:bg-[#f5f2ee] transition-colors"
                      >
                        {/* Product Image */}
                        <div className="relative aspect-square">
                          {(() => {
                            const sanityImage = product.mainImage || product.fieldReport?.image;
                            const imageUrl = sanityImage ? urlForImage(sanityImage) : null;
                            const shopifyImageUrl = product.shopifyPreviewImageUrl || product.shopifyImage;
                            
                            if (imageUrl) {
                              try {
                                const imageSrc = imageUrl.width(500).height(500).url();
                                return (
                                  <Image
                                    src={imageSrc}
                                    alt={product.title || 'Product image'}
                                    fill
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                    className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                    }}
                                  />
                                );
                              } catch (error) {
                                console.warn('Failed to generate image URL:', product.title, error);
                              }
                            }
                            
                            if (shopifyImageUrl) {
                              return (
                                <Image
                                  src={shopifyImageUrl}
                                  alt={product.title || 'Product image'}
                                  fill
                                  sizes="(max-width: 768px) 50vw, 25vw"
                                  className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                />
                              );
                            }
                            
                            // Use placeholder image for products without images
                            return (
                              <Image
                                src={getPlaceholderImageUrl('atlas', placeholderImages)}
                                alt={`${product.title} - Coming soon`}
                                fill
                                sizes="(max-width: 768px) 50vw, 25vw"
                                className="object-cover opacity-60 grayscale group-hover:opacity-80 group-hover:grayscale-0 transition-all duration-500"
                                onError={(e) => {
                                  // Fallback to text if placeholder image fails to load
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = '<div class="absolute inset-0 flex items-center justify-center"><span class="font-mono text-[10px] uppercase tracking-widest opacity-20">Coming Soon</span></div>';
                                  }
                                }}
                              />
                            );
                          })()}
                        </div>
                        
                        {/* Product Info - Centered in text area */}
                        <div className="text-center py-4 md:py-8 space-y-1.5 px-2">
                          <h3 className="font-sans text-xs md:text-base font-medium tracking-[0.15em] uppercase break-words line-clamp-2">
                            {product.title}
                          </h3>
                          {!product.inStock ? (
                            <p className="text-[10px] md:text-sm tracking-wider opacity-50">
                              Coming Soon
                            </p>
                          ) : (
                            <p className="text-xs md:text-base tracking-wide">
                              ${getTerritoryStartingPrice(territory.id) || product.price || '—'}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center bg-[#f8f6f3]">
                    <span className="font-mono text-xs uppercase tracking-widest opacity-30">
                      No products in this territory yet
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
        </div>
      </section>

      <GlobalFooter theme="dark" />
    </div>
  );
}
