
import React from 'react';
import { motion } from 'framer-motion';

export const GlobalFooter: React.FC = () => {
  return (
    <footer className="w-full bg-theme-obsidian text-theme-alabaster pt-16 md:pt-24 pb-12 px-6 md:px-24 overflow-hidden border-t border-white/5">
      <div className="max-w-[1800px] mx-auto">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12 md:gap-24 items-start">
          
          {/* Brand Identity Section */}
          <div className="lg:col-span-5 space-y-8 md:space-y-10 w-full">
            <div className="flex flex-col">
              <h2 className="text-2xl sm:text-3xl md:text-4xl tracking-[0.3em] md:tracking-[0.4em] uppercase font-semibold leading-none mb-2">
                TARIFE ATTÄR
              </h2>
              <span className="text-[9px] md:text-[10px] font-mono tracking-[0.6em] uppercase opacity-40">Modern Apothecary</span>
            </div>
            <p className="font-serif italic text-base sm:text-lg md:text-xl opacity-40 leading-relaxed max-w-sm">
              An archival study in the volatility of scent. We stabilize atmospheric memories into liquid specimens.
            </p>
            <div className="flex flex-wrap gap-x-8 gap-y-4 font-mono text-[9px] uppercase tracking-widest opacity-20">
              <a href="#" className="hover:opacity-100 transition-opacity">Journal</a>
              <a href="#" className="hover:opacity-100 transition-opacity">Archive</a>
              <a href="#" className="hover:opacity-100 transition-opacity">Stockists</a>
              <a href="#" className="hover:opacity-100 transition-opacity">Privacy</a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-3 space-y-6 md:space-y-8 w-full">
            <h3 className="font-mono text-[9px] md:text-[10px] uppercase tracking-[0.4em] opacity-20">Navigation</h3>
            <ul className="space-y-4 font-serif italic text-base sm:text-lg opacity-60">
              <li><a href="#" className="hover:opacity-100 hover:tracking-tighter transition-all">Threshold</a></li>
              <li><a href="#" className="hover:opacity-100 hover:tracking-tighter transition-all">Atlas Collection</a></li>
              <li><a href="#" className="hover:opacity-100 hover:tracking-tighter transition-all">Relic Vault</a></li>
              <li><a href="#" className="hover:opacity-100 hover:tracking-tighter transition-all">Private Consult</a></li>
            </ul>
          </div>

          {/* Newsletter / Lab Notes */}
          <div className="lg:col-span-4 space-y-6 md:space-y-8 w-full">
            <h3 className="font-mono text-[9px] md:text-[10px] uppercase tracking-[0.4em] opacity-20">Lab Notes</h3>
            <div className="space-y-6">
              <p className="font-serif italic text-sm sm:text-base opacity-40">Join the ledger for private distillation alerts.</p>
              <div className="relative w-full">
                <input 
                  type="email" 
                  placeholder="ARCHIVIST_EMAIL"
                  className="w-full bg-transparent border-b border-white/20 py-4 font-mono text-[10px] uppercase tracking-widest outline-none focus:border-white transition-colors"
                />
                <button className="absolute right-0 top-1/2 -translate-y-1/2 font-mono text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100">Subscribe</button>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Metadata Bar */}
        <div className="mt-16 md:mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 md:gap-10">
          <div className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-4 font-mono text-[8px] uppercase tracking-[0.3em] opacity-20 text-center">
            <span>Lat: 31.7917° N</span>
            <span>Lon: 7.0926° W</span>
            <span>Batch: ARCH_04_2025</span>
            <span>Status: Verified</span>
          </div>
          <div className="font-mono text-[8px] uppercase tracking-[0.3em] opacity-10 text-center">
            © 2025 Tarife Attär — All Specimens Verified Archival Grade
          </div>
        </div>
      </div>
    </footer>
  );
};
