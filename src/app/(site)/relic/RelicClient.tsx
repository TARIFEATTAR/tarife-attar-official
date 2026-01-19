"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GlobalFooter } from "@/components/navigation";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { urlForImage } from "@/sanity/lib/image";
import { getItemLabel } from "@/lib/brandSystem";

interface RelicProduct {
  _id: string;
  title: string;
  slug: { current: string };
  price?: number;
  volume?: string;
  productFormat?: string;
  mainImage?: any;
  museumExhibit?: {
    exhibitImage?: any;
  };
  inStock?: boolean;
  legacyName?: string;
  showLegacyName?: boolean;
  legacyNameStyle?: 'formerly' | 'once-known' | 'previously';
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
}

export function RelicClient({ categories, totalCount }: Props) {
  const router = useRouter();

  const handleNavigate = (path: string) => {
    if (path === "home") router.push("/");
    else router.push(`/${path}`);
  };

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
              {totalCount} {getItemLabel('relic', totalCount)}{'\u00A0'}·{'\u00A0'}Pure Line
            </span>
            <h1 className="text-4xl md:text-8xl font-serif tracking-tighter leading-[0.95] md:leading-[0.9] mb-6 md:mb-8">
              The Relic
            </h1>
            <p className="font-serif italic text-base md:text-2xl opacity-80 leading-relaxed max-w-xl mb-4 md:mb-6 break-words">
              Pure resins. Rare ouds. Aged materials sourced for the devoted
              collector. Each specimen arrives with provenance documentation.
            </p>
            <p className="font-mono text-[10px] md:text-sm uppercase tracking-[0.3em] md:tracking-widest opacity-70 leading-tight break-words">
              Limited quantities. Verified authenticity.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="pb-20 md:pb-32 px-4 md:px-24">
        <div className="max-w-[1800px] mx-auto space-y-12 md:space-y-20">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="space-y-6 md:space-y-8"
            >
              {/* Category Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 md:gap-4 border-b border-white/10 pb-4 md:pb-6 min-w-0">
                <div className="min-w-0 flex-1">
                  <h2 className="text-2xl md:text-5xl font-serif tracking-tighter mb-1 md:mb-2 leading-tight break-words">
                    {category.name}
                  </h2>
                  <p className="font-serif italic text-base md:text-xl opacity-80 leading-relaxed break-words">
                    {category.description}
                  </p>
                </div>
                <p className="font-mono text-[10px] md:text-sm uppercase tracking-[0.2em] md:tracking-widest opacity-70 flex-shrink-0 whitespace-nowrap">
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
                          const imageUrl = urlForImage(displayImage);
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
                            return (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="font-mono text-[10px] uppercase tracking-widest opacity-20">
                                  No Image
                                </span>
                              </div>
                            );
                          }
                        })() : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="font-mono text-[10px] uppercase tracking-widest opacity-20">
                              No Image
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Product Info - Minimal like Atlas */}
                      <div className="text-center py-6 md:py-8 space-y-1.5">
                        <h3 className="font-serif italic text-sm md:text-base tracking-wide">
                          {product.title}
                        </h3>
                        {!product.inStock ? (
                          <p className="font-mono text-xs md:text-sm tracking-wider opacity-40">
                            Out of Stock
                          </p>
                        ) : product.price ? (
                          <p className="text-sm md:text-base tracking-wide opacity-70">
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

      <GlobalFooter theme="dark" />
    </div>
  );
}
