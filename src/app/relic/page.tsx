"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { RealisticCompass, GlobalFooter } from "@/components/navigation";
import { ArrowLeft, Lock } from "lucide-react";

// Relic categories
const RELIC_CATEGORIES = [
  {
    id: "pure-oud",
    name: "Pure Oud",
    description: "Single-origin agarwood oils. Aged. Verified. Uncut.",
    specimens: 4,
  },
  {
    id: "aged-resins",
    name: "Aged Resins",
    description: "Fossilized amber, vintage frankincense, and temple-grade myrrh.",
    specimens: 4,
  },
  {
    id: "rare-attars",
    name: "Rare Attars",
    description: "Traditional hydro-distillations from master perfumers.",
    specimens: 4,
  },
];

export default function RelicPage() {
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
            className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Threshold
          </button>
          <span className="font-mono text-[10px] uppercase tracking-[0.6em] text-theme-gold">
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
            <span className="font-mono text-[10px] uppercase tracking-[0.8em] text-theme-gold mb-6 block">
              Pure Line · Collector Grade
            </span>
            <h1 className="text-5xl md:text-8xl font-serif tracking-tighter leading-[0.9] mb-8">
              The Relic
            </h1>
            <p className="font-serif italic text-xl md:text-2xl opacity-50 leading-relaxed max-w-xl mb-6">
              Pure resins. Rare ouds. Aged materials sourced for the devoted 
              collector. Each specimen arrives with provenance documentation.
            </p>
            <p className="font-mono text-[10px] uppercase tracking-widest opacity-30">
              Limited quantities. Verified authenticity.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="pb-32 px-6 md:px-24">
        <div className="max-w-[1800px] mx-auto space-y-20">
          {RELIC_CATEGORIES.map((category, index) => (
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
                  <p className="font-serif italic text-lg opacity-40">
                    {category.description}
                  </p>
                </div>
                <p className="font-mono text-[9px] uppercase tracking-widest opacity-20">
                  {category.specimens} Specimens
                </p>
              </div>

              {/* Specimen Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {Array.from({ length: category.specimens }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square bg-white/[0.02] border border-white/10 flex flex-col items-center justify-center p-6 hover:border-white/20 hover:bg-white/[0.04] transition-all cursor-pointer group relative"
                  >
                    {/* Lock icon for "coming soon" effect */}
                    <Lock className="w-8 h-8 opacity-10 mb-4 group-hover:opacity-20 transition-opacity" />
                    <span className="font-mono text-[9px] uppercase tracking-widest opacity-20 text-center">
                      Specimen {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-mono text-[8px] uppercase tracking-widest opacity-10 mt-2">
                      Vault Access Pending
                    </span>
                  </div>
                ))}
              </div>
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
            <span className="font-mono text-[9px] uppercase tracking-[0.6em] text-theme-gold">
              Collector Protocol
            </span>
            <h3 className="text-2xl md:text-4xl font-serif italic">
              For the Devoted Few
            </h3>
            <p className="font-serif italic opacity-40 leading-relaxed">
              Relic specimens are sourced in limited quantities from verified suppliers. 
              Each arrives with documentation of origin, age, and distillation method. 
              Priority access available to registered collectors.
            </p>
            <div className="pt-4">
              <button
                onClick={() => router.push("/consult")}
                className="px-10 py-4 border border-white/20 font-mono text-[10px] uppercase tracking-[0.4em] hover:bg-white hover:text-theme-obsidian transition-all"
              >
                Request Vault Access
              </button>
            </div>
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
