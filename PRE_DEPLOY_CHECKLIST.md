# Pre-Deploy Checklist

## ✅ Before Redeploying

### 1. Environment Variables in Vercel

Make sure these are set in **Vercel Dashboard → Settings → Environment Variables**:

- [ ] `NEXT_PUBLIC_SANITY_PROJECT_ID=8h5l91ut`
- [ ] `NEXT_PUBLIC_SANITY_DATASET=production`
- [ ] `NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01` (or `2024-01` if that's what you have)
- [ ] `SANITY_REVALIDATE_SECRET=Fxo7t5YLAIEdqU50hl0iNTMId6xlyis5yEHAERAFHAE=`

**Important:** Add `SANITY_REVALIDATE_SECRET` to **Production**, **Preview**, AND **Development** environments.

### 2. Sanity Webhook

Verify in Sanity:
- [ ] Webhook name: Set
- [ ] URL: `https://tarife-attar-site.vercel.app/api/revalidate`
- [ ] Dataset: `production`
- [ ] Trigger on: Create, Update, Delete (all checked)
- [ ] Filter: `_type == "product" || _type == "exhibit"`
- [ ] API Version: `v2024-01-01` (or latest)
- [ ] Secret: `Fxo7t5YLAIEdqU50hl0iNTMId6xlyis5yEHAERAFHAE=`
- [ ] Webhook saved

---

## 🚀 Ready to Deploy!

Once the checklist above is complete, you can redeploy.

### How to Redeploy

**Option 1: Automatic (Recommended)**
- Just push a new commit (even an empty one)
- Vercel will auto-deploy

**Option 2: Manual**
- Go to Vercel Dashboard → Your Project → Deployments
- Click "..." on latest deployment → "Redeploy"

**Option 3: Via Git**
```bash
git commit --allow-empty -m "Trigger redeploy for webhook setup"
git push
```

---

## ✅ After Deployment

### Test the Webhook

1. **Test endpoint:**
   ```bash
   curl https://tarife-attar-site.vercel.app/api/revalidate
   ```
   Should return: `{"message":"Sanity revalidation webhook endpoint",...}`

2. **Publish a test product:**
   - Create/publish a product in Sanity Studio
   - Check production site within 60 seconds (or instantly with webhook)

3. **Check webhook delivery:**
   - Go to Sanity Manage → API → Webhooks
   - Click on your webhook
   - Check "Recent deliveries" to see if it's being called

---

## 🎉 You're All Set!

Once deployed, your Sanity content will:
- ✅ Appear on production site
- ✅ Update instantly when you publish (with webhook)
- ✅ Or update within 60 seconds (without webhook)
