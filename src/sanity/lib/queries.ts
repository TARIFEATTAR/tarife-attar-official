import { groq } from "next-sanity";

// ===== ATLAS QUERIES (The Voyage) =====

/**
 * Get all Atlas products grouped by territory
 * Note: Only returns PUBLISHED products (not drafts)
 * Make sure to click "Publish" in Sanity Studio!
 */
export const atlasProductsByTerritoryQuery = groq`
  *[_type == "product" && collectionType == "atlas" && !(_id in path("drafts.**"))] | order(title asc) {
    _id,
    "title": coalesce(title, store.title),
    "slug": coalesce(slug, store.slug),
    legacyName,
    showLegacyName,
    legacyNameStyle,
    scentProfile,
    internalName,
    "price": coalesce(price, store.priceRange.minVariantPrice),
    volume,
    productFormat,
    mainImage,
    shopifyPreviewImageUrl,
    "shopifyImage": store.previewImageUrl,
    inStock,
    "atmosphere": atlasData.atmosphere,
    "gpsCoordinates": atlasData.gpsCoordinates,
    "travelLog": atlasData.travelLog,
    "fieldReport": atlasData.fieldReport {
      image,
      hotspots[] {
        product-> {
          _id,
          title,
          slug
        },
        x,
        y,
        note
      }
    },
    notes,
    perfumer,
    year
  }
`;

/**
 * Get Atlas products filtered by territory
 */
export const atlasProductsByTerritoryFilterQuery = groq`
  *[_type == "product" && collectionType == "atlas" && atlasData.atmosphere == $territory] | order(title asc) {
    _id,
    "title": coalesce(title, store.title),
    "slug": coalesce(slug, store.slug),
    legacyName,
    showLegacyName,
    legacyNameStyle,
    internalName,
    "price": coalesce(price, store.priceRange.minVariantPrice),
    volume,
    productFormat,
    mainImage,
    inStock,
    "atmosphere": atlasData.atmosphere,
    "gpsCoordinates": atlasData.gpsCoordinates,
    "travelLog": atlasData.travelLog,
    "fieldReport": atlasData.fieldReport,
    notes,
    perfumer,
    year
  }
`;

/**
 * Get territory counts for Atlas
 * Note: Only counts PUBLISHED products
 */
export const atlasTerritoryCountsQuery = groq`
  {
    "tidal": count(*[_type == "product" && collectionType == "atlas" && !(_id in path("drafts.**")) && atlasData.atmosphere == "tidal"]),
    "ember": count(*[_type == "product" && collectionType == "atlas" && !(_id in path("drafts.**")) && atlasData.atmosphere == "ember"]),
    "petal": count(*[_type == "product" && collectionType == "atlas" && !(_id in path("drafts.**")) && atlasData.atmosphere == "petal"]),
    "terra": count(*[_type == "product" && collectionType == "atlas" && !(_id in path("drafts.**")) && atlasData.atmosphere == "terra"])
  }
`;

// ===== RELIC QUERIES (The Vault) =====

/**
 * Get all Relic products
 * Note: Only returns PUBLISHED products (not drafts)
 * Make sure to click "Publish" in Sanity Studio!
 */
export const relicProductsQuery = groq`
  *[_type == "product" && collectionType == "relic" && !(_id in path("drafts.**"))] | order(title asc) {
    _id,
    "title": coalesce(title, store.title),
    "slug": coalesce(slug, store.slug),
    legacyName,
    showLegacyName,
    legacyNameStyle,
    internalName,
    "price": coalesce(price, store.priceRange.minVariantPrice),
    volume,
    productFormat,
    mainImage,
    inStock,
    "distillationYear": relicData.distillationYear,
    "originRegion": relicData.originRegion,
    "gpsCoordinates": relicData.gpsCoordinates,
    "viscosity": relicData.viscosity,
    "museumDescription": relicData.museumDescription,
    "museumExhibit": relicData.museumExhibit {
      exhibitImage,
      artifacts[] {
        label,
        specimenData
      }
    },
    notes,
    perfumer,
    year
  }
`;

/**
 * Get Relic products by category (Pure Oud, Aged Resins, Rare Attars)
 */
