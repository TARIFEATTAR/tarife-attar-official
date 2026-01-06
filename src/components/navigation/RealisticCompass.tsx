"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { useIdleHeartbeat, useScrollActivity } from '@/Hooks/useIdleHeartbeat';

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
  position?: 'corner' | 'center';
  hoveredDirection?: 'W' | 'E' | null;
  showHint?: boolean;
  absolutePosition?: boolean;
}

export const RealisticCompass: React.FC<Props> = ({
  onNavigate,
  size = 'md',
  position = 'corner',
  hoveredDirection: externalHoveredDirection = null,
  showHint = true,
  absolutePosition = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredDirection, setHoveredDirection] = useState<'N' | 'E' | 'S' | 'W' | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isShortViewport, setIsShortViewport] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [mousePosition, setMousePosition] = useState<{ x: number, y: number } | null>(null);

  const compassRef = React.useRef<HTMLButtonElement>(null);

  // === ZERO-UI MITIGATIONS ===

  // 1. Idle Heartbeat Detection
  const { isIdle, markInteracted } = useIdleHeartbeat({
    enabled: !isOpen && position === 'corner', // Only in corner mode when closed
  });

  // 2. Scroll Activity Detection (for shrink behavior)
  const isScrolling = useScrollActivity(300);

  // === EXISTING SCROLL-BASED ROTATION ===
  const { scrollYProgress } = useScroll();
  const rawRotation = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const needleRotation = useSpring(rawRotation, {
    stiffness: 120,
    damping: 24,
    mass: 0.8,
  });

  // === INITIALIZATION ===
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

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        setMousePosition({ x: touch.clientX, y: touch.clientY });
      }
    };

    const handleTouchEnd = () => {
      setTimeout(() => setMousePosition(null), 300);
    };

    handleResize();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleTouchMove, { passive: true });
      window.addEventListener('touchend', handleTouchEnd);
    }

    // Load interaction state
    if (typeof window !== 'undefined') {
      const interacted = localStorage.getItem('compass-interacted');
      if (interacted) setHasInteracted(true);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, []);

  // === SIZING ===
  const sizeConfig = {
    sm: isMobile ? 56 : 80,
    md: isMobile ? 64 : 100,
    lg: isMobile ? 80 : 140
  };
  const baseSizeValue = sizeConfig[size];
  const compassSize = position === 'center' ? baseSizeValue * 1.2 : baseSizeValue;

  const expandedSize = isMobile
    ? (isShortViewport ? 120 : viewportWidth > 0 ? Math.min(viewportWidth * 0.35, 130) : 130)
    : 240;
  const compassRadius = expandedSize / 2;
  const labelGap = isMobile ? 12 : 50;
  const needleBaseOffset = 45;

  // === SCROLL-SHRINK BEHAVIOR ===
  // When scrolling, shrink compass to get out of the way
  const scrollShrinkScale = isScrolling && !isOpen ? 0.85 : 1;
  const scrollShrinkOpacity = isScrolling && !isOpen ? 0.6 : 1;

  // === NEEDLE ANGLE CALCULATION ===
  const getActiveNeedleAngle = useCallback((): number => {
    if (isOpen && hoveredDirection) {
      return NAV_ITEMS.find(i => i.direction === hoveredDirection)!.angle - needleBaseOffset;
    }

    if (mousePosition && compassRef.current) {
      const rect = compassRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = mousePosition.x - centerX;
      const deltaY = mousePosition.y - centerY;
      const angleDeg = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
      return angleDeg + 90 - needleBaseOffset;
    }

    if (externalHoveredDirection) {
      const externalAngle = externalHoveredDirection === 'W' ? 270 : 90;
      return externalAngle - needleBaseOffset;
    }

    if (isOpen) {
      return -needleBaseOffset;
    }

    return needleRotation.get();
  }, [isOpen, hoveredDirection, mousePosition, externalHoveredDirection, needleRotation, needleBaseOffset]);

  // === EVENT HANDLERS ===
  const handleNavClick = (item: NavItem) => {
    onNavigate(item.path);
    setIsOpen(false);

    // Mark as interacted
    if (!hasInteracted) {
      setHasInteracted(true);
      markInteracted();
      if (typeof window !== 'undefined') {
        localStorage.setItem('compass-interacted', 'true');
      }
    }
  };

  const handleOverlayClick = () => {
    setIsOpen(false);
    setHoveredDirection(null);
  };

  const handleCompassClick = () => {
    setIsOpen(!isOpen);

    // Mark as interacted on first click
    if (!hasInteracted) {
      setHasInteracted(true);
      markInteracted();
      if (typeof window !== 'undefined') {
        localStorage.setItem('compass-interacted', 'true');
      }
    }
  };

  if (!isMounted) return null;

  // === POSITION CLASSES ===
  const getPositionClasses = () => {
    if (isOpen) {
      return 'inset-0 flex items-center justify-center';
    }
    if (position === 'center') {
      return isMobile ? 'top-1/2 left-1/2' : 'bottom-12 left-1/2';
    }
    return isMobile ? 'bottom-3 right-3' : 'bottom-6 right-6';
  };

  const getTransformStyle = () => {
    // When open, reset all transforms so flexbox centering works
    if (isOpen) {
      return { x: 0, y: 0 };
    }
    if (position === 'center') {
      return isMobile
        ? { x: '-50%', y: '-50%' }
        : { x: '-50%', y: 0 };
    }
    return { x: 0, y: 0 };
  };

  // === HEARTBEAT ANIMATION CONFIG ===
  // The "breathing" effect when user is idle
  const heartbeatAnimation = isIdle && !hasInteracted && !isOpen ? {
    scale: [1, 1.05, 1],
    boxShadow: [
      '0 4px 20px rgba(0,0,0,0.1)',
      '0 8px 40px rgba(197,166,106,0.4)',
      '0 4px 20px rgba(0,0,0,0.1)',
    ],
  } : {};

  const heartbeatTransition = isIdle && !hasInteracted && !isOpen ? {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut" as const,
  } : {};

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

            {/* Cardinal Labels */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[2999] pointer-events-none overflow-hidden"
            >
              {/* NORTH - Threshold */}
              <div
                className="absolute top-0 left-0 right-0 bottom-1/2 flex items-end justify-center pointer-events-none"
                style={{ paddingBottom: `${compassRadius + labelGap}px` }}
              >
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  onClick={() => handleNavClick(NAV_ITEMS[0])}
                  onMouseEnter={() => !isMobile && setHoveredDirection('N')}
                  onMouseLeave={() => !isMobile && setHoveredDirection(null)}
                  className="pointer-events-auto flex flex-col items-center group touch-manipulation min-h-[48px] min-w-[80px] md:min-w-[120px] px-4 py-3 active:scale-95 transition-transform"
                >
                  <span className={`font-mono ${isMobile ? 'text-[10px] tracking-[0.2em]' : 'text-lg tracking-[0.5em]'} uppercase transition-all duration-300 ${hoveredDirection === 'N' ? 'text-theme-gold scale-110' : 'text-white/60'
                    }`}>
                    {NAV_ITEMS[0].label}
                  </span>
                  {!isMobile && (
                    <span className={`font-serif italic text-sm mt-1 transition-colors ${hoveredDirection === 'N' ? 'text-white/70' : 'text-white/30'
                      }`}>
                      {NAV_ITEMS[0].description}
                    </span>
                  )}
                </motion.button>
              </div>

              {/* EAST - The Relic */}
              <div
                className="absolute top-0 left-1/2 bottom-0 right-0 flex items-center justify-start pointer-events-none"
                style={{ paddingLeft: `${compassRadius + labelGap}px` }}
              >
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onClick={() => handleNavClick(NAV_ITEMS[1])}
                  onMouseEnter={() => !isMobile && setHoveredDirection('E')}
                  onMouseLeave={() => !isMobile && setHoveredDirection(null)}
                  className="pointer-events-auto flex flex-col items-center group touch-manipulation min-h-[48px] min-w-[80px] md:min-w-[120px] px-4 py-3 active:scale-95 transition-transform"
                >
                  <span className={`font-mono ${isMobile ? 'text-[10px] tracking-[0.2em]' : 'text-lg tracking-[0.5em]'} uppercase transition-all duration-300 ${hoveredDirection === 'E' ? 'text-theme-gold scale-110' : 'text-white/60'
                    }`}>
                    {NAV_ITEMS[1].label}
                  </span>
                  {!isMobile && (
                    <span className={`font-serif italic text-sm mt-1 transition-colors ${hoveredDirection === 'E' ? 'text-white/70' : 'text-white/30'
                      }`}>
                      {NAV_ITEMS[1].description}
                    </span>
                  )}
                </motion.button>
              </div>

              {/* SOUTH - Satchel */}
              <div
                className="absolute top-1/2 left-0 right-0 bottom-0 flex items-start justify-center pointer-events-none"
                style={{ paddingTop: `${compassRadius + labelGap}px` }}
              >
                <motion.button
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onClick={() => handleNavClick(NAV_ITEMS[2])}
                  onMouseEnter={() => !isMobile && setHoveredDirection('S')}
                  onMouseLeave={() => !isMobile && setHoveredDirection(null)}
                  className="pointer-events-auto flex flex-col items-center group touch-manipulation min-h-[48px] min-w-[80px] md:min-w-[120px] px-4 py-3 active:scale-95 transition-transform"
                >
                  <span className={`font-mono ${isMobile ? 'text-[10px] tracking-[0.2em]' : 'text-lg tracking-[0.5em]'} uppercase transition-all duration-300 ${hoveredDirection === 'S' ? 'text-theme-gold scale-110' : 'text-white/60'
                    }`}>
                    {NAV_ITEMS[2].label}
                  </span>
                  {!isMobile && (
                    <span className={`font-serif italic text-sm mt-1 transition-colors ${hoveredDirection === 'S' ? 'text-white/70' : 'text-white/30'
                      }`}>
                      {NAV_ITEMS[2].description}
                    </span>
                  )}
                </motion.button>
              </div>

              {/* WEST - The Atlas */}
              <div
                className="absolute top-0 left-0 bottom-0 right-1/2 flex items-center justify-end pointer-events-none"
                style={{ paddingRight: `${compassRadius + labelGap}px` }}
              >
                <motion.button
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onClick={() => handleNavClick(NAV_ITEMS[3])}
                  onMouseEnter={() => !isMobile && setHoveredDirection('W')}
                  onMouseLeave={() => !isMobile && setHoveredDirection(null)}
                  className="pointer-events-auto flex flex-col items-center group touch-manipulation min-h-[48px] min-w-[80px] md:min-w-[120px] px-4 py-3 active:scale-95 transition-transform"
                >
                  <span className={`font-mono ${isMobile ? 'text-[10px] tracking-[0.2em]' : 'text-lg tracking-[0.5em]'} uppercase transition-all duration-300 ${hoveredDirection === 'W' ? 'text-theme-gold scale-110' : 'text-white/60'
                    }`}>
                    {NAV_ITEMS[3].label}
                  </span>
                  {!isMobile && (
                    <span className={`font-serif italic text-sm mt-1 transition-colors ${hoveredDirection === 'W' ? 'text-white/70' : 'text-white/30'
                      }`}>
                      {NAV_ITEMS[3].description}
                    </span>
                  )}
                </motion.button>
              </div>

              {/* Close Hint */}
              <div
                className={`absolute ${isMobile ? 'bottom-6' : 'bottom-10'} left-0 right-0 flex justify-center pointer-events-auto cursor-pointer`}
                onClick={handleOverlayClick}
              >
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
        className={`${absolutePosition && !isOpen ? 'absolute' : 'fixed'} z-[3000] ${getPositionClasses()} ${isOpen ? 'pointer-events-none' : 'pointer-events-auto'}`}
        initial={getTransformStyle()}
        animate={{
          ...getTransformStyle(),
          scale: isOpen ? 1 : scrollShrinkScale,
          opacity: isOpen ? 1 : scrollShrinkOpacity,
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Compass Container */}
        <div className="flex flex-col items-center">
          {/* Hover-to-Reveal Label (Desktop Only) */}
          <AnimatePresence>
            {isHovered && !isOpen && !isMobile && (
              <motion.span
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute -top-8 font-mono text-[10px] uppercase tracking-[0.3em] text-theme-charcoal/60 whitespace-nowrap"
              >
                Explore
              </motion.span>
            )}
          </AnimatePresence>

          <motion.button
            ref={compassRef}
            onClick={handleCompassClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`cursor-pointer relative touch-manipulation shadow-2xl rounded-full active:scale-95 ${isOpen ? 'pointer-events-none' : 'pointer-events-auto'}`}
            style={{
              width: isOpen ? expandedSize : compassSize,
              height: isOpen ? expandedSize : compassSize,
              willChange: isOpen ? 'transform' : 'auto',
            }}
            animate={{
              // Heartbeat animation when idle (first-time visitors)
              ...heartbeatAnimation,
              // Normal scale animation when not idle
              ...((!isIdle || hasInteracted) && !isOpen ? {
                scale: isHovered ? 1.05 : 1,
              } : {}),
            }}
            transition={{
              width: { type: "spring", stiffness: 200, damping: 25, mass: 0.5 },
              height: { type: "spring", stiffness: 200, damping: 25, mass: 0.5 },
              ...heartbeatTransition,
            }}
          >
            {/* Compass Body */}
            <div className="w-full h-full rounded-full overflow-hidden relative">
              <Image
                src="/assets/compass-body.png"
                alt="Navigation Compass"
                fill
                className="object-cover"
                priority
              />

              {/* Needle */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  rotate: isOpen || mousePosition || externalHoveredDirection
                    ? getActiveNeedleAngle()
                    : needleRotation,
                }}
                transition={{
                  type: "spring",
                  stiffness: 150,
                  damping: 20,
                }}
              >
                <Image
                  src="/assets/compass-needle.png"
                  alt="Compass Needle"
                  fill
                  className="object-contain"
                />
              </motion.div>

              {/* Glass Glare Overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(255,255,255,0.15)_0%,_transparent_60%)] pointer-events-none" />
            </div>
          </motion.button>

          {/* Hint Text (Center position only) */}
          {position === 'center' && showHint && !isOpen && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              className="mt-4 font-mono text-[9px] md:text-[10px] uppercase tracking-[0.4em] text-theme-charcoal whitespace-nowrap"
            >
              Navigate by compass
            </motion.p>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default RealisticCompass;
