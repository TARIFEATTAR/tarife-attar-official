"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function QuizPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-theme-alabaster text-theme-charcoal flex flex-col">
      {/* Header */}
      <header className="px-6 md:px-24 py-6">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Threshold
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-6 md:px-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl text-center"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="inline-block mb-8"
          >
            <Sparkles className="w-16 h-16 text-theme-gold" />
          </motion.div>
          
          <span className="font-mono text-[10px] uppercase tracking-[0.8em] text-theme-gold mb-6 block">
            Protocol_01
          </span>
          <h1 className="text-4xl md:text-6xl font-serif italic tracking-tighter leading-[0.9] mb-8">
            Sensory Curator
          </h1>
          <p className="font-serif italic text-lg md:text-xl opacity-60 leading-relaxed mb-12 max-w-lg mx-auto">
            A guided calibration to discover your molecular match. 
            Answer a series of atmospheric questions to reveal your archival coordinates.
          </p>

          <div className="space-y-4">
            <div className="inline-block px-12 py-5 bg-theme-charcoal/10 border border-theme-charcoal/20 font-mono text-[10px] uppercase tracking-[0.4em]">
              Coming Soon — Q1 2025
            </div>
            <p className="font-mono text-[9px] uppercase tracking-widest opacity-30">
              Currently in distillation
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
