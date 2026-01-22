import { sanityFetch } from "@/sanity/lib/client";
import { productBySlugQuery } from "@/sanity/lib/queries";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "./ProductDetailClient";

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await sanityFetch<unknown>({
    query: productBySlugQuery,
    params: { slug: params.slug },
    tags: [`product-${params.slug}`],
    revalidate: 0, // Always fetch fresh data
  });

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
