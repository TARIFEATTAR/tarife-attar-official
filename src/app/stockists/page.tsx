"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin } from "lucide-react";
import { GlobalFooter } from "@/components/navigation";

export default function StockistsPage() {
  const router = useRouter();

  const stockists = [
    { name: "Coming Soon", location: "New York, NY", status: "pending" },
    { name: "Coming Soon", location: "Los Angeles, CA", status: "pending" },
    { name: "Coming Soon", location: "London, UK", status: "pending" },
    { name: "Coming Soon", location: "Paris, FR", status: "pending" },
  ];

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
            Stockists
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-6 md:px-24 py-20">
        <div className="max-w-[1800px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mb-16"
          >
            <MapPin className="w-12 h-12 text-theme-gold mb-8" />
            <h1 className="text-4xl md:text-6xl font-serif italic tracking-tighter leading-[0.9] mb-8">
              Stockists
            </h1>
            <p className="font-serif italic text-lg md:text-xl opacity-60 leading-relaxed">
              Authorized purveyors of Tarife Attär specimens. 
              Physical locations for in-person consultation and acquisition.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {stockists.map((stockist, i) => (
              <div
                key={i}
                className="p-8 border border-theme-charcoal/10 bg-theme-charcoal/[0.02]"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-serif italic text-xl mb-1">{stockist.name}</h3>
                    <p className="font-mono text-[10px] uppercase tracking-widest opacity-40">
                      {stockist.location}
                    </p>
                  </div>
                  <span className="font-mono text-[8px] uppercase tracking-widest px-3 py-1 bg-theme-gold/10 text-theme-gold">
                    {stockist.status}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-12 font-mono text-[10px] uppercase tracking-widest opacity-30 text-center"
          >
            Retail partnerships opening Q2 2025
          </motion.p>
        </div>
      </main>

      <GlobalFooter theme="dark" />
    </div>
  );
}
