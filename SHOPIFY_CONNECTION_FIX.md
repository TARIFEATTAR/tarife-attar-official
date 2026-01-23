# Shopify Connection Fix Guide

## Issues Identified

1. **Missing Product/Variant IDs in Sanity** - Products don't have `shopifyProductId` and `shopifyVariantId` fields populated
2. **No Inventory in Shopify** - Variants have 0 inventory
3. **Missing Images** - Some products don't have images in Shopify
4. **Sales Channel Mapping** - Headless site can't add to cart because variant IDs are missing

## Root Cause

When products were imported via CSV, the Shopify Product IDs and Variant IDs were not synced back to Sanity. The headless site needs these IDs to:
- Add items to cart
- Connect to the correct Shopify products
- Display correct inventory status

## Solution

Run the fix script to:
1. ✅ Update Sanity with Shopify Product IDs and Variant IDs
2. ✅ Set inventory in Shopify based on Sanity's `inStock` field
3. ✅ Verify connections are working

## Steps to Fix

### Step 1: Preview Changes

```bash
node scripts/fix-shopify-connections.mjs --dry-run
```

This will show:
- Which products need connection updates
- Which variants need inventory updates
- Which products are missing images

### Step 2: Apply Fixes

```bash
node scripts/fix-shopify-connections.mjs
```

**What this does:**
- Updates `shopifyProductId` in Sanity
- Updates `shopifyHandle` in Sanity
- Updates `shopifyVariantId`, `shopifyVariant6mlId`, `shopifyVariant12mlId` in Sanity
- Sets inventory in Shopify (100 if in stock, 0 if not)

### Step 3: Verify

After running the script, check:

1. **In Sanity Studio:**
   - Open a product
   - Go to "Shopify Sync" tab
   - Verify `shopifyProductId` and variant IDs are populated

2. **On Headless Site:**
   - Go to a product page
   - Try adding to cart
   - Should work if variant IDs are set

3. **In Shopify Admin:**
   - Check product inventory
   - Should be set to 100 (if in stock) or 0 (if not)

## Image Issues

Some products are missing images in Shopify. This is because:
- Images were provided as URLs in CSV
- Shopify may need time to download them
- Or URLs might not be accessible

**To fix images:**
1. Wait a few minutes for Shopify to download images
2. Or manually upload images in Shopify Admin
3. Or re-run the CSV import with image URLs

## Sales Channel Mapping

The headless site connects to Shopify products via:
- `shopifyVariantId` - For single-variant products (Relic)
- `shopifyVariant6mlId` - For 6ml variant (Atlas)
- `shopifyVariant12mlId` - For 12ml variant (Atlas)

Once these are populated in Sanity, the headless site will be able to:
- Add items to cart
- Check inventory status
- Process purchases

## After Running the Fix

1. ✅ All products should have Shopify IDs in Sanity
2. ✅ Inventory should be set in Shopify
3. ✅ Headless site should be able to add items to cart
4. ⚠️  Images may still need manual upload

## Troubleshooting

### "Product missing Shopify Variant ID" error

This means the product doesn't have variant IDs in Sanity. Run the fix script to populate them.

### Cart not working

1. Check that variant IDs are populated in Sanity
2. Verify the product is published in Shopify
3. Check that inventory is set (not 0)

### Images not showing

1. Check if image URLs in CSV are accessible
2. Wait for Shopify to download images
3. Or manually upload images in Shopify Admin
