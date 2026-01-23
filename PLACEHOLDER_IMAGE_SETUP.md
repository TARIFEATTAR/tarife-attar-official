# Placeholder Image Setup for Coming Soon Products

## Overview

I've set up a placeholder image system so that products without images (coming soon, etc.) will show a placeholder instead of "No Image" text.

## What Was Changed

✅ **Created placeholder image utility** (`src/lib/placeholder-image.ts`)
✅ **Updated all product display components** to use placeholder:
   - Home page featured products
   - Atlas collection page
   - Relic collection page
   - Product detail pages

## How to Add Your Placeholder Image

You have 3 options for where to host the placeholder image:

### Option 1: Upload to Sanity (Recommended)

1. **Go to Sanity Studio**
2. **Upload the image** to your media library
3. **Copy the image URL** from Sanity CDN
4. **Add to `.env.local`:**
   ```bash
   NEXT_PUBLIC_PLACEHOLDER_IMAGE_URL=https://cdn.sanity.io/images/8h5l91ut/production/[image-id]-1200x1200.jpg
   ```

### Option 2: Add to Public Folder

1. **Create folder** (if it doesn't exist): `public/images/`
2. **Upload your placeholder image** as `placeholder-coming-soon.jpg`
3. **The placeholder will automatically use**: `/images/placeholder-coming-soon.jpg`

### Option 3: Use External CDN

1. **Upload image to your CDN** (e.g., Cloudinary, Imgix)
2. **Add to `.env.local`:**
   ```bash
   NEXT_PUBLIC_PLACEHOLDER_IMAGE_URL=https://your-cdn.com/placeholder-coming-soon.jpg
   ```

## Image Recommendations

- **Format**: JPG or WebP
- **Size**: 1200x1200px (square) or 1200x1500px (portrait)
- **Style**: Should match your brand aesthetic (dark, moody, etc.)
- **File size**: Keep under 500KB for fast loading

## How It Works

When a product doesn't have an image:
1. ✅ System checks for Sanity image → Not found
2. ✅ System checks for Shopify image → Not found
3. ✅ System uses placeholder image → **Shows your placeholder**
4. ✅ If placeholder fails to load → Falls back to "Coming Soon" text

## Testing

After adding your placeholder image:

1. **Find a product without an image** (or create a test product)
2. **View it on the site** - should show placeholder
3. **Check all locations:**
   - Home page featured products
   - Atlas collection
   - Relic collection
   - Product detail page

## Current Status

- ✅ Code is ready - just needs the image URL
- ✅ All fallbacks updated
- ⏳ Waiting for placeholder image URL

## Quick Start

**Easiest method:**
1. Upload image to `public/images/placeholder-coming-soon.jpg`
2. Done! It will automatically work.

**Or set environment variable:**
1. Upload image anywhere
2. Add `NEXT_PUBLIC_PLACEHOLDER_IMAGE_URL` to `.env.local`
3. Restart dev server
