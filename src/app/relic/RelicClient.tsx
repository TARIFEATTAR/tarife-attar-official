"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { RealisticCompass, GlobalFooter } from "@/components/navigation";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { urlForImage } from "@/sanity/lib/image";

interface RelicProduct {
  _id: string;
  title: string;
  slug: { current: string };
  price?: number;
  volume?: string;
  productFormat?: string;
  mainImage?: any;
  inStock?: boolean;
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
              {totalCount} Specimens{'\u00A0'}·{'\u00A0'}Pure Line
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
                  {category.count} Specimen{category.count !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Product Grid */}
              {category.products.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                  {category.products.map((product) => {
                    // Debug: Log product details
                    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
                      console.log('[RelicClient] Rendering product:', product.title, product.slug?.current);
                    }
                    return (
                    <Link
                      key={product._id}
                      href={`/product/${product.slug.current}`}
                      className="group aspect-[4/5] bg-white/[0.02] border border-white/10 flex flex-col overflow-hidden hover:border-white/20 transition-colors"
                    >
                      {product.mainImage ? (() => {
                        const imageUrl = urlForImage(product.mainImage);
                        if (!imageUrl) {
                          return (
                            <div className="w-full h-4/5 bg-white/[0.02] flex items-center justify-center">
                              <span className="font-mono text-xs uppercase tracking-widest opacity-20">
                                No Image
                              </span>
                            </div>
                          );
                        }
                        
                        try {
                          const imageSrc = imageUrl.width(400).height(500).url();
                          return (
                            <div className="relative w-full h-4/5 bg-white/[0.02]">
                              <Image
                                src={imageSrc}
                                alt={product.title || 'Product image'}
                                fill
                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
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
                            <div className="w-full h-4/5 bg-white/[0.02] flex items-center justify-center">
                              <span className="font-mono text-xs uppercase tracking-widest opacity-20">
                                No Image
                              </span>
                            </div>
                          );
                        }
                      })() : (
                        <div className="w-full h-3/4 bg-white/[0.02] flex items-center justify-center">
                          <span className="font-mono text-xs uppercase tracking-widest opacity-20">
                            No Image
                          </span>
                        </div>
                      )}
                      <div className="p-3 md:p-4 flex-1 flex flex-col justify-between min-w-0">
                        <div className="min-w-0">
                          <h3 className="font-serif italic text-sm md:text-lg mb-1 group-hover:tracking-tighter transition-all line-clamp-2 leading-tight break-words overflow-hidden">
                            {product.title}
                          </h3>
                          {product.price && (
                            <p className="font-mono text-[10px] md:text-sm uppercase tracking-[0.1em] md:tracking-widest opacity-80 tabular-nums break-words">
                              ${product.price}
                            </p>
                          )}
                        </div>
                        {!product.inStock && (
                          <span className="font-mono text-[8px] md:text-[10px] uppercase tracking-widest opacity-40 mt-1 md:mt-2 break-words">
                            Out of Stock
                          </span>
                        )}
                      </div>
                    </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="aspect-square bg-white/[0.02] border border-white/10 flex flex-col items-center justify-center p-6">
                    <span className="font-mono text-xs uppercase tracking-widest opacity-20 text-center">
                      No Specimens Yet
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Collector Notice */}
      <section className="bg-white/[0.02] py-12 md:py-20 px-4 md:px-24 border-y border-white/5">
        <div className="max-w-[1800px] mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center space-y-4 md:space-y-6"
          >
            <span className="font-mono text-[10px] md:text-sm uppercase tracking-[0.4em] md:tracking-[0.6em] text-theme-gold">
              Collector Protocol
            </span>
            <h3 className="text-xl md:text-4xl font-serif italic leading-tight">
              For the Devoted Few
            </h3>
            <p className="font-serif italic text-sm md:text-base opacity-80 leading-relaxed px-2">
              Relic specimens are sourced in limited quantities from verified suppliers. 
              Each arrives with documentation of origin, age, and distillation method. 
              Priority access available to registered collectors.
            </p>
          </motion.div>
        </div>
      </section>

      <GlobalFooter theme="dark" />

      <RealisticCompass
        onNavigate={handleNavigate}
        size="md"
      />
    </div>
  );
}
