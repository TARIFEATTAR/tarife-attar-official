"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useShopifyCart } from '@/context/ShopifyCartContext';
import { EssenceDrop, SatchelImpact } from './EssenceDrop';
import { useRouter } from 'next/navigation';

interface SatchelProps {
  /** Theme for styling */
  theme?: 'atlas' | 'relic';
}

// Global event for triggering essence drop from anywhere
export const ESSENCE_DROP_EVENT = 'tarife-essence-drop';

interface EssenceDropEventDetail {
  productColor?: string;
  productName?: string;
  startX: number;
  startY: number;
  timestamp?: number; // Add timestamp to dedupe events
}

/**
 * Satchel - The Gravity Cart Icon
 * 
 * Positioned in the bottom-left corner as a counterweight to the Compass.
 * Items "drop" down into it with physics-based animations.
 * 
 * Features:
 * - Fixed bottom-left position
 * - Item count badge
 * - Essence Drop animation on add
 * - Squash & stretch impact effect
 * - Click to navigate to cart page
 */
export const Satchel: React.FC<SatchelProps> = ({ theme = 'atlas' }) => {
  const router = useRouter();
  const { itemCount } = useShopifyCart();
  const [isImpacting, setIsImpacting] = useState(false);
  const [essenceDropActive, setEssenceDropActive] = useState(false);
  const [dropDetails, setDropDetails] = useState<{
    productColor: string;
    productName: string;
    startPosition: { x: number; y: number };
  } | null>(null);

  const satchelRef = useRef<HTMLButtonElement>(null);
  const prevItemCount = useRef(itemCount);
  const lastEventTimestamp = useRef<number>(0); // Track last processed event to prevent duplicates

  // Spring animation for the badge
  const badgeScale = useMotionValue(1);
  const springBadgeScale = useSpring(badgeScale, {
    stiffness: 500,
    damping: 15,
  });

  // Get satchel position for the essence drop endpoint
  const getSatchelPosition = useCallback(() => {
    if (!satchelRef.current) {
      // Default position if ref not available
      return { x: 40, y: window.innerHeight - 40 };
    }
    const rect = satchelRef.current.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }, []);

  // Listen for essence drop events from "Add to Satchel" buttons
  useEffect(() => {
    const handleEssenceDrop = (event: CustomEvent<EssenceDropEventDetail>) => {
      const { productColor, productName, startX, startY, timestamp } = event.detail;
      
      // Prevent duplicate processing - ignore events within 500ms of each other
      const now = timestamp || Date.now();
      if (now - lastEventTimestamp.current < 500) {
        console.log('[Satchel] Ignoring duplicate event, too soon after last one');
        return;
      }
      lastEventTimestamp.current = now;

      // Don't trigger if animation is already active
      if (essenceDropActive) {
        console.log('[Satchel] Ignoring event, animation already active');
        return;
      }

      console.log('[Satchel] Received essence drop event:', { productColor, productName, startX, startY });

      setDropDetails({
        productColor: productColor || '#c5a66a',
        productName: productName || 'Item',
        startPosition: { x: startX, y: startY },
      });
      setEssenceDropActive(true);
    };

    console.log('[Satchel] Setting up essence drop event listener');
    window.addEventListener(ESSENCE_DROP_EVENT, handleEssenceDrop as EventListener);

    return () => {
      console.log('[Satchel] Cleaning up essence drop event listener');
      window.removeEventListener(ESSENCE_DROP_EVENT, handleEssenceDrop as EventListener);
    };
  }, [essenceDropActive]);

  // Detect item count changes for impact animation
  useEffect(() => {
    if (itemCount > prevItemCount.current) {
      // Item was added - trigger impact
      setIsImpacting(true);
      badgeScale.set(1.3);

      setTimeout(() => {
        setIsImpacting(false);
        badgeScale.set(1);
      }, 400);
    }
    prevItemCount.current = itemCount;
  }, [itemCount, badgeScale]);

  // Handle essence drop completion - memoized to prevent unnecessary re-renders
  const handleEssenceDropComplete = useCallback(() => {
    console.log('[Satchel] Essence drop complete, resetting state');
    setEssenceDropActive(false);
    setDropDetails(null);
  }, []);

  const handleClick = () => {
    router.push('/cart');
  };

  const isAtlas = theme === 'atlas';

  return (
    <>
      {/* Essence Drop Animation */}
      {essenceDropActive && dropDetails && (
        <>
          {console.log('[Satchel] Rendering EssenceDrop:', { essenceDropActive, dropDetails, endPosition: getSatchelPosition() })}
          <EssenceDrop
            isActive={essenceDropActive}
            productColor={dropDetails.productColor}
            productName={dropDetails.productName}
            startPosition={dropDetails.startPosition}
            endPosition={getSatchelPosition()}
            onComplete={handleEssenceDropComplete}
          />
        </>
      )}

      {/* Satchel Icon */}
      <div className="fixed bottom-4 left-4 md:bottom-6 md:left-6 z-[2999]">
        <SatchelImpact isImpacting={isImpacting}>
          <motion.button
            ref={satchelRef}
            onClick={handleClick}
            className={`
              relative flex items-center justify-center
              w-12 h-12 md:w-14 md:h-14
              rounded-full shadow-lg
              transition-colors duration-300
              ${isAtlas
                ? 'bg-theme-charcoal text-theme-alabaster hover:bg-theme-obsidian'
                : 'bg-theme-alabaster text-theme-charcoal hover:bg-theme-alabaster/90'
              }
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={`Shopping satchel with ${itemCount} items`}
          >
            <ShoppingBag className="w-5 h-5 md:w-6 md:h-6" />

            {/* Item Count Badge */}
            <AnimatePresence>
              {itemCount > 0 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  style={{ scale: springBadgeScale }}
                  className={`
                    absolute -top-1 -right-1
                    min-w-[20px] h-5
                    flex items-center justify-center
                    rounded-full px-1.5
                    font-mono text-[10px] font-medium
                    ${isAtlas
                      ? 'bg-theme-gold text-theme-charcoal'
                      : 'bg-theme-gold text-theme-charcoal'
                    }
                  `}
                >
                  {itemCount > 99 ? '99+' : itemCount}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </SatchelImpact>
      </div>
    </>
  );
};

/**
 * Helper function to trigger essence drop from any "Add to Satchel" button
 * 
 * @example
 * ```tsx
 * const handleAddToCart = async (e: React.MouseEvent) => {
 *   const rect = e.currentTarget.getBoundingClientRect();
 *   triggerEssenceDrop({
 *     productColor: '#c5a66a',
 *     productName: 'Oud Wood',
 *     startX: rect.left + rect.width / 2,
 *     startY: rect.top + rect.height / 2,
 *   });
 *   await addItem(variantId, quantity);
 * };
 * ```
 */
export function triggerEssenceDrop(details: Omit<EssenceDropEventDetail, 'timestamp'>) {
  if (typeof window === 'undefined') return;

  const detailsWithTimestamp: EssenceDropEventDetail = {
    ...details,
    timestamp: Date.now(),
  };

  console.log('[triggerEssenceDrop] Dispatching event:', detailsWithTimestamp);

  const event = new CustomEvent(ESSENCE_DROP_EVENT, {
    detail: detailsWithTimestamp,
  });
  window.dispatchEvent(event);
}

export default Satchel;
