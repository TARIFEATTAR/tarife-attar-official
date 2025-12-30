# Animation System Constraints

## 🚫 Critical: NO Top Navigation Bar

### Design Decision
The Tarife Attär site uses a **headerless, cinematic entry experience**. The layoutId morphing animation should **NOT** create or morph to a top navigation bar.

### Correct Morphing Flow

```
EntryLoader (Stage 1-2)
  └─ A and R centered, large scale
       │
       │ (morph with layoutId)
       ▼
SplitEntry
  ├─ A morphs to LEFT side (Atlas section)
  └─ R morphs to RIGHT side (Relic section)
```

### What NOT to Do

❌ **DO NOT:**
- Create a top navigation bar
- Morph A/R to header positions
- Add fixed header elements
- Break the headerless design

✅ **DO:**
- Morph A/R within the split-screen layout
- Keep the cinematic, full-screen entry experience
- Maintain headerless design throughout

### Implementation Notes

The `layoutId` morphing should:
1. Start: EntryLoader center (both A and R together)
2. End: SplitEntry left/right positions (A on left, R on right)
3. Duration: ~0.8s with liquid easing
4. Effect: Seamless brand continuity without breaking the headerless design

---

## Current Navigation Pattern

The site uses:
- **RealisticCompass** - Floating bottom-right compass for navigation
- **SplitEntry** - Full-screen split entry (no header)
- **No top navigation bar** - Maintain this constraint

---

**Status:** ✅ Constraint Documented - Ready for Implementation
