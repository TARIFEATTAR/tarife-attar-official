# Placeholder Image Setup for Coming Soon Products

## Overview

I've set up a placeholder image system so that products without images (coming soon, etc.) will show a placeholder instead of "No Image" text.

**Important:** The Relic collection uses a **separate, collection-specific placeholder image** for a more tailored aesthetic.

## What Was Changed

✅ **Created placeholder image utility** (`src/lib/placeholder-image.ts`)
✅ **Updated all product display components** to use placeholder:
   - Home page featured products (general placeholder)
   - Atlas collection page (general placeholder)
   - **Relic collection page (Relic-specific placeholder)** ⭐
   - Product detail pages (general placeholder)

## How to Add Your Placeholder Images

### For Relic Collection (Required)

The Relic collection uses its own placeholder image. You have 3 options:

**Option 1: Add to Public Folder (Easiest)**

1. **Upload your Relic placeholder image** as `placeholder-relic-coming-soon.jpg`
2. **Place it in**: `public/images/placeholder-relic-coming-soon.jpg`
3. **Done!** It will automatically work.

**Option 2: Upload to Sanity**

1. **Go to Sanity Studio**
2. **Upload the Relic placeholder image** to your media library
3. **Copy the image URL** from Sanity CDN
4. **Add to `.env.local`:**
   ```bash
   NEXT_PUBLIC_PLACEHOLDER_RELIC_IMAGE_URL=https://cdn.sanity.io/images/8h5l91ut/production/[image-id]-1200x1200.jpg
   ```

**Option 3: Use External CDN**

1. **Upload image to your CDN** (e.g., Cloudinary, Imgix)
2. **Add to `.env.local`:**
   ```bash
   NEXT_PUBLIC_PLACEHOLDER_RELIC_IMAGE_URL=https://your-cdn.com/placeholder-relic-coming-soon.jpg
   ```

### For Other Collections (Atlas, Home, etc.) - Optional

If you want a different placeholder for Atlas/other collections, follow the same steps but use:
- **File name**: `placeholder-coming-soon.jpg` (in `public/images/`)
- **Environment variable**: `NEXT_PUBLIC_PLACEHOLDER_IMAGE_URL`

## Image Recommendations

### Relic Placeholder (Required)
- **Format**: JPG or WebP
- **Size**: 1200x1200px (square) or 1200x1500px (portrait)
- **Style**: Should match the Relic collection aesthetic (dark, moody, atmospheric - like the stone pedestal image you showed)
- **File size**: Keep under 500KB for fast loading
- **File name**: `placeholder-relic-coming-soon.jpg`

### General Placeholder (Optional)
- **Format**: JPG or WebP
- **Size**: 1200x1200px (square) or 1200x1500px (portrait)
- **Style**: Should match your brand aesthetic
- **File size**: Keep under 500KB for fast loading
- **File name**: `placeholder-coming-soon.jpg`

## How It Works

When a product doesn't have an image:
1. ✅ System checks for Sanity image → Not found
2. ✅ System checks for Shopify image → Not found
3. ✅ System uses placeholder image based on collection:
   - **Relic products** → Uses `placeholder-relic-coming-soon.jpg` ⭐
   - **Atlas/Other products** → Uses `placeholder-coming-soon.jpg`
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

- ✅ Code is ready - Relic-specific placeholder system implemented
- ✅ All fallbacks updated
- ⏳ **Waiting for Relic placeholder image** (`placeholder-relic-coming-soon.jpg`)

## Quick Start

**For Relic Collection (Required):**
1. Upload your Relic placeholder image to `public/images/placeholder-relic-coming-soon.jpg`
2. Done! It will automatically work for all Relic products.

**For Other Collections (Optional):**
1. Upload general placeholder to `public/images/placeholder-coming-soon.jpg`
2. Or set `NEXT_PUBLIC_PLACEHOLDER_IMAGE_URL` in `.env.local`
3. Restart dev server
