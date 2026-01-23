# Implementation Steps: Product Description Sync

## Quick Start

### Step 1: Verify Environment Variables

Make sure you have the required tokens in `.env.local`:

```bash
# Check if these are set
cat .env.local | grep -E "(SHOPIFY_ADMIN_ACCESS_TOKEN|SANITY_WRITE_TOKEN)"
```

**Required:**
- `SHOPIFY_ADMIN_ACCESS_TOKEN` - Shopify Admin API token
- `SANITY_WRITE_TOKEN` - Sanity write token (for reading products)

### Step 2: Sync Existing Products (Preview First)

```bash
# Preview what will be updated (no changes made)
node scripts/sync-descriptions-to-shopify.mjs --dry-run
```

**What to check:**
- How many products will be updated
- Which products are matched
- Preview of new descriptions

### Step 3: Apply the Sync

```bash
# Actually update Shopify descriptions
node scripts/sync-descriptions-to-shopify.mjs
```

**What happens:**
- Fetches products from Sanity and Shopify
- Matches them by handle/slug
- Builds rich HTML descriptions from Sanity content
- Updates Shopify product descriptions

### Step 4: Verify in Shopify

1. Go to Shopify Admin → Products
2. Open a product that has Evocation Story in Sanity
3. Check the product description
4. Should see:
   - Title + Legacy Name
   - Evocation section (if available)
   - On Skin section (if available)
   - The Journey section (if available)

### Step 5: Test New Products (Optional)

If you're adding new products:

```bash
# Generate CSV with full descriptions
node scripts/generate-shopify-import-csv.mjs

# Then import shopify-import-products.csv in Shopify Admin
```

## Detailed Steps

### Prerequisites Check

```bash
# 1. Verify Node.js scripts can run
node --version  # Should be v18+

# 2. Verify dependencies
npm list @sanity/client  # Should be installed

# 3. Check environment variables
node -e "console.log('SHOPIFY_ADMIN:', !!process.env.SHOPIFY_ADMIN_ACCESS_TOKEN)"
```

### Step-by-Step Execution

#### Phase 1: Dry Run (Safe Preview)

```bash
# Run dry run to see what will change
node scripts/sync-descriptions-to-shopify.mjs --dry-run
```

**Expected Output:**
```
📝 SYNC DESCRIPTIONS: SANITY → SHOPIFY
📋 DRY RUN MODE (no changes will be made)

📚 Fetching products from Sanity...
   Found 45 products in Sanity

🛒 Fetching products from Shopify...
   Found 50 products in Shopify

🔗 Matching products...
   ✅ Matched: 40 products
   ⚠️  Unmatched: 5 products

📝 UPDATING DESCRIPTIONS

  JASMINE
     Shopify: jasmine
     → Updating description...
        Current: 45 chars
        New: 1250 chars
        Preview (first 200 chars): <p><strong>JASMINE (formerly Arabian Jasmine)</strong></p>...
```

#### Phase 2: Apply Changes

```bash
# Remove --dry-run to actually update
node scripts/sync-descriptions-to-shopify.mjs
```

**Expected Output:**
```
📝 SYNC DESCRIPTIONS: SANITY → SHOPIFY
🚀 LIVE MODE

[... matching process ...]

📝 UPDATING DESCRIPTIONS

  JASMINE
     Shopify: jasmine
     → Updating description...
        Current: 45 chars
        New: 1250 chars
      ✅ Updated description (1250 chars)

📊 SUMMARY
   Products matched:     40
   Descriptions updated: 35
   Descriptions skipped: 5 (already match)
   Errors:               0

✅ Description sync complete!
```

#### Phase 3: Verification

**In Shopify Admin:**
1. Products → Select a product
2. Scroll to "Description" section
3. Should see formatted HTML with:
   - Title + Legacy Name
   - Evocation section
   - On Skin section
   - The Journey section

**On Your Website:**
- Should still display exactly as before
- Separate "Evocation" and "On Skin" sections
- No changes to website display

## Troubleshooting

### Error: "Missing SHOPIFY_ADMIN_ACCESS_TOKEN"

**Fix:**
```bash
# Add to .env.local
echo "SHOPIFY_ADMIN_ACCESS_TOKEN=your_token_here" >> .env.local
```

**How to get token:**
1. Shopify Admin → Settings → Apps and sales channels
2. Develop apps → Create an app
3. Configure Admin API scopes: `write_products`
4. Install app → Copy Admin API access token

### Error: "Shopify API Error: UNAUTHORIZED"

**Fix:**
- Verify token has `write_products` scope
- Check token hasn't expired
- Ensure token is for correct store

### Error: "No products matched"

**Possible causes:**
- Handles/slugs don't match between Sanity and Shopify
- Products exist in one system but not the other

**Fix:**
```bash
# Run diagnostic to see mismatches
node scripts/diagnose-sku-sync.mjs
```

### Some Products Not Updating

**Check:**
1. Does product have Evocation/On Skin stories in Sanity?
2. Is product matched correctly? (check handles)
3. Run dry-run to see which products are skipped

## Ongoing Workflow

### When You Update Stories in Sanity

```bash
# After editing Evocation Story or On Skin Story in Sanity Studio
node scripts/sync-descriptions-to-shopify.mjs
```

### When You Add New Products

```bash
# 1. Create product in Sanity Studio
# 2. Add Evocation Story, On Skin Story, etc.
# 3. Generate CSV
node scripts/generate-shopify-import-csv.mjs

# 4. Import CSV in Shopify Admin
# Descriptions will automatically include all story content
```

### When You Need to Revert

**Option 1: Re-sync from Sanity**
```bash
# Just run sync again - it will overwrite Shopify with Sanity content
node scripts/sync-descriptions-to-shopify.mjs
```

**Option 2: Manual Edit in Shopify**
- Edit product description in Shopify Admin
- Note: Will be overwritten on next sync

## Success Criteria

✅ **After implementation, you should have:**

1. **Shopify product descriptions** include:
   - Title + Legacy Name
   - Evocation Story (if available)
   - On Skin Story (if available)
   - Travel Log / Museum Description (if available)

2. **Website display** remains unchanged:
   - Separate "Evocation" section
   - Separate "On Skin" section
   - Same styling and layout

3. **Sanity remains source of truth:**
   - Edit stories in Sanity Studio
   - Run sync to push to Shopify
   - Website reads directly from Sanity

## Next Steps After Implementation

1. ✅ Verify descriptions in Shopify look correct
2. ✅ Test that website still displays correctly
3. ✅ Document workflow for your team
4. ✅ Set up regular sync schedule (if needed)

## Quick Reference

```bash
# Preview sync (safe)
node scripts/sync-descriptions-to-shopify.mjs --dry-run

# Apply sync
node scripts/sync-descriptions-to-shopify.mjs

# Generate CSV for new products
node scripts/generate-shopify-import-csv.mjs

# Diagnose issues
node scripts/diagnose-sku-sync.mjs
```
