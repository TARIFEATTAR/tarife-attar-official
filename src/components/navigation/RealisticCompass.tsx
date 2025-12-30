"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, LayoutGroup } from 'framer-motion';

interface NavItem {
  label: string;
  path: string;
  direction: 'N' | 'E' | 'S' | 'W';
  angle: number;
  description: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Threshold', path: 'home', direction: 'N', angle: 0, description: 'Return to origin' },
  { label: 'The Relic', path: 'relic', direction: 'E', angle: 90, description: 'Pure resins & rare materials' },
  { label: 'Satchel', path: 'cart', direction: 'S', angle: 180, description: 'Your collection' },
  { label: 'The Atlas', path: 'atlas', direction: 'W', angle: 270, description: 'Perfume oil territories' },
];

interface Props {
  onNavigate: (path: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

export const RealisticCompass: React.FC<Props> = ({ onNavigate, size = 'md' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredDirection, setHoveredDirection] = useState<'N' | 'E' | 'S' | 'W' | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { scrollYProgress } = useScroll();
  const rawRotation = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const needleRotation = useSpring(rawRotation, {
    stiffness: 120,
    damping: 24,
    mass: 0.8,
  });

  useEffect(() => {
    setIsMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const sizeConfig = { sm: isMobile ? 64 : 80, md: isMobile ? 72 : 100, lg: isMobile ? 100 : 140 };
  const compassSize = sizeConfig[size];
  
  // Perfectly circular proportions
  const expandedSize = isMobile ? 180 : 240;
  const compassRadius = expandedSize / 2;
  const labelGap = isMobile ? 40 : 60; // Exact gap from edge of compass to label
  
  const needleBaseOffset = 45;

  const handleNavClick = (item: NavItem) => {
    onNavigate(item.path);
    setIsOpen(false);
  };

  const handleTouchStart = (direction: 'N' | 'E' | 'S' | 'W') => setHoveredDirection(direction);
  const handleOverlayClick = () => {
    setIsOpen(false);
    setHoveredDirection(null);
  };

  if (!isMounted) return null;

  const springTransition = { type: "spring" as const, stiffness: 120, damping: 24, mass: 0.8 };

  return (
    <LayoutGroup>
      {/* 1. NAVIGATION OVERLAY LAYER */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="fixed inset-0 z-[2998] bg-black/95 backdrop-blur-2xl cursor-pointer"
              onClick={handleOverlayClick}
            />

            {/* Labels Layer - Fixed Inset 0 to guarantee perfect centering */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[2999] pointer-events-none flex items-center justify-center"
            >
              <div className="relative w-full h-full flex items-center justify-center">
                
                {/* NORTH - Threshold */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: 0.1, ...springTransition }}
                  onClick={() => handleNavClick(NAV_ITEMS[0])}
                  onMouseEnter={() => !isMobile && setHoveredDirection('N')}
                  onMouseLeave={() => !isMobile && setHoveredDirection(null)}
                  onTouchStart={() => handleTouchStart('N')}
                  onTouchEnd={() => setHoveredDirection(null)}
                  className="absolute pointer-events-auto touch-manipulation flex flex-col items-center group px-6 py-4"
                  style={{ bottom: `calc(50% + ${compassRadius + labelGap}px)`, left: '50%', transform: 'translateX(-50%)' }}
                >
                  <span className={`font-mono text-sm md:text-lg uppercase tracking-[0.4em] transition-all duration-300 ${
                    hoveredDirection === 'N' ? 'text-theme-gold scale-105' : 'text-white/90'
                  }`}>
                    {NAV_ITEMS[0].label}
                  </span>
                  <span className={`font-serif italic text-[10px] md:text-xs mt-2 transition-opacity ${
                    hoveredDirection === 'N' ? 'text-white/70' : 'text-white/40'
                  }`}>
                    {NAV_ITEMS[0].description}
                  </span>
                </motion.button>

                {/* SOUTH - Satchel */}
                <motion.button
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: 0.15, ...springTransition }}
                  onClick={() => handleNavClick(NAV_ITEMS[2])}
                  onMouseEnter={() => !isMobile && setHoveredDirection('S')}
                  onMouseLeave={() => !isMobile && setHoveredDirection(null)}
                  onTouchStart={() => handleTouchStart('S')}
                  onTouchEnd={() => setHoveredDirection(null)}
                  className="absolute pointer-events-auto touch-manipulation flex flex-col items-center group px-6 py-4"
                  style={{ top: `calc(50% + ${compassRadius + labelGap}px)`, left: '50%', transform: 'translateX(-50%)' }}
                >
                  <span className={`font-mono text-sm md:text-lg uppercase tracking-[0.4em] transition-all duration-300 ${
                    hoveredDirection === 'S' ? 'text-theme-gold scale-105' : 'text-white/90'
                  }`}>
                    {NAV_ITEMS[2].label}
                  </span>
                  <span className={`font-serif italic text-[10px] md:text-xs mt-2 transition-opacity ${
                    hoveredDirection === 'S' ? 'text-white/70' : 'text-white/40'
                  }`}>
                    {NAV_ITEMS[2].description}
                  </span>
                </motion.button>

                {/* EAST - The Relic */}
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: 0.2, ...springTransition }}
                  onClick={() => handleNavClick(NAV_ITEMS[1])}
                  onMouseEnter={() => !isMobile && setHoveredDirection('E')}
                  onMouseLeave={() => !isMobile && setHoveredDirection(null)}
                  onTouchStart={() => handleTouchStart('E')}
                  onTouchEnd={() => setHoveredDirection(null)}
                  className="absolute pointer-events-auto touch-manipulation flex flex-col items-center group px-6 py-4"
                  style={{ left: `calc(50% + ${compassRadius + labelGap}px)`, top: '50%', transform: 'translateY(-50%)' }}
                >
                  <span className={`font-mono text-sm md:text-lg uppercase tracking-[0.4em] transition-all duration-300 ${
                    hoveredDirection === 'E' ? 'text-theme-gold scale-105' : 'text-white/90'
                  }`}>
                    {NAV_ITEMS[1].label}
                  </span>
                  <span className={`font-serif italic text-[10px] md:text-xs mt-2 transition-opacity ${
                    hoveredDirection === 'E' ? 'text-white/70' : 'text-white/40'
                  }`}>
                    {NAV_ITEMS[1].description}
                  </span>
                </motion.button>

                {/* WEST - The Atlas */}
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: 0.25, ...springTransition }}
                  onClick={() => handleNavClick(NAV_ITEMS[3])}
                  onMouseEnter={() => !isMobile && setHoveredDirection('W')}
                  onMouseLeave={() => !isMobile && setHoveredDirection(null)}
                  onTouchStart={() => handleTouchStart('W')}
                  onTouchEnd={() => setHoveredDirection(null)}
                  className="absolute pointer-events-auto touch-manipulation flex flex-col items-center group px-6 py-4"
                  style={{ right: `calc(50% + ${compassRadius + labelGap}px)`, top: '50%', transform: 'translateY(-50%)' }}
                >
                  <span className={`font-mono text-sm md:text-lg uppercase tracking-[0.4em] transition-all duration-300 ${
                    hoveredDirection === 'W' ? 'text-theme-gold scale-105' : 'text-white/90'
                  }`}>
                    {NAV_ITEMS[3].label}
                  </span>
                  <span className={`font-serif italic text-[10px] md:text-xs mt-2 transition-opacity ${
                    hoveredDirection === 'W' ? 'text-white/70' : 'text-white/40'
                  }`}>
                    {NAV_ITEMS[3].description}
                  </span>
                </motion.button>

