# Webhook Configuration Review

## ✅ What Looks Good

1. **Secret Field:** ✅ You have a secret filled in:
   ```
   Fxo7t5YLAIEdqU50hl0iNTMId6xlyis5yEHAERAFHAE=
   ```

2. **Drafts:** ✅ Unchecked (correct - we don't want drafts to trigger)

3. **Versions:** ✅ Unchecked (fine for now)

---

## ⚠️ What Needs to Be Updated

### 1. API Version

**Current:** `v2021-03-25`  
**Should be:** `v2024-01-01` or `2024-01-01`

**Why:** Your code uses `2024-01-01`, so they should match.

**Action:**
- Click the API version dropdown
- Select `v2024-01-01` (or the closest match available)
- If `2024-01-01` isn't available, use the latest version shown

---

## ✅ Next Steps

### Step 1: Update API Version
- Change from `v2021-03-25` to `v2024-01-01` (or latest available)

### Step 2: Add Secret to Vercel

Copy this exact secret value:
```
Fxo7t5YLAIEdqU50hl0iNTMId6xlyis5yEHAERAFHAE=
```

Then:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add new variable:
   - **Key:** `SANITY_REVALIDATE_SECRET`
   - **Value:** `Fxo7t5YLAIEdqU50hl0iNTMId6xlyis5yEHAERAFHAE=`
3. Add to: Production, Preview, Development
4. Save and redeploy

### Step 3: Verify Basic Fields (if not already set)

Make sure you also have:
- **Name:** Something like "Vercel Revalidation"
- **URL:** `https://your-domain.vercel.app/api/revalidate`
- **Dataset:** `production` (not "all datasets")
- **Trigger on:** ✅ Create, ✅ Update, ✅ Delete (all checked)
- **Filter:** `_type == "product" || _type == "exhibit"`

### Step 4: Save

Click the **"Save"** button at the bottom.

---

## ✅ Summary

**Almost perfect!** Just need to:
1. ✅ Update API version to `v2024-01-01`
2. ✅ Copy the secret to Vercel as `SANITY_REVALIDATE_SECRET`
3. ✅ Save the webhook

Then you're all set! 🎉
