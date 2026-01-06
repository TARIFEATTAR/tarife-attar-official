"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseIdleHeartbeatOptions {
  /** Idle timeout in milliseconds for first-time visitors (default: 3000ms) */
  firstVisitTimeout?: number;
  /** Idle timeout in milliseconds for returning visitors (default: 6000ms) */
  returnVisitTimeout?: number;
  /** LocalStorage key to track if user has visited before */
  visitedKey?: string;
  /** Whether the heartbeat is enabled (disable when compass is open) */
  enabled?: boolean;
}

interface UseIdleHeartbeatResult {
  /** Whether the user is currently idle */
  isIdle: boolean;
  /** Whether this is the user's first visit */
  isFirstVisit: boolean;
  /** Reset the idle timer (call on user interaction) */
  resetIdle: () => void;
  /** Mark the user as having interacted (persists to localStorage) */
  markInteracted: () => void;
}

/**
 * Detects user idle state for triggering attention animations
 * 
 * Uses different timeouts for first-time vs returning visitors:
 * - First visit: 3 seconds (users need guidance faster)
 * - Return visit: 6 seconds (they already know the interface)
 * 
 * Resets on: scroll, click, mousemove, keydown, touchstart
 * 
 * @example
 * ```tsx
 * const { isIdle, isFirstVisit, resetIdle } = useIdleHeartbeat({
 *   enabled: !isCompassOpen
 * });
 * 
 * // Trigger heartbeat animation when idle
 * useEffect(() => {
 *   if (isIdle) {
 *     triggerHeartbeatAnimation();
 *   }
 * }, [isIdle]);
 * ```
 */
export function useIdleHeartbeat({
  firstVisitTimeout = 3000,
  returnVisitTimeout = 6000,
  visitedKey = 'tarife-has-visited',
  enabled = true,
}: UseIdleHeartbeatOptions = {}): UseIdleHeartbeatResult {
  const [isIdle, setIsIdle] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasInteractedRef = useRef(false);

  // Check if user has visited before
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hasVisited = localStorage.getItem(visitedKey);
    setIsFirstVisit(!hasVisited);
  }, [visitedKey]);

  // Get the appropriate timeout based on visit history
  const getTimeout = useCallback(() => {
    return isFirstVisit ? firstVisitTimeout : returnVisitTimeout;
  }, [isFirstVisit, firstVisitTimeout, returnVisitTimeout]);

  // Reset idle state and restart timer
  const resetIdle = useCallback(() => {
    setIsIdle(false);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (enabled) {
      timerRef.current = setTimeout(() => {
        setIsIdle(true);
      }, getTimeout());
    }
  }, [enabled, getTimeout]);

  // Mark user as having interacted (persists)
  const markInteracted = useCallback(() => {
    if (typeof window === 'undefined') return;

    hasInteractedRef.current = true;
    localStorage.setItem(visitedKey, 'true');
    setIsFirstVisit(false);
    resetIdle();
  }, [visitedKey, resetIdle]);

  // Set up event listeners for user activity
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!enabled) {
      setIsIdle(false);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      return;
    }

    const events = [
      'scroll',
      'click',
      'mousemove',
      'keydown',
      'touchstart',
      'touchmove',
    ];

    // Throttled handler to prevent excessive resets
    let lastReset = 0;
    const throttleMs = 100;

    const handleActivity = () => {
      const now = Date.now();
      if (now - lastReset > throttleMs) {
        lastReset = now;
        resetIdle();
      }
    };

    // Start initial timer
    resetIdle();

    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [enabled, resetIdle]);

  return {
    isIdle,
    isFirstVisit,
    resetIdle,
    markInteracted,
  };
}

/**
 * Hook to track scroll activity specifically
 * Returns true if user has scrolled in the last N milliseconds
 */
export function useScrollActivity(timeoutMs: number = 300): boolean {
  const [isScrolling, setIsScrolling] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      setIsScrolling(true);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, timeoutMs);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeoutMs]);

  return isScrolling;
}
