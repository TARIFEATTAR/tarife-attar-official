"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  onComplete: () => void;
}

export const EntryLoader: React.FC<Props> = ({ onComplete }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Simple sequential animation
    const timer1 = setTimeout(() => setStage(1), 300);
    const timer2 = setTimeout(() => setStage(2), 1000);
    const timer3 = setTimeout(() => setStage(3), 1800);
    const timer4 = setTimeout(() => onComplete(), 2400);

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
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[500] bg-theme-alabaster flex items-center justify-center overflow-hidden"
    >
      {/* Text container with scaling during fission */}
      <motion.div 
        className="relative flex items-center justify-center gap-[0.4em] text-4xl md:text-8xl tracking-[0.2em] font-serif font-light text-theme-charcoal"
        animate={{
          scale: stage >= 3 ? 0.8 : 1,
          filter: stage >= 3 ? 'blur(12px)' : 'blur(0px)',
          opacity: stage >= 3 ? 0.1 : 1
        }}
        transition={{ 
          duration: 0.8,
          ease: [0.85, 0, 0.15, 1] // Liquid easing
        }}
      >
        {/* TARIFE text */}
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: stage >= 1 ? (stage >= 3 ? 0.2 : 1) : 0,
            y: stage >= 1 ? 0 : 20,
            filter: stage >= 3 ? 'blur(8px)' : 'blur(0px)'
          }}
          transition={{ 
            duration: 0.6,
            ease: [0.85, 0, 0.15, 1] // Liquid easing
          }}
          className="whitespace-nowrap"
        >
          TARIFE
        </motion.span>

        <div className="flex items-center">
          {/* A insignia - with layoutId for morphing */}
          <motion.span
            layoutId="atlas-insignia"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: stage >= 1 ? 1 : 0,
              scale: stage === 2 ? 1.15 : 1,
              color: stage === 2 ? '#c5a66a' : '#1A1A1A',
            }}
            transition={{ 
              duration: 0.5,
              ease: [0.85, 0, 0.15, 1] // Liquid easing
            }}
            className="inline-block"
          >
            A
          </motion.span>

          {/* TTÄ text */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: stage >= 1 ? (stage >= 3 ? 0.1 : 1) : 0,
              filter: stage >= 3 ? 'blur(12px)' : 'blur(0px)',
            }}
            transition={{ 
              duration: 0.6,
              ease: [0.85, 0, 0.15, 1] // Liquid easing
            }}
            className="inline-block"
          >
            TTÄ
          </motion.span>

          {/* R insignia - with layoutId for morphing */}
          <motion.span
            layoutId="relic-insignia"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: stage >= 1 ? 1 : 0,
              scale: stage === 2 ? 1.15 : 1,
              color: stage === 2 ? '#c5a66a' : '#1A1A1A',
            }}
            transition={{ 
              duration: 0.5,
              ease: [0.85, 0, 0.15, 1] // Liquid easing
            }}
            className="inline-block"
          >
            R
          </motion.span>
        </div>
      </motion.div>
      
      {/* Enhanced Fission: Split reveal background with blur + scale */}
      {stage >= 3 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-[-1] flex pointer-events-none"
        >
          {/* Left Panel - Fixed with slight scale */}
          <motion.div 
            className="w-1/2 h-full bg-theme-alabaster"
            initial={{ scale: 1.1, filter: 'blur(4px)' }}
            animate={{ 
              scale: 1,
              filter: 'blur(0px)'
            }}
            transition={{ 
              duration: 0.8,
              ease: [0.85, 0, 0.15, 1] // Liquid easing
            }}
          />
          {/* Right Panel - Slides in with blur + scale */}
          <motion.div 
            initial={{ x: '100%', scale: 1.1, filter: 'blur(4px)' }}
            animate={{ 
              x: 0,
              scale: 1,
              filter: 'blur(0px)'
            }}
            transition={{ 
              duration: 0.8,
              ease: [0.85, 0, 0.15, 1] // Liquid easing
            }}
            className="w-1/2 h-full bg-theme-obsidian" 
          />
        </motion.div>
      )}

      {/* Flash effect during stage 2 */}
      {stage === 2 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.08 }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#c5a66a_0%,_transparent_60%)]"
        />
      )}
    </motion.div>
  );
};
