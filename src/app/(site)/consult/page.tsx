"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { GlobalFooter } from "@/components/navigation";

export default function ConsultPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-theme-obsidian text-theme-alabaster flex flex-col">
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
      <main className="flex-1 flex items-center justify-center px-6 md:px-24 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="inline-block mb-8"
          >
            <MessageCircle className="w-16 h-16 text-theme-gold" />
          </motion.div>
          
          <span className="font-mono text-[10px] uppercase tracking-[0.8em] opacity-40 mb-6 block">
            Protocol_02
          </span>
          <h1 className="text-4xl md:text-6xl font-serif italic tracking-tighter leading-[0.9] mb-8">
            Private Consult
          </h1>
          <p className="font-serif italic text-lg md:text-xl opacity-50 leading-relaxed mb-12 max-w-lg mx-auto">
            Direct archival consultation with our in-house apothecary. 
            Bespoke formulation guidance for collectors and connoisseurs.
          </p>

          <div className="space-y-6">
            <a 
              href="mailto:consult@tarifeattar.com"
              className="inline-block px-12 py-5 border border-white/20 font-mono text-[10px] uppercase tracking-[0.4em] hover:bg-white hover:text-theme-obsidian transition-all"
            >
              Request Consultation
            </a>
            <p className="font-mono text-[9px] uppercase tracking-widest opacity-30">
              Response within 48 hours
            </p>
          </div>
        </motion.div>
      </main>

      <GlobalFooter theme="dark" />
    </div>
  );
}
