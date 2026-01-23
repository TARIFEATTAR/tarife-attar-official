# How to Get Shopify Admin API Token

The **Admin API token** is different from the **Storefront API token**. You need the Admin API token to sync SKUs and manage products.

## Steps to Get Admin API Token

1. **Go to Shopify Admin**
   - Navigate to: https://admin.shopify.com/store/vasana-perfumes
   - Or go to your Shopify admin dashboard

2. **Open App Settings**
   - Click **Settings** (gear icon, bottom left)
   - Click **Apps and sales channels**

3. **Create a Custom App**
   - Click **Develop apps** (you may need to enable developer mode first)
   - Click **Create an app**
   - Name it: `SKU Sync Scripts` or `Tarife Attar Admin`
   - Click **Create app**

4. **Configure Admin API Scopes**
   - Click **Configure Admin API scopes**
   - Enable these permissions:
     - ✅ `read_products` (to read product data)
     - ✅ `write_products` (to update SKUs)
   - Click **Save**

5. **Install the App**
   - Click **Install app**
   - Confirm installation

6. **Get the Access Token**
   - After installation, you'll see **Admin API access token**
   - Click **Reveal token once**
   - **Copy the token** (starts with `shpat_`)

## Set the Token

### Option 1: Temporary (for this session)
```bash
export SHOPIFY_ADMIN_ACCESS_TOKEN="shpat_your_token_here"
```

### Option 2: Permanent (add to .env.local)
Add this line to your `.env.local` file:
```bash
SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_your_token_here
```

Then load it:
```bash
source .env.local
```

### Option 3: Run with token inline
```bash
SHOPIFY_ADMIN_ACCESS_TOKEN="shpat_your_token_here" node scripts/diagnose-sku-sync.mjs
```

## Verify It Works

After setting the token, run:
```bash
node scripts/diagnose-sku-sync.mjs
```

You should see the diagnostic report instead of the "Missing token" error.

## Security Note

⚠️ **Never commit the Admin API token to git!**
- It's already in `.gitignore` for `.env.local`
- Don't add it to any files that get committed
- If you accidentally commit it, regenerate the token immediately
