"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDeviceTier } from '@/Hooks/useDeviceTier';

interface EssenceDropProps {
  /** Whether an item is currently being added (triggers the animation) */
  isActive: boolean;
  /** The dominant color of the product being added (hex color) */
  productColor?: string;
  /** Starting position (where the "Add to Satchel" button is) */
  startPosition: { x: number; y: number };
  /** End position (where the Satchel icon is - bottom-left) */
  endPosition: { x: number; y: number };
  /** Callback when the drop animation completes */
  onComplete?: () => void;
  /** Product name for the toast notification */
  productName?: string;
}

/**
 * EssenceDrop - The "Comet Tail" Cart Animation
 * 
 * When a user clicks "Add to Satchel", a glowing essence particle
 * detaches from the button and travels in a parabolic arc down
 * to the Satchel icon in the bottom-left corner.
 * 
 * Features:
 * - Parabolic arc trajectory (not straight line)
 * - Fading comet tail effect
 * - Impact "squash & stretch" on the satchel
 * - Toast notification appears near the satchel
 * - Graceful degradation for low-power devices
 */
export const EssenceDrop: React.FC<EssenceDropProps> = ({
  isActive,
  productColor = '#c5a66a', // Default to theme gold
  startPosition,
  endPosition,
  onComplete,
  productName = 'Item',
}) => {
  const { enableParticles, durationMultiplier } = useDeviceTier();
  const [showToast, setShowToast] = useState(false);
  const [trailPositions, setTrailPositions] = useState<{ x: number; y: number; opacity: number }[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component is mounted before creating portal
  useEffect(() => {
    setIsMounted(true);
    console.log('[EssenceDrop] Component mounted');
    return () => setIsMounted(false);
  }, []);

  // Calculate the parabolic path - memoized to prevent recalculation every render
  const path = useMemo(() => {
    const dx = endPosition.x - startPosition.x;

    // Control point for the bezier curve (creates the arc)
    // We want it to arc upward first, then down - like a thrown object
    const controlX = startPosition.x + dx * 0.3;
    const controlY = Math.min(startPosition.y, endPosition.y) - 100; // Arc peak

    console.log('[EssenceDrop] Path calculated:', {
      start: startPosition,
      control: { x: controlX, y: controlY },
      end: endPosition,
    });

    return {
      start: startPosition,
      control: { x: controlX, y: controlY },
      end: endPosition,
    };
  }, [startPosition, endPosition]);

  // Animation duration based on distance (600-800ms as specified)
  const distance = Math.sqrt(
    Math.pow(endPosition.x - startPosition.x, 2) +
    Math.pow(endPosition.y - startPosition.y, 2)
  );
  // Ensure minimum 1.2s duration for visibility, max 2s
  const baseDuration = Math.min(Math.max(distance / 600, 1.2), 2.0);
  const duration = baseDuration * durationMultiplier;

  console.log('[EssenceDrop] Animation config:', { isActive, distance, duration, enableParticles });

  // Generate trail positions for the comet effect
  useEffect(() => {
    if (!isActive || !enableParticles) {
      setTrailPositions([]);
      return;
    }

    const trailCount = 8;
    const newTrail: { x: number; y: number; opacity: number }[] = [];

    for (let i = 0; i < trailCount; i++) {
      const t = i / trailCount;
      // Quadratic bezier interpolation
      const x = Math.pow(1 - t, 2) * path.start.x +
        2 * (1 - t) * t * path.control.x +
        Math.pow(t, 2) * path.end.x;
      const y = Math.pow(1 - t, 2) * path.start.y +
        2 * (1 - t) * t * path.control.y +
        Math.pow(t, 2) * path.end.y;

      newTrail.push({
        x,
        y,
        opacity: 1 - (i / trailCount) * 0.8,
      });
    }

    setTrailPositions(newTrail);
  }, [isActive, enableParticles, path]);

  // Show toast after animation completes
  useEffect(() => {
    if (isActive) {
      const toastTimer = setTimeout(() => {
        setShowToast(true);
        onComplete?.();
      }, duration * 1000);

      const hideToastTimer = setTimeout(() => {
        setShowToast(false);
      }, (duration + 3) * 1000); // Toast visible for 3 seconds

      return () => {
        clearTimeout(toastTimer);
        clearTimeout(hideToastTimer);
      };
    }
  }, [isActive, duration, onComplete]);

  // Don't render until mounted (for SSR safety)
  if (!isMounted) {
    console.log('[EssenceDrop] Not mounted yet, returning null');
    return null;
  }

  // Render via Portal to ensure it sits on top of everything
  return createPortal(
    <>
      {/* Main Essence Particle */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            className="fixed top-0 left-0 pointer-events-none"
            style={{ zIndex: 2147483647 }}
            initial={{
              x: startPosition.x - 20,
              y: startPosition.y - 20,
              scale: 1,
              opacity: 1,
            }}
            animate={{
              x: [
                startPosition.x - 20,
                path.control.x - 20,
                endPosition.x - 20,
              ],
              y: [
                startPosition.y - 20,
                path.control.y - 20,
                endPosition.y - 20,
              ],
              scale: [1, 1.8, 0.6],
              opacity: [1, 1, 0.8],
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{
              duration: duration,
              ease: [0.25, 0.1, 0.25, 1],
              times: [0, 0.4, 1],
            }}
            onAnimationComplete={() => {
              console.log('[EssenceDrop] Animation complete');
            }}
          >
            {/* The glowing essence orb - LARGER and BRIGHTER for visibility */}
            <div
              className="w-[40px] h-[40px] rounded-full"
              style={{
                backgroundColor: productColor,
                boxShadow: `
                  0 0 20px ${productColor},
                  0 0 40px ${productColor},
                  0 0 60px ${productColor}80,
                  0 0 80px ${productColor}40
                `,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comet Trail (High-performance devices only) */}
      <AnimatePresence>
        {isActive && enableParticles && trailPositions.map((pos, index) => (
          <motion.div
            key={index}
            className="fixed top-0 left-0 pointer-events-none"
            style={{ zIndex: 99998 }}
            initial={{
              x: startPosition.x - 6,
              y: startPosition.y - 6,
              opacity: 0,
            }}
            animate={{
              x: pos.x - 6,
              y: pos.y - 6,
              opacity: [0, pos.opacity * 0.6, 0],
            }}
            transition={{
              duration: duration * 0.8,
              delay: index * 0.03,
              ease: "easeOut",
            }}
          >
            <div
              className="w-[12px] h-[12px] rounded-full"
              style={{
                backgroundColor: productColor,
                opacity: pos.opacity * 0.7,
                filter: 'blur(3px)',
              }}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Toast Notification (appears near Satchel) */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 10, x: 0 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed pointer-events-none"
            style={{
              zIndex: 99999,
              left: endPosition.x + 60,
              bottom: typeof window !== 'undefined' ? window.innerHeight - endPosition.y - 20 : 40,
            }}
          >
            <div className="bg-theme-charcoal/95 backdrop-blur-sm text-theme-alabaster px-4 py-2 rounded-sm shadow-lg">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] whitespace-nowrap">
                {productName} <span className="text-theme-gold">Added to Satchel</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>,
    document.body
  );
};

/**
 * SatchelImpact - The "Counterweight" Squash & Stretch Effect
 * 
 * Apply this to the Satchel icon when an item drops into it.
 * Creates a physical "catching" sensation.
 */
interface SatchelImpactProps {
  isImpacting: boolean;
  children: React.ReactNode;
}

export const SatchelImpact: React.FC<SatchelImpactProps> = ({
  isImpacting,
  children,
}) => {
  return (
    <motion.div
      animate={isImpacting ? {
        scaleY: [1, 0.9, 1.05, 1],
        scaleX: [1, 1.1, 0.95, 1],
        y: [0, 2, -1, 0],
      } : {
        scaleY: 1,
        scaleX: 1,
        y: 0,
      }}
      transition={{
        duration: 0.4,
        ease: [0.34, 1.56, 0.64, 1], // Bouncy easing
      }}
    >
      {children}
    </motion.div>
  );
};

export default EssenceDrop;
