"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, Plus, Minus, Gift, MapPin, Calendar, Droplets, Check, AlertCircle, Map as MapIcon, Info } from "lucide-react";
import { urlForImage } from "@/sanity/lib/image";
import { useShopifyCart } from "@/context";
import { RealisticCompass, GlobalFooter } from "@/components/navigation";
import { PortableText } from "@portabletext/react";

// Portable Text type
type PortableTextBlock = any;

interface Product {
  _id: string;
  title: string;
  slug: { current: string };
  collectionType: "atlas" | "relic";
  price?: number;
  volume?: string;
  productFormat?: string;
  mainImage?: any;
  gallery?: Array<{ _key: string; asset: any }>;
  inStock?: boolean;
  shopifyHandle?: string;
  shopifyVariantId?: string;
  shopifyProductId?: string;
  scarcityNote?: string;
  relatedProducts?: Array<{
    _id: string;
    title: string;
    slug: { current: string };
    price?: number;
    mainImage?: any;
  }>;
  notes?: {
    top?: string[];
    heart?: string[];
    base?: string[];
  };
  perfumer?: string;
  year?: number;
  atlasData?: {
    atmosphere?: string;
    gpsCoordinates?: string;
    travelLog?: PortableTextBlock[];
    badges?: string[];
    fieldReport?: {
      image?: any;
      hotspots?: Array<{
        product?: {
          _id: string;
          title: string;
          slug: { current: string };
        };
        x: number;
        y: number;
        note?: string;
      }>;
    };
  };
  relicData?: {
    distillationYear?: number;
    originRegion?: string;
    gpsCoordinates?: string;
    viscosity?: number;
    museumDescription?: PortableTextBlock[];
    badges?: string[];
    fieldReport?: {
      image?: any;
      hotspots?: Array<{
        product?: {
          _id: string;
          title: string;
          slug: { current: string };
        };
        x: number;
        y: number;
        note?: string;
      }>;
    };
  };
}

interface Props {
  product: Product;
}

const TERRITORY_NAMES: Record<string, string> = {
  tidal: "Tidal",
  ember: "Ember",
  petal: "Petal",
  terra: "Terra",
};

// Scent Pyramid Component
const ScentPyramid = ({ notes }: { notes: Product["notes"] }) => {
  if (!notes) return null;

  return (
    <div className="relative w-full max-w-[300px] mx-auto py-8">
      <svg viewBox="0 0 200 180" className="w-full h-auto drop-shadow-sm">
        {/* Background Triangle */}
        <motion.path
          d="M100 20 L20 160 L180 160 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-theme-charcoal/10"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        
        {/* Horizontal Dividers */}
        <line x1="60" y1="70" x2="140" y2="70" stroke="currentColor" strokeWidth="0.5" className="text-theme-charcoal/10" />
        <line x1="40" y1="120" x2="160" y2="120" stroke="currentColor" strokeWidth="0.5" className="text-theme-charcoal/10" />

        {/* TOP notes (Apex) */}
        <g className="group cursor-help">
          <motion.circle 
            cx="100" cy="45" r="5" 
            className="fill-theme-gold"
            whileHover={{ scale: 1.5 }}
          />
          <text x="110" y="48" className="font-mono text-[8px] uppercase tracking-widest fill-theme-charcoal/60">Top</text>
        </g>
        
        {/* HEART notes (Center) */}
        <g className="group cursor-help">
          <motion.circle 
            cx="85" cy="95" r="6" 
            className="fill-theme-gold/70"
            whileHover={{ scale: 1.5 }}
          />
          <motion.circle 
            cx="115" cy="95" r="6" 
            className="fill-theme-gold/70"
            whileHover={{ scale: 1.5 }}
          />
          <text x="100" y="108" textAnchor="middle" className="font-mono text-[8px] uppercase tracking-widest fill-theme-charcoal/60">Heart</text>
        </g>
        
        {/* BASE notes (Bottom) */}
        <g className="group cursor-help">
          <motion.circle cx="70" cy="145" r="7" className="fill-theme-gold/40" whileHover={{ scale: 1.5 }} />
          <motion.circle cx="100" cy="145" r="7" className="fill-theme-gold/40" whileHover={{ scale: 1.5 }} />
          <motion.circle cx="130" cy="145" r="7" className="fill-theme-gold/40" whileHover={{ scale: 1.5 }} />
          <text x="100" y="158" textAnchor="middle" className="font-mono text-[8px] uppercase tracking-widest fill-theme-charcoal/60">Base</text>
        </g>
      </svg>
    </div>
  );
};

