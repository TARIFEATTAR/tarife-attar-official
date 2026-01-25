# OmniAscent Abandoned Cart Email 404 Fix

## Problem

When clicking the "shop button" in OmniAscent abandoned cart/checkout emails, users are getting 404 errors.

## Root Cause

OmniAscent is likely generating URLs that don't exist on your Next.js site:
- `/shop` (doesn't exist - your site uses `/atlas` and `/relic`)
- `/collections` (Shopify-style URL that doesn't exist)
- `/shopify/shop` (common OmniAscent pattern)
- Or linking to the old Shopify storefront (`vasana-perfumes.myshopify.com`)

## Solution Implemented

### 1. Added Redirects in `next.config.js`

I've added redirects for common "shop" URLs that OmniAscent might generate. **For abandoned cart emails, these redirect to `/cart`** (not the collection page), so users can see their cart and complete checkout:

```javascript
{ source: '/shop', destination: '/cart', permanent: false },
{ source: '/shopify', destination: '/cart', permanent: false },
{ source: '/shopify/shop', destination: '/cart', permanent: false },
{ source: '/collections', destination: '/cart', permanent: false },
{ source: '/collections/all', destination: '/cart', permanent: false },
{ source: '/store', destination: '/cart', permanent: false },
{ source: '/browse', destination: '/cart', permanent: false },
```

**Why `/cart`?** For abandoned cart emails, users should go directly to their cart to complete the purchase, not browse more products.

### 2. Next Steps: Check OmniAscent Configuration

You need to verify what URL OmniAscent is actually generating:

#### Option A: Check Email Template in OmniAscent
1. Go to your OmniAscent dashboard
2. Navigate to **Automations** → **Abandoned Cart** (or **Abandoned Checkout**)
3. Open the email template
4. Find the "shop button" or "continue shopping" link
5. Check what URL it's pointing to

#### Option B: Inspect the Email Link
1. Open the test email in your email client
2. Right-click the "shop button"
3. Select "Copy link address" or "Inspect"
4. Check the actual URL

### 3. Update OmniAscent Email Templates

**For abandoned cart/checkout emails, you should configure OmniAscent to use:**

#### Primary Button (Complete Checkout)
- **URL**: Use OmniAscent's `{{checkout_url}}` variable - this goes directly to Shopify checkout
- **Text**: "Complete Checkout" or "Continue to Checkout"

#### Secondary Button (View Cart)
- **URL**: `https://www.tarifeattar.com/cart`
- **Text**: "View Cart" or "Return to Cart"

#### Alternative: Direct Cart Recovery
If OmniAscent supports cart recovery tokens, you can:
- Use `{{cart_url}}` or `{{recovery_url}}` if available
- Or manually set: `https://www.tarifeattar.com/cart?cart_id={{cart_id}}` (if OmniAscent provides cart ID)

**Note:** The redirects I've added will handle common patterns automatically, so even if OmniAscent generates `/shop`, it will redirect to `/cart`.

### 4. Common OmniAscent URL Patterns

OmniAscent might be generating:
- `{{shop.url}}/shop` → Will redirect to `/atlas` ✅
- `{{shop.url}}/collections` → Will redirect to `/atlas` ✅
- `{{cart_url}}` → Should point to `/cart` (verify this)
- `{{checkout_url}}` → Should point to Shopify checkout (this is correct)

### 5. Verify Redirects Work

After deploying, test these URLs:
- `https://www.tarifeattar.com/shop` → Should redirect to `/cart`
- `https://www.tarifeattar.com/collections` → Should redirect to `/cart`
- `https://www.tarifeattar.com/shopify` → Should redirect to `/cart`

### 6. How Cart Restoration Works

Your cart system:
1. **Stores cart ID in localStorage** (`shopify_cart_id`)
2. **On `/cart` page load**, it tries to restore the cart from localStorage
3. **If cart ID exists**, it fetches the cart from Shopify
4. **If cart is expired/missing**, it creates a new cart

**For abandoned cart emails:**
- If the user clicks the link on the same device/browser, their cart should restore automatically
- If on a different device, they'll see an empty cart (this is expected - they need to add items again or use the checkout URL directly)

## Additional Considerations

### If OmniAscent Links to Old Shopify Storefront

If OmniAscent is generating links to `vasana-perfumes.myshopify.com/shop`, you have two options:

1. **Update OmniAscent settings** to use `tarifeattar.com` as the store URL
2. **Use Shopify's redirect theme** (see `SHOPIFY_CHECKOUT_REDIRECT_SETUP.md`)

### Console Errors (Non-Critical)

The console errors you're seeing are mostly:
- **OmniAscent module version conflicts** - These are warnings, not breaking errors
- **XSS warnings** - Security warnings about content sanitization (not causing 404s)
- **Google Analytics loading failure** - Network issue, not related to 404s
- **Favicon 404** - Minor, doesn't affect functionality

These won't cause the shop button 404 issue.

## Testing Checklist

- [ ] Deploy the redirect changes
- [ ] Test `/shop` redirects to `/atlas`
- [ ] Check OmniAscent email template URLs
- [ ] Update OmniAscent if needed
- [ ] Test abandoned cart email again
- [ ] Verify shop button works

## Need More Help?

If the issue persists after deploying these redirects:
1. Share the actual URL from the OmniAscent email button
2. Check OmniAscent's store URL configuration
3. Verify the redirects are working on the live site
