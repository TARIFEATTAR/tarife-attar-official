"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Minus, Gift, MapPin, Calendar, Droplets } from "lucide-react";
import { urlForImage } from "@/sanity/lib/image";
import { useSatchel } from "@/context/CartContext";
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
  };
  relicData?: {
    distillationYear?: number;
    originRegion?: string;
    viscosity?: number;
    museumDescription?: PortableTextBlock[];
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

export function ProductDetailClient({ product }: Props) {
  const router = useRouter();
  const { addToSatchel } = useSatchel();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    description: false,
    notes: false,
  });

  const allImages = product.mainImage
    ? [product.mainImage, ...(product.gallery || [])]
    : product.gallery || [];

  const mainImageUrl = urlForImage(allImages[selectedImage] || product.mainImage);
  const isAtlas = product.collectionType === "atlas";
  const isRelic = product.collectionType === "relic";

  const handleAddToSatchel = () => {
    if (!product.inStock) return;

    // Convert Sanity product to CartItem format
    const cartProduct = {
      id: product._id,
      title: product.title,
      price: product.price || 0,
      imageUrl: mainImageUrl?.width(400).url() || "",
      collectionType: product.collectionType,
      productFormat: product.productFormat,
      volume: product.volume,
    };

    for (let i = 0; i < quantity; i++) {
      addToSatchel(cartProduct as any);
    }

    // Optional: Show success message or open cart
    // You can add a toast notification here
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
            {/* Main Image */}
            <div className="relative aspect-[4/5] bg-theme-charcoal/5 overflow-hidden border border-theme-charcoal/10">
              {mainImageUrl ? (
                <Image
                  src={mainImageUrl.width(800).height(1000).url()}
                  alt={product.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              ) : (
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
                      {thumbUrl ? (
                        <Image
                          src={thumbUrl.width(200).height(200).url()}
                          alt={`${product.title} view ${index + 1}`}
                          fill
                          sizes="(max-width: 1024px) 25vw, 12.5vw"
                          className="object-cover"
                        />
                      ) : (
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
                  <div className="flex items-center gap-2 font-mono text-xs md:text-sm uppercase tracking-widest opacity-80">
                    <MapPin className="w-4 h-4" />
                    {product.atlasData.gpsCoordinates}
                  </div>
                )}
              </div>
            )}

            {/* Relic-Specific Details */}
            {isRelic && product.relicData && (
              <div className="space-y-3 pt-4 border-t border-theme-charcoal/10">
                {product.relicData.originRegion && (
                  <div className="flex items-center gap-2 font-mono text-xs md:text-sm uppercase tracking-widest opacity-80">
                    <MapPin className="w-4 h-4" />
                    {product.relicData.originRegion}
                  </div>
                )}
                {product.relicData.distillationYear && (
                  <div className="flex items-center gap-2 font-mono text-xs md:text-sm uppercase tracking-widest opacity-80">
                    <Calendar className="w-4 h-4" />
                    Distilled {product.relicData.distillationYear}
                  </div>
                )}
                {product.relicData.viscosity !== undefined && (
                  <div className="flex items-center gap-2 font-mono text-xs md:text-sm uppercase tracking-widest opacity-80">
                    <Droplets className="w-4 h-4" />
                    Viscosity: {product.relicData.viscosity}/100
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
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-3 hover:bg-theme-charcoal/5 transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-6 py-3 font-mono text-sm tabular-nums min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-3 hover:bg-theme-charcoal/5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Add to Satchel Button - Hidden on mobile (shown in sticky bar) */}
            <button
              onClick={handleAddToSatchel}
              disabled={!product.inStock}
              className={`hidden md:block w-full py-5 font-mono text-sm md:text-base uppercase tracking-[0.4em] transition-all ${
                product.inStock
                  ? "bg-theme-charcoal text-theme-alabaster hover:bg-theme-charcoal/90"
                  : "bg-theme-charcoal/20 text-theme-charcoal/40 cursor-not-allowed"
              }`}
            >
              {product.inStock ? "Add to Satchel" : "Out of Stock"}
            </button>

            {/* Gift Option */}
            <button className="flex items-center gap-2 font-mono text-xs md:text-sm uppercase tracking-widest opacity-80 hover:opacity-100 transition-opacity">
              <Gift className="w-4 h-4" />
              Make it a gift
            </button>

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
                <span>Notes & Ingredients</span>
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
                    <div className="pb-4 space-y-4">
                      {product.notes?.top && product.notes.top.length > 0 && (
                        <div>
                          <span className="font-mono text-xs md:text-sm uppercase tracking-widest opacity-80 block mb-2">
                            Top Notes
                          </span>
                          <div className="font-serif italic text-base md:text-lg">
                            {product.notes.top.join(", ")}
                          </div>
                        </div>
                      )}
                      {product.notes?.heart && product.notes.heart.length > 0 && (
                        <div>
                          <span className="font-mono text-xs md:text-sm uppercase tracking-widest opacity-80 block mb-2">
                            Heart Notes
                          </span>
                          <div className="font-serif italic text-base md:text-lg">
                            {product.notes.heart.join(", ")}
                          </div>
                        </div>
                      )}
                      {product.notes?.base && product.notes.base.length > 0 && (
                        <div>
                          <span className="font-mono text-xs md:text-sm uppercase tracking-widest opacity-80 block mb-2">
                            Base Notes
                          </span>
                          <div className="font-serif italic text-base md:text-lg">
                            {product.notes.base.join(", ")}
                          </div>
                        </div>
                      )}
                      {product.perfumer && (
                        <div className="pt-4 border-t border-theme-charcoal/10">
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
                disabled={!product.inStock}
                className={`flex-1 py-4 font-mono text-sm uppercase tracking-[0.4em] transition-all ${
                  product.inStock
                    ? "bg-theme-charcoal text-theme-alabaster hover:bg-theme-charcoal/90 active:bg-theme-charcoal/80"
                    : "bg-theme-charcoal/20 text-theme-charcoal/40 cursor-not-allowed"
                }`}
              >
                {product.inStock ? "Add to Satchel" : "Out of Stock"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
