"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EntryState } from '@/types';
import { AtmosphereTuner } from './AtmosphereTuner';
import { ViscosityTuner } from './ViscosityTuner';

interface Props {
  onNavigate?: (path: string) => void;
  onGuidedEntry?: (path: 'atlas' | 'relic') => void;
}

export const SplitEntry: React.FC<Props> = ({ onNavigate, onGuidedEntry }) => {
  const [selection, setSelection] = useState<EntryState>('idle');
  const [hovered, setHovered] = useState<EntryState>('idle');
  const [showChoice, setShowChoice] = useState<EntryState>('idle');

  const isAnySelected = selection !== 'idle';

  const handleChoice = (isGuided: boolean) => {
    const target = showChoice as 'atlas' | 'relic';
    if (isGuided) {
      onGuidedEntry?.(target);
    } else {
      setSelection(target);
    }
    setShowChoice('idle');
  };

  return (
    <div className="relative w-full h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Choice Modal Overlay */}
      <AnimatePresence>
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
                   <span className="inline-block px-8 sm:px-10 md:px-12 py-3 sm:py-4 md:py-5 bg-theme-charcoal text-white font-mono text-[10px] uppercase tracking-[0.4em] shadow-xl group-hover:scale-105 transition-transform">Start Onboarding</span>
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
                   <span className="inline-block px-8 sm:px-10 md:px-12 py-3 sm:py-4 md:py-5 border border-white/20 text-white font-mono text-[10px] uppercase tracking-[0.4em] group-hover:bg-white group-hover:text-black transition-all shadow-xl">Enter Archive</span>
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

      {/* Atlas Side */}
      <motion.section
        onMouseEnter={() => !isAnySelected && setHovered('atlas')}
        onMouseLeave={() => !isAnySelected && setHovered('idle')}
        onClick={() => setShowChoice('atlas')}
        className={`relative flex flex-col items-center justify-center overflow-hidden cursor-pointer
          ${selection === 'atlas' ? 'w-full h-full z-40' : selection === 'relic' ? 'w-0 h-0 md:w-0 md:h-full pointer-events-none' : 
            hovered === 'atlas' ? 'w-full h-2/3 md:w-[75%] md:h-full' : 
            hovered === 'relic' ? 'w-full h-1/3 md:w-[25%] md:h-full' : 'w-full h-1/2 md:w-1/2 md:h-full'}
          bg-theme-alabaster text-theme-charcoal transition-all duration-1000 ease-out`}
      >
        <AnimatePresence mode="wait">
          {selection === 'idle' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center px-6 md:px-10 relative z-10"
            >
              <div className="flex flex-col items-center">
                <motion.span className="text-5xl sm:text-6xl md:text-[12rem] font-serif font-bold mb-2 leading-none text-theme-gold">A</motion.span>
                <motion.h2 className="text-2xl sm:text-3xl md:text-6xl italic font-light mb-2 md:mb-6 tracking-tighter">Atlas</motion.h2>
              </div>
              <motion.p className="max-w-[160px] sm:max-w-[200px] md:max-w-xs mx-auto text-xs sm:text-sm md:text-lg opacity-80 leading-relaxed font-serif italic">
                {hovered === 'atlas' ? "Begin Protocol" : "Slow-release molecular oils stabilized via the Tarife Attär system."}
              </motion.p>
            </motion.div>
          )}

          {selection === 'atlas' && (
            <motion.div key="atlas-active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full p-6 sm:p-8 md:p-20 flex flex-col">
              <AtmosphereTuner onBack={() => setSelection('idle')} onNavigate={onNavigate} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      {/* Relic Side */}
      <motion.section
        onMouseEnter={() => !isAnySelected && setHovered('relic')}
        onMouseLeave={() => !isAnySelected && setHovered('idle')}
        onClick={() => setShowChoice('relic')}
        className={`relative flex flex-col items-center justify-center overflow-hidden cursor-pointer
          ${selection === 'relic' ? 'w-full h-full z-40' : selection === 'atlas' ? 'w-0 h-0 md:w-0 md:h-full pointer-events-none' : 
            hovered === 'relic' ? 'w-full h-2/3 md:w-[75%] md:h-full' : 
            hovered === 'atlas' ? 'w-full h-1/3 md:w-[25%] md:h-full' : 'w-full h-1/2 md:w-1/2 md:h-full'}
          bg-theme-obsidian text-theme-alabaster transition-all duration-1000 ease-out`}
      >
        <AnimatePresence mode="wait">
          {selection === 'idle' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center px-6 md:px-10 relative z-10"
            >
              <div className="flex flex-col items-center">
                <motion.span className="text-5xl sm:text-6xl md:text-[12rem] font-serif font-bold mb-2 leading-none text-theme-gold">R</motion.span>
                <motion.h2 className="text-2xl sm:text-3xl md:text-6xl font-light mb-2 md:mb-6 tracking-tighter">Relic</motion.h2>
              </div>
              <motion.p className="max-w-[160px] sm:max-w-[200px] md:max-w-xs mx-auto text-xs sm:text-sm md:text-lg leading-relaxed font-serif italic">
                {hovered === 'relic' ? "Access Vault" : "Weighty study of fossilized resins."}
              </motion.p>
            </motion.div>
          )}

          {selection === 'relic' && (
            <motion.div key="relic-active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full p-6 sm:p-8 md:p-20 flex flex-col">
              <ViscosityTuner onBack={() => setSelection('idle')} onNavigate={onNavigate} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>
    </div>
  );
};
