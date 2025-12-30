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
    <div className="min-h-screen bg-theme-obsidian text-theme-alabaster">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-theme-obsidian/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-[1800px] mx-auto px-6 md:px-24 py-6 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-3 font-mono text-xs md:text-sm uppercase tracking-widest opacity-80 hover:opacity-100 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Threshold
          </button>
          <span className="font-mono text-xs md:text-sm uppercase tracking-[0.6em] text-theme-gold">
            The Relic
          </span>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-48 md:pb-24 px-6 md:px-24">
        <div className="max-w-[1800px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <span className="font-mono text-xs md:text-sm uppercase tracking-[0.8em] text-theme-gold mb-6 block">
              {totalCount} Specimens · Pure Line
            </span>
            <h1 className="text-5xl md:text-8xl font-serif tracking-tighter leading-[0.9] mb-8">
              The Relic
            </h1>
            <p className="font-serif italic text-xl md:text-2xl opacity-80 leading-relaxed max-w-xl mb-6">
              Pure resins. Rare ouds. Aged materials sourced for the devoted 
              collector. Each specimen arrives with provenance documentation.
            </p>
            <p className="font-mono text-xs md:text-sm uppercase tracking-widest opacity-70">
              Limited quantities. Verified authenticity.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="pb-32 px-6 md:px-24">
        <div className="max-w-[1800px] mx-auto space-y-20">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="space-y-8"
            >
              {/* Category Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
                <div>
                  <h2 className="text-3xl md:text-5xl font-serif tracking-tighter mb-2">
                    {category.name}
                  </h2>
                  <p className="font-serif italic text-lg md:text-xl opacity-80">
                    {category.description}
                  </p>
                </div>
                <p className="font-mono text-xs md:text-sm uppercase tracking-widest opacity-70">
                  {category.count} Specimen{category.count !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Product Grid */}
              {category.products.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                        return imageUrl ? (
                          <div className="relative w-full h-4/5 bg-white/[0.02]">
                            <Image
                              src={imageUrl.width(400).height(500).url()}
                              alt={product.title || 'Product image'}
                              fill
                              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                              className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-4/5 bg-white/[0.02] flex items-center justify-center">
                            <span className="font-mono text-xs uppercase tracking-widest opacity-20">
                              No Image
                            </span>
                          </div>
                        );
                      })() : (
                        <div className="w-full h-3/4 bg-white/[0.02] flex items-center justify-center">
                          <span className="font-mono text-xs uppercase tracking-widest opacity-20">
                            No Image
                          </span>
                        </div>
                      )}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-serif italic text-base md:text-lg mb-1 group-hover:tracking-tighter transition-all line-clamp-2">
                            {product.title}
                          </h3>
                          {product.price && (
                            <p className="font-mono text-xs md:text-sm uppercase tracking-widest opacity-80 tabular-nums">
                              ${product.price}
                            </p>
                          )}
                        </div>
                        {!product.inStock && (
                          <span className="font-mono text-[10px] uppercase tracking-widest opacity-40 mt-2">
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
      <section className="bg-white/[0.02] py-20 px-6 md:px-24 border-y border-white/5">
        <div className="max-w-[1800px] mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center space-y-6"
          >
            <span className="font-mono text-xs md:text-sm uppercase tracking-[0.6em] text-theme-gold">
              Collector Protocol
            </span>
            <h3 className="text-2xl md:text-4xl font-serif italic">
              For the Devoted Few
            </h3>
            <p className="font-serif italic opacity-80 leading-relaxed">
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
