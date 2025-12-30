# Sanity Architecture Implementation

## ✅ All 6 Phases Complete

### Phase 1: Sensory Lexicon Validation ✅
**Location:** `src/sanity/validation/sensoryLexicon.ts`

Prevents generic marketing language with warnings (not errors). Scans for:
- "smell" → Suggests: "Olfactory Profile", "Sillage"
- "nice" → Suggests: "Evocative", "Compelling"
- "strong" → Suggests: "Tenacious", "Resinous"
- "cheap" → Suggests: "Accessible", "Approachable"
- "good" → Suggests: "Exceptional", "Notable"

Works with both string fields and Portable Text blocks.

---

### Phase 2: Viscosity Input Component ✅
**Location:** `src/sanity/components/ViscosityInput.tsx`

Custom Sanity input for "The Relic" collection. Visual preview transitions from:
- Light Amber (#F2F0E9) at 0
- Deep Resin (#3D1C02) at 100

**Required Package:** `@sanity/ui` (for Stack, Card, Text, Slider)

---

### Phase 3: Field Report Object Schema ✅
**Location:** `src/sanity/schema/objects/fieldReport.ts`

Enables shoppable lifestyle images for "The Atlas" with:
- Image with hotspot support
- Array of hotspots with product references
- X/Y positioning (0-100%)
- Contextual notes

---

### Phase 4: Master Product Schema (Two Roads) ✅
**Location:** `src/sanity/schema/product.ts`

Unified product document with conditional fields:

**Core Fields:**
- `collectionType`: 'atlas' | 'relic' (required)
- `generationSource`: 'manual' | 'madison-studio' (hidden)
- `internalName`: For inventory tracking
- `title`, `slug`, `price`, `volume`, `productFormat`

**Atlas Data** (shown only when `collectionType === 'atlas'`):
- `atmosphere`: 'tidal' | 'ember' | 'petal' | 'terra'
- `gpsCoordinates`: Optional geographic coordinates
- `travelLog`: Portable Text (with Sensory Lexicon validation)
- `fieldReport`: Shoppable image object

**Relic Data** (shown only when `collectionType === 'relic'`):
- `distillationYear`: Number
- `originRegion`: String
- `viscosity`: Number (0-100) with ViscosityInput component
- `museumDescription`: Portable Text (with Sensory Lexicon validation)

---

### Phase 5: Bifurcated Desk Structure ✅
**Location:** `src/sanity/structure.ts`

Custom Studio desk with three curated groups:

1. **The Inbox** 📥
   - Filter: `generationSource == "madison-studio"`
   - For reviewing AI-generated content

2. **The Atlas (Journey)** 🗺️
   - Filter: `collectionType == "atlas"`
   - Voyage collection

3. **The Relic (Vault)** 🔒
   - Filter: `collectionType == "relic"`
   - Pure line collection

---

### Phase 6: Madison Studio Ghost Writer ✅
**Location:** `src/lib/madison/ghostWriter.ts`

Utility function `pushDraft(data: MadisonPayload)` that:
1. Authenticates with `SANITY_API_WRITE_TOKEN`
2. Fetches and uploads images from URLs
3. Converts markdown to Portable Text blocks
4. Creates draft documents with `_id: 'drafts.' + uuid`
5. Sets `generationSource: 'madison-studio'`

**Required Packages:**
- `@sanity/client` (for write operations)
- `uuid` (for generating draft IDs)
- Optional: `@portabletext/to-portabletext` (for better markdown conversion)

---

## 📦 Required Package Installation

```bash
# For Sanity Studio UI components
npm install @sanity/ui

# For Madison Studio Ghost Writer
npm install @sanity/client uuid

# Optional: Better markdown-to-PortableText conversion
npm install @portabletext/to-portabletext

# For Sanity Studio (if not already installed)
npm install sanity
```

---

## 🚀 Next Steps

1. **Install Required Packages:**
   ```bash
   npm install @sanity/ui @sanity/client uuid sanity
   ```

2. **Set Environment Variable:**
   Add to `.env.local`:
   ```
   SANITY_API_WRITE_TOKEN=your_write_token_here
   ```

3. **Initialize Sanity Studio** (if not already done):
   ```bash
   npx sanity init
   ```
   Or use the provided `sanity.config.ts` file.

4. **Launch Studio:**
   ```bash
   npx sanity dev
   ```
   Or:
   ```bash
   npx sanity start
   ```

5. **Verify Structure:**
   You should see three groups in the Studio:
   - The Inbox
   - The Atlas (Journey)
   - The Relic (Vault)

---

## 📝 Schema Registration

All schemas are exported from:
- `src/sanity/schema/index.ts`

The `sanity.config.ts` file automatically imports and registers them.

---

## 🔧 Configuration Files

- **Studio Config:** `sanity.config.ts`
- **Structure:** `src/sanity/structure.ts`
- **Schemas:** `src/sanity/schema/`
- **Validation:** `src/sanity/validation/`
- **Components:** `src/sanity/components/`

---

## ✨ Features

- ✅ Conditional field visibility based on collection type
- ✅ Sensory Lexicon validation on text fields
- ✅ Custom Viscosity Input with visual feedback
- ✅ Shoppable image hotspots
- ✅ Bifurcated desk structure
- ✅ Madison Studio integration ready

---

**Status:** All 6 phases implemented and ready for testing! 🎉
