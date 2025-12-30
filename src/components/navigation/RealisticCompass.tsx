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
  const [isMobile, setIsMobile] = useState(false);

  // Scroll-based needle rotation
  const { scrollYProgress } = useScroll();
  const rawRotation = useTransform(scrollYProgress, [0, 1], [0, 360]);
  
  // Physics-based spring for smooth needle movement (optimized for liquid feel)
  const needleRotation = useSpring(rawRotation, {
    stiffness: 120,
    damping: 24,
    mass: 0.8,
  });

  useEffect(() => {
    setIsMounted(true);
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Responsive size config
  const sizeConfig = {
    sm: isMobile ? 64 : 80,
    md: isMobile ? 72 : 100,
    lg: isMobile ? 100 : 140,
  };

  const compassSize = sizeConfig[size];
  const expandedSize = isMobile ? 160 : 220;
  const needleBaseOffset = 45;

  // Navigation container size - proportional to compass
  const navContainerSize = isMobile ? 320 : 480;
  const labelOffset = isMobile ? 140 : 200; // Distance from center to labels

  const handleNavClick = (item: NavItem) => {
    onNavigate(item.path);
    setIsOpen(false);
  };

  const handleTouchStart = (direction: 'N' | 'E' | 'S' | 'W') => {
    setHoveredDirection(direction);
  };

  // Close compass when clicking outside
  const handleOverlayClick = () => {
    setIsOpen(false);
    setHoveredDirection(null);
  };

  if (!isMounted) {
    return null;
  }

  const springTransition = {
    type: "spring" as const,
    stiffness: 120,
    damping: 24,
    mass: 0.8
  };

  return (
    <LayoutGroup>
      {/* Full-screen overlay - clicking anywhere closes the compass */}
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

      {/* Compass and Navigation Container */}
      <motion.div
        layout
        layoutId="navigation-compass-wrapper"
        className={`fixed z-[3000] ${
          isOpen 
            ? 'inset-0 flex items-center justify-center' 
            : 'bottom-4 right-4 md:bottom-6 md:right-6'
        }`}
        style={{
          pointerEvents: isOpen ? 'none' : 'auto'
        }}
        transition={springTransition}
      >
        {/* Navigation Layout Container - fixed size, centered */}
        <div 
          className="relative flex items-center justify-center"
          style={{ 
            width: isOpen ? navContainerSize : compassSize, 
            height: isOpen ? navContainerSize : compassSize,
            pointerEvents: 'none'
          }}
        >
          {/* The Compass Button */}
          <motion.button
            layout
            layoutId="compass-button"
            className="cursor-pointer relative pointer-events-auto touch-manipulation z-10"
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
              animate={{ 
                rotate: isHovered && !isOpen && !isMobile ? [0, 5, -5, 0] : 0,
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
                  rotate: isHovered && !isOpen && !isMobile ? [0, 15, -15, 0] : 0,
                }}
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
                  ? '0 0 30px rgba(197, 166, 106, 0.4)' 
                  : '0 4px 20px rgba(0, 0, 0, 0.2)',
              }}
            />
          </motion.button>

          {/* Navigation Labels - positioned relative to container center */}
          <AnimatePresence>
            {isOpen && (
              <>
                {/* North - Threshold */}
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
                  className="absolute left-1/2 -translate-x-1/2 text-center py-3 px-4 pointer-events-auto touch-manipulation"
                  style={{ top: `calc(50% - ${labelOffset}px)` }}
                >
                  <span className={`block font-mono text-sm md:text-base uppercase tracking-[0.2em] md:tracking-[0.3em] transition-all duration-300 whitespace-nowrap ${
                    hoveredDirection === 'N' ? 'text-theme-gold scale-110' : 'text-white/90'
                  }`}>
                    {NAV_ITEMS[0].label}
                  </span>
                  <span className={`block font-serif italic text-xs mt-1 transition-opacity whitespace-nowrap ${
                    hoveredDirection === 'N' ? 'text-white/70' : 'text-white/50'
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
                  onMouseEnter={() => !isMobile && setHoveredDirection('E')}
                  onMouseLeave={() => !isMobile && setHoveredDirection(null)}
                  onTouchStart={() => handleTouchStart('E')}
                  onTouchEnd={() => setHoveredDirection(null)}
                  className="absolute top-1/2 -translate-y-1/2 text-center py-3 px-4 pointer-events-auto touch-manipulation"
                  style={{ left: `calc(50% + ${labelOffset * 0.7}px)` }}
                >
                  <span className={`block font-mono text-sm md:text-base uppercase tracking-[0.2em] md:tracking-[0.3em] transition-all duration-300 whitespace-nowrap ${
                    hoveredDirection === 'E' ? 'text-theme-gold scale-110' : 'text-white/90'
                  }`}>
                    {NAV_ITEMS[1].label}
                  </span>
                  <span className={`block font-serif italic text-xs mt-1 transition-opacity whitespace-nowrap ${
                    hoveredDirection === 'E' ? 'text-white/70' : 'text-white/50'
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
                  onMouseEnter={() => !isMobile && setHoveredDirection('S')}
                  onMouseLeave={() => !isMobile && setHoveredDirection(null)}
                  onTouchStart={() => handleTouchStart('S')}
                  onTouchEnd={() => setHoveredDirection(null)}
                  className="absolute left-1/2 -translate-x-1/2 text-center py-3 px-4 pointer-events-auto touch-manipulation"
                  style={{ top: `calc(50% + ${labelOffset}px)` }}
                >
                  <span className={`block font-mono text-sm md:text-base uppercase tracking-[0.2em] md:tracking-[0.3em] transition-all duration-300 whitespace-nowrap ${
                    hoveredDirection === 'S' ? 'text-theme-gold scale-110' : 'text-white/90'
                  }`}>
                    {NAV_ITEMS[2].label}
                  </span>
                  <span className={`block font-serif italic text-xs mt-1 transition-opacity whitespace-nowrap ${
                    hoveredDirection === 'S' ? 'text-white/70' : 'text-white/50'
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
                  onMouseEnter={() => !isMobile && setHoveredDirection('W')}
                  onMouseLeave={() => !isMobile && setHoveredDirection(null)}
                  onTouchStart={() => handleTouchStart('W')}
                  onTouchEnd={() => setHoveredDirection(null)}
                  className="absolute top-1/2 -translate-y-1/2 text-center py-3 px-4 pointer-events-auto touch-manipulation"
                  style={{ right: `calc(50% + ${labelOffset * 0.7}px)` }}
                >
                  <span className={`block font-mono text-sm md:text-base uppercase tracking-[0.2em] md:tracking-[0.3em] transition-all duration-300 whitespace-nowrap ${
                    hoveredDirection === 'W' ? 'text-theme-gold scale-110' : 'text-white/90'
                  }`}>
                    {NAV_ITEMS[3].label}
                  </span>
                  <span className={`block font-serif italic text-xs mt-1 transition-opacity whitespace-nowrap ${
                    hoveredDirection === 'W' ? 'text-white/70' : 'text-white/50'
                  }`}>
                    {NAV_ITEMS[3].description}
                  </span>
                </motion.button>

                {/* Close hint - fixed at bottom of screen */}
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.3 }}
                  className="fixed bottom-6 left-1/2 -translate-x-1/2 font-mono text-[9px] md:text-[10px] uppercase tracking-widest text-white/30 whitespace-nowrap pointer-events-none"
                >
                  {isMobile ? 'Tap anywhere to close' : 'Click anywhere to close'}
                </motion.span>
              </>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Tooltip on hover - desktop only */}
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
