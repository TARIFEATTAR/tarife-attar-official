import { sanityFetch } from "@/sanity/lib/client";
import {
  atlasProductsByTerritoryQuery,
  atlasTerritoryCountsQuery,
} from "@/sanity/lib/queries";
import { urlForImage } from "@/sanity/lib/image";
import Image from "next/image";
import Link from "next/link";
import { AtlasClient } from "./AtlasClient";

// Territory metadata (static)
const TERRITORIES = [
  {
    id: "tidal",
    name: "Tidal",
    tagline: "Salt. Mist. The pull of open water.",
    description: "Aquatic, fresh, and marine compositions that capture coastal atmospheres and oceanic depths.",
    color: "from-blue-900/20 to-transparent",
  },
  {
    id: "ember",
    name: "Ember",
    tagline: "Spice. Warmth. The intimacy of ancient routes.",
    description: "Warm, gourmand, and spiced oils inspired by the heat of distant markets and caravan trails.",
    color: "from-amber-900/20 to-transparent",
  },
  {
    id: "petal",
    name: "Petal",
    tagline: "Bloom. Herb. The exhale of living gardens.",
    description: "Floral and herbaceous compositions drawn from botanical gardens and wild meadows.",
    color: "from-rose-900/20 to-transparent",
  },
  {
    id: "terra",
    name: "Terra",
    tagline: "Wood. Oud. The gravity of deep forests.",
    description: "Woody and exotic oils grounded in ancient forests, rare ouds, and earthen depths.",
    color: "from-stone-900/20 to-transparent",
  },
];

interface AtlasProduct {
  _id: string;
  title: string;
  slug: { current: string };
  price?: number;
  volume?: string;
  productFormat?: string;
  mainImage?: any;
  atmosphere: string;
  inStock?: boolean;
}

interface TerritoryCounts {
  tidal: number;
  ember: number;
  petal: number;
  terra: number;
}

export default async function AtlasPage() {
  // Fetch all Atlas products (only published, not drafts)
  const products = (await sanityFetch<AtlasProduct[]>({
    query: atlasProductsByTerritoryQuery,
    tags: ["atlas-products"],
    revalidate: 0, // Always fetch fresh data, rely on webhook for revalidation
  })) || [];

  // Fetch territory counts
  const counts = (await sanityFetch<TerritoryCounts>({
    query: atlasTerritoryCountsQuery,
    tags: ["atlas-counts"],
    revalidate: 0, // Always fetch fresh data
  })) || { tidal: 0, ember: 0, petal: 0, terra: 0 };

  // Group products by territory
  const productsByTerritory = TERRITORIES.map((territory) => ({
    ...territory,
    count: counts[territory.id as keyof TerritoryCounts] || 0,
    products: products.filter((p) => p.atmosphere === territory.id),
  }));

  // Products without atmosphere (shouldn't happen, but handle gracefully)
  const productsWithoutTerritory = products.filter((p) => !p.atmosphere || !TERRITORIES.some((t) => t.id === p.atmosphere));

  const totalCount = products.length;

  return <AtlasClient territories={productsByTerritory} totalCount={totalCount} />;
}
