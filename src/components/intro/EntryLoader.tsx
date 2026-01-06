"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  onComplete: () => void;
}

export const EntryLoader: React.FC<Props> = ({ onComplete }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Animation sequence:
    // Stage 1: Text fades in
    // Stage 2: A and R highlight gold
    // Stage 3: A and R fly to their positions, split reveals
    // Stage 4: Complete
    const timer1 = setTimeout(() => setStage(1), 200);   // Fade in
    const timer2 = setTimeout(() => setStage(2), 1000);  // Highlight A & R
    const timer3 = setTimeout(() => setStage(3), 1600);  // Fly apart
    const timer4 = setTimeout(() => onComplete(), 2400); // Complete

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
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed inset-0 z-[500] flex items-center justify-center overflow-hidden"
    >
      {/* Split background - reveals during stage 3 */}
      <div className="absolute inset-0 flex">
        {/* Left - Alabaster */}
        <div className="w-1/2 h-full bg-theme-alabaster" />
        {/* Right - Obsidian */}
        <motion.div
          className="w-1/2 h-full bg-theme-obsidian"
          initial={{ x: '100%' }}
          animate={{ x: stage >= 3 ? 0 : '100%' }}
          transition={{
            duration: 0.6,
            ease: [0.4, 0, 0.2, 1]
          }}
        />
      </div>

      {/* Center text container - fades out during split */}
      <motion.div
        className="relative z-10 flex items-center justify-center"
        animate={{
          opacity: stage >= 3 ? 0 : 1,
          scale: stage >= 3 ? 0.95 : 1,
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* TARIFÉ */}
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: stage >= 1 ? 1 : 0,
            y: stage >= 1 ? 0 : 10,
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-3xl sm:text-4xl md:text-7xl tracking-[0.15em] font-serif font-light text-theme-charcoal mr-[0.3em]"
        >
          TARIFÉ
        </motion.span>

        {/* A - flies to left */}
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: stage >= 1 ? 1 : 0,
            y: stage >= 1 ? 0 : 10,
            color: stage >= 2 ? '#c5a66a' : '#1A1A1A',
            scale: stage === 2 ? 1.1 : 1,
          }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
            color: { duration: 0.3 },
            scale: { duration: 0.3 }
          }}
          className="text-3xl sm:text-4xl md:text-7xl tracking-[0.15em] font-serif font-light"
        >
          A
        </motion.span>

        {/* TT */}
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: stage >= 1 ? (stage >= 3 ? 0 : 1) : 0,
            y: stage >= 1 ? 0 : 10,
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-3xl sm:text-4xl md:text-7xl tracking-[0.15em] font-serif font-light text-theme-charcoal"
        >
          TT
        </motion.span>

        {/* Ä */}
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: stage >= 1 ? (stage >= 3 ? 0 : 1) : 0,
            y: stage >= 1 ? 0 : 10,
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-3xl sm:text-4xl md:text-7xl tracking-[0.15em] font-serif font-light text-theme-charcoal"
        >
          Ä
        </motion.span>

        {/* R - flies to right */}
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: stage >= 1 ? 1 : 0,
            y: stage >= 1 ? 0 : 10,
            color: stage >= 2 ? '#c5a66a' : '#1A1A1A',
            scale: stage === 2 ? 1.1 : 1,
          }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
            color: { duration: 0.3 },
            scale: { duration: 0.3 }
          }}
          className="text-3xl sm:text-4xl md:text-7xl tracking-[0.15em] font-serif font-light"
        >
          R
        </motion.span>
      </motion.div>

      {/* Flying A - appears during stage 3, flies to left position */}
      <motion.span
        initial={{
          opacity: 0,
          x: 0,
          y: 0,
          scale: 1
        }}
        animate={{
          opacity: stage >= 3 ? 1 : 0,
          x: stage >= 3 ? '-25vw' : 0,
          y: stage >= 3 ? 0 : 0,
          scale: stage >= 3 ? 2.5 : 1,
        }}
        transition={{
          duration: 0.6,
          ease: [0.4, 0, 0.2, 1]
        }}
        className="absolute z-20 text-5xl sm:text-6xl md:text-[10rem] font-serif font-bold text-theme-gold leading-none"
      >
        A
      </motion.span>

      {/* Flying R - appears during stage 3, flies to right position */}
      <motion.span
        initial={{
          opacity: 0,
          x: 0,
          y: 0,
          scale: 1
        }}
        animate={{
          opacity: stage >= 3 ? 1 : 0,
          x: stage >= 3 ? '25vw' : 0,
          y: stage >= 3 ? 0 : 0,
          scale: stage >= 3 ? 2.5 : 1,
        }}
        transition={{
          duration: 0.6,
          ease: [0.4, 0, 0.2, 1]
        }}
        className="absolute z-20 text-5xl sm:text-6xl md:text-[10rem] font-serif font-bold text-theme-gold leading-none"
      >
        R
      </motion.span>

      {/* Subtle tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{
          opacity: stage >= 1 && stage < 3 ? 0.4 : 0,
        }}
        transition={{ duration: 0.4, delay: stage === 1 ? 0.3 : 0 }}
        className="absolute bottom-1/3 font-mono text-[9px] md:text-[10px] uppercase tracking-[0.5em] text-theme-charcoal"
      >
        Scent Archive
      </motion.p>

      {/* Gold glow during highlight */}
      {stage === 2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.08 }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#c5a66a_0%,_transparent_50%)] pointer-events-none"
        />
      )}
    </motion.div>
  );
};
