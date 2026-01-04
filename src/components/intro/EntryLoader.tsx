"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  onComplete: () => void;
}

export const EntryLoader: React.FC<Props> = ({ onComplete }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Smoother sequential animation with better timing
    const timer1 = setTimeout(() => setStage(1), 200);   // Fade in text
    const timer2 = setTimeout(() => setStage(2), 1200);  // Gold highlight
    const timer3 = setTimeout(() => setStage(3), 1800);  // Begin split
    const timer4 = setTimeout(() => onComplete(), 2200); // Complete

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed inset-0 z-[500] bg-theme-alabaster flex items-center justify-center overflow-hidden"
    >
      {/* Brand text container */}
      <motion.div 
        className="relative flex flex-col items-center justify-center"
        animate={{
          scale: stage >= 3 ? 0.9 : 1,
          opacity: stage >= 3 ? 0 : 1
        }}
        transition={{ 
          duration: 0.4,
          ease: [0.4, 0, 0.2, 1]
        }}
      >
        {/* TARIFE ATTÄR */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ 
            opacity: stage >= 1 ? 1 : 0,
            y: stage >= 1 ? 0 : 15,
          }}
          transition={{ 
            duration: 0.6,
            ease: [0.4, 0, 0.2, 1]
          }}
          className="text-3xl sm:text-4xl md:text-7xl tracking-[0.15em] font-serif font-light text-theme-charcoal"
        >
          <span>TARIFE </span>
          <motion.span
            animate={{
              color: stage === 2 ? '#c5a66a' : '#1A1A1A',
            }}
            transition={{ duration: 0.4 }}
          >
            ATTÄR
          </motion.span>
        </motion.h1>

        {/* Subtle tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: stage >= 1 ? 0.4 : 0,
          }}
          transition={{ 
            duration: 0.5,
            delay: 0.3,
            ease: "easeOut"
          }}
          className="mt-4 md:mt-6 font-mono text-[9px] md:text-[10px] uppercase tracking-[0.5em] text-theme-charcoal"
        >
          Scent Archive
        </motion.p>
      </motion.div>
      
      {/* Split reveal background */}
      {stage >= 3 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 z-[-1] flex pointer-events-none"
        >
          {/* Left Panel - Atlas side */}
          <motion.div 
            className="w-1/2 h-full bg-theme-alabaster"
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
          {/* Right Panel - Relic side slides in */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            transition={{ 
              duration: 0.5,
              ease: [0.4, 0, 0.2, 1]
            }}
            className="w-1/2 h-full bg-theme-obsidian" 
          />
        </motion.div>
      )}

      {/* Subtle gold glow during highlight stage */}
      {stage === 2 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.06 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#c5a66a_0%,_transparent_50%)] pointer-events-none"
        />
      )}
    </motion.div>
  );
};
