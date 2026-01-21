"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { SplitEntry } from "@/components/home";
import { GlobalFooter } from "@/components/navigation";
import { EntryLoader } from "@/components/intro";
import { Product } from "@/types";
import { urlForImage } from "@/sanity/lib/image";
import { LegacyName } from "@/components/product/LegacyName";
import { HeroBackgroundsQueryResult } from "@/sanity/lib/queries";

interface HomeClientProps {
    featuredProducts: (Product & { 
      atlasImage?: any; 
      relicImage?: any;
      shopifyPreviewImageUrl?: string;
      shopifyImage?: string;
    })[];
    heroBackgrounds?: HeroBackgroundsQueryResult;
}

export function HomeClient({ featuredProducts, heroBackgrounds }: HomeClientProps) {
    const router = useRouter();
    const [showLoader, setShowLoader] = useState(true); // Enable intro loader with animations

    // Debug hero backgrounds in development
    if (process.env.NODE_ENV === 'development') {
        console.log('[HomeClient] Hero Backgrounds Data:', heroBackgrounds);
    }

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

    const handleProductClick = (product: Product) => {
        if (product.slug?.current) {
            router.push(`/product/${product.slug.current}`);
        }
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
                className={`w-full bg-theme-alabaster selection:bg-theme-industrial/30 overflow-x-hidden transition-opacity duration-700 ${showLoader ? 'opacity-0 pointer-events-none' : 'opacity-100'
                    }`}
            >
                {/* Hero Entry Section */}
                <div className="h-screen w-full relative">
                    <SplitEntry onNavigate={handleNavigate} heroBackgrounds={heroBackgrounds} />
                </div>

                {/* Featured Grid Section */}
                <section className="py-20 md:py-48 px-4 sm:px-6 md:px-24">
                    <header className="mb-12 md:mb-24 flex flex-col md:flex-row justify-between items-baseline border-b border-theme-charcoal/5 pb-8 md:pb-12 gap-4 md:gap-8">
                        <h2 className="text-3xl md:text-6xl font-serif italic tracking-tight text-theme-charcoal leading-none">
                            From the collection
                        </h2>
                        <button
                            onClick={() => handleNavigate('atlas')}
                            className="font-mono text-[9px] md:text-[10px] uppercase tracking-[0.4em] opacity-40 hover:opacity-100 transition-opacity whitespace-nowrap"
                        >
                            Explore the Atlas →
                        </button>
                    </header>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 sm:gap-16 md:gap-20">
                        {featuredProducts && featuredProducts.length > 0 ? (
                            featuredProducts.map((product) => (
                                <motion.div
                                    key={product._id}
                                    whileHover={{ y: -10 }}
                                    onClick={() => handleProductClick(product)}
                                    className="group cursor-pointer flex flex-col space-y-6 md:space-y-10"
                                >
                                    <div className="relative w-full aspect-[4/5] bg-[#F8F7F2] overflow-hidden shadow-sm border border-theme-charcoal/5">
                                        {(() => {
                                            // Try Sanity images first
                                            const displayImage = product.atlasImage || product.relicImage || product.mainImage;
                                            const imageUrl = displayImage ? urlForImage(displayImage)?.width(800)?.height(1000)?.url() : null;
                                            
                                            // Fallback to Shopify image
                                            const shopifyImageUrl = product.shopifyPreviewImageUrl || product.shopifyImage;
                                            
                                            if (imageUrl) {
                                                return (
                                                    <Image
                                                        src={imageUrl}
                                                        alt={product.title}
                                                        fill
                                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                        className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                                                    />
                                                );
                                            }
                                            
                                            // Use Shopify image as fallback
                                            if (shopifyImageUrl) {
                                                return (
                                                    <Image
                                                        src={shopifyImageUrl}
                                                        alt={product.title}
                                                        fill
                                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                        className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                                                    />
                                                );
                                            }
                                            
                                            return (
                                                <div className="w-full h-full flex items-center justify-center bg-theme-charcoal/5">
                                                    <span className="font-mono text-xs uppercase tracking-widest opacity-20">No Image</span>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex justify-between items-baseline">
                                                <h3 className="text-xl md:text-2xl font-serif italic text-theme-charcoal leading-none group-hover:tracking-tighter transition-all">
                                                    {product.title}
                                                </h3>
                                                {product.price && (
                                                    <p className="font-mono text-[9px] md:text-[10px] uppercase tracking-widest opacity-40 tabular-nums">
                                                        ${product.price}
                                                    </p>
                                                )}
                                            </div>
                                            <LegacyName
                                                legacyName={product.legacyName}
                                                showLegacyName={product.showLegacyName}
                                                className="text-[10px] opacity-50"
                                            />
                                        </div>
                                        <p className="font-mono text-[8px] uppercase tracking-widest opacity-20">
                                            {product.collectionType === 'atlas' ? 'ATLAS COLLECTION' : 'RELIC VAULT'}
                                        </p>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center opacity-40 font-mono text-sm">
                                Loading notable formulations...
                            </div>
                        )}
                    </div>
                </section>

                {/* Territory Quiz CTA */}
                <section className="py-16 md:py-24 px-4 sm:px-6 md:px-24 bg-theme-charcoal/[0.02]">
                    <div className="max-w-3xl mx-auto text-center">
                        <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-theme-gold block mb-4">
                            Find Your Signature
                        </span>
                        <h2 className="text-3xl md:text-5xl font-serif italic tracking-tight text-theme-charcoal leading-tight mb-4">
                            Discover Your Territory
                        </h2>
                        <p className="font-serif text-lg md:text-xl text-theme-charcoal/60 mb-8 max-w-xl mx-auto">
                            Four olfactory worlds. Five questions. One path that speaks to your soul.
                        </p>
                        <button
                            onClick={() => handleNavigate('quiz')}
                            className="inline-flex items-center gap-3 bg-theme-charcoal text-theme-alabaster px-8 py-4 rounded-full font-mono text-xs uppercase tracking-[0.2em] hover:bg-theme-charcoal/90 transition-colors"
                        >
                            Take the Quiz
                            <span>→</span>
                        </button>
                    </div>
                </section>

                {/* Global Footer */}
                <GlobalFooter theme="dark" />
            </div>
        </>
    );
}
