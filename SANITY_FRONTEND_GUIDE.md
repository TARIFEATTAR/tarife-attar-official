# Connecting Sanity to Your Frontend

## ✅ What's Been Set Up

1. **GROQ Queries** - Created in `src/sanity/lib/queries.ts`:
   - `atlasProductsByTerritoryQuery` - Fetches all Atlas products
   - `atlasTerritoryCountsQuery` - Gets counts per territory
   - `relicProductsQuery` - Fetches all Relic products
   - `productBySlugQuery` - Single product detail
   - `featuredProductsQuery` - Homepage featured items

2. **Atlas Page** - Now fetches real data from Sanity
3. **Image Helper** - `urlForImage()` for optimized Sanity images

## 🚀 How to See It in Action

### Step 1: Create a Product in Sanity Studio

1. Open Sanity Studio: `npx sanity dev` (or visit `/studio` if embedded)
2. Navigate to **"The Atlas (Journey)"** or **"The Relic (Vault)"**
3. Click **"Create new"**
4. Fill in the required fields:
   - **Collection Type**: Choose "Atlas" or "Relic"
   - **Internal Name**: e.g., "ATLAS-001"
   - **Title**: e.g., "Corsican Driftwood"
   - **Slug**: Auto-generated from title
   - **Main Image**: Upload an image
   - **Price**: e.g., 95
   - **Volume**: e.g., "9ml"
   - **Product Format**: Select from dropdown

5. **If Atlas:**
   - **Atmosphere**: Select territory (Tidal, Ember, Petal, or Terra)
   - **Travel Log**: Write a description (Sensory Lexicon will validate!)
   - **GPS Coordinates**: Optional

6. **If Relic:**
   - **Distillation Year**: e.g., 1998
   - **Origin Region**: e.g., "Trat, Thailand"
   - **Viscosity**: Use the slider (0-100)
   - **Museum Description**: Write curator notes

7. Click **"Publish"**

### Step 2: View on Frontend

1. **Atlas Page**: Visit `http://localhost:3000/atlas`
   - You'll see your products grouped by territory
   - Filter by territory using the buttons
   - Click any product to view details (when product page is created)

2. **Relic Page**: Visit `http://localhost:3000/relic`
   - Products grouped by category
   - Shows viscosity, origin, and museum descriptions

### Step 3: Test the Sensory Lexicon

Try typing generic words in the **Travel Log** or **Museum Description**:
- "smell" → Warning with suggestions
- "nice" → Warning with suggestions
- "strong" → Warning with suggestions

The validation will guide you toward more sophisticated language!

## 📝 Next Steps

### Create Product Detail Pages

Create `src/app/product/[slug]/page.tsx`:

```typescript
import { sanityFetch } from "@/sanity/lib/client";
import { productBySlugQuery } from "@/sanity/lib/queries";
import { urlForImage } from "@/sanity/lib/image";
import Image from "next/image";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await sanityFetch({
    query: productBySlugQuery,
    params: { slug: params.slug },
    tags: [`product-${params.slug}`],
  });

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div>
      <h1>{product.title}</h1>
      {product.mainImage && (
        <Image
          src={urlForImage(product.mainImage).width(800).url()}
          alt={product.title}
          width={800}
          height={800}
        />
      )}
      {/* Render product details */}
    </div>
  );
}
```

### Update Homepage

Update `src/app/page.tsx` to use `featuredProductsQuery`:

```typescript
import { sanityFetch } from "@/sanity/lib/client";
import { featuredProductsQuery } from "@/sanity/lib/queries";

const products = await sanityFetch({
  query: featuredProductsQuery,
  tags: ["featured-products"],
});
```

## 🔍 Debugging

### Check if Data is Loading

1. Open browser DevTools → Network tab
2. Look for requests to `api.sanity.io`
3. Check the response to see if products are returned

### Common Issues

**No products showing?**
- Make sure products are **Published** (not drafts)
- Check `collectionType` is set correctly
- Verify `atlasData.atmosphere` is set for Atlas products

**Images not loading?**
- Ensure images are uploaded in Sanity Studio
- Check `urlForImage()` is working correctly
- Verify image URLs in Network tab

**TypeScript errors?**
- Run `npm run typecheck` to see specific errors
- Check that query return types match your schema

## 🎯 Testing Checklist

- [ ] Create an Atlas product in Sanity Studio
- [ ] Verify it appears on `/atlas` page
- [ ] Create a Relic product in Sanity Studio
- [ ] Verify it appears on `/relic` page
- [ ] Test Sensory Lexicon validation
- [ ] Test image uploads and display
- [ ] Test territory filtering on Atlas page

## 📚 Resources

- [Sanity GROQ Query Cheat Sheet](https://www.sanity.io/docs/groq)
- [Next.js App Router Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [Sanity Image URLs](https://www.sanity.io/docs/image-urls)
