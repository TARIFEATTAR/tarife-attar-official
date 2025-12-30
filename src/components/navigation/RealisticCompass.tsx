"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, LayoutGroup } from 'framer-motion';

interface NavItem {
  label: string;
  path: string;
  direction: 'N' | 'E' | 'S' | 'W';
  angle: number; // Needle angle for this direction
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

  // Scroll-based needle rotation
  const { scrollYProgress } = useScroll();
  const rawRotation = useTransform(scrollYProgress, [0, 1], [0, 360]);
  
  // Physics-based spring for smooth needle movement (optimized for liquid feel)
  const needleRotation = useSpring(rawRotation, {
    stiffness: 120,  // Higher = more responsive
    damping: 24,     // Lower = more oscillation (organic feel)
    mass: 0.8,       // Lower = lighter feel
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sizeConfig = {
    sm: 80,
    md: 100,
    lg: 140,
  };

  const compassSize = sizeConfig[size];
  const needleBaseOffset = 45; // The needle image is at 45° by default

  const handleNavClick = (item: NavItem) => {
    onNavigate(item.path);
    setIsOpen(false);
  };

  if (!isMounted) {
    return null;
  }

  // Spring transition config for liquid feel
  const springTransition = {
    type: "spring" as const,
    stiffness: 120,
    damping: 24,
    mass: 0.8
  };

  return (
    <LayoutGroup>
      {/* Navigation Overlay Background */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[2998] bg-black/90 backdrop-blur-xl"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Single Animated Compass - moves from bottom-right to center */}
      <motion.div
        layout
        layoutId="navigation-compass"
        className={`fixed z-[3000] ${
          isOpen 
            ? 'inset-0 flex items-center justify-center pointer-events-none' 
            : 'bottom-6 right-6 pointer-events-auto'
        }`}
        transition={springTransition}
      >
        <motion.button
          className="cursor-pointer relative pointer-events-auto"
          layout
          animate={{
            width: isOpen ? 256 : compassSize,
            height: isOpen ? 256 : compassSize,
          }}
          transition={springTransition}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          whileHover={{ scale: isOpen ? 1 : 1.05 }}
          whileTap={{ scale: isOpen ? 0.98 : 0.95 }}
        >
          {/* Compass Body */}
          <motion.div
            animate={{ 
              rotate: isHovered && !isOpen ? [0, 5, -5, 0] : 0,
            }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            <Image
              src="/assets/compass-body.png"
              alt="Navigation Compass"
              fill
              className="object-contain drop-shadow-lg"
              priority
            />
          </motion.div>

          {/* Animated Needle */}
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
              animate={{
                rotate: isHovered && !isOpen ? [0, 15, -15, 0] : 0,
              }}
              transition={
                isHovered && !isOpen 
                  ? { duration: 0.6, repeat: Infinity, repeatType: 'reverse' as const }
                  : { type: 'spring', stiffness: 80, damping: 20 }
              }
            >
              <Image
                src="/assets/compass-needle.png"
                alt="Compass Needle"
                fill
                className="object-contain"
                priority
              />
            </motion.div>
          </motion.div>

          {/* Hover glow effect */}
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            animate={{
              boxShadow: isHovered 
                ? '0 0 30px rgba(197, 166, 106, 0.4)' 
                : '0 4px 20px rgba(0, 0, 0, 0.2)',
            }}
          />
        </motion.button>

        {/* Navigation buttons - only visible when open */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="absolute inset-0 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* North - Threshold */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.1, ...springTransition }}
                onClick={() => handleNavClick(NAV_ITEMS[0])}
                onMouseEnter={() => setHoveredDirection('N')}
                onMouseLeave={() => setHoveredDirection(null)}
                className="absolute top-[12%] left-1/2 -translate-x-1/2 text-center group py-4 px-6"
              >
                <span className={`block font-mono text-xs md:text-sm uppercase tracking-[0.3em] transition-all duration-300 ${
                  hoveredDirection === 'N' ? 'text-theme-gold scale-110' : 'text-white/80'
                }`}>
                  {NAV_ITEMS[0].label}
                </span>
                <span className={`block font-serif italic text-[10px] mt-1 transition-opacity ${
                  hoveredDirection === 'N' ? 'text-white/60' : 'text-white/40'
                }`}>
                  {NAV_ITEMS[0].description}
                </span>
              </motion.button>

              {/* East - Relic */}
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: 0.15, ...springTransition }}
                onClick={() => handleNavClick(NAV_ITEMS[1])}
                onMouseEnter={() => setHoveredDirection('E')}
                onMouseLeave={() => setHoveredDirection(null)}
                className="absolute right-[12%] top-1/2 -translate-y-1/2 text-center group py-4 px-6"
              >
                <span className={`block font-mono text-xs md:text-sm uppercase tracking-[0.3em] transition-all duration-300 ${
                  hoveredDirection === 'E' ? 'text-theme-gold scale-110' : 'text-white/80'
                }`}>
                  {NAV_ITEMS[1].label}
                </span>
                <span className={`block font-serif italic text-[10px] mt-1 transition-opacity ${
                  hoveredDirection === 'E' ? 'text-white/60' : 'text-white/40'
                }`}>
                  {NAV_ITEMS[1].description}
                </span>
              </motion.button>

              {/* South - Satchel */}
              <motion.button
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.2, ...springTransition }}
                onClick={() => handleNavClick(NAV_ITEMS[2])}
                onMouseEnter={() => setHoveredDirection('S')}
                onMouseLeave={() => setHoveredDirection(null)}
                className="absolute bottom-[12%] left-1/2 -translate-x-1/2 text-center group py-4 px-6"
              >
                <span className={`block font-mono text-xs md:text-sm uppercase tracking-[0.3em] transition-all duration-300 ${
                  hoveredDirection === 'S' ? 'text-theme-gold scale-110' : 'text-white/80'
                }`}>
                  {NAV_ITEMS[2].label}
                </span>
                <span className={`block font-serif italic text-[10px] mt-1 transition-opacity ${
                  hoveredDirection === 'S' ? 'text-white/60' : 'text-white/40'
                }`}>
                  {NAV_ITEMS[2].description}
                </span>
              </motion.button>

              {/* West - Atlas */}
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: 0.25, ...springTransition }}
                onClick={() => handleNavClick(NAV_ITEMS[3])}
                onMouseEnter={() => setHoveredDirection('W')}
                onMouseLeave={() => setHoveredDirection(null)}
                className="absolute left-[12%] top-1/2 -translate-y-1/2 text-center group py-4 px-6"
              >
                <span className={`block font-mono text-xs md:text-sm uppercase tracking-[0.3em] transition-all duration-300 ${
                  hoveredDirection === 'W' ? 'text-theme-gold scale-110' : 'text-white/80'
                }`}>
                  {NAV_ITEMS[3].label}
                </span>
                <span className={`block font-serif italic text-[10px] mt-1 transition-opacity ${
                  hoveredDirection === 'W' ? 'text-white/60' : 'text-white/40'
                }`}>
                  {NAV_ITEMS[3].description}
                </span>
              </motion.button>

              {/* Close hint */}
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-widest text-white/30"
              >
                Click compass or anywhere to close
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Tooltip on hover - only when closed */}
      <AnimatePresence>
        {isHovered && !isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="fixed bottom-6 z-[2999] pointer-events-none"
            style={{ right: compassSize + 40 }}
          >
            <span className="font-mono text-[9px] uppercase tracking-widest text-theme-charcoal/60 bg-white px-3 py-2 rounded-sm shadow-lg">
              Navigate
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </LayoutGroup>
  );
};
