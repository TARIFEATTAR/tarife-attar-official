# Vercel Production Checklist

## ✅ Current Status

You already have these in Vercel:
- ✅ `NEXT_PUBLIC_SANITY_PROJECT_ID=8h5l91ut`
- ✅ `NEXT_PUBLIC_SANITY_DATASET=production`
- ✅ `NEXT_PUBLIC_SANITY_API_VERSION=2024-01` ⚠️ (should be `2024-01-01`)

## 🔧 Action Items

### 1. Fix API Version (Recommended)

**Current:** `2024-01`  
**Should be:** `2024-01-01`

**Why:** Sanity API versions use full date format (YYYY-MM-DD). While the code has a fallback, it's better to match exactly.

**Action:**
1. Go to Vercel → Settings → Environment Variables
2. Edit `NEXT_PUBLIC_SANITY_API_VERSION`
3. Change from `2024-01` to `2024-01-01`
4. Save and redeploy

### 2. Add Webhook Secret (For Instant Updates)

**Add this new variable:**
```
SANITY_REVALIDATE_SECRET=<generate-random-secret>
```

**Generate secret:**
```bash
openssl rand -base64 32
```

**Or use:** https://randomkeygen.com/ (use "CodeIgniter Encryption Keys")

**Action:**
1. Generate a random secret
2. Add `SANITY_REVALIDATE_SECRET` to Vercel
3. Add to **Production**, **Preview**, and **Development**
4. Save and redeploy

### 3. Set Up Sanity Webhook (Optional but Recommended)

**After adding the secret:**

1. Go to: https://sanity.io/manage → Your Project (`8h5l91ut`)
2. Navigate to: **API** → **Webhooks**
3. Click **"Create webhook"**
4. Configure:
   - **Name:** `Vercel Production Revalidation`
   - **URL:** `https://your-domain.vercel.app/api/revalidate`
     - Replace with your actual Vercel domain
   - **Dataset:** `production`
   - **Trigger on:** ✅ Create, ✅ Update, ✅ Delete
   - **Filter:** 
     ```
     _type == "product" || _type == "exhibit"
     ```
   - **HTTP method:** `POST`
   - **API version:** `2024-01-01`
   - **Secret:** (paste the same secret from `SANITY_REVALIDATE_SECRET`)

5. **Save**

---

## ✅ Verification Steps

### Step 1: Check Environment Variables

In Vercel Dashboard:
- [ ] `NEXT_PUBLIC_SANITY_PROJECT_ID` = `8h5l91ut`
- [ ] `NEXT_PUBLIC_SANITY_DATASET` = `production`
- [ ] `NEXT_PUBLIC_SANITY_API_VERSION` = `2024-01-01` (updated)
- [ ] `SANITY_REVALIDATE_SECRET` = (random secret)

### Step 2: Test Revalidation Endpoint

After deploying, test:
```bash
curl https://your-domain.vercel.app/api/revalidate
```

Should return:
```json
{"message":"Sanity revalidation webhook endpoint","status":"active",...}
```

### Step 3: Test Content Updates

1. **Publish a product in Sanity Studio**
2. **Check production site:**
   - **With webhook:** Appears instantly (0-5 seconds)
   - **Without webhook:** Appears within 60 seconds

---

## 🚨 If Content Still Doesn't Show

### Quick Debug:

1. **Check if product is PUBLISHED:**
   - In Sanity Studio, product should NOT have "Draft" badge
   - Click "Publish" if it's still a draft

2. **Check Vercel Build Logs:**
   - Go to Deployments → Latest
   - Look for Sanity connection errors
   - Verify environment variables are loaded

3. **Check Browser Console:**
   - Open production site
   - Open DevTools → Network tab
   - Look for requests to `api.sanity.io`
   - Check if they return data

4. **Wait for Revalidation:**
   - Without webhook: Wait 60 seconds
   - With webhook: Should be instant

---

## 📋 Summary

**You're almost there!** Just need to:

1. ✅ Update API version to `2024-01-01` (minor fix)
2. ✅ Add `SANITY_REVALIDATE_SECRET` (for webhooks)
3. ✅ Set up Sanity webhook (for instant updates)
4. ✅ Redeploy after adding variables

Then all your Sanity content will appear on production! 🎉
