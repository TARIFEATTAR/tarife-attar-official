
import { sanityFetch } from "@/sanity/lib/client";
import { featuredProductsQuery, heroBackgroundsQuery, HeroBackgroundsQueryResult, placeholderImagesQuery, PlaceholderImagesQueryResult } from "@/sanity/lib/queries";
import { Product } from "@/types";
import { HomeClient } from "./HomeClient";

export default async function Home() {
  const [featuredProducts, heroBackgrounds, placeholderImages] = await Promise.all([
    sanityFetch<Product[]>({
      query: featuredProductsQuery
    }),
    sanityFetch<HeroBackgroundsQueryResult>({
      query: heroBackgroundsQuery
    }),
    sanityFetch<PlaceholderImagesQueryResult>({
      query: placeholderImagesQuery
    })
  ]);

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Home Page] Hero Backgrounds fetched:', heroBackgrounds);
  }

  return <HomeClient featuredProducts={featuredProducts} heroBackgrounds={heroBackgrounds} placeholderImages={placeholderImages} />;
}
