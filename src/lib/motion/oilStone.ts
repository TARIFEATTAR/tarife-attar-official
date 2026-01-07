/**
 * "Oil & Stone" Motion Physics System
 * 
 * The signature movement language for Tarife Attär.
 * Heavy friction, slow stop - like thick oil settling on stone.
 * 
 * This creates a sense of weight and preciousness,
 * reinforcing the "Modern Apothecary" aesthetic.
 */

import { Transition, Variants } from 'framer-motion';

// ============================================================================
// CORE PHYSICS
// ============================================================================

/**
 * The signature easing curve
 * cubic-bezier(0.19, 1, 0.22, 1)
 * Heavy initial friction, slow deceleration
 */
export const OIL_STONE_EASE = [0.19, 1, 0.22, 1] as const;

/**
 * Standard duration for most transitions
 */
export const OIL_STONE_DURATION = 0.6;

/**
 * Spring configuration for physics-based animations
 */
export const OIL_STONE_SPRING: Transition = {
  type: "spring",
  stiffness: 100,
  damping: 20,
  mass: 1.2,
};

/**
 * Liquid spring - even heavier, for large elements
 */
export const LIQUID_SPRING: Transition = {
  type: "spring",
  stiffness: 80,
  damping: 25,
  mass: 1.5,
};

/**
 * Quick settle - for micro-interactions
 */
export const QUICK_SETTLE: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 20,
  mass: 0.8,
};

// ============================================================================
// TRANSITION PRESETS
// ============================================================================

/**
 * Standard Oil & Stone transition (CSS-style)
 */
export const oilStoneTransition: Transition = {
  duration: OIL_STONE_DURATION,
  ease: OIL_STONE_EASE,
};

/**
 * Slower variant for dramatic reveals
 */
export const dramaticTransition: Transition = {
  duration: 0.9,
  ease: OIL_STONE_EASE,
};

/**
 * Faster variant for responsive feedback
 */
export const quickTransition: Transition = {
  duration: 0.35,
  ease: OIL_STONE_EASE,
};

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

/**
 * Fade up - content entering from below
 */
export const fadeUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: oilStoneTransition,
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: quickTransition,
  },
};

/**
 * Scale in - elements growing from center
 */
export const scaleInVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.85,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: OIL_STONE_SPRING,
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: quickTransition,
  },
};

/**
 * Slide from right - panels entering
 */
export const slideRightVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 40,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: oilStoneTransition,
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: quickTransition,
  },
};

/**
 * Sheet up - mobile sheets
 */
export const sheetUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: '100%',
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: OIL_STONE_SPRING,
  },
  exit: {
    opacity: 0,
    y: '50%',
    transition: { duration: 0.3, ease: OIL_STONE_EASE },
  },
};

/**
 * Morph - for layoutId animations
 */
export const morphTransition: Transition = {
  layout: {
    ...OIL_STONE_SPRING,
  },
};

// ============================================================================
// STAGGER CONFIGURATIONS
// ============================================================================

/**
 * Stagger children with oil & stone feel
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

/**
 * Individual stagger item
 */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: oilStoneTransition,
  },
};

// ============================================================================
// HOVER STATES
// ============================================================================

/**
 * Gentle lift on hover
 */
export const hoverLift = {
  y: -4,
  transition: quickTransition,
};

/**
 * Subtle scale on hover
 */
export const hoverScale = {
  scale: 1.02,
  transition: QUICK_SETTLE,
};

/**
 * Press state
 */
export const tapScale = {
  scale: 0.98,
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a custom oil & stone transition with overrides
 */
export function createOilStoneTransition(overrides: Partial<Transition> = {}): Transition {
  return {
    ...oilStoneTransition,
    ...overrides,
  };
}

/**
 * Get the appropriate duration multiplier for device tier
 */
export function getDeviceDuration(baseDuration: number, isLowPower: boolean): number {
  return isLowPower ? baseDuration * 1.5 : baseDuration;
}
