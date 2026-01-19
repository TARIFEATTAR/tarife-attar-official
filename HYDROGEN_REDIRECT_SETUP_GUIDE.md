# Hydrogen Redirect Theme Setup Guide

## Step-by-Step Instructions

### Step 1: Download the Theme

1. **Go to the GitHub repository:**
   - Open: https://github.com/Shopify/hydrogen-redirect-theme
   - Click the green **"Code"** button
   - Click **"Download ZIP"**
   - Save the file to your Downloads folder (or somewhere easy to find)

### Step 2: Upload to Shopify

1. **Log into Shopify Admin:**
   - Go to: https://admin.shopify.com
   - Log in with your credentials

2. **Navigate to Themes:**
   - In the left sidebar, click **"Online Store"**
   - Click **"Themes"** (should be the first option)

3. **Upload the Theme:**
   - Scroll down to the bottom of the themes page
   - Click **"Add theme"** button (usually in the top right)
   - Select **"Upload zip file"**
   - Click **"Choose file"** or **"Browse"**
   - Navigate to your Downloads folder
   - Select the `hydrogen-redirect-theme-main.zip` file (or whatever it's named)
   - Click **"Upload"**

4. **Wait for Upload:**
   - Shopify will process the upload (may take 30-60 seconds)
   - You'll see a new theme appear in your themes list

### Step 3: Configure the Theme

1. **Open Theme Customizer:**
   - Find the "Hydrogen Redirect" theme in your themes list
   - Click **"Customize"** button (or the three dots menu → Customize)

2. **Access Theme Settings:**
   - In the left sidebar of the theme customizer, look for **"Theme settings"**
   - Click on it to expand
   - Look for **"Storefront"** or **"Redirect"** settings

3. **Set Your Domain:**
   - Find the field labeled `storefront_hostname` or **"Storefront Hostname"**
   - Enter: `www.tarifeattar.com` (without https://)
   - Or try: `tarifeattar.com` if www doesn't work

4. **Save Settings:**
   - Click **"Save"** in the top right

### Step 4: Publish the Theme

1. **Exit Customizer:**
   - Click the **"X"** or **"Back"** button to return to themes list

2. **Publish:**
   - Find the Hydrogen Redirect theme
   - Click the **three dots** menu (⋯) next to it
   - Click **"Publish"**
   - Confirm by clicking **"Publish"** again

**Important:** This theme will redirect ALL traffic from `vasana-perfumes.myshopify.com` to `tarifeattar.com`, which is what you want!

### Step 5: Test It

1. **Test the Redirect:**
   - Open a new incognito/private browser window
   - Go to: `https://vasana-perfumes.myshopify.com`
   - It should redirect to: `https://www.tarifeattar.com`

2. **Test Checkout Redirect:**
   - Add a product to cart on your site
   - Go to checkout
   - If an out-of-stock modal appears, click "Back to cart"
   - Should redirect to: `https://www.tarifeattar.com/cart`

## Troubleshooting

### If you can't find Theme Settings:

The theme might use a different configuration method. Try:

1. **Check theme.liquid file:**
   - In the theme customizer, look for **"Theme files"** or **"Edit code"**
   - Open `layout/theme.liquid`
   - Look for a variable like `storefront_hostname` or `redirect_domain`
   - Update it manually if needed

2. **Check config/settings_schema.json:**
   - This file defines theme settings
   - Look for the storefront_hostname setting

### If the theme doesn't appear after upload:

1. Make sure the ZIP file wasn't corrupted
2. Try extracting the ZIP and re-zipping just the contents (not the folder)
3. Check Shopify's upload limits (usually 50MB max)

### If redirects aren't working:

1. Clear your browser cache
2. Try in an incognito window
3. Check that the theme is actually published (not just uploaded)
4. Verify the domain is set correctly (no https://, no trailing slash)

## What This Theme Does

The Hydrogen Redirect Theme contains JavaScript that:
- Detects when someone visits `vasana-perfumes.myshopify.com`
- Preserves the path (e.g., `/cart`, `/products/xyz`)
- Redirects to `www.tarifeattar.com` with the same path
- Excludes `/checkout` paths so payment processing still works

## Need Help?

If you get stuck at any step, let me know:
- What step you're on
- What error message you see (if any)
- A screenshot if possible

I can help troubleshoot!
