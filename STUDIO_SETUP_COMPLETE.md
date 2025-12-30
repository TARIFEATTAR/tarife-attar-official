# ✅ Sanity Studio Setup - Complete!

## What We've Done

✅ **Created embedded Studio route in Next.js**
- Studio is now accessible at `/studio` in your app
- Uses catch-all routing `[[...index]]` to handle all Studio sub-routes
- Isolated layout to prevent style conflicts

## Files Created

1. **`src/app/studio/[[...index]]/page.tsx`**
   - Main Studio route page
   - Uses dynamic rendering

2. **`src/app/studio/[[...index]]/Studio.tsx`**
   - Client component that renders Sanity Studio
   - Imports config from `sanity.config.ts`

3. **`src/app/studio/layout.tsx`**
   - Isolated layout for Studio
   - Full-screen, no site styling interference

## 🚀 Next Steps (Required)

### 1. Add CORS Origins in Sanity Manage

**Critical:** Studio won't work without this!

1. Go to: https://sanity.io/manage
2. Select your project: `8h5l91ut`
3. Navigate to: **API** → **CORS origins**
4. Click **"Add CORS origin"**

**Add these origins:**

**Development:**
- **Origin:** `http://localhost:3000`
- **Credentials:** ✅ Enable

**Production:**
- **Origin:** `https://tarife-attar-site.vercel.app` (or your production domain)
- **Credentials:** ✅ Enable

**Preview (if using Vercel preview deployments):**
- **Origin:** `https://*.vercel.app`
- **Credentials:** ✅ Enable

### 2. Test Locally

```bash
npm run dev
```

Then visit: **http://localhost:3000/studio**

You should see:
- Sanity login screen (if not logged in)
- Or your Studio dashboard (if already logged in)

### 3. Deploy to Vercel

Once CORS is configured:

1. Push changes to Git
2. Vercel will auto-deploy
3. Visit: `https://your-domain.vercel.app/studio`

### 4. Register Studio in Sanity Manage (Optional)

If you want Studio to show in the "Studios" section:

1. Go to: https://sanity.io/manage → Your Project → **Studios**
2. Click **"+ Add studio"**
3. Select **"Custom studio URL"**
4. Enter: `https://your-domain.vercel.app/studio`
5. Click **"Add studio host"**

**Note:** This is optional - Studio works without it!

---

## 🔍 Troubleshooting

### Studio Shows Blank Page?

1. **Check CORS:** Make sure your domain is added
2. **Check Console:** Open browser DevTools → Console
3. **Check Network:** Look for failed requests to `api.sanity.io`

### "Access Denied" Error?

- You need to be logged in to Sanity
- Make sure you have access to project `8h5l91ut`

### Studio Not Loading?

- Verify environment variables are set:
  - `NEXT_PUBLIC_SANITY_PROJECT_ID=8h5l91ut`
  - `NEXT_PUBLIC_SANITY_DATASET=production`
- Check that `sanity.config.ts` is correct

### TypeScript Errors?

- Run: `npm run typecheck`
- Make sure `sanity` package is installed: `npm install sanity`

---

## 📚 Resources

- [Sanity Studio Embedding](https://www.sanity.io/docs/studio/embedding-sanity-studio)
- [CORS Configuration](https://www.sanity.io/docs/content-lake/cors)
- [Next.js App Router](https://nextjs.org/docs/app)

---

## ✨ You're All Set!

Once CORS is configured, your Studio will be fully functional at:
- **Local:** `http://localhost:3000/studio`
- **Production:** `https://your-domain.com/studio`

Happy editing! 🎨
