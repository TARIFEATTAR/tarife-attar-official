# Cache & Revalidation Fix Summary

## 🔧 Issues Fixed

### 1. **Caching Logic Problem**
**Issue:** When tags were present, revalidation was set to `false`, meaning tagged queries never revalidated automatically.

**Fix:** Updated `src/sanity/lib/client.ts` to allow both tag-based and time-based revalidation to work together.

### 2. **Revalidation Time Too Long**
**Issue:** Products were set to revalidate every 60 seconds, causing delays.

**Fix:** Set `revalidate: 0` for all product queries to always fetch fresh data, relying on webhook for instant updates.

### 3. **Webhook Payload Parsing**
**Issue:** Webhook handler expected a simple object, but Sanity sends an array of mutations.

**Fix:** Updated `/api/revalidate/route.ts` to properly parse Sanity's webhook format.

---

## ✅ What Changed

### Files Modified:

1. **`src/sanity/lib/client.ts`**
   - Fixed revalidation logic to work with tags
   - Now supports both tag-based and time-based revalidation

2. **`src/app/atlas/page.tsx`**
   - Set `revalidate: 0` for immediate data fetching
   - Products will always fetch fresh data

3. **`src/app/product/[slug]/page.tsx`**
   - Set `revalidate: 0` for product detail pages

4. **`src/app/api/revalidate/route.ts`**
   - Fixed webhook payload parsing to handle Sanity's mutation array format
   - Now properly extracts document types and slugs from webhook payload

### New File:

5. **`src/app/api/debug/route.ts`**
   - Diagnostic endpoint to check environment variables and Sanity connection
   - Access at: `https://your-domain.vercel.app/api/debug`

---

## 🔍 Verification Steps

### Step 1: Check Environment Variables in Vercel

Go to **Vercel Dashboard → Your Project → Settings → Environment Variables**

Verify these are set:
- ✅ `NEXT_PUBLIC_SANITY_PROJECT_ID=8h5l91ut`
- ✅ `NEXT_PUBLIC_SANITY_DATASET=production`
- ✅ `NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01` (not `2024-01`)
- ✅ `SANITY_REVALIDATE_SECRET=<your-secret>`

### Step 2: Test Debug Endpoint

After redeploying, visit:
```
https://your-domain.vercel.app/api/debug
```

This will show:
- Environment variables status
- Sanity connection status
- Product count (should match what you see in Sanity Studio)

### Step 3: Verify Products Are Published

**Important:** Products must be **PUBLISHED** (not just saved) in Sanity Studio.

1. Go to Sanity Studio: `https://your-domain.vercel.app/studio`
2. Open a product
3. Click **"Publish"** button (not just "Save")
4. Check the debug endpoint to see if product count increases

### Step 4: Test Webhook (If Set Up)

1. Publish a product in Sanity Studio
2. Check Vercel logs: **Deployments → Latest → Functions → `/api/revalidate`**
3. You should see a successful revalidation log

---

## 🚀 Next Steps

1. **Commit and Push Changes:**
   ```bash
   git add -A
   git commit -m "🔧 Fix caching and revalidation issues"
   git push
   ```

2. **Wait for Vercel Deployment:**
   - Changes will auto-deploy
   - Check deployment status in Vercel dashboard

3. **Test the Debug Endpoint:**
   - Visit `/api/debug` to verify everything is working

4. **Publish a Test Product:**
   - Create/publish a product in Sanity Studio
   - Check if it appears on `/atlas` page
   - Should appear immediately if webhook is set up, or within a few seconds otherwise

---

## 🐛 Troubleshooting

### Products Still Not Showing?

1. **Check Debug Endpoint:**
   - Visit `/api/debug`
   - Verify `productCount` matches what you see in Sanity Studio

2. **Verify Products Are Published:**
   - In Sanity Studio, products must have a green "Published" badge
   - Drafts are excluded from queries

3. **Check Product Fields:**
   - Products must have `collectionType` set to `"atlas"` or `"relic"`
   - Atlas products must have `atlasData.atmosphere` set
   - Products must have a `slug` field

4. **Clear Browser Cache:**
   - Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)

5. **Check Vercel Build Logs:**
   - Look for any Sanity connection errors
   - Verify environment variables are present during build

---

## 📝 Notes

- **Revalidation:** Products now fetch fresh data on every request (`revalidate: 0`)
- **Webhook:** If webhook is set up, changes appear instantly
- **Fallback:** Without webhook, changes appear on next page load (no delay)
- **CDN:** Sanity CDN is still used in production for performance, but Next.js cache is bypassed