                {/* Close Hint */}
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.3 }}
                  className="absolute bottom-10 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.5em] text-white/30 whitespace-nowrap"
                >
                  {isMobile ? 'Tap anywhere to close' : 'Click anywhere to close'}
                </motion.span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 2. COMPASS BUTTON LAYER - Morphs position using layoutId */}
      <motion.div
        layout
        layoutId="compass-root"
        className={`fixed z-[3000] ${
          isOpen 
            ? 'inset-0 flex items-center justify-center pointer-events-none' 
            : 'bottom-4 right-4 md:bottom-6 md:right-6 pointer-events-auto'
        }`}
        transition={springTransition}
      >
        <motion.button
          layout
          layoutId="compass-trigger"
          className="cursor-pointer relative pointer-events-auto touch-manipulation shadow-2xl rounded-full"
          animate={{
            width: isOpen ? expandedSize : compassSize,
            height: isOpen ? expandedSize : compassSize,
          }}
          transition={springTransition}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
            if (isOpen) setHoveredDirection(null);
          }}
          onMouseEnter={() => !isMobile && setIsHovered(true)}
          onMouseLeave={() => !isMobile && setIsHovered(false)}
        >
          {/* Compass Body */}
          <motion.div
            animate={{ rotate: isHovered && !isOpen && !isMobile ? [0, 5, -5, 0] : 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            <Image
              src="/assets/compass-body.png"
              alt="Compass"
              fill
              sizes="(max-width: 768px) 180px, 240px"
              className="object-contain"
              priority
            />
          </motion.div>

          {/* Needle */}
          <motion.div
            className="absolute inset-0"
            animate={{ 
              rotate: isOpen 
                ? (hoveredDirection 
                    ? NAV_ITEMS.find(i => i.direction === hoveredDirection)!.angle - needleBaseOffset 
                    : -needleBaseOffset)
                : needleRotation.get()
            }}
            style={{ rotate: isOpen ? undefined : needleRotation }}
            transition={springTransition}
          >
            <motion.div 
              className="relative w-full h-full"
              style={{ transform: `rotate(-${needleBaseOffset}deg)` }}
              animate={{ rotate: isHovered && !isOpen && !isMobile ? [0, 15, -15, 0] : 0 }}
              transition={
                isHovered && !isOpen && !isMobile
                  ? { duration: 0.6, repeat: Infinity, repeatType: 'reverse' as const }
                  : { type: 'spring', stiffness: 80, damping: 20 }
              }
            >
              <Image
                src="/assets/compass-needle.png"
                alt="Needle"
                fill
                sizes="(max-width: 768px) 180px, 240px"
                className="object-contain"
                priority
              />
            </motion.div>
          </motion.div>

          {/* Atmosphere Glow */}
          <motion.div
            className="absolute inset-[-20%] rounded-full pointer-events-none z-[-1]"
            animate={{
              background: isOpen 
                ? 'radial-gradient(circle, rgba(197, 166, 106, 0.15) 0%, rgba(0,0,0,0) 70%)' 
                : 'none',
              boxShadow: isHovered && !isOpen
                ? '0 0 40px rgba(197, 166, 106, 0.2)' 
                : 'none',
            }}
          />
        </motion.button>
      </motion.div>

      {/* 3. TOOLTIP (Closed Desktop State) */}
      <AnimatePresence>
        {isHovered && !isOpen && !isMobile && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="fixed bottom-6 z-[2999] pointer-events-none"
            style={{ right: compassSize + 40 }}
          >
            <span className="font-mono text-[9px] uppercase tracking-[0.5em] text-theme-charcoal/60 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-xl">
              Navigate
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </LayoutGroup>
  );
};
