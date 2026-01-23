# SKU Sync Workflow - Step by Step

Based on the diagnostic results, here's the recommended workflow to fix all SKU sync issues.

## Current Issues Summary

- ✅ **7 products** perfectly synced
- ⚠️ **1 product** with SKU mismatch
- ❌ **10 products** with null titles (generating UNKNOWN SKUs)
- ❌ **23 products** in Sanity but not in Shopify
- 🛡️ **46 legacy Shopify products** (safe to ignore)

## Step-by-Step Workflow

### Step 1: Clean Up Incomplete Products ⚠️ **DO THIS FIRST**

The 10 products with null titles are causing "RELIC-UNKNOWN" SKUs. These need to be fixed or removed.

```bash
# 1. Preview what will be cleaned up
node scripts/cleanup-incomplete-products.mjs --dry-run

# 2. Review the output - decide if these should be:
#    - Fixed (add titles in Sanity Studio), OR
#    - Deleted (if they're duplicates/test records)

# 3. If deleting, preview deletion:
node scripts/cleanup-incomplete-products.mjs --delete --dry-run

# 4. If confirmed, delete them:
node scripts/cleanup-incomplete-products.mjs --delete
```

**Why first?** These incomplete products are polluting the SKU sync and causing errors.

---

### Step 2: Populate SKUs in Sanity

Generate SKUs for all valid products in Sanity.

```bash
# 1. Preview what SKUs will be generated
node scripts/populate-skus.mjs --dry-run

# 2. Review the output - check that SKUs look correct

# 3. Apply the changes
node scripts/populate-skus.mjs
```

**What this does:**
- Generates primary SKU: `TERRITORY-PRODUCTNAME` (e.g., `TERRA-ONYX`)
- Generates variant SKUs: `TERRITORY-PRODUCTNAME-6ML`, `TERRITORY-PRODUCTNAME-12ML`
- Only updates products that don't already have correct SKUs

---

### Step 3: Sync SKUs to Shopify

Push Sanity SKUs to Shopify for products that exist in both systems.

```bash
# 1. Preview what will be updated in Shopify
node scripts/sync-skus-to-shopify.mjs --dry-run

# 2. Review the output carefully:
#    - Check which products will be updated
#    - Verify SKUs look correct
#    - Confirm legacy products won't be touched

# 3. Apply the changes
node scripts/sync-skus-to-shopify.mjs
```

**Safety:** This script only updates products that exist in BOTH Sanity and Shopify. Legacy products are safe.

---

### Step 4: Handle New Products (23 products in Sanity but not Shopify)

You have 23 products in Sanity that don't exist in Shopify yet:

- SACRED HOJARI, JASMINE, BAHIA, BAHRAIN, OBSIDIAN, KYOTO, CLARITY, DELMAR, ETHIOPIA, GRANADA, HAVANA, CARAVAN, MUKHALLAT, ONYX, CHERISH, REGALIA, ADEN, SICILY, TAHARA, OMAN, DAMASCUS, DUNE, RITUAL

**Options:**

**Option A: Create products in Shopify** (Recommended for new products)
1. Go to Shopify Admin → Products
2. Create each product manually, OR
3. Use Shopify import/API to bulk create
4. Match the product handles to Sanity slugs
5. Then run sync again

**Option B: Match to existing Shopify products**
1. Check if any of these products already exist in Shopify with different handles
2. Update the `shopifyHandle` field in Sanity to match existing Shopify products
3. Re-run diagnostic to verify matches

**Option C: Use Shopify-Sanity sync scripts**
- If you have scripts that create Shopify products from Sanity, use those first
- Then run the SKU sync

---

### Step 5: Verify Everything is Synced

Run the diagnostic again to confirm all issues are resolved:

```bash
node scripts/diagnose-sku-sync.mjs
```

You should see:
- ✅ All matched products have correct SKUs
- ✅ No more UNKNOWN SKUs
- ✅ No missing SKUs in Sanity
- ✅ No missing SKUs in Shopify (for matched products)

---

## Quick Reference Commands

```bash
# Full workflow (after cleanup)
node scripts/populate-skus.mjs --dry-run          # Preview SKU generation
node scripts/populate-skus.mjs                    # Generate SKUs in Sanity
node scripts/sync-skus-to-shopify.mjs --dry-run   # Preview Shopify updates
node scripts/sync-skus-to-shopify.mjs             # Sync to Shopify
node scripts/diagnose-sku-sync.mjs                # Verify everything
```

## Troubleshooting

### "Products still showing UNKNOWN SKUs"
- Make sure you cleaned up null-title products (Step 1)
- Re-run `populate-skus.mjs` after cleanup

### "Products not matching between systems"
- Check that product handles/slugs match
- Verify product titles are similar
- Update `shopifyHandle` in Sanity if needed

### "SKUs not updating in Shopify"
- Verify `SHOPIFY_ADMIN_ACCESS_TOKEN` has `write_products` scope
- Check Shopify API version (currently `2024-10`)
- Review error messages in script output

## Ongoing Maintenance

**After creating new products:**
1. Populate SKUs: `node scripts/populate-skus.mjs`
2. Sync to Shopify: `node scripts/sync-skus-to-shopify.mjs`

**Monthly health check:**
```bash
node scripts/diagnose-sku-sync.mjs
```

This will catch any drift or new issues.