export const relicProductsByCategoryQuery = groq`
  *[_type == "product" && collectionType == "relic" && productFormat == $format] | order(title asc) {
    _id,
    "title": coalesce(title, store.title),
    "slug": coalesce(slug, store.slug),
    legacyName,
    showLegacyName,
    legacyNameStyle,
    internalName,
    "price": coalesce(price, store.priceRange.minVariantPrice),
    volume,
    productFormat,
    mainImage,
    inStock,
    "distillationYear": relicData.distillationYear,
    "originRegion": relicData.originRegion,
    "gpsCoordinates": relicData.gpsCoordinates,
    "viscosity": relicData.viscosity,
    "museumDescription": relicData.museumDescription,
    "museumExhibit": relicData.museumExhibit {
      exhibitImage,
      artifacts[] {
        label,
        specimenData
      }
    },
    notes,
    perfumer,
    year
  }
`;

// ===== PRODUCT DETAIL QUERIES =====

/**
 * Get a single product by slug (works for both Atlas and Relic)
 * Note: Only returns PUBLISHED products (not drafts)
 */
export const productBySlugQuery = groq`
  *[_type == "product" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
    _id,
    "title": coalesce(title, store.title),
    "slug": coalesce(slug, store.slug),
    legacyName,
    showLegacyName,
    legacyNameStyle,
    scentProfile,
    inspiredBy,
    internalName,
    collectionType,
    "price": coalesce(price, store.priceRange.minVariantPrice),
    volume,
    productFormat,
    mainImage,
    gallery,
    inStock,
    "shopifyHandle": store.slug.current,
    "shopifyVariantId": coalesce(shopifyVariantId, store.variants[0].store.gid),
    "shopifyProductId": coalesce(shopifyProductId, store.id),
    scarcityNote,
    relatedProducts[]-> {
      _id,
      "title": coalesce(title, store.title),
      "slug": coalesce(slug, store.slug),
      legacyName,
      showLegacyName,
      legacyNameStyle,
      scentProfile,
      "price": coalesce(price, store.priceRange.minVariantPrice),
      mainImage
    },
    notes,
    perfumer,
    year,
    // Atlas-specific fields
    atlasData {
      atmosphere,
      gpsCoordinates,
      travelLog,
      badges,
      fieldReport {
        image,
        hotspots[] {
          product-> {
            _id,
            title,
            slug
          },
          x,
          y,
          note
        }
      }
    },
    // Relic-specific fields
    relicData {
      distillationYear,
      originRegion,
      gpsCoordinates,
      viscosity,
      museumDescription,
      badges,
      museumExhibit {
        exhibitImage,
        artifacts[] {
          label,
          specimenData
        }
      }
    }
  }
`;

// ===== HOMEPAGE QUERIES =====

/**
 * Get featured products for homepage
 * Note: Only returns PUBLISHED products
 */
export const featuredProductsQuery = groq`
  *[_type == "product" && inStock == true && !(_id in path("drafts.**"))] | order(_createdAt desc) [0...3] {
    _id,
    title,
    slug,
    legacyName,
    showLegacyName,
    legacyNameStyle,
    collectionType,
    price,
    volume,
    productFormat,
    mainImage,
    shopifyPreviewImageUrl,
    "shopifyImage": store.previewImageUrl,
    "atmosphere": atlasData.atmosphere,
    "viscosity": relicData.viscosity,
    "atlasImage": atlasData.fieldReport.image,
    "relicImage": relicData.museumExhibit.exhibitImage
  }
`;

// ===== LEGACY QUERIES (for backward compatibility) =====

export const allProductsQuery = groq`
  *[_type == "product"] | order(_createdAt desc) {
    _id,
    title,
    slug,
    collectionType,
    price,
    volume,
    productFormat,
    mainImage,
    inStock
  }
`;

// Exhibit queries
export const allExhibitsQuery = groq`
  *[_type == "exhibit" && !(_id in path("drafts.**"))] | order(_createdAt desc) {
    _id,
    title,
    slug,
    subtitle,
    internalSku,
    coverImage,
    "excerpt": body[0].children[0].text,
    specimenData {
      binomial,
      origin,
      coordinates,
      harvestStratum,
      viscosity,
      profile
    }
  }
`;

export const exhibitBySlugQuery = groq`
  *[_type == "exhibit" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
    _id,
    title,
    slug,
    subtitle,
    internalSku,
    body,
    coverImage,
    specimenData {
      binomial,
      origin,
      coordinates,
      harvestStratum,
      viscosity,
      profile
    },
    curatorsLog,
    featuredProducts[]-> {
      _id,
      title,
      slug,
      mainImage
    }
  }
`;
