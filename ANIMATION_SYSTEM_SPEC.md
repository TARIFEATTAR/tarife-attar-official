# Tarife Attär Animation System - Technical Specification

## 🎯 Overview

This document outlines the "Modern Manuscript" animation system for Tarife Attär, focusing on liquid, physics-based motion that creates a cinematic entry experience.

---

## 📊 Current State Analysis

### ✅ Already Implemented

1. **Basic EntryLoader** (`EntryLoader.tsx`)
   - Sequential stage-based animation
   - Split screen reveal (stage 3)
   - Basic blur/opacity transitions
   - **Missing:** `layoutId` morphing, liquid easing

2. **SplitEntry Component** (`SplitEntry.tsx`)
   - Hover-based panel expansion
   - AnimatePresence for choice modal
   - **Missing:** Full "fission" effect, `mode="wait"`, liquid transitions

3. **RealisticCompass** (`RealisticCompass.tsx`)
   - Spring physics for scroll-based rotation
   - Hover-based needle movement
   - **Missing:** Optimized spring config (stiffness: 120, damping: 24, mass: 0.8)

4. **Tailwind Config**
   - Basic animations defined
   - **Missing:** `liquid` easing curve

---

## 🔧 Required Implementations

### 1. Liquid Easing Function

**Location:** `tailwind.config.ts`

```typescript
extend: {
  transitionTimingFunction: {
    'liquid': 'cubic-bezier(0.85, 0, 0.15, 1)',
  },
  // Or as a custom easing in Framer Motion
}
```

**Usage:**
- All image scaling transitions
- Split-screen "fission" transitions
- Threshold entry/exit animations
- Any heavy, deliberate movement

**Framer Motion Integration:**
```typescript
transition={{ 
  type: "tween",
  ease: [0.85, 0, 0.15, 1], // Liquid easing
  duration: 0.8
}}
```

---

### 2. Shared Layout Identity (layoutId Morphing)

**Concept:** The "A" and "R" insignias morph from their centered position in `EntryLoader` to their final positions in the header/navigation.

**Implementation Strategy:**

#### Step 1: Add layoutId to EntryLoader
```typescript
// In EntryLoader.tsx
<motion.span
  layoutId="atlas-insignia" // Shared ID
  initial={{ opacity: 0 }}
  animate={{ 
    opacity: stage >= 1 ? 1 : 0,
    scale: stage === 2 ? 1.15 : 1,
  }}
  className="inline-block"
>
  A
</motion.span>

<motion.span
  layoutId="relic-insignia" // Shared ID
  initial={{ opacity: 0 }}
  animate={{ 
    opacity: stage >= 1 ? 1 : 0,
    scale: stage === 2 ? 1.15 : 1,
  }}
  className="inline-block"
>
  R
</motion.span>
```

#### Step 2: Add matching layoutId to SplitEntry (NOT a top nav bar)
```typescript
// In SplitEntry.tsx - Atlas side (left)
<motion.span 
  layoutId="atlas-insignia" // Same ID = morphing from EntryLoader
  className="text-5xl sm:text-6xl md:text-[12rem] font-serif font-bold mb-2 leading-none text-theme-gold"
>
  A
</motion.span>

// In SplitEntry.tsx - Relic side (right)
<motion.span 
  layoutId="relic-insignia" // Same ID = morphing from EntryLoader
  className="text-5xl sm:text-6xl md:text-[12rem] font-serif font-bold mb-2 leading-none text-theme-gold"
>
  R
</motion.span>
```

**⚠️ IMPORTANT: NO TOP NAVIGATION BAR**
- The A and R morph from EntryLoader center → SplitEntry left/right positions
- They do NOT morph to a top navigation bar
- Keep the site headerless for the cinematic entry experience

**Key Points:**
- Framer Motion automatically animates between matching `layoutId` elements
- Works across component boundaries
- Creates seamless "brand continuity"

---

### 3. Procedural "Fission" (Screen Split)

**Current State:** Basic split-screen with `x: '100%'` animation

