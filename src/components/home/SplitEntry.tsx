"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RealisticCompass } from '@/components/navigation/RealisticCompass';
import { EntryState } from '@/types';

interface Props {
  onNavigate?: (path: string) => void;
  onGuidedEntry?: (path: 'atlas' | 'relic') => void;
}

export const SplitEntry: React.FC<Props> = ({ onNavigate, onGuidedEntry }) => {
  const [hovered, setHovered] = useState<EntryState>('idle');
  const [showChoice, setShowChoice] = useState<EntryState>('idle');

  const handleChoice = (isGuided: boolean) => {
    const target = showChoice as 'atlas' | 'relic';
    if (isGuided) {
      onGuidedEntry?.(target);
    } else {
      onNavigate?.(target);
    }
    setShowChoice('idle');
  };

  // Convert hover state to compass direction
  // Atlas is on the LEFT (West), Relic is on the RIGHT (East)
  const getCompassDirection = (): 'W' | 'E' | null => {
    if (hovered === 'atlas') return 'W';
    if (hovered === 'relic') return 'E';
    return null;
  };

  const handleCompassNavigate = (path: string) => {
    // Handle compass navigation from split entry
    if (path === 'atlas' || path === 'relic') {
      setShowChoice(path as EntryState);
    } else {
      onNavigate?.(path);
    }
  };

  return (
    <div className="relative w-full h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Choice Modal Overlay */}
      <AnimatePresence mode="wait">
        {showChoice !== 'idle' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-theme-charcoal/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 md:p-12"
          >
            <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden rounded-sm">
              
              <button 
                onClick={() => handleChoice(true)}
                className="relative group p-8 sm:p-10 md:p-20 bg-theme-alabaster text-theme-charcoal flex flex-col items-center text-center space-y-4 sm:space-y-6 md:space-y-8 transition-all duration-700 hover:brightness-105"
              >
                <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.8em] text-theme-gold">Protocol_Alpha</span>
                <h3 className="text-3xl sm:text-4xl md:text-6xl font-serif italic tracking-tighter">Guided Entry</h3>
                <p className="font-serif italic text-base sm:text-lg md:text-xl opacity-60 max-w-xs leading-relaxed">
                  Recommended for new seekers. A sensory orientation through the Tarife Attär system.
                </p>
                <div className="pt-2 md:pt-8">
                  <span className="inline-block px-8 sm:px-10 md:px-12 py-3 sm:py-4 md:py-5 bg-theme-charcoal text-white font-mono text-[10px] uppercase tracking-[0.4em] shadow-xl group-hover:scale-105 transition-transform">
                    Start Onboarding
                  </span>
                </div>
              </button>

              <button 
                onClick={() => handleChoice(false)}
                className="relative group p-8 sm:p-10 md:p-20 bg-theme-obsidian text-theme-alabaster flex flex-col items-center text-center space-y-4 sm:space-y-6 md:space-y-8 transition-all duration-700 hover:bg-[#1a1a1a]"
              >
                <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.8em] opacity-30">Protocol_Beta</span>
                <h3 className="text-3xl sm:text-4xl md:text-6xl font-serif italic tracking-tighter">Direct Entry</h3>
                <p className="font-serif italic text-base sm:text-lg md:text-xl opacity-40 max-w-xs leading-relaxed">
                  For established archivists. Bypass orientation to access the full specimen vault.
                </p>
                <div className="pt-2 md:pt-8">
                  <span className="inline-block px-8 sm:px-10 md:px-12 py-3 sm:py-4 md:py-5 border border-white/20 text-white font-mono text-[10px] uppercase tracking-[0.4em] group-hover:bg-white group-hover:text-black transition-all shadow-xl">
                    Enter Archive
                  </span>
                </div>
              </button>

              <button 
                onClick={() => setShowChoice('idle')} 
                className="absolute top-6 right-6 md:top-auto md:bottom-16 md:left-1/2 md:-translate-x-1/2 font-mono text-[9px] md:text-[10px] uppercase tracking-[0.6em] text-white/60 md:text-white/40 hover:text-white transition-colors p-2"
              >
                [ Close ]
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Atlas Side (Left/West) - Fixed 50% */}
      <motion.section
        onMouseEnter={() => setHovered('atlas')}
        onMouseLeave={() => setHovered('idle')}
        onClick={() => setShowChoice('atlas')}
        className="relative flex flex-col items-center justify-center overflow-hidden cursor-pointer
          w-full h-1/2 md:w-1/2 md:h-full
          bg-theme-alabaster text-theme-charcoal
          group"
      >
        {/* Subtle hover overlay */}
        <motion.div 
          className="absolute inset-0 bg-theme-gold/5 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: hovered === 'atlas' ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center px-6 md:px-10 relative z-10"
        >
          <div className="flex flex-col items-center">
            {/* A insignia */}
            <motion.span 
              layoutId="atlas-insignia"
              className="text-5xl sm:text-6xl md:text-[10rem] font-serif font-bold mb-2 leading-none text-theme-gold"
            >
              A
            </motion.span>
            <motion.h2 className="text-2xl sm:text-3xl md:text-5xl italic font-light mb-4 md:mb-6 tracking-tighter">
              Atlas
            </motion.h2>
          </div>
          
          {/* Always visible description */}
          <motion.p className="max-w-[200px] sm:max-w-[240px] md:max-w-sm mx-auto text-xs sm:text-sm md:text-base opacity-60 leading-relaxed font-serif italic mb-6 md:mb-8">
            Clean perfume oils organized across four sensory territories. Twenty-four destinations for the modern explorer.
          </motion.p>

          {/* Territory preview */}
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 font-mono text-[8px] md:text-[9px] uppercase tracking-[0.3em] opacity-40 mb-6 md:mb-8">
            <span className="group-hover:text-theme-gold group-hover:opacity-100 transition-all">Tidal</span>
            <span className="group-hover:text-theme-gold group-hover:opacity-100 transition-all delay-75">Ember</span>
            <span className="group-hover:text-theme-gold group-hover:opacity-100 transition-all delay-100">Petal</span>
            <span className="group-hover:text-theme-gold group-hover:opacity-100 transition-all delay-150">Terra</span>
          </div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span className="inline-block px-6 sm:px-8 py-3 sm:py-4 border border-theme-charcoal/20 font-mono text-[9px] md:text-[10px] uppercase tracking-[0.4em] group-hover:bg-theme-charcoal group-hover:text-white transition-all duration-500">
              Explore Territories
            </span>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Relic Side (Right/East) - Fixed 50% */}
      <motion.section
        onMouseEnter={() => setHovered('relic')}
        onMouseLeave={() => setHovered('idle')}
        onClick={() => setShowChoice('relic')}
        className="relative flex flex-col items-center justify-center overflow-hidden cursor-pointer
          w-full h-1/2 md:w-1/2 md:h-full
          bg-theme-obsidian text-theme-alabaster
          group"
      >
        {/* Subtle hover overlay */}
        <motion.div 
          className="absolute inset-0 bg-theme-gold/5 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: hovered === 'relic' ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center px-6 md:px-10 relative z-10"
        >
          <div className="flex flex-col items-center">
            {/* R insignia */}
            <motion.span 
              layoutId="relic-insignia"
              className="text-5xl sm:text-6xl md:text-[10rem] font-serif font-bold mb-2 leading-none text-theme-gold"
            >
              R
            </motion.span>
            <motion.h2 className="text-2xl sm:text-3xl md:text-5xl font-light mb-4 md:mb-6 tracking-tighter">
              Relic
            </motion.h2>
          </div>
          
          {/* Always visible description */}
          <motion.p className="max-w-[200px] sm:max-w-[240px] md:max-w-sm mx-auto text-xs sm:text-sm md:text-base opacity-50 leading-relaxed font-serif italic mb-6 md:mb-8">
            Pure resins, rare ouds, and aged materials for the devoted collector. Each specimen arrives with provenance documentation.
          </motion.p>

          {/* Material preview */}
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 font-mono text-[8px] md:text-[9px] uppercase tracking-[0.3em] opacity-30 mb-6 md:mb-8">
            <span className="group-hover:text-theme-gold group-hover:opacity-100 transition-all">Resins</span>
            <span className="group-hover:text-theme-gold group-hover:opacity-100 transition-all delay-75">Ouds</span>
            <span className="group-hover:text-theme-gold group-hover:opacity-100 transition-all delay-100">Ambers</span>
            <span className="group-hover:text-theme-gold group-hover:opacity-100 transition-all delay-150">Musks</span>
          </div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <span className="inline-block px-6 sm:px-8 py-3 sm:py-4 border border-white/20 font-mono text-[9px] md:text-[10px] uppercase tracking-[0.4em] group-hover:bg-white group-hover:text-black transition-all duration-500">
              Enter Vault
            </span>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Centered Compass - Teaching Mode */}
      <RealisticCompass
        onNavigate={handleCompassNavigate}
        position="center"
        hoveredDirection={getCompassDirection()}
        showHint={true}
        size="lg"
      />
    </div>
  );
};

export default SplitEntry;
