# Sanity → Shopify Sync Guide

Since **Sanity Studio is your source of truth**, here's how to sync everything to Shopify.

## Overview

You have:
- ✅ **40 products** in Sanity (all accurate with new names + legacy names)
- 🛒 **62 products** in Shopify (some match, some don't)
- 📦 **23 products** in Sanity that don't exist in Shopify yet

## Strategy: Two-Phase Approach

### Phase 1: Update Existing Products in Shopify
Use the sync script to update SKUs and product data for products that already exist in both systems.

### Phase 2: Create New Products in Shopify
Use the CSV import for the 23 products that don't exist in Shopify yet.

---

## Phase 1: Sync Existing Products

### Step 1: Update SKUs for Existing Products

```bash
# Preview what will be updated
node scripts/sync-skus-to-shopify.mjs --dry-run

# Apply the updates
node scripts/sync-skus-to-shopify.mjs
```

**What this does:**
- Updates SKUs in Shopify to match Sanity
- Updates product titles if they differ
- Only touches products that exist in BOTH systems
- **Safe:** Legacy Shopify products are not touched

**What gets updated:**
- Product SKUs (primary, 6ml, 12ml variants)
- Product titles (if different)
- Variant SKUs

---

## Phase 2: Create New Products

### Step 2: Generate Shopify Import CSV

```bash
node scripts/generate-shopify-import-csv.mjs
```

This creates `shopify-import-products.csv` with:
- All 23 products that don't exist in Shopify
- Product titles (new names)
- Legacy names in description
- SKUs (from Sanity)
- Variants (6ml, 12ml for Atlas products)
- Pricing (from territory pricing or Sanity)
- Handles (from Sanity slugs)

### Step 3: Import CSV to Shopify

1. **Go to Shopify Admin** → **Products** → **Import**
2. **Click "Add file"** and select `shopify-import-products.csv`
3. **Review the import preview:**
   - Check product titles
   - Verify SKUs match Sanity
   - Confirm pricing is correct
4. **Click "Import products"**
5. **Wait for import to complete**

### Step 4: Verify and Final Sync

After import, run the sync again to ensure everything matches:

```bash
# Verify everything is synced
node scripts/diagnose-sku-sync.mjs

# Final sync to ensure exact match
node scripts/sync-skus-to-shopify.mjs
```

---

## Complete Workflow

```bash
# 1. Clean up any incomplete products (if needed)
node scripts/cleanup-incomplete-products.mjs --dry-run

# 2. Populate SKUs in Sanity (if any are missing)
node scripts/populate-skus.mjs --dry-run
node scripts/populate-skus.mjs

# 3. Sync existing products to Shopify
node scripts/sync-skus-to-shopify.mjs --dry-run
node scripts/sync-skus-to-shopify.mjs

# 4. Generate CSV for new products
node scripts/generate-shopify-import-csv.mjs

# 5. Import CSV in Shopify Admin (manual step)

# 6. Final verification
node scripts/diagnose-sku-sync.mjs
node scripts/sync-skus-to-shopify.mjs
```

---

## What Gets Synced

### From Sanity to Shopify:

✅ **Product Titles** - New names (e.g., "ONYX" instead of old name)
✅ **SKUs** - Format: `TERRITORY-PRODUCTNAME-6ML`, `TERRITORY-PRODUCTNAME-12ML`
✅ **Product Handles** - From Sanity slugs
✅ **Legacy Names** - Included in product descriptions
✅ **Pricing** - From territory pricing or Sanity price field
✅ **Inventory Status** - From Sanity `inStock` field

### What Doesn't Get Synced (Manual):

⚠️ **Product Images** - Need to be uploaded manually in Shopify
⚠️ **Product Descriptions** - Basic HTML included, but rich content needs manual setup
⚠️ **SEO Metadata** - Can be added manually or via CSV

---

## After Import: Next Steps

1. **Upload Product Images**
   - Go to each product in Shopify
   - Upload images from Sanity (or your image library)

2. **Add Rich Descriptions**
   - Copy detailed descriptions from Sanity
   - Add to Shopify product descriptions

3. **Set Up Collections**
   - Create "Atlas" and "Relic" collections in Shopify
   - Add products to appropriate collections

4. **Verify Everything**
   ```bash
   node scripts/diagnose-sku-sync.mjs
   ```

---

## Ongoing Maintenance

**When you add new products in Sanity:**

1. Generate CSV for new products:
   ```bash
   node scripts/generate-shopify-import-csv.mjs
   ```

2. Import CSV in Shopify

3. Sync SKUs:
   ```bash
   node scripts/sync-skus-to-shopify.mjs
   ```

**When you update existing products in Sanity:**

1. Sync SKUs and titles:
   ```bash
   node scripts/sync-skus-to-shopify.mjs
   ```

**Monthly health check:**

```bash
node scripts/diagnose-sku-sync.mjs
```

---

## Troubleshooting

### "Products not matching between systems"
- Check that product handles/slugs match
- Update `shopifyHandle` in Sanity if needed
- Re-run diagnostic

### "SKUs not updating in Shopify"
- Verify Admin API token has `write_products` scope
- Check Shopify API version
- Review error messages

### "CSV import fails"
- Check CSV format (should be UTF-8)
- Verify required fields are present
- Check Shopify import error messages

---

## Summary

**Best Approach:** 
1. ✅ Use sync script for existing products (automatic, safe)
2. ✅ Use CSV import for new products (bulk creation)
3. ✅ Final sync to ensure everything matches exactly

This gives you:
- ✅ Sanity as source of truth
- ✅ Shopify stays in sync
- ✅ All SKUs match
- ✅ New names + legacy names preserved
