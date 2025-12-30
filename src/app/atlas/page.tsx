"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { SmartCompass, GlobalFooter } from "@/components/navigation";
import { ArrowLeft } from "lucide-react";

// Territory definitions
const TERRITORIES = [
  {
    id: "tidal",
    name: "Tidal",
    tagline: "Salt. Mist. The pull of open water.",
    description: "Aquatic, fresh, and marine compositions that capture coastal atmospheres and oceanic depths.",
    count: 6,
    color: "from-blue-900/20 to-transparent",
  },
  {
    id: "ember",
    name: "Ember",
    tagline: "Spice. Warmth. The intimacy of ancient routes.",
    description: "Warm, gourmand, and spiced oils inspired by the heat of distant markets and caravan trails.",
    count: 6,
    color: "from-amber-900/20 to-transparent",
  },
  {
    id: "petal",
    name: "Petal",
    tagline: "Bloom. Herb. The exhale of living gardens.",
    description: "Floral and herbaceous compositions drawn from botanical gardens and wild meadows.",
    count: 6,
    color: "from-rose-900/20 to-transparent",
  },
  {
    id: "terra",
    name: "Terra",
    tagline: "Wood. Oud. The gravity of deep forests.",
    description: "Woody and exotic oils grounded in ancient forests, rare ouds, and earthen depths.",
    count: 6,
    color: "from-stone-900/20 to-transparent",
  },
];

export default function AtlasPage() {
  const router = useRouter();
  const [activeTerritory, setActiveTerritory] = useState<string | null>(null);

  const handleNavigate = (path: string) => {
    if (path === "home") router.push("/");
    else router.push(`/${path}`);
  };

  return (
    <div className="min-h-screen bg-theme-alabaster text-theme-charcoal">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-theme-alabaster/80 backdrop-blur-md border-b border-theme-charcoal/5">
        <div className="max-w-[1800px] mx-auto px-6 md:px-24 py-6 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Threshold
          </button>
          <span className="font-mono text-[10px] uppercase tracking-[0.6em] text-theme-gold">
            The Atlas
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
            <span className="font-mono text-[10px] uppercase tracking-[0.8em] text-theme-gold mb-6 block">
              24 Perfume Oils · 4 Territories
            </span>
            <h1 className="text-5xl md:text-8xl font-serif italic tracking-tighter leading-[0.9] mb-8">
              The Atlas
            </h1>
            <p className="font-serif italic text-xl md:text-2xl opacity-60 leading-relaxed max-w-xl mb-6">
              Clean, skin-safe perfume oils. Phthalate-free formulations 
              crafted for those who travel by scent.
            </p>
            <p className="font-mono text-[10px] uppercase tracking-widest opacity-30">
              Navigate by territory. Discover by instinct.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Territory Navigation */}
      <section className="pb-8 px-6 md:px-24">
        <div className="max-w-[1800px] mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-wrap gap-4"
          >
            <button
              onClick={() => setActiveTerritory(null)}
              className={`px-6 py-3 font-mono text-[10px] uppercase tracking-widest transition-all ${
                activeTerritory === null
                  ? "bg-theme-charcoal text-theme-alabaster"
                  : "bg-theme-charcoal/5 opacity-60 hover:opacity-100"
              }`}
            >
              All Territories
            </button>
            {TERRITORIES.map((territory) => (
              <button
                key={territory.id}
                onClick={() => setActiveTerritory(territory.id)}
                className={`px-6 py-3 font-mono text-[10px] uppercase tracking-widest transition-all ${
                  activeTerritory === territory.id
                    ? "bg-theme-charcoal text-theme-alabaster"
                    : "bg-theme-charcoal/5 opacity-60 hover:opacity-100"
                }`}
              >
                {territory.name}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Territories Grid */}
      <section className="pb-32 px-6 md:px-24">
        <div className="max-w-[1800px] mx-auto space-y-16">
          {TERRITORIES.filter(
            (t) => activeTerritory === null || activeTerritory === t.id
          ).map((territory, index) => (
            <motion.div
              key={territory.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="space-y-8"
            >
              {/* Territory Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-theme-charcoal/10 pb-6">
                <div>
                  <h2 className="text-4xl md:text-6xl font-serif italic tracking-tighter mb-2">
                    {territory.name}
                  </h2>
                  <p className="font-serif italic text-lg opacity-60">
                    {territory.tagline}
                  </p>
                </div>
                <p className="font-mono text-[9px] uppercase tracking-widest opacity-30">
                  {territory.count} Specimens
                </p>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
                {Array.from({ length: territory.count }).map((_, i) => (
                  <div
                    key={i}
                    className={`aspect-[3/4] bg-gradient-to-b ${territory.color} bg-theme-charcoal/[0.03] border border-theme-charcoal/10 flex flex-col items-center justify-center p-4 hover:border-theme-charcoal/20 transition-colors cursor-pointer group`}
                  >
                    <div className="w-12 h-20 bg-theme-charcoal/5 rounded-sm mb-4 group-hover:bg-theme-charcoal/10 transition-colors" />
                    <span className="font-mono text-[8px] uppercase tracking-widest opacity-30 text-center">
                      {territory.name} {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-mono text-[7px] uppercase tracking-widest opacity-20 mt-1">
                      Coming Soon
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Clean Beauty Callout */}
      <section className="bg-theme-charcoal/[0.03] py-20 px-6 md:px-24 border-y border-theme-charcoal/5">
        <div className="max-w-[1800px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto space-y-6"
          >
            <h3 className="text-2xl md:text-3xl font-serif italic">
              Clean. Safe. Intentional.
            </h3>
            <p className="font-serif italic opacity-60 leading-relaxed">
              Every Atlas oil is phthalate-free, skin-safe, and crafted with 
              transparent ingredient sourcing. No synthetics that don&apos;t serve the scent.
            </p>
            <div className="flex flex-wrap justify-center gap-8 pt-4 font-mono text-[9px] uppercase tracking-widest opacity-30">
              <span>Phthalate-Free</span>
              <span>·</span>
              <span>Skin-Safe</span>
              <span>·</span>
              <span>Vegan</span>
              <span>·</span>
              <span>Cruelty-Free</span>
            </div>
          </motion.div>
        </div>
      </section>

      <GlobalFooter theme="dark" />

      <SmartCompass
        view="atlas"
        theme="light"
        onNavigate={handleNavigate}
        onOpenAssistant={() => {}}
      />
    </div>
  );
}
