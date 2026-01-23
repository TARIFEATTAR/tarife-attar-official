"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GlobalFooter } from "@/components/navigation";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { urlForImage } from "@/sanity/lib/image";
import { getPlaceholderImageUrl } from "@/lib/placeholder-image";
import { getItemLabel } from "@/lib/brandSystem";
import { PlaceholderImagesQueryResult } from "@/sanity/lib/queries";

interface RelicProduct {
  _id: string;
  title: string;
  slug: { current: string };
  price?: number;
  volume?: string;
  productFormat?: string;
  mainImage?: unknown;
  museumExhibit?: {
    exhibitImage?: unknown;
  };
  inStock?: boolean;
  legacyName?: string;
  showLegacyName?: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string;
  productFormat: string;
  count: number;
  products: RelicProduct[];
}

interface Props {
  categories: Category[];
  totalCount: number;
  placeholderImages?: PlaceholderImagesQueryResult | null;
}

export function RelicClient({ categories, totalCount, placeholderImages }: Props) {
  const router = useRouter();


  return (
    <div className="min-h-screen bg-theme-obsidian text-theme-alabaster overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-theme-obsidian/80 backdrop-blur-md border-b border-white/5 overflow-hidden">
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
            The Relic
          </span>
        </div>
      </header>

      {/* Hero - Compact layout */}
      <section className="pt-16 md:pt-28 pb-4 md:pb-12 px-4 md:px-24">
        <div className="max-w-[1800px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-8"
          >
            {/* Left - Title */}
            <div className="flex-shrink-0">
              <span className="font-mono text-[10px] md:text-xs uppercase tracking-[0.6em] md:tracking-[0.8em] text-theme-gold mb-2 md:mb-3 block leading-tight">
                {totalCount} {getItemLabel('relic', totalCount)}{'\u00A0'}·{'\u00A0'}Pure Line
              </span>
              <h1 className="text-3xl md:text-6xl font-serif tracking-tighter leading-[0.95] md:leading-[0.9]">
                The Relic
              </h1>
            </div>
            
            {/* Right - Description */}
            <div className="hidden md:block max-w-md text-right">
              <p className="font-serif italic text-lg opacity-80 leading-relaxed mb-2">
                Pure resins. Rare ouds. Aged materials sourced for the devoted collector.
              </p>
              <p className="font-mono text-[10px] uppercase tracking-widest opacity-60">
                Limited quantities. Verified authenticity.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="pb-20 md:pb-24 px-4 md:px-24">
        <div className="max-w-[1800px] mx-auto space-y-8 md:space-y-12">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="space-y-3 md:space-y-6"
            >
              {/* Category Header - Compact inline layout */}
              <div className="flex flex-row items-baseline justify-between gap-4 border-b border-white/10 pb-2 md:pb-4 min-w-0">
                <div className="flex items-baseline gap-4 min-w-0 flex-1">
                  <h2 className="text-xl md:text-3xl font-serif tracking-tighter leading-tight break-words flex-shrink-0">
                    {category.name}
                  </h2>
                  <p className="hidden md:block font-serif italic text-base opacity-60 leading-relaxed truncate">
                    {category.description}
                  </p>
                </div>
                <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-widest opacity-50 flex-shrink-0 whitespace-nowrap">
                  {category.count} {getItemLabel('relic', category.count)}
                </p>
              </div>

              {/* Product Grid - Clean layout matching Atlas but dark */}
              {category.products.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[1px] bg-white/[0.08]">
                  {category.products.map((product) => (
                    <Link
                      key={product._id}
                      href={`/product/${product.slug.current}`}
                      className="group flex flex-col bg-[#1a1a1a] hover:bg-[#222] transition-colors"
                    >
                      {/* Product Image */}
                      <div className="relative aspect-square">
                        {product.museumExhibit?.exhibitImage || product.mainImage ? (() => {
                          const displayImage = product.museumExhibit?.exhibitImage || product.mainImage;
                          const imageUrl = urlForImage(displayImage as any);
                          if (!imageUrl) {
                            return (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="font-mono text-[10px] uppercase tracking-widest opacity-20">
                                  No Image
                                </span>
                              </div>
                            );
                          }

                          try {
                            const imageSrc = imageUrl.width(500).height(500).url();
                            return (
                              <Image
                                src={imageSrc}
                                alt={product.title || 'Product image'}
                                fill
                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            );
                          } catch (error) {
                            console.warn('Failed to generate image URL:', product.title, error);
                            // Use Relic-specific placeholder image if Sanity image fails
                            return (
                              <Image
                                src={getPlaceholderImageUrl('relic', placeholderImages)}
                                alt={`${product.title} - Coming soon`}
                                fill
                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                className="object-cover opacity-60 grayscale group-hover:opacity-80 group-hover:grayscale-0 transition-all duration-500"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = '<div class="absolute inset-0 flex items-center justify-center"><span class="font-mono text-[10px] uppercase tracking-widest opacity-20">Coming Soon</span></div>';
                                  }
                                }}
                              />
                            );
                          }
                        })() : (
                          // Use Relic-specific placeholder image for products without images
                          <Image
                            src={getPlaceholderImageUrl('relic', placeholderImages)}
                            alt={`${product.title} - Coming soon`}
                            fill
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                            className="object-cover opacity-60 grayscale group-hover:opacity-80 group-hover:grayscale-0 transition-all duration-500"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = '<div class="absolute inset-0 flex items-center justify-center"><span class="font-mono text-[10px] uppercase tracking-widest opacity-20">Coming Soon</span></div>';
                              }
                            }}
                          />
                        )}
                      </div>
                      
                      {/* Product Info - Minimal like Atlas */}
                      <div className="text-center py-4 md:py-8 space-y-1.5 px-2">
                        <h3 className="font-serif italic text-xs md:text-base tracking-wide break-words line-clamp-2">
                          {product.title}
                        </h3>
                        {!product.inStock ? (
                          <p className="font-mono text-[10px] md:text-sm tracking-wider opacity-40">
                            Out of Stock
                          </p>
                        ) : product.price ? (
                          <p className="text-xs md:text-base tracking-wide opacity-70">
                            ${product.price}
                          </p>
                        ) : null}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center bg-[#1a1a1a]">
                  <span className="font-mono text-xs uppercase tracking-widest opacity-30">
                    No specimens in this category yet
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      <GlobalFooter theme="dark" hideQuiz />
    </div>
  );
}
