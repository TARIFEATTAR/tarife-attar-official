# Product Description Sync Analysis

## Current State

### In Sanity Studio
- **Evocation Story**: Array of strings (paragraphs) - stored in `atlasData.evocationStory`
- **On Skin Story**: Array of strings (paragraphs) - stored in `atlasData.onSkinStory`
- **Travel Log**: PortableText blocks - stored in `atlasData.travelLog`
- **Museum Description** (Relic): PortableText blocks - stored in `relicData.museumDescription`

### On the Headless Website
- ✅ **Evocation Story**: Displays as separate section with title "Evocation"
- ✅ **On Skin Story**: Displays as separate section with title "On Skin"
- ✅ **Travel Log**: Displays as "The Journey" section
- ✅ **Museum Description**: Displays as "Curator's Notes" section

### In Shopify
- ❌ **Product Description**: Currently only has basic HTML: `<p>{title} (formerly {legacyName})</p>`
- ❌ **Evocation Story**: NOT synced
- ❌ **On Skin Story**: NOT synced
- ❌ **Travel Log**: NOT synced

## The Problem

1. **Sanity has rich content** (Evocation Story, On Skin Story, Travel Log)
2. **Website displays it correctly** (separate sections)
3. **Shopify only has basic description** (title + legacy name)
4. **No sync exists** to push Sanity descriptions to Shopify

## Impact

- When you edit descriptions in Shopify, they don't match Sanity
- When Madison Studio pushes content, it doesn't include evocation/on skin stories
- Customers see different content on website vs Shopify store

## Solution Options

### Option A: Sync Sanity → Shopify (Recommended)
Create a script that:
1. Combines Evocation Story + On Skin Story + Travel Log into HTML
2. Updates Shopify product descriptions
3. Keeps Sanity as source of truth

### Option B: Add Description Field to Sanity
Create a dedicated `shopifyDescription` field in Sanity that:
1. Combines all story content
2. Can be edited separately if needed
3. Syncs to Shopify

### Option C: Two-Way Sync
- Sanity → Shopify: Push descriptions
- Shopify → Sanity: Pull descriptions (for legacy products)

## Recommended Approach

**Option A + B Hybrid:**
1. Add a computed/editable `shopifyDescription` field in Sanity
2. Auto-populate it from Evocation + On Skin + Travel Log
3. Allow manual override if needed
4. Sync this field to Shopify product descriptions