**Enhanced Implementation:**

```typescript
// In EntryLoader.tsx - Stage 3 (Fission)
<motion.div 
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  className="absolute inset-0 z-[-1] flex pointer-events-none"
>
  {/* Left Panel - Fixed */}
  <motion.div 
    className="w-1/2 h-full bg-theme-alabaster"
    initial={{ scale: 1 }}
    animate={{ 
      scale: stage >= 3 ? 1 : 1.1, // Slight zoom out
      filter: stage >= 3 ? 'blur(0px)' : 'blur(4px)'
    }}
    transition={{ 
      ease: [0.85, 0, 0.15, 1], // Liquid easing
      duration: 0.8 
    }}
  />
  
  {/* Right Panel - Slides in */}
  <motion.div 
    initial={{ x: '100%', scale: 1.1, filter: 'blur(4px)' }}
    animate={{ 
      x: 0,
      scale: 1,
      filter: 'blur(0px)'
    }}
    transition={{ 
      ease: [0.85, 0, 0.15, 1], // Liquid easing
      duration: 0.8 
    }}
    className="w-1/2 h-full bg-theme-obsidian" 
  />
</motion.div>

{/* Text scaling down during fission */}
<motion.div
  animate={{
    scale: stage >= 3 ? 0.8 : 1,
    filter: stage >= 3 ? 'blur(12px)' : 'blur(0px)',
    opacity: stage >= 3 ? 0.1 : 1
  }}
  transition={{ 
    ease: [0.85, 0, 0.15, 1],
    duration: 0.8 
  }}
>
  {/* TARIFE ATTÄR text */}
</motion.div>
```

**Effect:** Simulates "opening of a vault" with simultaneous blur, scale, and position changes.

---

### 4. Physics-Based Scroll (Compass Needle)

**Current State:** Basic spring physics with `stiffness: 80, damping: 20, mass: 1.2`

**Optimized Implementation:**

```typescript
// In RealisticCompass.tsx
const { scrollYProgress } = useScroll();
const rawRotation = useTransform(scrollYProgress, [0, 1], [0, 360]);

// Optimized spring config for "liquid" feel
const needleRotation = useSpring(rawRotation, {
  stiffness: 120,  // Higher = more responsive
  damping: 24,     // Lower = more oscillation
  mass: 0.8,       // Lower = lighter feel
});
```

**Why These Values:**
- `stiffness: 120` - Responsive but not jittery
- `damping: 24` - Allows slight oscillation when scrolling stops (feels organic)
- `mass: 0.8` - Lighter feel, less "heavy" than current `1.2`

---

### 5. AnimatePresence with mode="wait"

**Current State:** `AnimatePresence` used but without `mode="wait"`

**Implementation:**

```typescript
// In SplitEntry.tsx - Choice Modal
<AnimatePresence mode="wait">
  {showChoice !== 'idle' && (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ 
        ease: [0.85, 0, 0.15, 1],
        duration: 0.6 
      }}
    >
      {/* Modal content */}
    </motion.div>
  )}
</AnimatePresence>

// In EntryLoader → SplitEntry transition
<AnimatePresence mode="wait">
  {!showLoader && (
    <motion.div
      key="split-entry"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ 
        ease: [0.85, 0, 0.15, 1],
        duration: 0.8 
      }}
    >
      <SplitEntry />
    </motion.div>
  )}
</AnimatePresence>
```

**Effect:** Ensures one animation completes before the next begins (no overlap).

---

### 6. SVG Path Morphing

**Use Cases:**
- SillageLine component (scent trail visualization)
- FieldReport hotspots (interactive product markers)
- Decorative elements

**Implementation Pattern:**

