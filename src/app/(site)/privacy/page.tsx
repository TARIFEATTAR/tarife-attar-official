"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { GlobalFooter } from "@/components/navigation";

export default function PrivacyPage() {
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
          <span className="font-mono text-[10px] uppercase tracking-[0.6em] opacity-40">
            Legal
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-6 md:px-24 py-20">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-serif italic tracking-tighter leading-[0.9] mb-12">
              Privacy Policy
            </h1>

            <div className="prose prose-lg max-w-none font-serif">
              <p className="text-lg opacity-60 italic mb-8">
                Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </p>

              <section className="mb-12">
                <h2 className="text-2xl font-serif italic mb-4">Data Collection</h2>
                <p className="opacity-70 leading-relaxed">
                  Tarife Attär collects minimal personal information necessary to fulfill orders 
                  and provide archival consultation services. This includes contact information, 
                  shipping addresses, and preference data voluntarily submitted through our 
                  Sensory Curator questionnaire.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-serif italic mb-4">Use of Information</h2>
                <p className="opacity-70 leading-relaxed">
                  Your information is used solely to process orders, communicate about products, 
                  and improve your experience with our archive. We do not sell, trade, or 
                  transfer your personal information to outside parties.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-serif italic mb-4">Cookies</h2>
                <p className="opacity-70 leading-relaxed">
                  We use cookies to enhance site functionality and analyze traffic patterns. 
                  You may disable cookies in your browser settings, though some features 
                  may be limited.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-serif italic mb-4">Contact</h2>
                <p className="opacity-70 leading-relaxed">
                  For privacy-related inquiries, contact us at{" "}
                  <a href="mailto:privacy@tarifeattar.com" className="text-theme-gold hover:underline">
                    privacy@tarifeattar.com
                  </a>
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </main>

      <GlobalFooter theme="dark" />
    </div>
  );
}
