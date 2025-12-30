# Troubleshooting: Products Not Showing Up

## 🔍 Common Issues & Solutions

### Issue 1: Product is Still a Draft

**Problem:** Products only show up if they're **PUBLISHED**, not drafts.

**Solution:**
1. In Sanity Studio, open your product
2. Look for the **"Publish"** button in the top right
3. Click **"Publish"** (not just "Save")
4. Refresh your frontend page

**How to Check:**
- Drafts have `_id` starting with `drafts.`
- Published products have `_id` without the `drafts.` prefix
- Our queries explicitly exclude drafts: `!(_id in path("drafts.**"))`

---

### Issue 2: Missing Required Fields

**Problem:** Product might be missing required fields that the query expects.

**For Atlas Products, make sure you have:**
- ✅ `collectionType` = "atlas"
- ✅ `atlasData.atmosphere` = One of: "tidal", "ember", "petal", or "terra"
- ✅ `title` (required)
- ✅ `slug` (auto-generated from title)

**For Relic Products, make sure you have:**
- ✅ `collectionType` = "relic"
- ✅ `title` (required)
- ✅ `slug` (auto-generated from title)

**Check in Sanity Studio:**
1. Open your product
2. Verify all required fields (marked with *) are filled
3. For Atlas: Make sure "Atmosphere Territory" is selected
4. Publish again

---

### Issue 3: Caching

**Problem:** Next.js might be caching the old data.

**Solutions:**

**Option A: Hard Refresh**
- Desktop: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
- Mobile: Clear browser cache

**Option B: Restart Dev Server**
```bash
# Stop the server (Ctrl+C)
npm run dev
```

**Option C: Force Revalidation**
The queries now revalidate every 10 seconds in development, but you can also:
- Wait 10 seconds after publishing
- Or restart the dev server

---

### Issue 4: Wrong Collection Type

**Problem:** Product might be set to wrong collection type.

**Check:**
1. In Sanity Studio, open your product
2. Look at "Collection Type" field
3. Make sure it matches:
   - Atlas products → "The Atlas (Voyage)"
   - Relic products → "The Relic (Vault)"

---

### Issue 5: Query Filtering

**Problem:** The query might be too strict.

**Current Query Filters:**
- ✅ Only published products (excludes drafts)
- ✅ Matches `collectionType == "atlas"` or `"relic"`
- ✅ For Atlas: Requires `atlasData.atmosphere` to be set

**If your product still doesn't show:**
1. Check the browser console for errors
2. Check Network tab → Look for Sanity API requests
3. Verify the response includes your product

---

## 🧪 Debugging Steps

### Step 1: Verify Product in Sanity Studio

1. Open Sanity Studio
2. Go to "The Atlas" or "The Relic"
3. Find your product
4. Check:
   - ✅ Is it published? (no "Draft" badge)
   - ✅ Does it have all required fields?
   - ✅ Is `collectionType` correct?
   - ✅ For Atlas: Is `atmosphere` selected?

### Step 2: Check Frontend Query

1. Open browser DevTools → Network tab
2. Refresh `/atlas` or `/relic` page
3. Look for requests to `api.sanity.io`
4. Check the response JSON
5. Verify your product is in the array

### Step 3: Test with Direct Query

You can test the query directly in Sanity Studio:

1. Open Sanity Studio
2. Go to "Vision" (query tool)
3. Run this query for Atlas:
```groq
*[_type == "product" && collectionType == "atlas" && !(_id in path("drafts.**"))] {
  _id,
  title,
  "atmosphere": atlasData.atmosphere
}
```

4. Run this for Relic:
```groq
*[_type == "product" && collectionType == "relic" && !(_id in path("drafts.**"))] {
  _id,
  title
}
```

---

## ✅ Quick Checklist

Before reporting an issue, verify:

- [ ] Product is **PUBLISHED** (not just saved as draft)
- [ ] `collectionType` is set correctly
- [ ] For Atlas: `atlasData.atmosphere` is selected
- [ ] `title` field is filled
- [ ] `slug` is generated
- [ ] Waited 10 seconds after publishing (cache revalidation)
- [ ] Hard refreshed the browser
- [ ] Checked browser console for errors
- [ ] Verified product appears in Sanity Studio Vision query

---

## 🚀 Quick Fix

**Most Common Issue:** Product is a draft, not published.

**Quick Fix:**
1. Open product in Sanity Studio
2. Click **"Publish"** button (top right)
3. Wait 10 seconds
4. Refresh frontend page

That's it! 🎉
