# Environment Variables Setup

**Production Domain:** `tarifeattar.com`

Copy these values to your `.env.local` file and Vercel dashboard.

## Required Environment Variables

```bash
# SANITY CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=8h5l91ut
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01

# Sanity Write Token (for migration scripts)
# Get from: https://sanity.io/manage → Your Project → API → Tokens
# IMPORTANT: Must have "Editor" permissions (not Viewer)
SANITY_WRITE_TOKEN=<your_token_here>

# Webhook Secret (generate with: openssl rand -base64 32)
SANITY_REVALIDATE_SECRET=<random_string_here>

# SHOPIFY
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=vasana-perfumes.myshopify.com

# Storefront API Token (see instructions below)
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=<your_token_here>
```

## How to Get Shopify Storefront API Token

1. Go to **Shopify Admin** → **Settings** → **Apps and sales channels**
2. Click **Develop apps** (you may need to enable developer mode first)
3. Click **Create an app**
4. Name it: `Tarife Attar Website`
5. Click **Configure Storefront API scopes**
6. Enable these permissions:
   - ✅ `unauthenticated_read_product_listings`
   - ✅ `unauthenticated_read_checkouts`
   - ✅ `unauthenticated_write_checkouts`
7. Click **Save**
8. Click **Install app**
9. Click **Reveal token once** and copy it

## How to Get Sanity Write Token

1. Go to [sanity.io/manage](https://sanity.io/manage)
2. Select your project (8h5l91ut)
3. Go to **API** → **Tokens**
4. Click **Add API token**
5. Name: `Website Scripts`
6. Permissions: **Editor**
7. Click **Save** and copy the token

## Vercel Setup

Add all these variables in:
**Vercel Dashboard** → **Project Settings** → **Environment Variables**

Make sure to add them to all environments (Production, Preview, Development).

After adding, redeploy with **"Use existing Build Cache"** unchecked.

## Sanity Webhook Setup (for instant content updates)

1. Go to [sanity.io/manage](https://sanity.io/manage) → Project 8h5l91ut
2. Navigate to **API** → **Webhooks**
3. Click **Create webhook**:
   - **Name:** `Revalidate tarifeattar.com`
   - **URL:** `https://tarifeattar.com/api/revalidate`
   - **Dataset:** `production`
   - **Trigger on:** Create, Update, Delete
   - **Filter:** `_type == "product" || _type == "exhibit"`
   - **Secret:** (same value as `SANITY_REVALIDATE_SECRET`)
4. Save
