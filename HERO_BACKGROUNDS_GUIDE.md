# Hero Backgrounds Guide

## Setting Hotspot Positions in Sanity Studio

Hotspot controls appear **when you click on the uploaded image** in Sanity Studio:

1. Go to **Sanity Studio** → **Settings** → **Hero Backgrounds**
2. Click on the **Atlas Background** or **Relic Background** image field
3. **Click directly on the uploaded image** - you should see a **crosshair/circle** appear
4. **Click and drag** the crosshair to set the focus point (hotspot)
5. The hotspot determines which part of the image stays centered when the image is cropped/resized

**Note:** Hotspots are optional - if you don't set one, the image will default to `center center`.

## Troubleshooting Images Not Showing

### 1. Check Browser Console
Open your browser's developer console (F12) and look for:
- `[HeroPanel atlas] Background URL: ...` - confirms data is being passed
- `[HeroPanel atlas] Image loaded successfully` - confirms image loaded
- Any error messages about failed image loads

### 2. Verify Images Are Published
- In Sanity Studio, make sure the **Hero Backgrounds** document has a green "Published" badge
- If it says "Draft", click **Publish**

### 3. Check Overlay Opacity
With 88% overlay opacity, images are only **12% visible** (very subtle texture). This is intentional for a subtle effect, but you can:
- Lower the opacity to 75-80% for more visible textures
- Temporarily set opacity to 0% to see the full image (for testing)

### 4. Verify Image URLs
Run the debug script:
```bash
node scripts/debug-hero-backgrounds.mjs
```

This will show:
- Whether images are uploaded
- The exact image URLs
- Whether hotspots are set
- Whether the document is published

### 5. Check Network Tab
In browser DevTools → Network tab:
- Filter by "Img" or "Image"
- Look for requests to `cdn.sanity.io`
- Check if they return 200 (success) or an error

### 6. Hard Refresh
After making changes in Sanity:
- Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
- Or clear browser cache

## Expected Behavior

- **Atlas side**: Light texture with cream/alabaster overlay (88% opacity default)
- **Relic side**: Dark texture with charcoal overlay (85% opacity default)
- Images should be **subtle textures** - not dominant backgrounds
- The overlay creates a "washed" effect over the texture

## Adjusting Overlay Opacity

In Sanity Studio → Hero Backgrounds:
- **Lower opacity (70-80%)**: More visible texture, less "washed" effect
- **Higher opacity (90-95%)**: Very subtle texture, more solid color
- **Recommended**: 85-88% for subtle but noticeable texture

## Image Recommendations

- **Format**: PNG or JPEG
- **Aspect Ratio**: 9:16 portrait (or similar vertical)
- **Size**: 1-3 MB (will be optimized by Sanity CDN)
- **Style**: Abstract, ethereal textures (not detailed photos)
