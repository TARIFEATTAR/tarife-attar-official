"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  theme?: 'atlas' | 'relic';
  onNavigate?: (path: string) => void;
}

export const GlobalCompass: React.FC<Props> = ({ theme = 'atlas', onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDir, setActiveDir] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The compass is a bridge between two worlds
  const isAtlas = theme === 'atlas';
  const bgColor = isAtlas ? 'bg-theme-alabaster' : 'bg-theme-obsidian';
  const borderColor = isAtlas ? 'border-theme-charcoal' : 'border-theme-industrial';

  // N: Home (Straddle), E: Relic (Black/Right), W: Atlas (White/Left), S: Satchel
  const menuItems = [
    { label: 'HOME', dir: 'N', angle: 0, path: 'home', desc: 'The Threshold' },
    { label: 'THE RELIC', dir: 'E', angle: 90, path: 'relic', desc: 'Material Vault' },
    { label: 'THE ATLAS', dir: 'W', angle: -90, path: 'atlas', desc: 'Sensory Journal' },
    { label: 'SATCHEL', dir: 'S', angle: 180, path: 'cart', desc: 'Your Archive' },
  ];

  const handleMouseEnter = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => {
      setIsOpen(false);
      setActiveDir(null);
    }, 400);
  };

  const getNeedleRotation = () => {
    switch (activeDir) {
      case 'N': return 0;
      case 'E': return 90;
      case 'W': return -90;
      case 'S': return 180;
      default: return 0;
    }
  };

  return (
    <div 
      className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[1000] flex items-center justify-center pointer-events-none"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background Detection Zone */}
      <div className="absolute w-[400px] h-[300px] rounded-full pointer-events-auto bg-transparent -z-20" />

      {/* The Visual Instrument */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="absolute bottom-0 w-[420px] h-[420px] flex items-center justify-center pointer-events-none"
          >
            {/* The Main Dial Ring */}
            <div className="relative w-full h-full rounded-full border border-theme-charcoal/10 overflow-hidden shadow-2xl bg-white/5 backdrop-blur-sm">
              {/* Split Theme Backdrop */}
              <div className="flex w-full h-full">
                <div className="w-1/2 h-full bg-[#F2F0E9] border-r border-theme-charcoal/10" />
                <div className="w-1/2 h-full bg-[#121212]" />
              </div>
              
              {/* Radial Notches */}
              <div className="absolute inset-4 rounded-full border border-dashed border-current opacity-5 pointer-events-none" />
            </div>

            {/* Menu Labels */}
            {menuItems.map((item) => {
              const radius = 150;
              const rad = (item.angle * Math.PI) / 180;
              const x = Math.sin(rad) * radius;
              const y = -Math.cos(rad) * radius;
              
              const isRelic = item.dir === 'E';
              const isHome = item.dir === 'N';

              return (
                <motion.button
                  key={item.dir}
                  onClick={() => onNavigate?.(item.path)}
                  onMouseEnter={() => setActiveDir(item.dir)}
                  className="absolute p-4 pointer-events-auto group flex flex-col items-center"
                  style={{ transform: `translate(${x}px, ${y}px)` }}
                >
                  <span className={`font-mono text-[10px] tracking-[0.4em] transition-all duration-300 ${
                    isHome ? 'text-theme-charcoal mix-blend-difference' : 
                    isRelic ? 'text-theme-industrial' : 
                    'text-theme-charcoal'
                  } ${activeDir === item.dir ? 'opacity-100 scale-110 font-bold' : 'opacity-40 scale-100'}`}>
                    {item.label}
                  </span>
                  <AnimatePresence>
                    {activeDir === item.dir && (
                      <motion.span 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-serif italic text-[9px] opacity-40 mt-1 whitespace-nowrap"
                      >
                        {item.desc}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Central Instrument Core (Always Visible Anchor) */}
      <motion.div
        animate={{ 
          scale: isOpen ? 1.1 : 1,
          boxShadow: isOpen ? '0 0 40px rgba(0,0,0,0.2)' : '0 0 10px rgba(0,0,0,0.05)'
        }}
        className={`relative w-24 h-24 rounded-full border-2 ${borderColor} ${bgColor} flex items-center justify-center pointer-events-auto cursor-pointer z-[1001] shadow-lg`}
      >
        {/* Needle System */}
        <motion.div
          animate={{ rotate: getNeedleRotation() }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="absolute w-[2px] h-16 flex flex-col items-center"
        >
          <div className="w-full h-1/2 bg-current" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }} />
          <div className="w-[1px] h-1/2 bg-current opacity-20" />
        </motion.div>

        {/* Pivot Center */}
        <div className={`w-3 h-3 rounded-full border border-white/20 shadow-inner ${isAtlas ? 'bg-theme-charcoal' : 'bg-theme-industrial'}`}>
          <div className="w-full h-full rounded-full animate-pulse bg-white/20" />
        </div>

        {/* Invisible Legend Indicators */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 font-mono text-[7px] opacity-30">N</div>
        <div className="absolute right-1 top-1/2 -translate-y-1/2 font-mono text-[7px] opacity-30">E</div>
        <div className="absolute left-1 top-1/2 -translate-y-1/2 font-mono text-[7px] opacity-30">W</div>
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 font-mono text-[7px] opacity-30">S</div>
      </motion.div>

      {/* Straddle Line (Visual cue for the Home position) */}
      <motion.div 
        animate={{ opacity: isOpen ? 0.4 : 0 }}
        className="absolute bottom-24 w-[1px] h-48 bg-theme-charcoal/20 -z-10"
      />
    </div>
  );
};
