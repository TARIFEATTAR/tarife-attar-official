"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Archive } from "lucide-react";
import { GlobalFooter } from "@/components/navigation";

export default function ArchivePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-theme-alabaster text-theme-charcoal flex flex-col">
      {/* Header */}
      <header className="px-6 md:px-24 py-6 border-b border-theme-charcoal/5">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            Return
          </button>
          <span className="font-mono text-[10px] uppercase tracking-[0.6em] text-theme-gold">
            Archive
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-6 md:px-24 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl text-center"
        >
          <Archive className="w-12 h-12 text-theme-gold mx-auto mb-8" />
          
          <h1 className="text-4xl md:text-6xl font-serif italic tracking-tighter leading-[0.9] mb-8">
            The Archive
          </h1>
          <p className="font-serif italic text-lg md:text-xl opacity-60 leading-relaxed mb-12 max-w-lg mx-auto">
            A comprehensive catalog of discontinued formulations, 
            vintage specimens, and historical reference materials.
          </p>

          <div className="inline-block px-12 py-5 bg-theme-charcoal/5 border border-theme-charcoal/10 font-mono text-[10px] uppercase tracking-[0.4em]">
            Archive Access — Coming Soon
          </div>
        </motion.div>
      </main>

      <GlobalFooter theme="dark" />
    </div>
  );
}
