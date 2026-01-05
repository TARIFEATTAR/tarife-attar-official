"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RealisticCompass } from '@/components/navigation/RealisticCompass';
import { EntryState } from '@/types';

interface Props {
  onNavigate?: (path: string) => void;
}

export const SplitEntry: React.FC<Props> = ({ onNavigate }) => {
  const [hovered, setHovered] = useState<EntryState>('idle');

  // Convert hover state to compass direction
  // Atlas is on the LEFT (West), Relic is on the RIGHT (East)
  const getCompassDirection = (): 'W' | 'E' | null => {
    if (hovered === 'atlas') return 'W';
    if (hovered === 'relic') return 'E';
    return null;
  };

  const handleCompassNavigate = (path: string) => {
    onNavigate?.(path);
  };

  return (
    <div className="relative w-full h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Atlas Side (Left/West) - Fixed 50% */}
      <motion.section
        onMouseEnter={() => setHovered('atlas')}
        onMouseLeave={() => setHovered('idle')}
        onClick={() => onNavigate?.('atlas')}
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
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
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
            <span className={`inline-block px-6 sm:px-8 py-3 sm:py-4 border border-theme-charcoal/20 font-mono text-[9px] md:text-[10px] uppercase tracking-[0.4em] transition-all duration-500 ${hovered === 'atlas' ? 'bg-theme-charcoal text-white' : ''}`}>
              Explore Territories
            </span>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Relic Side (Right/East) - Fixed 50% */}
      <motion.section
        onMouseEnter={() => setHovered('relic')}
        onMouseLeave={() => setHovered('idle')}
        onClick={() => onNavigate?.('relic')}
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
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
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
            <span className={`inline-block px-6 sm:px-8 py-3 sm:py-4 border border-white/20 font-mono text-[9px] md:text-[10px] uppercase tracking-[0.4em] transition-all duration-500 ${hovered === 'relic' ? 'bg-white text-black' : ''}`}>
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
        absolutePosition={true}
      />
    </div>
  );
};

export default SplitEntry;
