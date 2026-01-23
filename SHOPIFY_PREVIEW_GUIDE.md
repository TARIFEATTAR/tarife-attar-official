# Shopify Preview Guide for Headless Site

## The Problem

When you click "Preview" in Shopify Admin, it tries to open the product on the default Shopify storefront (`.myshopify.com`), which shows a 404 because you're using a headless setup.

## Solution Options

### Option 1: Use Metafields + Manual Preview (Recommended)

We'll set preview URLs as metafields, then you can:
1. View the metafield in Shopify Admin
2. Copy the URL
3. Open it in a new tab

**Run the script:**
```bash
node scripts/set-shopify-preview-urls.mjs
```

This sets a `custom.preview_url` metafield on each product pointing to `https://www.tarifeattar.com/product/[slug]`

**To use:**
1. In Shopify Admin → Products → Select a product
2. Scroll to "Metafields" section
3. Find "Preview URL" metafield
4. Copy the URL and open in a new tab

### Option 2: Browser Bookmarklet (Quick Access)

Create a bookmarklet that automatically opens the headless site preview:

**JavaScript Bookmarklet:**
```javascript
javascript:(function(){
  const handle = window.location.pathname.match(/products\/([^\/]+)/)?.[1];
  if(handle) {
    window.open(`https://www.tarifeattar.com/product/${handle}`, '_blank');
  }
})();
```

**How to use:**
1. Create a new bookmark in your browser
2. Name it "Preview on Headless Site"
3. Set the URL to the bookmarklet code above
4. When viewing a product in Shopify Admin, click the bookmarklet

### Option 3: Shopify Plus Custom Preview (If Available)

If you have Shopify Plus, you can use the Preview API to set custom preview URLs. This requires:
- Shopify Plus account
- Custom app with preview permissions
- API integration

## Current Setup

After running the script, all products will have:
- **Metafield**: `custom.preview_url`
- **Value**: `https://www.tarifeattar.com/product/[slug]`
- **Example**: `https://www.tarifeattar.com/product/dune`

## URL Mapping

The script maps Shopify product handles to headless site URLs:
- Shopify handle: `dune` → Headless URL: `/product/dune`
- Shopify handle: `cairo` → Headless URL: `/product/cairo`
- Shopify handle: `jasmine` → Headless URL: `/product/jasmine`

## Quick Preview Workflow

1. **In Shopify Admin:**
   - Go to Products → Select a product
   - Note the product handle (e.g., `dune`)

2. **Open Preview:**
   - Option A: Copy metafield URL
   - Option B: Manually go to `https://www.tarifeattar.com/product/[handle]`
   - Option C: Use bookmarklet

3. **Verify:**
   - Product should load on headless site
   - All content should match Sanity data

## Troubleshooting

### "404 Not Found" on Headless Site

**Check:**
1. Does the product exist in Sanity?
2. Does the slug match between Shopify and Sanity?
3. Is the product published in Sanity?

**Fix:**
- Run: `node scripts/fix-shopify-connections.mjs` to verify connections
- Check Sanity Studio to ensure product is published

### Preview URL Not Set

**Check:**
1. Did the script run successfully?
2. Check product metafields in Shopify Admin

**Fix:**
- Re-run: `node scripts/set-shopify-preview-urls.mjs`

### Handle Mismatch

**Check:**
1. Shopify handle vs Sanity slug
2. Run diagnostic: `node scripts/diagnose-sku-sync.mjs`

**Fix:**
- Update `shopifyHandle` in Sanity to match Shopify
- Or update Shopify handle to match Sanity slug
