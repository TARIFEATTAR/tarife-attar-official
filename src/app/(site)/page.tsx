
import { sanityFetch } from "@/sanity/lib/client";
import { featuredProductsQuery, heroBackgroundsQuery, HeroBackgroundsQueryResult } from "@/sanity/lib/queries";
import { Product } from "@/types";
import { HomeClient } from "./HomeClient";

export default async function Home() {
  const [featuredProducts, heroBackgrounds] = await Promise.all([
    sanityFetch<Product[]>({
      query: featuredProductsQuery
    }),
    sanityFetch<HeroBackgroundsQueryResult>({
      query: heroBackgroundsQuery
    })
  ]);

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Home Page] Hero Backgrounds fetched:', heroBackgrounds);
  }

  return <HomeClient featuredProducts={featuredProducts} heroBackgrounds={heroBackgrounds} />;
}
