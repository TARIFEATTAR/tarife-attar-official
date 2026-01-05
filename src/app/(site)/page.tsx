
import { sanityFetch } from "@/sanity/lib/client";
import { featuredProductsQuery } from "@/sanity/lib/queries";
import { Product } from "@/types";
import { HomeClient } from "./HomeClient";

export default async function Home() {
  const featuredProducts = await sanityFetch<Product[]>({
    query: featuredProductsQuery
  });

  return <HomeClient featuredProducts={featuredProducts} />;
}
