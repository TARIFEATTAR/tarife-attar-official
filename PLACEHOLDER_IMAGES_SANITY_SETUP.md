# Placeholder Images - Sanity Studio Configuration

## ✅ What's Been Set Up

I've made placeholder images **configurable in Sanity Studio**! Now you can:

1. **Upload placeholder images directly in Sanity Studio** (no code changes needed)
2. **Override the hardcoded placeholder** by uploading an image
3. **Set collection-specific placeholders** (Relic, Atlas, General)

## How It Works

**Priority Order:**
1. ✅ **Sanity-managed placeholder** (if you upload one in Studio)
2. ✅ **Hardcoded placeholder** (fallback from `public/images/`)

## How to Use in Sanity Studio

### Step 1: Access Placeholder Images Settings

1. **Open Sanity Studio** (your site's `/studio` route or `https://your-project.sanity.studio`)
2. **Navigate to:** ⚙️ Settings → 🖼️ Placeholder Images
3. You'll see three image fields:
   - **Relic Placeholder Image** - For Relic collection products
   - **Atlas Placeholder Image** - For Atlas collection products  
   - **General Placeholder Image** - Fallback for all products

### Step 2: Upload Your Placeholder Images

1. **Click on any image field** (e.g., "Relic Placeholder Image")
2. **Upload your image** or select from existing assets
3. **Click "Publish"** to save changes
4. **Done!** The placeholder will automatically appear on your site

### Step 3: Test It

1. **Find a product without an image** (or create a test product)
2. **View it on your site** - should show your Sanity placeholder
3. **If you remove the image from Sanity**, it falls back to the hardcoded placeholder

## Image Recommendations

- **Format:** PNG, JPG, or WebP
- **Size:** 1024x1024px (square) or 1024x1500px (portrait)
- **File size:** Keep under 500KB for fast loading
- **Style:** Match your collection aesthetic

## Current Hardcoded Placeholders

If you don't upload images in Sanity, these are used:

- **Relic:** `/images/placeholder-relic-coming-soon.png` (dark stone pedestal)
- **Atlas/General:** `/images/placeholder-coming-soon.jpg` (if you add one)

## Technical Details

### Schema Location
- **Schema:** `src/sanity/schema/placeholderImages.ts`
- **Type:** Singleton document (only one instance)
- **Document ID:** `placeholderImages`

### Query
The placeholder images are fetched on every page load:
- Home page
- Atlas collection page
- Relic collection page
- Product detail pages

### Code Location
- **Utility:** `src/lib/placeholder-image.ts`
- **Query:** `src/sanity/lib/queries.ts` → `placeholderImagesQuery`
- **Components:** All product display components

## Benefits

✅ **Editorial Control** - Change placeholders without code changes  
✅ **Collection-Specific** - Different placeholders for Relic vs Atlas  
✅ **Fallback Safety** - Always has a placeholder (hardcoded backup)  
✅ **Easy Updates** - Just upload new image in Sanity Studio

## Next Steps

1. **Go to Sanity Studio**
2. **Navigate to Settings → Placeholder Images**
3. **Upload your placeholder images**
4. **Publish**
5. **Done!** Your placeholders are now live

---

**Note:** The hardcoded placeholder (`placeholder-relic-coming-soon.png`) will continue to work as a fallback if you don't upload images in Sanity.
