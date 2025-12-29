"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { SmartCompass, GlobalFooter } from "@/components/navigation";
import { ArrowLeft } from "lucide-react";

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
            Relic Vault
          </span>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-6 md:px-24">
        <div className="max-w-[1800px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.8em] text-theme-gold mb-6 block">
              The Material Archive
            </span>
            <h1 className="text-5xl md:text-8xl font-serif tracking-tighter leading-[0.9] mb-8">
              Relic
            </h1>
            <p className="font-serif italic text-xl md:text-2xl opacity-50 leading-relaxed max-w-xl">
              Weighty study of fossilized resins. Rare specimens excavated from 
              time-locked deposits, preserved in their original mineral state.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Coming Soon Grid */}
      <section className="pb-32 px-6 md:px-24">
        <div className="max-w-[1800px] mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="aspect-[3/4] bg-white/5 border border-white/10 flex items-center justify-center"
              >
                <span className="font-mono text-[9px] uppercase tracking-widest opacity-20">
                  Specimen {String(i).padStart(2, "0")} — Coming Soon
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <GlobalFooter theme="dark" />

      <SmartCompass
        view="relic"
        theme="dark"
        onNavigate={handleNavigate}
        onOpenAssistant={() => {}}
      />
    </div>
  );
}
