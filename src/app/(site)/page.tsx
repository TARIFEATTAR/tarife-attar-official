
import { sanityFetch } from "@/sanity/lib/client";
import { featuredProductsQuery, heroBackgroundsQuery, HeroBackgroundsQueryResult, placeholderImagesQuery, PlaceholderImagesQueryResult } from "@/sanity/lib/queries";
import { Product } from "@/types";
import { HomeClient } from "./HomeClient";

export default async function Home() {
  const [featuredProducts, heroBackgrounds, placeholderImages] = await Promise.all([
    sanityFetch<Product[]>({
      query: featuredProductsQuery,
      tags: ['featured-products'],
      revalidate: 0, // Always fetch fresh, rely on webhook for revalidation
    }),
    sanityFetch<HeroBackgroundsQueryResult>({
      query: heroBackgroundsQuery,
      tags: ['hero-backgrounds'],
      revalidate: 0, // Always fetch fresh, rely on webhook for revalidation
    }),
    sanityFetch<PlaceholderImagesQueryResult>({
      query: placeholderImagesQuery,
      tags: ['placeholder-images'],
      revalidate: 0,
    })
  ]);

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Home Page] Hero Backgrounds fetched:', heroBackgrounds);
  }

  return <HomeClient featuredProducts={featuredProducts} heroBackgrounds={heroBackgrounds} placeholderImages={placeholderImages} />;
}
