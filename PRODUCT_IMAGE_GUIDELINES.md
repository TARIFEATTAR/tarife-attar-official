# Product Image Guidelines for Tarife Attär

## 📐 Recommended Aspect Ratios

### **Primary Product Images (Main Image)**

**Recommended: 4:5 (Portrait)**
- **Dimensions**: 1200×1500px (or 800×1000px minimum)
- **Use Case**: Main product image, product cards, grid views
- **Why**: Works well for perfume bottles, creates elegant vertical composition
- **Current Usage**: Homepage featured products

**Alternative: 3:4 (Portrait)**
- **Dimensions**: 900×1200px (or 600×800px minimum)
- **Use Case**: Atlas product grid (currently used)
- **Why**: Slightly taller, good for narrow product displays
- **Current Usage**: Atlas collection grid

**Square: 1:1**
- **Dimensions**: 1200×1200px (or 800×800px minimum)
- **Use Case**: Relic collection, social media, thumbnails
- **Why**: Balanced, works well for luxury product photography
- **Current Usage**: Relic collection grid

### **Gallery Images**

**Recommended: 16:9 (Landscape)**
- **Dimensions**: 1920×1080px (or 1280×720px minimum)
- **Use Case**: Lifestyle shots, detail images, context photos
- **Why**: Wide format for storytelling, detail shots

**Alternative: 4:3 (Landscape)**
- **Dimensions**: 1600×1200px (or 1200×900px minimum)
- **Use Case**: Product in context, ingredient shots
- **Why**: Classic photography ratio, versatile

### **Field Report Images (Shoppable Lifestyle)**

**Recommended: 3:2 or 16:9 (Landscape)**
- **Dimensions**: 1920×1280px (3:2) or 1920×1080px (16:9)
- **Use Case**: Lifestyle photography with hotspots
- **Why**: Wide format for editorial/lifestyle content

## 🎯 Current Implementation

| Location | Aspect Ratio | Image Size Requested | Notes |
|----------|-------------|---------------------|-------|
| **Atlas Grid** | 3:4 | 400×500px (4:5) | ⚠️ Mismatch - should be 400×533px |
| **Homepage Featured** | 4:5 | Various | ✅ Matches |
| **Relic Grid** | 1:1 | Not specified | ✅ Square format |
| **Product Detail** | Flexible | 800×800px+ | TBD |

## 📏 Standard E-commerce Ratios

1. **4:5 (Portrait)** - Most common for luxury products
   - Instagram portrait posts
   - Product detail pages
   - Featured/hero images

2. **1:1 (Square)** - Social media friendly
   - Instagram feed
   - Product thumbnails
   - Catalog views

3. **3:4 (Portrait)** - Editorial feel
   - Magazine-style layouts
   - Narrow product displays
   - Mobile-first designs

## 🔧 Recommended Fix

Update Atlas grid to use **4:5** consistently:

```typescript
// In AtlasClient.tsx, change:
className="group aspect-[3/4] ..."
// To:
className="group aspect-[4/5] ..."

// And update image dimensions:
imageUrl.width(400).height(500).url() // ✅ Already correct
```

## 📸 Photography Best Practices

### For Perfume Bottles (Atlas/Relic):
- **4:5 ratio** recommended
- Bottle should occupy ~60-70% of frame
- Negative space above/below for elegance
- Consistent lighting across all products
- White or neutral background preferred

### For Lifestyle Shots (Field Reports):
- **16:9 or 3:2 ratio**
- Product should be clearly visible but not dominant
- Natural, editorial feel
- Room for hotspot placement

### Image Quality:
- **Minimum**: 800px on longest side
- **Recommended**: 1200-2000px on longest side
- **Format**: JPEG (high quality) or WebP
- **File Size**: Keep under 500KB when possible
- **Color Space**: sRGB

## 🎨 Brand Consistency

All product images should:
- Use consistent aspect ratio within each collection
- Maintain similar lighting/color grading
- Follow the "Amber & Parchment" aesthetic
- Allow for grayscale hover effects (ensure images work in B&W)

## ✅ Action Items

1. **Standardize Atlas images to 4:5** (update CSS)
2. **Update image dimensions** in queries to match aspect ratios
3. **Create image upload guidelines** for content team
4. **Add aspect ratio validation** in Sanity schema (optional)
