# 🎨 Sanity Studio Setup & Deployment Guide

## Overview

You have **two main options** for hosting Sanity Studio:

1. **✅ Embedded in Next.js** (Recommended for your setup)
   - Studio lives at `https://your-domain.com/studio`
   - Same deployment as your site
   - Easier to manage

2. **Sanity Managed Hosting** (Alternative)
   - Studio lives at `https://your-project.sanity.studio`
   - Separate deployment
   - Managed by Sanity

---

## 🎯 Recommended: Embed Studio in Next.js

### Why This Approach?

- ✅ Single deployment (Studio + Site together)
- ✅ Same domain (no CORS issues)
- ✅ Easier to manage
- ✅ Better for team collaboration

### Step 1: Create Studio Route

We'll create a `/studio` route in your Next.js app that embeds the Studio.

### Step 2: Add CORS Origin

**Important:** You MUST add your Studio URL to Sanity's CORS settings:

1. Go to: https://sanity.io/manage
2. Select your project: `8h5l91ut`
3. Go to: **API** → **CORS origins**
4. Click **"Add CORS origin"**
5. Add:
   - **Origin:** `https://your-domain.vercel.app` (or your production domain)
   - **Credentials:** ✅ Enable (required for Studio)
6. **Also add for development:**
   - **Origin:** `http://localhost:3000`
   - **Credentials:** ✅ Enable

### Step 3: Register Studio in Sanity Manage (Optional)

If you want the Studio to show up in the "Studios" section of Sanity Manage:

1. Go to: https://sanity.io/manage → Your Project → **Studios**
2. Click **"+ Add studio"**
3. Select **"Custom studio URL"**
4. Enter: `https://your-domain.vercel.app/studio`
5. Click **"Add studio host"**

**Note:** This is optional - Studio will work without it, but it won't show in the dashboard.

---

## 🚀 Alternative: Sanity Managed Hosting

If you prefer Sanity to host your Studio separately:

### Step 1: Deploy Studio

```bash
# From your project root
npx sanity deploy
```

You'll be prompted to:
- Choose a hostname (e.g., `tarife-attar`)
- Studio will be available at: `https://tarife-attar.sanity.studio`

### Step 2: Configure CLI (Optional)

Create `sanity.cli.ts` in your project root:

```typescript
import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: '8h5l91ut',
    dataset: 'production'
  },
  studioHost: 'tarife-attar' // Your chosen hostname
})
```

### Step 3: Auto-deploy in CI/CD (Optional)

Add to your GitHub Actions or Vercel build:

```yaml
# .github/workflows/deploy-studio.yml
- name: Deploy Sanity Studio
  run: npx sanity deploy
  env:
    SANITY_AUTH_TOKEN: ${{ secrets.SANITY_AUTH_TOKEN }}
```

---

## 📋 Best Practices

### 1. **Environment Variables**

Make sure these are set in Vercel:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=8h5l91ut
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
```

### 2. **CORS Configuration**

**Critical:** Always add your Studio URL to CORS origins:
- Production: `https://your-domain.vercel.app`
- Development: `http://localhost:3000`
- Preview: `https://your-preview-url.vercel.app` (if using preview deployments)

### 3. **Authentication**

Studio uses Sanity's built-in authentication:
- Users log in with their Sanity account
- No additional auth setup needed
- Access is controlled by Sanity project permissions

### 4. **Base Path**

Your `sanity.config.ts` already has:
```typescript
basePath: '/studio'
```

This means Studio will be accessible at `/studio` in your app.

### 5. **Development vs Production**

- **Development:** Run `npm run dev` - Studio accessible at `http://localhost:3000/studio`
- **Production:** Deploy to Vercel - Studio accessible at `https://your-domain.com/studio`

---

## 🔧 Troubleshooting

### Studio Not Loading?

1. **Check CORS:** Make sure your domain is in CORS origins
2. **Check Environment Variables:** Verify all `NEXT_PUBLIC_*` vars are set
3. **Check Base Path:** Ensure `basePath: '/studio'` matches your route
4. **Check Console:** Look for errors in browser console

### "Studio not found" in Sanity Manage?

- This is **optional** - Studio works without it
- To add: Go to Studios → "+ Add studio" → Enter your Studio URL

### Authentication Issues?

- Users must have access to your Sanity project
- Check project permissions in Sanity Manage → **Members**

---

## ✅ Implementation Complete!

The Studio route has been created:

- **Route:** `/studio/[[...index]]/page.tsx` - Catch-all route for Studio
- **Component:** `/studio/[[...index]]/Studio.tsx` - Studio component
- **Layout:** `/studio/layout.tsx` - Isolated layout for Studio

### How It Works

1. **Catch-all Routing:** `[[...index]]` handles all Studio sub-routes
2. **Client Component:** Studio runs entirely client-side
3. **Config Import:** Uses your existing `sanity.config.ts`
4. **Isolated Layout:** Studio has its own layout to avoid style conflicts

---

## 🎯 Next Steps

1. ✅ **Studio route implemented** - Done!
2. ⏭️ **Add CORS origins** in Sanity Manage (see below)
3. ⏭️ **Test locally** (`npm run dev` → `http://localhost:3000/studio`)
4. ⏭️ **Deploy to Vercel** and test production
5. ⏭️ **Register Studio** in Sanity Manage (optional)

---

## 📚 Resources

- [Sanity Studio Embedding Docs](https://www.sanity.io/docs/studio/embedding-sanity-studio)
- [Sanity Studio Deployment Docs](https://www.sanity.io/docs/studio/deployment)
- [Next.js + Sanity Guide](https://www.sanity.io/docs/next-js-quickstart)
