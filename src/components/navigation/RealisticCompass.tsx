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
  const [isShortViewport, setIsShortViewport] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(0);

  const { scrollYProgress } = useScroll();
  const rawRotation = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const needleRotation = useSpring(rawRotation, {
    stiffness: 120,
    damping: 24,
    mass: 0.8,
  });

  useEffect(() => {
    setIsMounted(true);
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth;
        const height = window.innerHeight;
        setIsMobile(width < 768);
        setIsShortViewport(height < 600);
        setViewportWidth(width);
      }
    };
    handleResize();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
    }

    // Load interaction state from localStorage
    if (typeof window !== 'undefined') {
      const interacted = localStorage.getItem('compass-interacted');
      if (interacted) setHasInteracted(true);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  // Responsive sizing - better mobile support
  const sizeConfig = { 
    sm: isMobile ? 56 : 80, 
    md: isMobile ? 64 : 100, 
    lg: isMobile ? 80 : 140 
  };
  const compassSize = sizeConfig[size];
  
  // Expanded state dimensions - responsive to viewport
  const expandedSize = isMobile 
    ? (isShortViewport 
        ? 160 
        : viewportWidth > 0 
          ? Math.min(viewportWidth * 0.5, 200)
          : 180)
    : 240;
  const compassRadius = expandedSize / 2;
  const labelGap = isMobile ? (isShortViewport ? 24 : 32) : 50;
  
  const needleBaseOffset = 45;

  const handleNavClick = (item: NavItem) => {
    onNavigate(item.path);
    setIsOpen(false);
  };

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

            {/* Absolute Cardinal Labels Layer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[2999] pointer-events-none overflow-hidden"
            >
              {/* NORTH - Threshold */}
              <div className="absolute top-0 left-0 right-0 bottom-1/2 flex items-end justify-center"
                   style={{ paddingBottom: `${compassRadius + labelGap}px` }}>
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  onClick={() => handleNavClick(NAV_ITEMS[0])}
                  onMouseEnter={() => !isMobile && setHoveredDirection('N')}
                  onMouseLeave={() => !isMobile && setHoveredDirection(null)}
                  onTouchStart={() => setHoveredDirection('N')}
                  onTouchEnd={() => setTimeout(() => setHoveredDirection(null), 200)}
                  className="pointer-events-auto flex flex-col items-center group touch-manipulation min-h-[48px] min-w-[120px] px-4 py-3 active:scale-95 transition-transform"
                >
                  <span className={`font-mono ${isMobile ? 'text-base' : 'text-lg'} uppercase tracking-[0.4em] md:tracking-[0.5em] transition-all duration-300 ${
                    hoveredDirection === 'N' ? 'text-theme-gold scale-105' : 'text-white/90'
                  }`}>
                    {NAV_ITEMS[0].label}
                  </span>
                  {!isShortViewport && (
                    <span className={`font-serif italic ${isMobile ? 'text-[11px]' : 'text-xs'} mt-1.5 md:mt-2 tracking-widest transition-opacity ${
                      hoveredDirection === 'N' ? 'text-white/70' : 'text-white/40'
                    }`}>
                      {NAV_ITEMS[0].description}
                    </span>
                  )}
                </motion.button>
              </div>

              {/* SOUTH - Satchel */}
              <div className="absolute top-1/2 left-0 right-0 bottom-0 flex items-start justify-center"
                   style={{ paddingTop: `${compassRadius + labelGap}px` }}>
                <motion.button
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onClick={() => handleNavClick(NAV_ITEMS[2])}
                  onMouseEnter={() => !isMobile && setHoveredDirection('S')}
                  onMouseLeave={() => !isMobile && setHoveredDirection(null)}
                  onTouchStart={() => setHoveredDirection('S')}
                  onTouchEnd={() => setTimeout(() => setHoveredDirection(null), 200)}
                  className="pointer-events-auto flex flex-col items-center group touch-manipulation min-h-[48px] min-w-[120px] px-4 py-3 active:scale-95 transition-transform"
                >
                  <span className={`font-mono ${isMobile ? 'text-base' : 'text-lg'} uppercase tracking-[0.4em] md:tracking-[0.5em] transition-all duration-300 ${
                    hoveredDirection === 'S' ? 'text-theme-gold scale-105' : 'text-white/90'
                  }`}>
                    {NAV_ITEMS[2].label}
                  </span>
                  {!isShortViewport && (
                    <span className={`font-serif italic ${isMobile ? 'text-[11px]' : 'text-xs'} mt-1.5 md:mt-2 tracking-widest transition-opacity ${
                      hoveredDirection === 'S' ? 'text-white/70' : 'text-white/40'
                    }`}>
                      {NAV_ITEMS[2].description}
                    </span>
                  )}
                </motion.button>
              </div>

              {/* EAST - The Relic */}
              <div className="absolute top-0 right-0 bottom-0 left-1/2 flex items-center justify-start"
                   style={{ paddingLeft: `${compassRadius + labelGap}px` }}>
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onClick={() => handleNavClick(NAV_ITEMS[1])}
                  onMouseEnter={() => !isMobile && setHoveredDirection('E')}
                  onMouseLeave={() => !isMobile && setHoveredDirection(null)}
                  onTouchStart={() => setHoveredDirection('E')}
                  onTouchEnd={() => setTimeout(() => setHoveredDirection(null), 200)}
                  className="pointer-events-auto flex flex-col items-center group touch-manipulation min-h-[48px] min-w-[120px] px-4 py-3 active:scale-95 transition-transform"
                >
                  <span className={`font-mono ${isMobile ? 'text-base' : 'text-lg'} uppercase tracking-[0.4em] md:tracking-[0.5em] transition-all duration-300 ${
                    hoveredDirection === 'E' ? 'text-theme-gold scale-105' : 'text-white/90'
                  }`}>
                    {NAV_ITEMS[1].label}
                  </span>
                  {!isShortViewport && (
                    <span className={`font-serif italic ${isMobile ? 'text-[11px]' : 'text-xs'} mt-1.5 md:mt-2 tracking-widest transition-opacity ${
                      hoveredDirection === 'E' ? 'text-white/70' : 'text-white/40'
                    }`}>
                      {NAV_ITEMS[1].description}
                    </span>
                  )}
                </motion.button>
              </div>

              {/* WEST - The Atlas */}
              <div className="absolute top-0 left-0 bottom-0 right-1/2 flex items-center justify-end"
                   style={{ paddingRight: `${compassRadius + labelGap}px` }}>
                <motion.button
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onClick={() => handleNavClick(NAV_ITEMS[3])}
                  onMouseEnter={() => !isMobile && setHoveredDirection('W')}
                  onMouseLeave={() => !isMobile && setHoveredDirection(null)}
                  onTouchStart={() => setHoveredDirection('W')}
                  onTouchEnd={() => setTimeout(() => setHoveredDirection(null), 200)}
                  className="pointer-events-auto flex flex-col items-center group touch-manipulation min-h-[48px] min-w-[120px] px-4 py-3 active:scale-95 transition-transform"
                >
                  <span className={`font-mono ${isMobile ? 'text-base' : 'text-lg'} uppercase tracking-[0.4em] md:tracking-[0.5em] transition-all duration-300 ${
                    hoveredDirection === 'W' ? 'text-theme-gold scale-105' : 'text-white/90'
                  }`}>
                    {NAV_ITEMS[3].label}
                  </span>
                  {!isShortViewport && (
                    <span className={`font-serif italic ${isMobile ? 'text-[11px]' : 'text-xs'} mt-1.5 md:mt-2 tracking-widest transition-opacity ${
                      hoveredDirection === 'W' ? 'text-white/70' : 'text-white/40'
                    }`}>
                      {NAV_ITEMS[3].description}
                    </span>
                  )}
                </motion.button>
              </div>

              {/* Close Hint */}
              <div className={`absolute ${isMobile ? 'bottom-6' : 'bottom-10'} left-0 right-0 flex justify-center`}>
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`font-mono ${isMobile ? 'text-xs' : 'text-[10px]'} uppercase tracking-[0.3em] md:tracking-[0.5em] text-white/30 md:text-white/20 whitespace-nowrap`}
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
            : isMobile
            ? 'bottom-3 right-3 pointer-events-auto'
            : 'bottom-6 right-6 pointer-events-auto'
        }`}
        style={{
          bottom: isOpen ? '0' : undefined,
          right: isOpen ? '0' : undefined,
        }}
        transition={springTransition}
      >
        <motion.button
          layout
          layoutId="compass-trigger"
          className="cursor-pointer relative pointer-events-auto touch-manipulation shadow-2xl rounded-full active:scale-95 transition-transform"
          animate={{
            width: isOpen ? expandedSize : compassSize,
            height: isOpen ? expandedSize : compassSize,
            scale: isOpen ? 1 : (hasInteracted ? 1 : [1, 1.08, 1]),
            boxShadow: isOpen 
              ? 'none' 
              : (hasInteracted 
                ? '0 4px 20px rgba(0,0,0,0.1)'
                : [
                    '0 4px 20px rgba(0,0,0,0.1)',
                    '0 8px 40px rgba(197,166,106,0.3)', // Gold glow
                    '0 4px 20px rgba(0,0,0,0.1)',
                  ])
          }}
          transition={{
            ...springTransition,
            scale: {
              duration: 2.5,
              repeat: isOpen || hasInteracted ? 0 : Infinity,
              ease: "easeInOut"
            },
            boxShadow: {
              duration: 2.5,
              repeat: isOpen || hasInteracted ? 0 : Infinity,
              ease: "easeInOut"
            }
          }}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
            if (isOpen) setHoveredDirection(null);
            
            if (!hasInteracted) {
              setHasInteracted(true);
              if (typeof window !== 'undefined') {
                localStorage.setItem('compass-interacted', 'true');
              }
            }
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            // Prevent body scroll when touching compass
            if (typeof document !== 'undefined') {
              document.body.style.overflow = 'hidden';
            }
          }}
          onTouchEnd={() => {
            if (typeof document !== 'undefined') {
              document.body.style.overflow = '';
            }
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
              sizes={isOpen ? `${expandedSize}px` : `${compassSize}px`}
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
              animate={{ 
                rotate: isHovered && !isOpen && !isMobile 
                  ? [0, 15, -15, 0] 
                  : isOpen
                  ? 0 
                  : [0, 3, -2, 0] // Subtle idle twitch
              }}
              transition={
                isOpen
                  ? { type: 'spring', stiffness: 120, damping: 24 }
                  : isHovered && !isMobile
                  ? { duration: 0.6, repeat: Infinity, repeatType: 'reverse' as const }
                  : { 
                      duration: 4, 
                      repeat: Infinity, 
                      repeatDelay: 8, // Twitch every 8 seconds
                      ease: "easeInOut" 
                    }
              }
            >
              <Image
                src="/assets/compass-needle.png"
                alt="Needle"
                fill
                sizes={isOpen ? `${expandedSize}px` : `${compassSize}px`}
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
