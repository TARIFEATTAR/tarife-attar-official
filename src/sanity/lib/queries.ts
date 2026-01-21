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
    "evocationLocation": atlasData.evocationLocation,
    "evocationStory": atlasData.evocationStory,
    "onSkinStory": atlasData.onSkinStory,
    "audioJourney": atlasData.audioJourney.asset->url,
    "audioOnSkin": atlasData.audioOnSkin.asset->url,
    "displayFieldReportConcept": atlasData.displayFieldReportConcept,
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
    scentProfile,
    inspiredBy,
    internalName,
    collectionType,
    "price": coalesce(price, store.priceRange.minVariantPrice),
    volume,
    productFormat,
    mainImage,
    shopifyPreviewImageUrl,
    "shopifyImage": store.previewImageUrl,
    gallery,
    inStock,
    "shopifyHandle": store.slug.current,
    "shopifyVariantId": coalesce(shopifyVariantId, store.variants[0].store.gid),
    shopifyVariant6mlId,
    shopifyVariant12mlId,
    "shopifyProductId": coalesce(shopifyProductId, store.id),
    scarcityNote,
    relatedProducts[]-> {
      _id,
      "title": coalesce(title, store.title),
      "slug": coalesce(slug, store.slug),
      legacyName,
      showLegacyName,
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
      evocationLocation,
      evocationStory,
      onSkinStory,
      "audioJourney": audioJourney.asset->url,
      "audioOnSkin": audioOnSkin.asset->url,
      displayFieldReportConcept,
      fieldReportConcept {
        concept,
        hotspots[] {
          item,
          meaning
        }
      },
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
 * Note: Only returns PUBLISHED Atlas products with images
 */
export const featuredProductsQuery = groq`
  *[_type == "product" && collectionType == "atlas" && inStock == true && !(_id in path("drafts.**")) && (defined(mainImage) || defined(shopifyPreviewImageUrl) || defined(store.previewImageUrl))] | order(_createdAt desc) [0...3] {
    _id,
    title,
    slug,
    legacyName,
    showLegacyName,
    collectionType,
    price,
    volume,
    productFormat,
    mainImage,
    shopifyPreviewImageUrl,
    "shopifyImage": store.previewImageUrl,
    "atmosphere": atlasData.atmosphere,
    "atlasImage": atlasData.fieldReport.image
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

// ===== JOURNAL QUERIES =====

/**
 * Get all published journal entries
 */
export const allJournalEntriesQuery = groq`
  *[_type == "journalEntry" && !(_id in path("drafts.**"))] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    coverImage,
    author,
    publishedAt,
    category,
    territory,
    featured
  }
`;

/**
 * Get featured journal entries for homepage
 */
export const featuredJournalEntriesQuery = groq`
  *[_type == "journalEntry" && featured == true && !(_id in path("drafts.**"))] | order(publishedAt desc) [0...3] {
    _id,
    title,
    slug,
    excerpt,
    coverImage,
    author,
    publishedAt,
    category,
    territory
  }
`;

/**
 * Get journal entries by category
 */
export const journalEntriesByCategoryQuery = groq`
  *[_type == "journalEntry" && category == $category && !(_id in path("drafts.**"))] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    coverImage,
    author,
    publishedAt,
    category,
    territory,
    featured
  }
`;

/**
 * Get a single journal entry by slug
 */
export const journalEntryBySlugQuery = groq`
  *[_type == "journalEntry" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
    _id,
    title,
    slug,
    excerpt,
    content,
    coverImage,
    author,
    publishedAt,
    category,
    territory,
    seoDescription,
    relatedProducts[]-> {
      _id,
      title,
      slug,
      mainImage,
      "price": coalesce(price, store.priceRange.minVariantPrice),
      collectionType
    }
  }
`;

// ===== FIELD JOURNAL QUERIES (SEO-Rich Editorial Content) =====

/**
 * Get all published Field Journal entries
 */
export const allFieldJournalEntriesQuery = groq`
  *[_type == "fieldJournal" && !(_id in path("drafts.**"))] | order(publishedAt desc) {
    _id,
    title,
    slug,
    subtitle,
    excerpt,
    coverImage,
    author,
    publishedAt,
    category,
    "territory": expeditionData.territory,
    "locationName": expeditionData.locationName,
    "region": expeditionData.region,
    "season": expeditionData.season
  }
`;

/**
 * Get Field Journal entries by territory
 */
export const fieldJournalByTerritoryQuery = groq`
  *[_type == "fieldJournal" && expeditionData.territory == $territory && !(_id in path("drafts.**"))] | order(publishedAt desc) {
    _id,
    title,
    slug,
    subtitle,
    excerpt,
    coverImage,
    author,
    publishedAt,
    category,
    "territory": expeditionData.territory,
    "locationName": expeditionData.locationName
  }
`;

/**
 * Get Field Journal entries by category
 */
export const fieldJournalByCategoryQuery = groq`
  *[_type == "fieldJournal" && category == $category && !(_id in path("drafts.**"))] | order(publishedAt desc) {
    _id,
    title,
    slug,
    subtitle,
    excerpt,
    coverImage,
    author,
    publishedAt,
    category,
    "territory": expeditionData.territory,
    "locationName": expeditionData.locationName
  }
`;

/**
 * Get a single Field Journal entry by slug (with full content for detail page)
 */
export const fieldJournalBySlugQuery = groq`
  *[_type == "fieldJournal" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
    _id,
    title,
    slug,
    subtitle,
    excerpt,
    body,
    coverImage,
    author,
    publishedAt,
    category,
    expeditionData {
      territory,
      locationName,
      gpsCoordinates {
        latitude,
        longitude,
        display
      },
      region,
      season
    },
    seo {
      metaTitle,
      metaDescription,
      ogImage,
      keywords,
      canonicalUrl
    },
    featuredProducts[]-> {
      _id,
      title,
      slug,
      mainImage,
      "price": coalesce(price, store.priceRange.minVariantPrice),
      collectionType,
      "atmosphere": atlasData.atmosphere
    },
    relatedEntries[]-> {
      _id,
      title,
      slug,
      excerpt,
      coverImage,
      "territory": expeditionData.territory
    }
  }
`;

/**
 * Get recent Field Journal entries for sidebar/homepage
 */
export const recentFieldJournalQuery = groq`
  *[_type == "fieldJournal" && !(_id in path("drafts.**"))] | order(publishedAt desc) [0...5] {
    _id,
    title,
    slug,
    "territory": expeditionData.territory,
    publishedAt
  }
`;

// ===== HERO BACKGROUNDS QUERY (Two Roads Landing Page) =====

/**
 * Get hero background textures for the Two Roads entry page
 * This is a singleton document - only one instance exists
 */
export const heroBackgroundsQuery = groq`
  *[_type == "heroBackgrounds"][0] {
    "atlasBackground": atlasBackground.asset->url,
    "atlasHotspot": atlasBackground.hotspot,
    atlasOverlayOpacity,
    "relicBackground": relicBackground.asset->url,
    "relicHotspot": relicBackground.hotspot,
    relicOverlayOpacity
  }
`;

// Type for hero backgrounds query result
export interface HeroBackgroundsQueryResult {
  atlasBackground?: string;
  atlasHotspot?: { x: number; y: number };
  atlasOverlayOpacity?: number;
  relicBackground?: string;
  relicHotspot?: { x: number; y: number };
  relicOverlayOpacity?: number;
}
