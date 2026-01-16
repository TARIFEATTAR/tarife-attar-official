"use client";

import { useState, useEffect } from 'react';

/**
 * Device Performance Tiers
 * 
 * Tier A (High Performance): Full WebGL effects, real-time physics
 * Tier B (Low Power): Pre-rendered videos, CSS-only animations
 */
export type DeviceTier = 'high' | 'low';

interface DeviceTierResult {
  tier: DeviceTier;
  isHighPerformance: boolean;
  isLowPower: boolean;
  /** Whether to use WebGL effects */
  enableWebGL: boolean;
  /** Whether to use Matter.js physics */
  enablePhysics: boolean;
  /** Whether to use complex particle effects */
  enableParticles: boolean;
  /** Recommended animation duration multiplier (1 = normal, 1.5 = slower for low-end) */
  durationMultiplier: number;
}

/**
 * Detects device performance tier for graceful degradation
 * 
 * Uses multiple signals:
 * - GPU renderer string
 * - Device memory (if available)
 * - Hardware concurrency (CPU cores)
 * - Battery saver mode
 * - Reduced motion preference
 * 
 * @returns Device tier information for conditional rendering
 */
export function useDeviceTier(): DeviceTierResult {
  const [tier, setTier] = useState<DeviceTier>('high');
  const [isLowPower, setIsLowPower] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const detectTier = async () => {
      let score = 0;

      // 1. Check GPU renderer (most reliable signal)
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

        if (gl && gl instanceof WebGLRenderingContext) {
          const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
          if (debugInfo) {
            const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();

            // High-performance GPUs
            if (
              renderer.includes('nvidia') ||
              renderer.includes('radeon') ||
              renderer.includes('apple m') ||
              renderer.includes('apple gpu') ||
              renderer.includes('adreno 6') || // Snapdragon 8xx
              renderer.includes('adreno 7') ||
              renderer.includes('mali-g7') ||
              renderer.includes('mali-g8')
            ) {
              score += 2;
            }
            // Low-performance GPUs
            else if (
              renderer.includes('intel hd') ||
              renderer.includes('intel uhd') ||
              renderer.includes('adreno 5') || // Older Snapdragon
              renderer.includes('adreno 4') ||
              renderer.includes('mali-g5') ||
              renderer.includes('mali-t') ||
              renderer.includes('powervr') ||
              renderer.includes('swiftshader') // Software renderer
            ) {
              score -= 1;
            }
          }
        }
      } catch (_e) {
        // WebGL not available
        score -= 2;
      }

      // 2. Check device memory (Chrome only)
      if ('deviceMemory' in navigator) {
        const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4;
        if (memory >= 8) score += 1;
        else if (memory <= 2) score -= 1;
      }

      // 3. Check hardware concurrency (CPU cores)
      if ('hardwareConcurrency' in navigator) {
        const cores = navigator.hardwareConcurrency || 4;
        if (cores >= 8) score += 1;
        else if (cores <= 2) score -= 1;
      }

      // 4. Check battery status (if in power saver mode)
      try {
        if ('getBattery' in navigator) {
          const battery = await (navigator as Navigator & { getBattery: () => Promise<{ charging: boolean; level: number }> }).getBattery();
          if (!battery.charging && battery.level < 0.2) {
            score -= 2;
            setIsLowPower(true);
          }
        }
      } catch (_e) {
        // Battery API not available
      }

      // 5. Check reduced motion preference
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        score -= 2;
      }

      // 6. Check if mobile device with small screen (likely low-end)
      if (window.innerWidth < 768 && window.devicePixelRatio < 2) {
        score -= 1;
      }

      // Determine tier based on score
      // Score range: -6 to +5
      // Threshold: 0 (anything negative is low tier)
      setTier(score >= 0 ? 'high' : 'low');
    };

    detectTier();

    // Re-check on visibility change (battery status might change)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        detectTier();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const isHighPerformance = tier === 'high';

  return {
    tier,
    isHighPerformance,
    isLowPower,
    enableWebGL: isHighPerformance && !isLowPower,
    enablePhysics: isHighPerformance && !isLowPower,
    enableParticles: isHighPerformance,
    durationMultiplier: isHighPerformance ? 1 : 1.5,
  };
}

/**
 * Simple synchronous check for reduced motion preference
 * Use this for immediate checks without the full hook
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
