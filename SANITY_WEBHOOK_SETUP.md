# Sanity Webhook Setup Guide

## 📝 Step-by-Step Webhook Configuration

### Step 1: Fill Out Basic Fields

**Name:**
```
Vercel Production Revalidation
```

**Description:**
```
Revalidates Next.js cache when products or exhibits are published/updated in Sanity
```

**URL:**
```
https://your-domain.vercel.app/api/revalidate
```
*(Replace `your-domain.vercel.app` with your actual Vercel domain)*

**Dataset:**
- Select: `production` (from dropdown)
- NOT "* (all datasets)"

**Trigger on:**
- ✅ **Create** (checked)
- ✅ **Update** (check this!)
- ✅ **Delete** (check this!)

---

### Step 2: Find the Secret Field

The **Secret** field is usually in one of these places:

#### Option A: Advanced/Security Section
1. Scroll down past the "Trigger on" section
2. Look for a section labeled:
   - **"Advanced"** or
   - **"Security"** or
   - **"HTTP Headers"**
3. Click to expand if it's collapsed
4. You'll see a field labeled **"Secret"** or **"Webhook Secret"**

#### Option B: HTTP Headers Section
1. Look for **"HTTP Headers"** section
2. There might be a field for **"X-Sanity-Secret"** header
3. Add your secret there

#### Option C: After URL Field
1. Sometimes it appears right after the URL field
2. Look for a field labeled **"Secret"** or **"Webhook Secret"**

---

### Step 3: Enter the Secret

**If you found the Secret field:**

1. **Paste this value:**
   ```
   otiAlSYUi5DuZZr+S3F+WEWuwUxbFqgoMyWDJyE5MmM=
   ```
   *(This is the secret I generated for you)*

2. **OR generate a new one:**
   - Use the same secret you added to Vercel as `SANITY_REVALIDATE_SECRET`
   - They must match exactly!

---

### Step 4: Add Filter (Important!)

Look for a **"Filter"** or **"GROQ Filter"** field and add:

```
_type == "product" || _type == "exhibit"
```

This ensures the webhook only triggers for products and exhibits, not other document types.

---

### Step 5: HTTP Method

- Should be set to: **POST**
- (This is usually the default)

---

### Step 6: Save

Click **"Create webhook"** or **"Save"** button at the bottom.

---

## 🔍 If You Can't Find the Secret Field

### Option 1: It Might Be Optional
- Some Sanity webhook configurations don't require a secret
- The webhook will still work, but without secret verification
- You can remove the secret check from the API route if needed

### Option 2: Check API Version
- Make sure you're using API version: `2024-01-01`
- Older API versions might have different field layouts

### Option 3: Update API Route (If No Secret Field)
If Sanity doesn't have a secret field, we can make it optional. Let me know and I'll update the code.

---

## ✅ After Creating Webhook

1. **Test it:**
   - Publish a product in Sanity Studio
   - Check Vercel Dashboard → Functions → `/api/revalidate`
   - Should see a successful invocation

2. **Verify:**
   - Product should appear on production site instantly (0-5 seconds)
   - Instead of waiting 60 seconds

---

## 🚨 Troubleshooting

**Webhook not triggering?**
- Check webhook status in Sanity Manage → API → Webhooks
- Look for "Recent deliveries" to see if it's being called
- Check for error messages

**Secret mismatch?**
- Secret in Sanity must match `SANITY_REVALIDATE_SECRET` in Vercel
- They must be exactly the same string

**Still not working?**
- The webhook is optional - content will still update every 60 seconds
- You can test without the webhook first
