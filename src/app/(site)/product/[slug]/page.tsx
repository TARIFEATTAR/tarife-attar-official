import { sanityFetch } from "@/sanity/lib/client";
import { productBySlugQuery } from "@/sanity/lib/queries";
import { urlForImage } from "@/sanity/lib/image";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Plus, Minus, Gift } from "lucide-react";
import { ProductDetailClient } from "./ProductDetailClient";

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await sanityFetch<any>({
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
