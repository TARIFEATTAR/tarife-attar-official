# Vercel Environment Variables Checklist

## ✅ Required Variables

Add these in **Vercel Dashboard → Your Project → Settings → Environment Variables**

### Production Environment

```
NEXT_PUBLIC_SANITY_PROJECT_ID=8h5l91ut
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
SANITY_REVALIDATE_SECRET=<generate-random-secret>
```

### Generate Secret

Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```

Or use an online generator: https://randomkeygen.com/

### Important Notes

- ✅ Add to **Production**, **Preview**, AND **Development** environments
- ✅ After adding variables, **redeploy** your site
- ✅ The `SANITY_REVALIDATE_SECRET` should match the secret you set in Sanity webhook

---

## 🔗 Sanity Webhook URL

Once deployed, your webhook URL will be:
```
https://your-domain.vercel.app/api/revalidate
```

Replace `your-domain.vercel.app` with your actual Vercel domain.

---

## ✅ Verification

After setting up:

1. **Check Vercel Build:**
   - Go to Deployments → Latest
   - Verify build succeeds
   - Check for no Sanity connection errors

2. **Test Revalidation Endpoint:**
   ```bash
   curl https://your-domain.vercel.app/api/revalidate
   ```
   Should return: `{"message":"Sanity revalidation webhook endpoint",...}`

3. **Publish a Test Product:**
   - Create product in Sanity
   - Publish it
   - Check production site within 60 seconds (or instantly if webhook is set up)