```typescript
// Example: SillageLine component
<motion.svg>
  <motion.path
    d="M 10 50 Q 50 20, 90 50"
    fill="none"
    stroke="#c5a66a"
    strokeWidth="2"
    initial={{ pathLength: 0, opacity: 0 }}
    animate={{ 
      pathLength: 1, 
      opacity: 1,
      filter: ["blur(0px)", "blur(8px)", "blur(0px)"] // Evaporation effect
    }}
    transition={{ 
      pathLength: { 
        duration: 2, 
        ease: [0.85, 0, 0.15, 1] 
      },
      filter: { 
        duration: 3, 
        repeat: Infinity,
        repeatType: "reverse"
      }
    }}
  />
</motion.svg>
```

**Key Properties:**
- `pathLength: 0 → 1` - Draws the path progressively
- `filter: blur()` - Simulates scent evaporation
- `opacity` - Fades in/out for "molecular" effect

---

## 📋 Implementation Checklist

### Phase 1: Foundation
- [ ] Add `liquid` easing to `tailwind.config.ts`
- [ ] Update all transitions to use liquid easing
- [ ] Optimize compass spring physics (stiffness: 120, damping: 24, mass: 0.8)

### Phase 2: Layout Morphing
- [ ] Add `layoutId="atlas-insignia"` to EntryLoader "A"
- [ ] Add `layoutId="relic-insignia"` to EntryLoader "R"
- [ ] Add matching `layoutId` to SplitEntry (A → left side, R → right side)
- [ ] **⚠️ DO NOT create a top navigation bar**
- [ ] Test morphing animation (center → split positions)

### Phase 3: Enhanced Fission
- [ ] Enhance split-screen with blur + scale
- [ ] Add text scaling/blur during fission
- [ ] Apply liquid easing to all fission transitions
- [ ] Test timing coordination

### Phase 4: AnimatePresence
- [ ] Add `mode="wait"` to all AnimatePresence instances
- [ ] Ensure smooth transitions between EntryLoader → SplitEntry
- [ ] Test modal transitions

### Phase 5: SVG Path Morphing (Future)
- [ ] Create SillageLine component
- [ ] Implement FieldReport hotspot animations
- [ ] Add decorative SVG elements

---

## 🎨 Visual Reference

### Liquid Easing Behavior
- **Start:** Slow acceleration (0.85, 0)
- **Middle:** Fast movement
- **End:** Slow deceleration (0.15, 1)
- **Result:** Thick oil movement - heavy, deliberate, smooth

### Layout Morphing Behavior
- **EntryLoader:** A and R centered, large scale
- **Transition:** Smooth position + scale interpolation
- **Final:** A morphs to left side (Atlas), R morphs to right side (Relic) in SplitEntry
- **Duration:** ~0.8s with liquid easing
- **⚠️ NO TOP NAV BAR:** Morphing happens within the split-screen, not to a header

### Fission Behavior
- **Stage 1-2:** Text appears, insignias glow
- **Stage 3:** Split-screen slides in, text blurs/scales down
- **Effect:** "Vault opening" - dramatic reveal

---

## 🔗 Component Dependencies

```
EntryLoader
  ├─ layoutId morphing (A, R)
  ├─ Fission effect (split-screen)
  └─ Liquid easing (all transitions)

SplitEntry
  ├─ AnimatePresence (mode="wait")
  ├─ Liquid easing (panel transitions)
  ├─ Receives layoutId elements from EntryLoader (A → left, R → right)
  └─ NO top navigation bar (headerless design)

RealisticCompass
  ├─ Spring physics (optimized)
  └─ Scroll-based rotation

Future Components
  ├─ SillageLine (SVG path morphing)
  └─ FieldReport (SVG hotspots)
```

---

## 📝 Notes

1. **Performance:** All animations use GPU-accelerated properties (transform, opacity, filter)
2. **Accessibility:** Respects `prefers-reduced-motion` (add checks)
3. **Mobile:** Consider lighter animations on mobile devices
4. **Testing:** Test on various devices/browsers for consistency

---

## 🚀 Next Steps

1. Review this specification
2. Prioritize features (Phase 1-2 are critical)
3. Implement incrementally
4. Test each phase before moving to next

---

**Status:** 📋 Specification Complete - Ready for Implementation
