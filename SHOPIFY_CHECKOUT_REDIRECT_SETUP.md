# Shopify Checkout Redirect Configuration

## Problem
When users encounter an out-of-stock product in Shopify checkout, the modal redirects them back to the old Shopify storefront instead of your new Next.js site at `tarifeattar.com`.

## Solution: Configure Checkout Redirect URLs

### Option 1: Shopify Admin Settings (Recommended)

1. **Go to Shopify Admin** → **Settings** → **Checkout**
2. Scroll down to **"Customer accounts"** section
3. Find **"Redirect after checkout"** or **"Post-purchase redirect"**
4. Set the redirect URL to: `https://www.tarifeattar.com`
5. Also check **"Redirect after cart update"** and set to: `https://www.tarifeattar.com/cart`

### Option 2: Checkout Settings

1. **Go to Shopify Admin** → **Settings** → **Checkout**
2. Look for **"Redirect URLs"** or **"Post-purchase redirect"**
3. Set:
   - **After checkout**: `https://www.tarifeattar.com`
   - **After cart update**: `https://www.tarifeattar.com/cart`
   - **After cart abandonment**: `https://www.tarifeattar.com`

### Option 3: Using Shopify Scripts/Apps

If you're using Shopify Scripts or a checkout customization app, you can add:

```liquid
{% if checkout.line_items.size == 0 %}
  <script>
    window.location.href = 'https://www.tarifeattar.com/cart';
  </script>
{% endif %}
```

### Option 4: Checkout Extension (Advanced)

If you have access to Shopify Checkout Extensions, you can customize the redirect behavior programmatically.

## Verify Settings

After configuring:
1. Add an out-of-stock product to cart
2. Go to checkout
3. When Shopify shows the out-of-stock modal
4. Click "Back to cart" or "Continue shopping"
5. Should redirect to `https://www.tarifeattar.com/cart` or `https://www.tarifeattar.com`

## Notes

- Some redirect settings may require Shopify Plus
- If you don't see these options, you may need to use the Shopify API or a third-party app
- The redirect URLs must use HTTPS (`https://`) not HTTP
