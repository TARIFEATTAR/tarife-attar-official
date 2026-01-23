# Shopify Preview Solution for Headless Site

## The Issue

When you click "Preview" in Shopify Admin, it tries to open the product on the default Shopify storefront (`vasana-perfumes.myshopify.com`), which shows a 404 because you're using a headless setup at `tarifeattar.com`.

## ✅ Solution: Preview URLs Set as Metafields

I've set preview URLs for all 30 products as metafields. Each product now has:
- **Metafield**: `custom.preview_url`
- **Value**: `https://www.tarifeattar.com/product/[slug]`

## How to Preview Products

### Method 1: Use Metafield (Easiest)

1. **In Shopify Admin:**
   - Go to **Products** → Select a product (e.g., DUNE)
   - Scroll down to **Metafields** section
   - Find **"Preview URL"** metafield
   - Copy the URL: `https://www.tarifeattar.com/product/dune`
   - Open in a new tab

### Method 2: Manual URL Construction

1. **Note the product handle** from Shopify Admin (shown in the URL: `/admin/products/[id]`)
2. **Construct URL**: `https://www.tarifeattar.com/product/[handle]`
3. **Example**: Handle is `dune` → URL is `https://www.tarifeattar.com/product/dune`

### Method 3: Quick Script

```bash
# Generate preview link for a product
node scripts/generate-preview-link.mjs dune
```

This will output the preview URL you can copy.

### Method 4: Browser Bookmarklet (Advanced)

Create a bookmark with this JavaScript code:

```javascript
javascript:(function(){
  const match = window.location.href.match(/products\/(\d+)/);
  if(match) {
    fetch(`https://vasana-perfumes.myshopify.com/admin/api/2024-10/products/${match[1]}.json`, {
      headers: {'X-Shopify-Access-Token': 'YOUR_TOKEN'}
    })
    .then(r => r.json())
    .then(d => {
      if(d.product) {
        window.open(`https://www.tarifeattar.com/product/${d.product.handle}`, '_blank');
      }
    });
  }
})();
```

**Note:** This requires your Shopify Admin token, so it's less secure but more convenient.

## URL Mapping

The preview URLs are mapped as follows:

| Shopify Handle | Headless Site URL |
|----------------|-------------------|
| `dune` | `https://www.tarifeattar.com/product/dune` |
| `cairo` | `https://www.tarifeattar.com/product/cairo` |
| `jasmine` | `https://www.tarifeattar.com/product/jasmine` |
| `riyadh` | `https://www.tarifeattar.com/product/riyadh` |
| ... | ... |

## Why Shopify's Preview Button Doesn't Work

Shopify's built-in "Preview" button is hardcoded to use the default storefront URL (`.myshopify.com`). For headless commerce, you need to:

1. **Use metafields** (✅ Done - we've set these)
2. **Manually construct URLs** (✅ Easy - just use `/product/[handle]`)
3. **Use a custom app** (Requires Shopify Plus and development)

## Verification

To verify preview URLs are set:

1. **In Shopify Admin:**
   - Products → Select any product
   - Scroll to "Metafields"
   - Look for "Preview URL" metafield
   - Should show: `https://www.tarifeattar.com/product/[handle]`

2. **Test the URL:**
   - Copy the preview URL
   - Open in a new tab
   - Should load the product on your headless site

## Troubleshooting

### "404 Not Found" on Headless Site

**Possible causes:**
1. Product doesn't exist in Sanity
2. Slug mismatch between Shopify and Sanity
3. Product not published in Sanity

**Fix:**
```bash
# Verify connections
node scripts/fix-shopify-connections.mjs --dry-run

# Check if product exists in Sanity
# Go to Sanity Studio and search for the product
```

### Metafield Not Showing

**Check:**
1. Did the script run successfully?
2. Are metafields enabled in your Shopify theme?

**Fix:**
```bash
# Re-run the script
node scripts/set-shopify-preview-urls.mjs
```

### Handle Mismatch

**Check:**
- Shopify product handle vs Sanity slug
- They should match exactly

**Fix:**
- Update `shopifyHandle` in Sanity to match Shopify
- Or update Shopify handle to match Sanity slug

## Best Practice Workflow

1. **Edit product in Shopify Admin**
2. **To preview:**
   - Copy preview URL from metafield, OR
   - Manually go to `tarifeattar.com/product/[handle]`
3. **Verify changes** on headless site
4. **Publish** when ready

## Future Enhancement

For a better experience, consider:
- Creating a Shopify app that overrides the Preview button (requires Shopify Plus)
- Using Shopify's Preview API (if available)
- Creating a browser extension for one-click preview

For now, the metafield solution works well for quick access to preview URLs.
