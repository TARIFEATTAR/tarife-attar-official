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

I've added redirects for common "shop" URLs that OmniAscent might generate:

```javascript
{ source: '/shop', destination: '/atlas', permanent: false },
{ source: '/shopify', destination: '/atlas', permanent: false },
{ source: '/shopify/shop', destination: '/atlas', permanent: false },
{ source: '/collections', destination: '/atlas', permanent: false },
{ source: '/collections/all', destination: '/atlas', permanent: false },
{ source: '/store', destination: '/atlas', permanent: false },
{ source: '/browse', destination: '/atlas', permanent: false },
```

These redirect to `/atlas` (your main collection page).

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

Once you know what URL OmniAscent is generating, you have two options:

#### Option A: Update OmniAscent to Use Correct URLs
In your OmniAscent email templates, change the shop button URL to:
- **Main collection**: `https://www.tarifeattar.com/atlas`
- **Cart page**: `https://www.tarifeattar.com/cart`
- **Home page**: `https://www.tarifeattar.com`

#### Option B: Keep Redirects (Current Solution)
The redirects I've added will automatically handle common patterns, so even if OmniAscent generates `/shop`, it will redirect to `/atlas`.

### 4. Common OmniAscent URL Patterns

OmniAscent might be generating:
- `{{shop.url}}/shop` → Will redirect to `/atlas` ✅
- `{{shop.url}}/collections` → Will redirect to `/atlas` ✅
- `{{cart_url}}` → Should point to `/cart` (verify this)
- `{{checkout_url}}` → Should point to Shopify checkout (this is correct)

### 5. Verify Redirects Work

After deploying, test these URLs:
- `https://www.tarifeattar.com/shop` → Should redirect to `/atlas`
- `https://www.tarifeattar.com/collections` → Should redirect to `/atlas`
- `https://www.tarifeattar.com/shopify` → Should redirect to `/atlas`

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
