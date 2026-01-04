"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';

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
  /** 
   * Position mode:
   * - 'corner': Fixed bottom-right (default navigation state)
   * - 'center': Centered at bottom (Split Entry teaching state)
   */
  position?: 'corner' | 'center';
  /**
   * External hover direction for Split Entry teaching mode.
   * When provided, overrides scroll-based needle rotation.
   * - 'W': Points to Atlas (West/Left)
   * - 'E': Points to Relic (East/Right)
   * - null: Points North (neutral)
   */
  hoveredDirection?: 'W' | 'E' | null;
  /**
   * Whether to show the hint text below compass in center mode
   */
  showHint?: boolean;
}

export const RealisticCompass: React.FC<Props> = ({ 
  onNavigate, 
  size = 'md',
  position = 'corner',
  hoveredDirection: externalHoveredDirection = null,
  showHint = true,
}) => {
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
  // Center position gets slightly larger for teaching visibility
  const sizeConfig = { 
    sm: isMobile ? 56 : 80, 
    md: isMobile ? 64 : 100, 
    lg: isMobile ? 80 : 140 
  };
  const baseSizeValue = sizeConfig[size];
  const compassSize = position === 'center' ? baseSizeValue * 1.2 : baseSizeValue;
  
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

  // Calculate needle angle based on external hover (Split Entry) or internal state
  const getActiveNeedleAngle = (): number => {
    // Priority 1: Open menu with internal hover
    if (isOpen && hoveredDirection) {
      return NAV_ITEMS.find(i => i.direction === hoveredDirection)!.angle - needleBaseOffset;
    }
    
    // Priority 2: External hover direction from Split Entry
    if (externalHoveredDirection) {
      const externalAngle = externalHoveredDirection === 'W' ? 270 : 90;
      return externalAngle - needleBaseOffset;
    }
    
    // Priority 3: Open menu without hover (point North)
    if (isOpen) {
      return -needleBaseOffset;
    }
    
    // Priority 4: Use scroll-based rotation (handled by motion style)
    return needleRotation.get();
  };

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

  // Position classes based on mode
  const getPositionClasses = () => {
    if (isOpen) {
      return 'inset-0 flex items-center justify-center';
    }
    if (position === 'center') {
      return 'bottom-12 left-1/2';
    }
    return isMobile 
      ? 'bottom-3 right-3'
      : 'bottom-6 right-6';
  };

  // Transform style for center position (can't use -translate-x-1/2 class with other positions)
  const getTransformStyle = (): React.CSSProperties => {
    if (position === 'center' && !isOpen) {
      return { transform: 'translateX(-50%)' };
    }
    return {};
  };

  // Determine if needle should use external control or scroll
  const useExternalNeedle = externalHoveredDirection !== null || isOpen;

  return (
    <>
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
                    hoveredDirection === 'N' ? 'text-theme-gold scale-110' : 'text-white/60'
                  }`}>
                    {NAV_ITEMS[0].label}
                  </span>
                  {!isMobile && (
                    <span className={`font-serif italic text-sm mt-1 transition-colors ${
                      hoveredDirection === 'N' ? 'text-white/70' : 'text-white/40'
                    }`}>
                      {NAV_ITEMS[0].description}
                    </span>
                  )}
                </motion.button>
              </div>

              {/* EAST - Relic */}
              <div className="absolute top-0 bottom-0 right-0 left-1/2 flex items-center justify-start"
                   style={{ paddingLeft: `${compassRadius + labelGap}px` }}>
                <motion.button
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onClick={() => handleNavClick(NAV_ITEMS[1])}
                  onMouseEnter={() => !isMobile && setHoveredDirection('E')}
                  onMouseLeave={() => !isMobile && setHoveredDirection(null)}
                  onTouchStart={() => setHoveredDirection('E')}
                  onTouchEnd={() => setTimeout(() => setHoveredDirection(null), 200)}
                  className="pointer-events-auto flex flex-col items-start group touch-manipulation min-h-[48px] min-w-[120px] px-4 py-3 active:scale-95 transition-transform"
                >
                  <span className={`font-mono ${isMobile ? 'text-base' : 'text-lg'} uppercase tracking-[0.4em] md:tracking-[0.5em] transition-all duration-300 ${
                    hoveredDirection === 'E' ? 'text-theme-gold scale-110' : 'text-white/60'
                  }`}>
                    {NAV_ITEMS[1].label}
                  </span>
                  {!isMobile && (
                    <span className={`font-serif italic text-sm mt-1 transition-colors ${
                      hoveredDirection === 'E' ? 'text-white/70' : 'text-white/40'
                    }`}>
                      {NAV_ITEMS[1].description}
                    </span>
                  )}
                </motion.button>
              </div>

              {/* SOUTH - Satchel */}
              <div className="absolute bottom-0 left-0 right-0 top-1/2 flex items-start justify-center"
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
                    hoveredDirection === 'S' ? 'text-theme-gold scale-110' : 'text-white/60'
                  }`}>
                    {NAV_ITEMS[2].label}
                  </span>
                  {!isMobile && (
                    <span className={`font-serif italic text-sm mt-1 transition-colors ${
                      hoveredDirection === 'S' ? 'text-white/70' : 'text-white/40'
                    }`}>
                      {NAV_ITEMS[2].description}
                    </span>
                  )}
                </motion.button>
              </div>

              {/* WEST - Atlas */}
              <div className="absolute top-0 bottom-0 left-0 right-1/2 flex items-center justify-end"
                   style={{ paddingRight: `${compassRadius + labelGap}px` }}>
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onClick={() => handleNavClick(NAV_ITEMS[3])}
                  onMouseEnter={() => !isMobile && setHoveredDirection('W')}
                  onMouseLeave={() => !isMobile && setHoveredDirection(null)}
                  onTouchStart={() => setHoveredDirection('W')}
                  onTouchEnd={() => setTimeout(() => setHoveredDirection(null), 200)}
                  className="pointer-events-auto flex flex-col items-end group touch-manipulation min-h-[48px] min-w-[120px] px-4 py-3 active:scale-95 transition-transform"
                >
                  <span className={`font-mono ${isMobile ? 'text-base' : 'text-lg'} uppercase tracking-[0.4em] md:tracking-[0.5em] transition-all duration-300 ${
                    hoveredDirection === 'W' ? 'text-theme-gold scale-110' : 'text-white/60'
                  }`}>
                    {NAV_ITEMS[3].label}
                  </span>
                  {!isMobile && (
                    <span className={`font-serif italic text-sm mt-1 transition-colors ${
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

      {/* 2. COMPASS BUTTON LAYER */}
      <motion.div
        data-compass-navigation
        className={`fixed z-[3000] ${getPositionClasses()} ${isOpen ? 'pointer-events-none' : 'pointer-events-auto'}`}
        style={getTransformStyle()}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Compass Container with Hint */}
        <div className="flex flex-col items-center">
          <motion.button
            className="cursor-pointer relative pointer-events-auto touch-manipulation shadow-2xl rounded-full active:scale-95"
            style={{
              width: isOpen ? expandedSize : compassSize,
              height: isOpen ? expandedSize : compassSize,
              willChange: isOpen ? 'transform' : 'auto',
            }}
            animate={{
              scale: isOpen 
                ? 1 
                : (hasInteracted 
                    ? 1 
                    : [1, 1.08, 1]),
              boxShadow: isOpen 
                ? 'none' 
                : (hasInteracted 
                  ? '0 4px 20px rgba(0,0,0,0.1)'
                  : [
                      '0 4px 20px rgba(0,0,0,0.1)',
                      '0 8px 40px rgba(197,166,106,0.3)',
                      '0 4px 20px rgba(0,0,0,0.1)',
                    ])
            }}
            transition={{
              width: { type: "spring", stiffness: 200, damping: 25, mass: 0.5 },
              height: { type: "spring", stiffness: 200, damping: 25, mass: 0.5 },
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
              style={{ willChange: 'transform' }}
            >
              <Image
                src="/assets/compass-body.png"
                alt="Compass"
                fill
                sizes={isOpen ? `${expandedSize}px` : `${compassSize}px`}
                className="object-contain"
                priority
                quality={90}
              />
            </motion.div>

            {/* Needle */}
            <motion.div
              className="absolute inset-0"
              animate={{ 
                rotate: useExternalNeedle ? getActiveNeedleAngle() : undefined
              }}
              style={{ 
                rotate: useExternalNeedle ? undefined : needleRotation,
                willChange: 'transform'
              }}
              transition={springTransition}
            >
              <motion.div 
                className="relative w-full h-full"
                style={{ 
                  transform: `rotate(-${needleBaseOffset}deg)`,
                  willChange: 'transform'
                }}
                animate={{ 
                  rotate: isHovered && !isOpen && !isMobile && !externalHoveredDirection
                    ? [0, 15, -15, 0] 
                    : isOpen || externalHoveredDirection
                    ? 0 
                    : [0, 3, -2, 0]
                }}
                transition={
                  isOpen || externalHoveredDirection
                    ? { type: 'spring', stiffness: 120, damping: 24 }
                    : isHovered && !isMobile
                    ? { duration: 0.5, ease: "easeInOut" }
                    : { duration: 3, repeat: Infinity, repeatType: "reverse" as const, ease: "easeInOut" }
                }
              >
                <Image
                  src="/assets/compass-needle.png"
                  alt="Compass Needle"
                  fill
                  sizes={isOpen ? `${expandedSize}px` : `${compassSize}px`}
                  className="object-contain"
                  priority
                  quality={90}
                />
              </motion.div>
            </motion.div>
          </motion.button>

          {/* Hint text - only in center mode when not open */}
          {position === 'center' && showHint && !isOpen && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ 
                opacity: externalHoveredDirection ? 0 : 0.6, 
                y: 0 
              }}
              className="font-mono text-[10px] uppercase tracking-[0.3em] text-theme-gold mt-4 whitespace-nowrap"
            >
              {isMobile ? 'Tap to navigate' : 'Hover to explore'}
            </motion.p>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default RealisticCompass;