// Trust Badges Component - Conditionally rendered based on collection type
const TrustBadges = ({ isAtlas, isRelic, product }: { isAtlas: boolean; isRelic: boolean; product: Product }) => {
  // Use custom badges from Sanity if available, otherwise fall back to defaults
  const customBadges = isAtlas ? product.atlasData?.badges : product.relicData?.badges;
  
  const badges = customBadges && customBadges.length > 0 
    ? customBadges.map(label => ({ label, icon: Check }))
    : isAtlas 
      ? [
          { label: "Skin Safe", icon: Check },
          { label: "Clean", icon: Check },
          { label: "Cruelty-Free", icon: Check },
        ]
      : [
          { label: "Pure Origin", icon: Check },
          { label: "Wild Harvested", icon: Check },
        ];

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-6 border-t border-theme-charcoal/5">
      {badges.map((badge, i) => (
        <div key={i} className="flex items-center gap-2 opacity-60">
          <badge.icon className="w-3 h-3 text-theme-gold" />
          <span className="font-mono text-[9px] md:text-[10px] uppercase tracking-wider whitespace-nowrap">
            {badge.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export function ProductDetailClient({ product }: Props) {
  const router = useRouter();
  const { addItem, isLoading: isCartLoading } = useShopifyCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    description: false,
    notes: false,
  });

  const scrollRef = useRef(null);
  const { scrollY } = useScroll();
  const imageY = useTransform(scrollY, [0, 1000], [0, -100]);

  const allImages = product.mainImage
    ? [product.mainImage, ...(product.gallery || [])]
    : product.gallery || [];

  const mainImageUrl = urlForImage(allImages[selectedImage] || product.mainImage);
  const isAtlas = product.collectionType === "atlas";
  const isRelic = product.collectionType === "relic";

  const handleAddToSatchel = async () => {
    // Check if product is purchasable
    if (!product.inStock) {
      console.warn('Product is out of stock');
      return;
    }

    if (isAdding) {
      console.warn('Already adding to cart');
      return;
    }

    if (!product.shopifyVariantId) {
      console.error('Product missing Shopify Variant ID. Please add shopifyVariantId in Sanity Studio.');
      alert('This product is not yet connected to Shopify. Please contact support or check Sanity Studio.');
      return;
    }

    setIsAdding(true);
    
    // Haptic feedback
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(40);
    }

    try {
      console.log('Adding to cart:', { variantId: product.shopifyVariantId, quantity });
      await addItem(product.shopifyVariantId, quantity);
      console.log('Successfully added to cart');
      
      // Success state feedback
      setTimeout(() => {
        setIsAdding(false);
      }, 1200);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(`Failed to add to cart: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsAdding(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleNavigate = (path: string) => {
    if (path === "home") router.push("/");
    else router.push(`/${path}`);
  };

  return (
    <div className="min-h-screen bg-theme-alabaster text-theme-charcoal">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-theme-alabaster/80 backdrop-blur-md border-b border-theme-charcoal/5">
        <div className="max-w-[1800px] mx-auto px-6 md:px-24 py-6 flex items-center justify-between">
          <Link
            href={isAtlas ? "/atlas" : "/relic"}
            className="flex items-center gap-3 font-mono text-xs md:text-sm uppercase tracking-widest opacity-80 hover:opacity-100 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to {isAtlas ? "Atlas" : "Relic"}
          </Link>
          <span className="font-mono text-xs md:text-sm uppercase tracking-[0.6em] text-theme-gold">
            {isAtlas ? "The Atlas" : "The Relic"}
          </span>
        </div>
      </header>

      {/* Main Content - Split Layout - Extra bottom padding on mobile for sticky button */}
      <div className="pt-24 pb-32 md:pb-20">
        <div className="max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 px-6 md:px-24">
          {/* Left: Product Images */}
          <div className="space-y-4">
            {/* Main Image with Parallax */}
            <div className="relative aspect-[4/5] bg-theme-charcoal/5 overflow-hidden border border-theme-charcoal/10 group">
              {mainImageUrl ? (() => {
                try {
                  const imageSrc = mainImageUrl.width(800).height(1000).url();
                  return (
                    <motion.div 
                      className="w-full h-full relative"
                      style={{ y: imageY }}
                    >
                      <Image
                        src={imageSrc}
                        alt={product.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover scale-110 group-hover:scale-[1.12] transition-transform duration-[2s] ease-out"
                        priority
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      {/* Atmospheric Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-theme-charcoal/5 to-transparent pointer-events-none" />
                    </motion.div>
                  );
                } catch (error) {
                  console.warn('Failed to generate main image URL:', error);
                  return (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-mono text-xs uppercase tracking-widest opacity-20">
                        No Image
                      </span>
                    </div>
                  );
                }
              })() : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="font-mono text-xs uppercase tracking-widest opacity-20">
                    No Image
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {allImages.map((image, index) => {
                  const thumbUrl = urlForImage(image);
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative aspect-square border-2 transition-all ${
                        selectedImage === index
                          ? "border-theme-charcoal"
                          : "border-theme-charcoal/10 hover:border-theme-charcoal/30"
                      }`}
                    >
                      {thumbUrl ? (() => {
                        try {
                          const thumbSrc = thumbUrl.width(200).height(200).url();
                          return (
                            <Image
                              src={thumbSrc}
                              alt={`${product.title} view ${index + 1}`}
                              fill
                              sizes="(max-width: 1024px) 25vw, 12.5vw"
                              className="object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          );
                        } catch (error) {
                          console.warn('Failed to generate thumbnail URL:', error);
                          return <div className="w-full h-full bg-theme-charcoal/5" />;
                        }
                      })() : (
                        <div className="w-full h-full bg-theme-charcoal/5" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Product Details */}
          <div className="flex flex-col justify-center space-y-8">
            {/* Collection Badge */}
            <div className="flex items-center gap-4">
              <span className="font-mono text-xs md:text-sm uppercase tracking-[0.4em] opacity-80">
                {isAtlas ? "ATLAS COLLECTION" : "RELIC VAULT"}
              </span>
              {isAtlas && product.atlasData?.atmosphere && (
                <span className="font-mono text-xs md:text-sm uppercase tracking-widest text-theme-gold">
                  {TERRITORY_NAMES[product.atlasData.atmosphere] || product.atlasData.atmosphere}
                </span>
              )}
            </div>

            {/* Product Title */}
            <h1 className="text-4xl md:text-6xl font-serif italic tracking-tighter leading-[0.9]">
              {product.title}
            </h1>

            {/* Product Essence/Notes Preview */}
            {product.notes && (
              <div className="flex flex-wrap gap-2 font-mono text-xs md:text-sm uppercase tracking-widest opacity-80">
                {product.notes.top && product.notes.top.length > 0 && (
                  <span>TOP: {product.notes.top.slice(0, 2).join(", ")}</span>
                )}
                {product.notes.heart && product.notes.heart.length > 0 && (
                  <span>HEART: {product.notes.heart.slice(0, 2).join(", ")}</span>
                )}
                {product.notes.base && product.notes.base.length > 0 && (
                  <span>BASE: {product.notes.base.slice(0, 2).join(", ")}</span>
                )}
              </div>
            )}

            {/* Price */}
            {product.price && (
              <div className="text-4xl md:text-5xl font-serif tracking-tighter">
                ${product.price}
              </div>
            )}

            {/* Volume & Format */}
            <div className="flex items-center gap-6">
              {product.volume && (
                <div className="px-6 py-3 border border-theme-charcoal/20 font-mono text-xs md:text-sm uppercase tracking-widest">
                  {product.volume}
                </div>
              )}
              {product.productFormat && (
                <span className="font-mono text-xs md:text-sm uppercase tracking-widest opacity-80">
                  {product.productFormat}
                </span>
              )}
            </div>

            {/* Atlas-Specific Details */}
            {isAtlas && product.atlasData && (
              <div className="space-y-3 pt-4 border-t border-theme-charcoal/10">
                {product.atlasData.gpsCoordinates && (
                  <div className="group flex flex-col gap-3">
                    <button 
                      onClick={() => setShowMap(!showMap)}
                      className="flex items-center gap-2 font-mono text-xs md:text-sm uppercase tracking-widest opacity-80 hover:opacity-100 hover:text-theme-gold transition-all"
                    >
                      <MapPin className={`w-4 h-4 transition-transform ${showMap ? 'scale-110 text-theme-gold' : ''}`} />
                      <span className="border-b border-transparent group-hover:border-theme-gold/30">
                        {product.atlasData.gpsCoordinates}
                      </span>
                      <Info className="w-3 h-3 opacity-30" />
                    </button>
                    
                    <AnimatePresence>
                      {showMap && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="aspect-video bg-theme-charcoal/5 border border-theme-charcoal/10 flex items-center justify-center relative group/map">
                            <MapIcon className="w-8 h-8 opacity-10 group-hover/map:scale-110 transition-transform duration-700" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="font-mono text-[9px] uppercase tracking-[0.3em] opacity-40">
                                [ Interactive Territory Map Integration Pending ]
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            )}

            {/* Relic-Specific Details */}
            {isRelic && product.relicData && (
              <div className="space-y-4 pt-4 border-t border-theme-charcoal/10">
                {(product.relicData.originRegion || product.relicData.gpsCoordinates) && (
                  <div className="group flex flex-col gap-3">
                    <button 
                      onClick={() => setShowMap(!showMap)}
                      className="flex flex-col gap-1 items-start font-mono text-xs md:text-sm uppercase tracking-widest opacity-80 hover:opacity-100 hover:text-theme-gold transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className={`w-4 h-4 transition-transform ${showMap ? 'scale-110 text-theme-gold' : ''}`} />
                        <span>{product.relicData.originRegion || "Rare Origin"}</span>
                      </div>
                      {product.relicData.gpsCoordinates && (
                        <span className="pl-6 text-[10px] opacity-60 font-mono tracking-widest">
                          {product.relicData.gpsCoordinates}
                        </span>
                      )}
                    </button>
                    
                    <AnimatePresence>
                      {showMap && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="aspect-video bg-theme-charcoal/5 border border-theme-charcoal/10 flex items-center justify-center relative group/map">
                            <MapIcon className="w-8 h-8 opacity-10 group-hover/map:scale-110 transition-transform duration-700" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="font-mono text-[9px] uppercase tracking-[0.3em] opacity-40 text-center px-6">
                                [ Curatorial Geographic Archive Data Pending ]
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
                {product.relicData.distillationYear && (
                  <div className="flex items-center gap-2 font-mono text-xs md:text-sm uppercase tracking-widest opacity-80">
                    <Calendar className="w-4 h-4" />
                    Distilled {product.relicData.distillationYear}
                  </div>
                )}
                {product.relicData.viscosity !== undefined && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 font-mono text-xs md:text-sm uppercase tracking-widest opacity-80">
                      <Droplets className="w-4 h-4" />
                      Viscosity: {product.relicData.viscosity}/100
                    </div>
                    {/* Visual Viscosity Meter */}
                    <div className="w-full h-[2px] bg-theme-charcoal/5 relative overflow-hidden">
                      <motion.div 
                        initial={{ x: "-100%" }}
                        animate={{ x: `${product.relicData.viscosity - 100}%` }}
                        transition={{ duration: 1.5, ease: "circOut", delay: 0.5 }}
                        className="absolute inset-0 bg-theme-gold/40"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="font-mono text-xs md:text-sm uppercase tracking-widest opacity-80">
                Quantity
              </span>
              <div className="flex items-center border border-theme-charcoal/20">
                <motion.button
                  whileHover={{ backgroundColor: "rgba(0,0,0,0.05)" }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-3 transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </motion.button>
                <span className="px-6 py-3 font-mono text-sm tabular-nums min-w-[3rem] text-center">
                  {quantity}
                </span>
                <motion.button
                  whileHover={{ backgroundColor: "rgba(0,0,0,0.05)" }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-3 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Add to Satchel Button with Feedback */}
            <motion.button
              layout
              onClick={handleAddToSatchel}
              disabled={!product.inStock || isAdding || !product.shopifyVariantId}
              whileHover={product.inStock && !isAdding && product.shopifyVariantId ? { scale: 1.01 } : {}}
              whileTap={product.inStock && !isAdding && product.shopifyVariantId ? { scale: 0.99 } : {}}
              className={`hidden md:flex items-center justify-center gap-3 w-full py-5 font-mono text-sm md:text-base uppercase tracking-[0.4em] transition-all relative overflow-hidden ${
                product.inStock
                  ? isAdding 
                    ? "bg-theme-gold text-theme-alabaster"
                    : product.shopifyVariantId
                    ? "bg-theme-charcoal text-theme-alabaster hover:bg-theme-charcoal/90"
                    : "bg-theme-charcoal/40 text-theme-alabaster/60 cursor-not-allowed"
                  : "bg-theme-charcoal/20 text-theme-charcoal/40 cursor-not-allowed"
              }`}
            >
              <AnimatePresence mode="wait">
                {isAdding ? (
                  <motion.div
                    key="adding"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    <span>Added</span>
                  </motion.div>
                ) : (
                  <motion.span
                    key="add"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {!product.inStock 
                      ? "Out of Stock" 
                      : !product.shopifyVariantId
                      ? "Not Connected to Shopify"
                      : "Add to Satchel"}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Shopify Connection Warning */}
            {product.inStock && !product.shopifyVariantId && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-amber-50 border border-amber-200 rounded"
              >
                <p className="font-mono text-[10px] uppercase tracking-widest text-amber-800 mb-1">
                  ⚠️ Shopify Connection Required
                </p>
                <p className="font-serif text-xs text-amber-700">
                  This product needs a Shopify Variant ID to be added to cart. Please add it in Sanity Studio under the "Shopify Sync" tab.
                </p>
              </motion.div>
            )}

            {/* Ethical Scarcity Indicator */}
            {product.inStock && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                className="flex items-center gap-2"
              >
                <AlertCircle className="w-3 h-3" />
                <span className="font-mono text-[9px] uppercase tracking-widest">
                  {product.scarcityNote || "Limited Batch Production — Small Volume Reserve"}
                </span>
              </motion.div>
            )}

            {/* Trust Badges */}
            <TrustBadges isAtlas={isAtlas} isRelic={isRelic} product={product} />

            {/* Gift Option */}
            <motion.button 
              whileHover={{ x: 5 }}
              className="flex items-center gap-2 font-mono text-xs md:text-sm uppercase tracking-widest opacity-80 hover:opacity-100 transition-all hover:text-theme-gold"
            >
              <Gift className="w-4 h-4" />
              Make it a gift
            </motion.button>

            {/* Collapsible Sections */}
            <div className="space-y-2 pt-8 border-t border-theme-charcoal/10">
              {/* Product Description */}
              <button
                onClick={() => toggleSection("description")}
                className="w-full flex items-center justify-between py-4 font-mono text-xs md:text-sm uppercase tracking-widest opacity-90 hover:opacity-100 transition-opacity"
              >
                <span>Product Description</span>
                <Plus
                  className={`w-4 h-4 transition-transform ${
                    expandedSections.description ? "rotate-45" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {expandedSections.description && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pb-4 font-serif italic text-base md:text-lg leading-relaxed opacity-90">
                      {isAtlas && product.atlasData?.travelLog ? (
                        <PortableText value={product.atlasData.travelLog} />
                      ) : isRelic && product.relicData?.museumDescription ? (
                        <PortableText value={product.relicData.museumDescription} />
                      ) : (
                        <p>No description available.</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Notes & Ingredients */}
              <button
                onClick={() => toggleSection("notes")}
                className="w-full flex items-center justify-between py-4 font-mono text-xs md:text-sm uppercase tracking-widest opacity-90 hover:opacity-100 transition-opacity"
              >
                <span>Scent Architecture</span>
                <Plus
                  className={`w-4 h-4 transition-transform ${
                    expandedSections.notes ? "rotate-45" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {expandedSections.notes && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pb-8 space-y-8">
                      {/* Visual Scent Pyramid */}
                      <ScentPyramid notes={product.notes} />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {product.notes?.top && product.notes.top.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                          >
                            <span className="font-mono text-[10px] uppercase tracking-widest opacity-40 block mb-2">
                              Top Notes
                            </span>
                            <div className="font-serif italic text-base">
                              {product.notes.top.join(", ")}
                            </div>
                          </motion.div>
                        )}
                        {product.notes?.heart && product.notes.heart.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            <span className="font-mono text-[10px] uppercase tracking-widest opacity-40 block mb-2">
                              Heart Notes
                            </span>
                            <div className="font-serif italic text-base">
                              {product.notes.heart.join(", ")}
                            </div>
                          </motion.div>
                        )}
                        {product.notes?.base && product.notes.base.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                          >
                            <span className="font-mono text-[10px] uppercase tracking-widest opacity-40 block mb-2">
                              Base Notes
                            </span>
                            <div className="font-serif italic text-base">
                              {product.notes.base.join(", ")}
                            </div>
                          </motion.div>
                        )}
                      </div>
                      
                      {product.perfumer && (
                        <div className="pt-4 border-t border-theme-charcoal/5">
                          <span className="font-mono text-[9px] uppercase tracking-widest opacity-40 block mb-2">
                            Perfumer
                          </span>
                          <div className="font-serif italic text-sm">{product.perfumer}</div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Complete the Journey - Related Products */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <div className="max-w-[1800px] mx-auto px-6 md:px-24 mt-32">
            <div className="border-t border-theme-charcoal/10 pt-16">
              <h2 className="font-mono text-xs md:text-sm uppercase tracking-[0.5em] mb-12 text-center opacity-60">
                Complete the Journey
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {product.relatedProducts.map((related) => {
                  const relatedImageUrl = urlForImage(related.mainImage);
                  return (
                    <Link
                      key={related._id}
                      href={`/product/${related.slug.current}`}
                      className="group flex flex-col items-center text-center space-y-6"
                    >
                      <div className="relative aspect-[4/5] w-full bg-theme-charcoal/5 overflow-hidden border border-theme-charcoal/5">
                        {relatedImageUrl ? (
                          <Image
                            src={relatedImageUrl.width(600).height(750).url()}
                            alt={related.title}
                            fill
                            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center opacity-20 font-mono text-[8px] uppercase tracking-widest">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-serif italic text-xl group-hover:tracking-tighter transition-all">
                          {related.title}
                        </h3>
                        <p className="font-mono text-xs opacity-40 uppercase tracking-widest">
                          ${related.price}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <GlobalFooter theme="light" />

      <RealisticCompass onNavigate={handleNavigate} size="md" />

      {/* Mobile Sticky Add to Satchel Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-theme-alabaster border-t border-theme-charcoal/10 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            {/* Price Display */}
            {product.price && (
              <div className="flex-shrink-0">
                <div className="text-2xl font-serif tracking-tighter">
                  ${product.price}
                </div>
                {product.volume && (
                  <div className="font-mono text-[11px] uppercase tracking-widest opacity-80">
                    {product.volume}
                  </div>
                )}
              </div>
            )}

            {/* Quantity & Add Button */}
            <div className="flex-1 flex items-center gap-3">
              {/* Quantity Selector - Compact */}
              <div className="flex items-center border border-theme-charcoal/20">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-theme-charcoal/5 transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="px-4 py-2 font-mono text-xs tabular-nums min-w-[2rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 hover:bg-theme-charcoal/5 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Add to Satchel Button */}
              <button
                onClick={handleAddToSatchel}
                disabled={!product.inStock || isAdding || !product.shopifyVariantId}
                className={`flex-1 py-4 font-mono text-sm uppercase tracking-[0.4em] transition-all relative overflow-hidden ${
                  product.inStock
                    ? isAdding
                      ? "bg-theme-gold text-theme-alabaster"
                      : product.shopifyVariantId
                      ? "bg-theme-charcoal text-theme-alabaster hover:bg-theme-charcoal/90 active:bg-theme-charcoal/80"
                      : "bg-theme-charcoal/40 text-theme-alabaster/60 cursor-not-allowed"
                    : "bg-theme-charcoal/20 text-theme-charcoal/40 cursor-not-allowed"
                }`}
              >
                <AnimatePresence mode="wait">
                  {isAdding ? (
                    <motion.div
                      key="adding-mobile"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      className="flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Added</span>
                    </motion.div>
                  ) : (
                    <motion.span
                      key="add-mobile"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {!product.inStock 
                        ? "Out of Stock" 
                        : !product.shopifyVariantId
                        ? "Not Connected"
                        : "Add to Satchel"}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
