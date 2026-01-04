"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { SplitEntry } from "@/components/home";
import { GlobalFooter } from "@/components/navigation";
import { EntryLoader } from "@/components/intro";
import { Product } from "@/types";

// Notable Formulations data - using territory system
const NOTABLE_FORMULATIONS: Partial<Product>[] = [
  {
    id: 'notable-1',
    title: 'Corsican Driftwood',
    price: '$95',
    imageUrl: 'https://images.unsplash.com/photo-1547483238-2cbf88bd1423?auto=format&fit=crop&q=80&w=800',
    collectionType: 'atlas',
    productFormat: 'Perfume Oil',
    volume: '9ml',
    scentVibe: 'Terra · Woody, earthy, mineral'
  },
  {
    id: 'notable-2',
    title: 'Vintage Trat Oud',
    price: '$450',
    imageUrl: 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&q=80&w=800',
    collectionType: 'relic',
    productFormat: 'Pure Oud',
    volume: '3ml',
    materialType: 'Aged 25 Years'
  },
  {
    id: 'notable-3',
    title: 'Mediterranean Dawn',
    price: '$85',
    imageUrl: 'https://images.unsplash.com/photo-1582733075932-a56763625f91?auto=format&fit=crop&q=80&w=800',
    collectionType: 'atlas',
    productFormat: 'Perfume Oil',
    volume: '9ml',
    scentVibe: 'Tidal · Salt, citrus, white musk'
  }
];

export default function Home() {
  const router = useRouter();
  const [showLoader, setShowLoader] = useState(true); // Enable intro loader with animations

  const handleNavigate = (path: string) => {
    if (path === 'home') {
      router.push('/');
    } else if (path === 'atlas') {
      router.push('/atlas');
    } else if (path === 'relic') {
      router.push('/relic');
    } else if (path === 'quiz') {
      router.push('/quiz');
    } else {
      router.push(`/${path}`);
    }
  };

  const handleLoaderComplete = useCallback(() => {
    setShowLoader(false);
  }, []);

  const handleProductClick = (product: Partial<Product>) => {
    console.log('Product clicked:', product.title);
    // router.push(`/product/${product.id}`);
  };

  return (
    <>
      {/* Cinematic Entry Loader */}
      <AnimatePresence mode="wait">
        {showLoader && (
          <EntryLoader onComplete={handleLoaderComplete} />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div
        className={`w-full bg-theme-alabaster selection:bg-theme-industrial/30 overflow-x-hidden transition-opacity duration-700 ${
          showLoader ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
            {/* Hero Entry Section */}
            <div className="h-screen w-full relative">
              <SplitEntry onNavigate={handleNavigate} />
            </div>

            {/* Featured Grid Section */}
            <section className="py-20 md:py-48 px-4 sm:px-6 md:px-24">
              <header className="mb-12 md:mb-24 flex flex-col md:flex-row justify-between items-baseline border-b border-theme-charcoal/5 pb-8 md:pb-12 gap-4 md:gap-8">
                <h2 className="text-3xl md:text-6xl font-serif italic tracking-tight text-theme-charcoal leading-none">
                  Notable formulations
                </h2>
                <button 
                  onClick={() => handleNavigate('atlas')}
                  className="font-mono text-[9px] md:text-[10px] uppercase tracking-[0.4em] opacity-40 hover:opacity-100 transition-opacity whitespace-nowrap"
                >
                  View All Specimens →
                </button>
              </header>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 sm:gap-16 md:gap-20">
                {NOTABLE_FORMULATIONS.map((product) => (
                  <motion.div 
                    key={product.id}
                    whileHover={{ y: -10 }}
                    onClick={() => handleProductClick(product)}
                    className="group cursor-pointer flex flex-col space-y-6 md:space-y-10"
                  >
                    <div className="relative w-full aspect-[4/5] bg-[#F8F7F2] overflow-hidden shadow-sm border border-theme-charcoal/5">
                      <Image 
                        src={product.imageUrl!}
                        alt={product.title!}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" 
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-baseline">
                        <h3 className="text-xl md:text-2xl font-serif italic text-theme-charcoal leading-none group-hover:tracking-tighter transition-all">{product.title}</h3>
                        <p className="font-mono text-[9px] md:text-[10px] uppercase tracking-widest opacity-40 tabular-nums">{product.price}</p>
                      </div>
                      <p className="font-mono text-[8px] uppercase tracking-widest opacity-20">
                        {product.collectionType === 'atlas' ? 'ATLAS COLLECTION' : 'RELIC VAULT'}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Brand Ethos Section */}
            <section className="bg-theme-obsidian text-theme-alabaster py-20 md:py-32 px-4 sm:px-6 md:px-24 overflow-hidden relative">
              <div className="max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center">
                <div className="space-y-8 md:space-y-12">
                  <span className="font-mono text-[10px] uppercase tracking-[0.8em] opacity-30">The Philosophy</span>
                  <h2 className="text-4xl sm:text-5xl md:text-7xl font-serif italic leading-[1.1] md:leading-[0.9] tracking-tighter">
                    Scent as <br className="hidden sm:block" /> Destination.
                  </h2>
                  <p className="font-serif text-lg sm:text-xl md:text-2xl opacity-50 italic leading-relaxed max-w-xl">
                    Four territories. Twenty-four coordinates. Clean perfume oils crafted for those who travel by instinct — not itinerary.
                  </p>
                  <div className="flex flex-wrap gap-6 font-mono text-[9px] uppercase tracking-widest opacity-30">
                    <span>Tidal</span>
                    <span>Ember</span>
                    <span>Petal</span>
                    <span>Terra</span>
                  </div>
                  <div className="pt-4 md:pt-8">
                    <button 
                      onClick={() => handleNavigate('atlas')}
                      className="w-full sm:w-auto px-12 py-5 border border-white/20 font-mono text-[10px] uppercase tracking-[0.6em] hover:bg-white hover:text-black transition-all"
                    >
                      Explore the Atlas
                    </button>
                  </div>
                </div>
                <div className="relative aspect-square sm:aspect-video lg:aspect-square grayscale opacity-60 rounded-sm overflow-hidden">
                   <Image 
                    src="https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?auto=format&fit=crop&q=80&w=1600"
                    alt="Laboratory Atmosphere" 
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                   />
                   <div className="absolute inset-0 bg-theme-obsidian/40" />
                </div>
              </div>
            </section>

            {/* Global Footer */}
            <GlobalFooter theme="dark" />
      </div>
    </>
  );
}
