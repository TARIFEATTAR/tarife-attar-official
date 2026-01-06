"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GhostLabelsProps {
  /** Whether to show the labels (controlled externally) */
  show?: boolean;
  /** Position of the Compass (for MENU label) */
  compassPosition?: 'corner' | 'center';
  /** Whether to show the satchel label */
  showSatchelLabel?: boolean;
  /** Callback when labels are dismissed */
  onDismiss?: () => void;
}

const STORAGE_KEY = 'tarife-ghost-labels-dismissed';

/**
 * GhostLabels - First-Visit Navigation Hints
 * 
 * Displays semi-transparent labels next to the Compass and Satchel
 * icons to help first-time visitors understand the navigation.
 * 
 * Behavior:
 * - Shows for first 5 seconds OR until user scrolls (whichever comes first)
 * - Never shows again once dismissed (persisted to localStorage)
 * - Fades out gracefully
 */
export const GhostLabels: React.FC<GhostLabelsProps> = ({
  show: showProp,
  compassPosition = 'corner',
  showSatchelLabel = true,
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenDismissed, setHasBeenDismissed] = useState(true); // Default to true, check localStorage

  // Check if labels have been dismissed before
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const dismissed = localStorage.getItem(STORAGE_KEY);
    setHasBeenDismissed(!!dismissed);
    
    // If not dismissed and no external control, show labels
    if (!dismissed && showProp === undefined) {
      setIsVisible(true);
    }
  }, [showProp]);

  // Handle external show prop
  useEffect(() => {
    if (showProp !== undefined) {
      setIsVisible(showProp && !hasBeenDismissed);
    }
  }, [showProp, hasBeenDismissed]);

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      dismissLabels();
    }, 5000);

    return () => clearTimeout(timer);
  }, [isVisible]);

  // Dismiss on scroll
  useEffect(() => {
    if (!isVisible) return;

    const handleScroll = () => {
      dismissLabels();
    };

    window.addEventListener('scroll', handleScroll, { passive: true, once: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isVisible]);

  const dismissLabels = () => {
    setIsVisible(false);
    setHasBeenDismissed(true);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
    
    onDismiss?.();
  };

  // Don't render if already dismissed
  if (hasBeenDismissed && showProp === undefined) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* MENU Label (next to Compass) */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={`fixed z-[2997] pointer-events-none ${
              compassPosition === 'corner'
                ? 'bottom-6 right-24 md:right-28'
                : 'bottom-20 left-1/2 -translate-x-1/2'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] text-theme-charcoal/40 whitespace-nowrap">
                Menu
              </span>
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="text-theme-charcoal/30"
              >
                →
              </motion.div>
            </div>
          </motion.div>

          {/* SATCHEL Label (next to Cart - bottom-left) */}
          {showSatchelLabel && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
              className="fixed z-[2997] pointer-events-none bottom-6 left-20 md:left-24"
            >
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ x: [0, -4, 0] }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="text-theme-charcoal/30"
                >
                  ←
                </motion.div>
                <span className="font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] text-theme-charcoal/40 whitespace-nowrap">
                  Satchel
                </span>
              </div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
};

/**
 * Hook to manage ghost label visibility
 * Use this if you need programmatic control over the labels
 */
export function useGhostLabels() {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      setShouldShow(true);
    }
  }, []);

  const dismiss = () => {
    setShouldShow(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
  };

  const reset = () => {
    // For testing purposes - allows re-showing the labels
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      setShouldShow(true);
    }
  };

  return {
    shouldShow,
    dismiss,
    reset,
  };
}

export default GhostLabels;
