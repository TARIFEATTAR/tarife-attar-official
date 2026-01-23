# Evocation Story & On Skin Story: How They Work

## Overview

This document explains how **Evocation Story** and **On Skin Story** flow through your system:
- Sanity Studio (where you edit)
- Headless Website (where customers see it)
- Shopify (where customers buy)

## Current State

### ✅ In Sanity Studio

**Location:** Product → Collection Data → Atlas Data

**Fields:**
1. **Evocation Story** (`atlasData.evocationStory`)
   - Type: Array of strings (paragraphs)
   - Example: `["Cape Agulhas is where two worlds collide...", "ONYX captures that collision..."]`

2. **On Skin Story** (`atlasData.onSkinStory`)
   - Type: Array of strings (paragraphs)
   - Example: `["The meeting of oceans creates something...", "..."]`

3. **Travel Log** (`atlasData.travelLog`)
   - Type: PortableText blocks (rich text)
   - Example: Rich text with headings, bold, italic

**How to Edit:**
- Open a product in Sanity Studio
- Go to "Collection Data" tab
- Scroll to "Atlas Data" section
- Edit "Evocation Story" and "On Skin Story" as paragraph lists
- Edit "Travel Log" as rich text

### ✅ On the Headless Website

**Location:** Product detail page (`/product/[slug]`)

**Display:**
- **Evocation Story** → Shows as "Evocation" section
- **On Skin Story** → Shows as "On Skin" section
- **Travel Log** → Shows as "The Journey" section

**Component:** `EvocationSection` in `ProductDetailClient.tsx`

```tsx
{isAtlas && product.atlasData?.evocationStory && (
  <EvocationSection title="Evocation" story={product.atlasData.evocationStory} />
)}
```

**Styling:**
- Small uppercase label (gold color)
- Italic serif paragraphs
- Spaced vertically

### ❌ In Shopify (Before Fix)

**Problem:** Only basic description
- Format: `<p>JASMINE (formerly Arabian Jasmine)</p>`
- Missing: Evocation Story, On Skin Story, Travel Log

**Why:** No sync existed to push Sanity content to Shopify

## The Fix

### Solution 1: CSV Import (New Products)

**Script:** `scripts/generate-shopify-import-csv.mjs`

**What it does:**
- Fetches products from Sanity
- Builds rich HTML description combining:
  - Title + Legacy Name
  - Evocation Story
  - On Skin Story
  - Travel Log
- Includes in CSV for Shopify import

**Usage:**
```bash
node scripts/generate-shopify-import-csv.mjs
# Then import shopify-import-products.csv in Shopify Admin
```

### Solution 2: Sync Script (Existing Products)

**Script:** `scripts/sync-descriptions-to-shopify.mjs`

**What it does:**
- Fetches products from both Sanity and Shopify
- Matches them by handle/slug
- Builds rich HTML description from Sanity
- Updates Shopify product descriptions

**Usage:**
```bash
# Preview changes
node scripts/sync-descriptions-to-shopify.mjs --dry-run

# Apply changes
node scripts/sync-descriptions-to-shopify.mjs
```

## Description Structure in Shopify

After sync, Shopify product descriptions will have:

```html
<p><strong>JASMINE (formerly Arabian Jasmine)</strong></p>

<h3>Evocation</h3>
<p>Cape Agulhas is where two worlds collide...</p>
<p>ONYX captures that collision...</p>

<h3>On Skin</h3>
<p>The meeting of oceans creates something...</p>

<h3>The Journey</h3>
<p>Rich text from Travel Log...</p>
```

## Data Flow

```
┌─────────────────┐
│  Sanity Studio  │
│                 │
│  evocationStory │
│  onSkinStory    │
│  travelLog      │
└────────┬────────┘
         │
         │ (GROQ Query)
         ▼
┌─────────────────┐
│  Headless Site  │
│                 │
│  Displays as:   │
│  - Evocation    │
│  - On Skin      │
│  - The Journey  │
└────────┬────────┘
         │
         │ (Sync Script)
         ▼
┌─────────────────┐
│    Shopify      │
│                 │
│  Product        │
│  Description    │
│  (HTML)         │
└─────────────────┘
```

## Madison Studio Integration

**Current State:**
- Madison Studio can push products via `pushDraft()`
- It includes a general `description` field
- It doesn't specifically handle `evocationStory` or `onSkinStory` arrays

**Options:**

### Option A: Push Full Description
- Include complete description in `description` field
- Run sync script to push to Shopify

### Option B: Update Madison Studio
- Modify `MadisonPayload` interface to include:
  ```typescript
  atlasData?: {
    evocationStory?: string[];
    onSkinStory?: string[];
    travelLog?: string;
  }
  ```
- Update `pushDraft()` to populate these fields
- Then run sync script to push to Shopify

## Workflow

### When Adding New Products

1. **Create in Sanity Studio**
   - Add product
   - Fill in Evocation Story, On Skin Story, Travel Log

2. **Generate CSV**
   ```bash
   node scripts/generate-shopify-import-csv.mjs
   ```

3. **Import to Shopify**
   - Shopify Admin → Products → Import
   - Upload `shopify-import-products.csv`
   - Descriptions will include all story content

### When Updating Existing Products

1. **Edit in Sanity Studio**
   - Update Evocation Story, On Skin Story, or Travel Log

2. **Sync to Shopify**
   ```bash
   node scripts/sync-descriptions-to-shopify.mjs
   ```

3. **Verify**
   - Check Shopify product page
   - Description should match Sanity content

## Important Notes

⚠️ **Sanity is Source of Truth**
- Shopify descriptions will be overwritten on sync
- Don't manually edit descriptions in Shopify
- Always edit in Sanity Studio

⚠️ **Format Differences**
- **Sanity**: Arrays of strings (Evocation/On Skin) or PortableText (Travel Log)
- **Website**: Rendered as separate sections
- **Shopify**: Combined into single HTML description

⚠️ **Relic Products**
- Relic products use `museumDescription` instead of Travel Log
- Shows as "Curator's Notes" section
- Same sync process applies

## Troubleshooting

### "Evocation Story not showing in Shopify"
- Check that field is populated in Sanity
- Verify product is matched correctly (by handle)
- Run sync script: `node scripts/sync-descriptions-to-shopify.mjs --dry-run`

### "Description looks wrong in Shopify"
- Shopify uses HTML descriptions
- Check that HTML is rendering correctly
- Verify no special characters breaking HTML

### "Some products missing stories"
- Check Sanity Studio - are fields populated?
- Run diagnostic: `node scripts/diagnose-sku-sync.mjs`
- Verify products are matched between systems

## Next Steps

1. ✅ **Sync existing products**: Run `sync-descriptions-to-shopify.mjs`
2. ✅ **Update CSV generation**: Already includes full descriptions
3. ⏳ **Test in Shopify**: Verify descriptions display correctly
4. ⏳ **Update workflow**: Document that Sanity is source of truth
