# Product Description Sync Guide

## Current Situation

### In Sanity Studio
- **Evocation Story**: Array of paragraph strings (`atlasData.evocationStory`)
- **On Skin Story**: Array of paragraph strings (`atlasData.onSkinStory`)
- **Travel Log**: PortableText blocks (`atlasData.travelLog`) - "The Journey"
- **Museum Description** (Relic): PortableText blocks (`relicData.museumDescription`) - "Curator's Notes"

### On the Headless Website
✅ **Displays correctly** as separate sections:
- "Evocation" section (from `evocationStory`)
- "On Skin" section (from `onSkinStory`)
- "The Journey" section (from `travelLog`)
- "Curator's Notes" section (from `museumDescription`)

### In Shopify
❌ **Currently only has**: Basic HTML with title + legacy name
- Format: `<p>JASMINE (formerly Arabian Jasmine)</p>`
- Missing: Evocation Story, On Skin Story, Travel Log

## The Problem

1. **Sanity has rich content** (Evocation, On Skin, Travel Log)
2. **Website displays it** (separate sections)
3. **Shopify only has basic description** (title + legacy name)
4. **No sync exists** to push full descriptions to Shopify

## Solution: Sync Descriptions from Sanity to Shopify

### How It Works

The sync script combines all story content into a rich HTML description:

```html
<p><strong>JASMINE (formerly Arabian Jasmine)</strong></p>

<h3>Evocation</h3>
<p>Cape Agulhas is where two worlds collide...</p>
<p>ONYX captures that collision...</p>

<h3>On Skin</h3>
<p>The meeting of oceans creates something...</p>

<h3>The Journey</h3>
<p>Travel log content here...</p>
```

### Step 1: Update CSV for New Products

The CSV generation script now includes full descriptions:

```bash
node scripts/generate-shopify-import-csv.mjs
```

This creates a CSV with:
- ✅ Title + Legacy Name
- ✅ Evocation Story (if available)
- ✅ On Skin Story (if available)
- ✅ Travel Log / Museum Description (if available)

### Step 2: Sync Existing Products

For products already in Shopify, sync descriptions:

```bash
# Preview what will be updated
node scripts/sync-descriptions-to-shopify.mjs --dry-run

# Apply the updates
node scripts/sync-descriptions-to-shopify.mjs
```

**What this does:**
- Fetches products from both Sanity and Shopify
- Builds rich HTML descriptions from Sanity content
- Updates Shopify product descriptions
- Only updates products that exist in both systems

## Complete Workflow

### For New Products (CSV Import)
```bash
# 1. Generate CSV with full descriptions
node scripts/generate-shopify-import-csv.mjs

# 2. Import CSV in Shopify Admin

# 3. Verify descriptions imported correctly
```

### For Existing Products (Sync Script)
```bash
# 1. Sync descriptions from Sanity to Shopify
node scripts/sync-descriptions-to-shopify.mjs --dry-run  # Preview
node scripts/sync-descriptions-to-shopify.mjs            # Apply

# 2. Verify in Shopify Admin that descriptions match Sanity
```

## Description Structure in Shopify

After sync, Shopify product descriptions will have:

1. **Title + Legacy Name** (if applicable)
2. **Evocation** section (Atlas products with evocation story)
3. **On Skin** section (Atlas products with on skin story)
4. **The Journey** section (Atlas products with travel log)
5. **Curator's Notes** section (Relic products with museum description)

## Madison Studio Integration

**Current State:**
- Madison Studio can push a general `description` field
- It doesn't specifically handle `evocationStory` or `onSkinStory` arrays

**Recommendation:**
- When pushing from Madison Studio, include the full description in the `description` field
- Or update Madison Studio to push `evocationStory` and `onSkinStory` arrays separately
- Then run the sync script to push to Shopify

## Ongoing Maintenance

**When you update stories in Sanity:**
```bash
node scripts/sync-descriptions-to-shopify.mjs
```

**When you add new products:**
```bash
# CSV will automatically include full descriptions
node scripts/generate-shopify-import-csv.mjs
```

## Important Notes

⚠️ **Shopify descriptions will be overwritten** with Sanity content
- If you manually edit descriptions in Shopify, they'll be replaced on next sync
- **Sanity is the source of truth** for product descriptions

⚠️ **Rich formatting**
- Evocation/On Skin stories are plain text paragraphs
- Travel Log/Museum Description support rich text (bold, italic, headings)
- All content is converted to HTML for Shopify

## Troubleshooting

### "Descriptions not updating in Shopify"
- Verify Admin API token has `write_products` scope
- Check Shopify API version
- Review error messages in script output

### "Some content missing"
- Check that fields are populated in Sanity
- Verify product is matched correctly (by handle/slug)
- Run diagnostic: `node scripts/diagnose-sku-sync.mjs`

### "Formatting looks wrong"
- Shopify uses HTML descriptions
- Rich text from Travel Log is converted to HTML
- Check that HTML is rendering correctly in Shopify
