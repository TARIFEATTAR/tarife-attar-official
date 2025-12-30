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
  const expandedSize = isMobile ? 160 : 200;
  const needleBaseOffset = 45;

  // Distance from compass center to labels
  const labelDistance = isMobile ? 130 : 180;

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

  // Label styles for each direction
  const getLabelStyle = (direction: 'N' | 'E' | 'S' | 'W') => {
    const base = {
      position: 'absolute' as const,
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
    };

    switch (direction) {
      case 'N': // True North - centered horizontally, above compass
        return {
          ...base,
          top: `calc(50% - ${labelDistance}px)`,
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
      case 'S': // True South - centered horizontally, below compass
        return {
          ...base,
          top: `calc(50% + ${labelDistance}px)`,
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
      case 'E': // True East - centered vertically, right of compass
        return {
          ...base,
          top: '50%',
          left: `calc(50% + ${labelDistance}px)`,
          transform: 'translate(-50%, -50%)',
        };
      case 'W': // True West - centered vertically, left of compass
        return {
          ...base,
          top: '50%',
          left: `calc(50% - ${labelDistance}px)`,
          transform: 'translate(-50%, -50%)',
        };
    }
  };

  return (
    <LayoutGroup>
      {/* Full-screen overlay - click anywhere to close */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[2998] bg-black/90 backdrop-blur-xl cursor-pointer"
            onClick={handleOverlayClick}
          />
        )}
      </AnimatePresence>

      {/* Compass Button - morphs from corner to center */}
      <motion.div
        layout
        layoutId="compass-wrapper"
        className={`fixed z-[3000] ${
          isOpen 
            ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' 
            : 'bottom-4 right-4 md:bottom-6 md:right-6'
        }`}
        transition={springTransition}
      >
        <motion.button
          layout
          className="cursor-pointer relative touch-manipulation"
          animate={{
            width: isOpen ? expandedSize : compassSize,
            height: isOpen ? expandedSize : compassSize,
          }}
          transition={springTransition}
          onClick={(e) => {
            e.stopPropagation();
            if (isOpen) {
              setIsOpen(false);
              setHoveredDirection(null);
            } else {
              setIsOpen(true);
            }
          }}
          onMouseEnter={() => !isMobile && setIsHovered(true)}
          onMouseLeave={() => !isMobile && setIsHovered(false)}
          whileHover={isMobile ? {} : { scale: isOpen ? 1 : 1.05 }}
          whileTap={{ scale: isOpen ? 0.98 : 0.95 }}
        >
          {/* Compass Body */}
          <motion.div
            animate={{ rotate: isHovered && !isOpen && !isMobile ? [0, 5, -5, 0] : 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            <Image
              src="/assets/compass-body.png"
              alt="Navigation Compass"
              fill
              sizes="200px"
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
              animate={{ rotate: isHovered && !isOpen && !isMobile ? [0, 15, -15, 0] : 0 }}
              transition={
                isHovered && !isOpen && !isMobile
                  ? { duration: 0.6, repeat: Infinity, repeatType: 'reverse' as const }
                  : { type: 'spring', stiffness: 80, damping: 20 }
              }
            >
              <Image
                src="/assets/compass-needle.png"
                alt="Compass Needle"
                fill
                sizes="200px"
                className="object-contain"
                priority
              />
            </motion.div>
          </motion.div>

          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            animate={{
              boxShadow: isHovered || isOpen
                ? '0 0 40px rgba(197, 166, 106, 0.5)' 
                : '0 4px 20px rgba(0, 0, 0, 0.2)',
            }}
          />
        </motion.button>
      </motion.div>

      {/* Navigation Labels - Fixed positions at true cardinal directions */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="fixed inset-0 z-[2999] pointer-events-none"
          >
            {/* NORTH - Threshold */}
            <motion.button
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ delay: 0.15, ...springTransition }}
              onClick={() => handleNavClick(NAV_ITEMS[0])}
              onMouseEnter={() => !isMobile && setHoveredDirection('N')}
              onMouseLeave={() => !isMobile && setHoveredDirection(null)}
              onTouchStart={() => handleTouchStart('N')}
              onTouchEnd={() => setHoveredDirection(null)}
              className="pointer-events-auto touch-manipulation py-3 px-6"
              style={getLabelStyle('N')}
            >
              <span className={`font-mono text-sm md:text-base uppercase tracking-[0.25em] transition-all duration-300 whitespace-nowrap ${
                hoveredDirection === 'N' ? 'text-theme-gold scale-110' : 'text-white/90'
              }`}>
                {NAV_ITEMS[0].label}
              </span>
              <span className={`font-serif italic text-xs mt-1.5 transition-opacity whitespace-nowrap ${
                hoveredDirection === 'N' ? 'text-white/70' : 'text-white/50'
              }`}>
                {NAV_ITEMS[0].description}
              </span>
            </motion.button>

            {/* EAST - The Relic */}
            <motion.button
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ delay: 0.2, ...springTransition }}
              onClick={() => handleNavClick(NAV_ITEMS[1])}
              onMouseEnter={() => !isMobile && setHoveredDirection('E')}
              onMouseLeave={() => !isMobile && setHoveredDirection(null)}
              onTouchStart={() => handleTouchStart('E')}
              onTouchEnd={() => setHoveredDirection(null)}
              className="pointer-events-auto touch-manipulation py-3 px-6"
              style={getLabelStyle('E')}
            >
              <span className={`font-mono text-sm md:text-base uppercase tracking-[0.25em] transition-all duration-300 whitespace-nowrap ${
                hoveredDirection === 'E' ? 'text-theme-gold scale-110' : 'text-white/90'
              }`}>
                {NAV_ITEMS[1].label}
              </span>
              <span className={`font-serif italic text-xs mt-1.5 transition-opacity whitespace-nowrap ${
                hoveredDirection === 'E' ? 'text-white/70' : 'text-white/50'
              }`}>
                {NAV_ITEMS[1].description}
              </span>
            </motion.button>

            {/* SOUTH - Satchel */}
            <motion.button
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ delay: 0.25, ...springTransition }}
              onClick={() => handleNavClick(NAV_ITEMS[2])}
              onMouseEnter={() => !isMobile && setHoveredDirection('S')}
              onMouseLeave={() => !isMobile && setHoveredDirection(null)}
              onTouchStart={() => handleTouchStart('S')}
              onTouchEnd={() => setHoveredDirection(null)}
              className="pointer-events-auto touch-manipulation py-3 px-6"
              style={getLabelStyle('S')}
            >
              <span className={`font-mono text-sm md:text-base uppercase tracking-[0.25em] transition-all duration-300 whitespace-nowrap ${
                hoveredDirection === 'S' ? 'text-theme-gold scale-110' : 'text-white/90'
              }`}>
                {NAV_ITEMS[2].label}
              </span>
              <span className={`font-serif italic text-xs mt-1.5 transition-opacity whitespace-nowrap ${
                hoveredDirection === 'S' ? 'text-white/70' : 'text-white/50'
              }`}>
                {NAV_ITEMS[2].description}
              </span>
            </motion.button>

            {/* WEST - The Atlas */}
            <motion.button
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ delay: 0.3, ...springTransition }}
              onClick={() => handleNavClick(NAV_ITEMS[3])}
              onMouseEnter={() => !isMobile && setHoveredDirection('W')}
              onMouseLeave={() => !isMobile && setHoveredDirection(null)}
              onTouchStart={() => handleTouchStart('W')}
              onTouchEnd={() => setHoveredDirection(null)}
              className="pointer-events-auto touch-manipulation py-3 px-6"
              style={getLabelStyle('W')}
            >
              <span className={`font-mono text-sm md:text-base uppercase tracking-[0.25em] transition-all duration-300 whitespace-nowrap ${
                hoveredDirection === 'W' ? 'text-theme-gold scale-110' : 'text-white/90'
              }`}>
                {NAV_ITEMS[3].label}
              </span>
              <span className={`font-serif italic text-xs mt-1.5 transition-opacity whitespace-nowrap ${
                hoveredDirection === 'W' ? 'text-white/70' : 'text-white/50'
              }`}>
                {NAV_ITEMS[3].description}
              </span>
            </motion.button>

            {/* Close hint */}
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.35 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-widest text-white/30"
            >
              {isMobile ? 'Tap anywhere to close' : 'Click anywhere to close'}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tooltip - desktop only */}
      <AnimatePresence>
        {isHovered && !isOpen && !isMobile && (
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
