# Making Metafields Visible in Shopify Admin

## The Issue

You set preview_url metafields, but they're not showing up in Shopify Admin. This is because metafields need to be **configured** to be visible in the product editor.

## Solution: Configure Metafield Definitions

Metafields need to be defined in Shopify Settings before they appear in the product editor.

### Step 1: Go to Metafield Definitions

1. **In Shopify Admin:**
   - Go to **Settings** → **Custom data**
   - Click **Products**

### Step 2: Create Preview URL Metafield Definition

1. **Click "Add definition"**
2. **Fill in the details:**
   - **Name**: `Preview URL`
   - **Namespace and key**: `custom.preview_url` (should auto-fill)
   - **Type**: `URL`
   - **Description**: `Preview URL for headless site`
   - **Validation**: Optional (can leave empty)
3. **Click "Save"**

### Step 3: Verify Visibility

1. **Go to Products** → Select any product
2. **Scroll down** - you should now see "Preview URL" in the metafields section
3. **The URL should be visible** and clickable

## Alternative: Use REST API to Check Metafields

If metafields still don't show in the UI, you can verify they exist via API:

```bash
node scripts/verify-metafields.mjs
```

This will show which products have the preview_url metafield set.

## Why Metafields Might Not Be Visible

1. **Not defined in Settings** - Metafields must be defined before they appear
2. **Wrong namespace/key** - Must match exactly: `custom.preview_url`
3. **Theme doesn't support metafields** - Some themes hide metafields
4. **Permissions** - Admin permissions might restrict visibility

## Quick Fix: Re-run Script After Defining Metafield

Once you've defined the metafield in Settings:

```bash
# Re-run to ensure all products have it
node scripts/set-shopify-preview-urls.mjs
```

## For Facebook & Instagram and Faire

These channels are separate from metafields. Products need to be:
1. **Published** (status: active)
2. **Published scope: web** (includes all channels)

The script `publish-to-all-channels.mjs` handles this automatically.
