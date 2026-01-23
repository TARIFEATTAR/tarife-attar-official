import { sanityFetch } from "@/sanity/lib/client";
import { productBySlugQuery, placeholderImagesQuery, PlaceholderImagesQueryResult } from "@/sanity/lib/queries";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "./ProductDetailClient";

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const [product, placeholderImages] = await Promise.all([
    sanityFetch<any>({
      query: productBySlugQuery,
      params: { slug: params.slug },
      tags: [`product-${params.slug}`],
      revalidate: 0, // Always fetch fresh data
    }),
    sanityFetch<PlaceholderImagesQueryResult>({
      query: placeholderImagesQuery,
      tags: ["placeholder-images"],
      revalidate: 0,
    })
  ]);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product as any} placeholderImages={placeholderImages} />;
}
