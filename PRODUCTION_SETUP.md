# Production Setup: Sanity Content on Vercel

## 🎯 Goal
Ensure all Sanity content appears instantly on your production site when you publish in Sanity Studio.

---

## Step 1: Environment Variables in Vercel

### Required Variables

Go to your Vercel project → Settings → Environment Variables and add:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=8h5l91ut
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
SANITY_REVALIDATE_SECRET=your-random-secret-here
```

**Generate a secret:**
```bash
# Run this to generate a secure random string:
openssl rand -base64 32
```

**Important:**
- ✅ Add to **Production**, **Preview**, and **Development** environments
- ✅ After adding, **redeploy** your site

---

## Step 2: Set Up Sanity Webhook (Instant Updates)

### Option A: Automatic Revalidation (Recommended)

1. **Go to Sanity Manage:**
   - Visit: https://sanity.io/manage
   - Select your project: `8h5l91ut`

2. **Create Webhook:**
   - Navigate to: **API** → **Webhooks**
   - Click **"Create webhook"**

3. **Configure Webhook:**
   - **Name:** `Vercel Revalidation`
   - **URL:** `https://your-domain.vercel.app/api/revalidate`
     - Replace `your-domain` with your actual Vercel domain
   - **Dataset:** `production`
   - **Trigger on:** 
     - ✅ Create
     - ✅ Update  
     - ✅ Delete
   - **Filter:** 
     ```
     _type == "product" || _type == "exhibit"
     ```
   - **HTTP method:** `POST`
   - **API version:** `2024-01-01`
   - **Secret:** (paste the same secret from `SANITY_REVALIDATE_SECRET`)

4. **Save the webhook**

### Option B: Manual Revalidation (Fallback)

If webhooks aren't set up, content will still update, but with a delay:
- **Current revalidation:** 60 seconds (1 minute)
- Content will appear automatically after 1 minute

---

## Step 3: Verify Production Build

### Check Build Logs

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the latest deployment
3. Check build logs for:
   - ✅ No Sanity connection errors
   - ✅ Environment variables loaded
   - ✅ Build completes successfully

### Test Production Site

1. **Visit your production URL**
2. **Check Atlas page:** `/atlas`
3. **Check Relic page:** `/relic`
4. **Verify products appear**

---

## Step 4: Test Webhook (Optional)

### Test the Revalidation Endpoint

```bash
# Test GET endpoint
curl https://your-domain.vercel.app/api/revalidate

# Should return:
# {"message":"Sanity revalidation webhook endpoint","status":"active",...}
```

### Test with Sanity Webhook

1. **Publish a product in Sanity Studio**
2. **Check Vercel logs:**
   - Go to Vercel Dashboard → Your Project → Functions
   - Look for `/api/revalidate` invocations
   - Should show successful revalidation

---

## Step 5: Production Revalidation Settings

### Current Configuration

**Development:**
- Revalidation: 10 seconds (fast updates during development)

**Production:**
- Revalidation: 60 seconds (default)
- **With webhook:** Instant (0 seconds delay)

### How It Works

1. **Without Webhook:**
   - Content updates every 60 seconds automatically
   - New products appear within 1 minute

2. **With Webhook:**
   - Sanity sends webhook when you publish
   - Next.js revalidates instantly
   - Content appears immediately (0 seconds)

---

## 🔍 Troubleshooting Production

### Issue: Products Not Showing

**Check 1: Environment Variables**
- ✅ Verify all env vars are set in Vercel
- ✅ Check they're added to **Production** environment
- ✅ Redeploy after adding env vars

**Check 2: Products Are Published**
- ✅ Products must be **PUBLISHED** (not drafts)
- ✅ Check in Sanity Studio

**Check 3: Build Success**
- ✅ Check Vercel build logs for errors
- ✅ Verify build completes successfully

**Check 4: Cache**
- ✅ Wait 60 seconds (revalidation time)
- ✅ Or trigger manual revalidation via webhook

### Issue: Webhook Not Working

**Check 1: Webhook URL**
- ✅ URL is correct: `https://your-domain.vercel.app/api/revalidate`
- ✅ No trailing slash
- ✅ HTTPS (not HTTP)

**Check 2: Secret Match**
- ✅ Secret in Sanity matches `SANITY_REVALIDATE_SECRET` in Vercel
- ✅ Both are the same value

**Check 3: Webhook Status**
- ✅ Check webhook status in Sanity Manage
- ✅ Look for recent deliveries
- ✅ Check for error messages

**Check 4: Vercel Function Logs**
- ✅ Go to Vercel Dashboard → Functions
- ✅ Check `/api/revalidate` logs
- ✅ Look for errors or successful calls

---

## 📋 Quick Checklist

Before going live, verify:

- [ ] All environment variables set in Vercel
- [ ] Environment variables added to Production environment
- [ ] Site redeployed after adding env vars
- [ ] Webhook created in Sanity (optional but recommended)
- [ ] Webhook secret matches in both places
- [ ] Test product published in Sanity
- [ ] Test product appears on production site
- [ ] Build logs show no errors

---

## 🚀 After Setup

### Publishing New Content

1. **Create/Edit product in Sanity Studio**
2. **Click "Publish"**
3. **With webhook:** Content appears instantly (0-5 seconds)
4. **Without webhook:** Content appears within 60 seconds

### Monitoring

- **Vercel Dashboard:** Check function invocations for webhook calls
- **Sanity Manage:** Check webhook delivery status
- **Production Site:** Verify content appears correctly

---

## 🔗 Useful Links

- **Sanity Manage:** https://sanity.io/manage
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Webhook Documentation:** https://www.sanity.io/docs/webhooks

---

**Status:** Your production site is now configured to show all Sanity content! 🎉
