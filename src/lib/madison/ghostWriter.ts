/**
 * Madison Studio "Ghost Writer" Client
 * 
 * Utility script allowing internal tools to push content to Sanity.
 * Handles image pipeline, Portable Text conversion, and draft creation.
 */

import { createClient } from '@sanity/client';
import { v4 as uuidv4 } from 'uuid';

// Note: For production, install:
// npm install @sanity/client uuid
// Optional: npm install @portabletext/to-portabletext (for better markdown conversion)

interface MadisonPayload {
  title: string;
  internalName: string;
  collectionType: 'atlas' | 'relic';
  description?: string; // Markdown or HTML
  imageUrl?: string;
  price?: number;
  volume?: string;
  productFormat?: string;
  // Atlas-specific
  atlasData?: {
    atmosphere: 'tidal' | 'ember' | 'petal' | 'terra';
    gpsCoordinates?: string;
    travelLog?: string; // Markdown
  };
  // Relic-specific
  relicData?: {
    distillationYear?: number;
    originRegion?: string;
    viscosity?: number;
    museumDescription?: string; // Markdown
  };
  notes?: {
    top?: string[];
    heart?: string[];
    base?: string[];
  };
}

/**
 * Converts markdown/HTML to Sanity Portable Text blocks
 * Simple implementation - for production, use @portabletext/to-portabletext
 */
function markdownToBlocks(text: string): Array<{ _type: string; children: Array<{ _type: string; text: string }> }> {
  if (!text) return [];

  // Split by paragraphs
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim());

  return paragraphs.map((para) => ({
    _type: 'block',
    style: 'normal',
    children: [
      {
        _type: 'span',
        text: para.trim(),
      },
    ],
    markDefs: [],
  }));
}

/**
 * Fetches an image from a URL and uploads it to Sanity
 */
async function uploadImageFromUrl(
  client: ReturnType<typeof createClient>,
  imageUrl: string
): Promise<string | undefined> {
  try {
    // Fetch the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error(`Failed to fetch image: ${response.statusText}`);
      return undefined;
    }

    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();

    // Upload to Sanity
    const asset = await client.assets.upload('image', Buffer.from(buffer), {
      filename: imageUrl.split('/').pop() || 'image.jpg',
    });

    return asset._id;
  } catch (error) {
    console.error('Error uploading image:', error);
    return undefined;
  }
}

/**
 * Main function to push a draft document to Sanity
 */
export async function pushDraft(data: MadisonPayload): Promise<string> {
  // Initialize Sanity client with write token
  const writeToken = process.env.SANITY_API_WRITE_TOKEN;
  if (!writeToken) {
    throw new Error('SANITY_API_WRITE_TOKEN environment variable is required');
  }

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01';

  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    token: writeToken,
    useCdn: false, // Always use the API for writes
  }) as ReturnType<typeof createClient> & {
    assets: {
      upload: (type: 'image' | 'file', buffer: Buffer, options?: { filename?: string }) => Promise<{ _id: string }>;
    };
  };

  // Generate draft ID
  const draftId = `drafts.${uuidv4()}`;

  // Handle image upload if provided
  let mainImageAssetId: string | undefined;
  if (data.imageUrl) {
    mainImageAssetId = await uploadImageFromUrl(client, data.imageUrl);
  }

  // Build the document
  const document: Record<string, unknown> = {
    _id: draftId,
    _type: 'product',
    generationSource: 'madison-studio',
    collectionType: data.collectionType,
    internalName: data.internalName,
    title: data.title,
    slug: {
      _type: 'slug',
      current: data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    },
    inStock: true,
  };

  // Add main image if uploaded
  if (mainImageAssetId) {
    document.mainImage = {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: mainImageAssetId,
      },
    };
  }

  // Add price and volume
  if (data.price !== undefined) {
    document.price = data.price;
  }
  if (data.volume) {
    document.volume = data.volume;
  }
  if (data.productFormat) {
    document.productFormat = data.productFormat;
  }

  // Add notes
  if (data.notes) {
    document.notes = {
      top: data.notes.top || [],
      heart: data.notes.heart || [],
      base: data.notes.base || [],
    };
  }

  // Add collection-specific data
  if (data.collectionType === 'atlas' && data.atlasData) {
    document.atlasData = {
      atmosphere: data.atlasData.atmosphere,
      gpsCoordinates: data.atlasData.gpsCoordinates,
      travelLog: data.atlasData.travelLog
        ? markdownToBlocks(data.atlasData.travelLog)
        : undefined,
    };
  }

  if (data.collectionType === 'relic' && data.relicData) {
    document.relicData = {
      distillationYear: data.relicData.distillationYear,
      originRegion: data.relicData.originRegion,
      viscosity: data.relicData.viscosity,
      museumDescription: data.relicData.museumDescription
        ? markdownToBlocks(data.relicData.museumDescription)
        : undefined,
    };
  }

  // Add general description if provided
  if (data.description) {
    document.description = markdownToBlocks(data.description);
  }

  // Create the document
  try {
    await client.create(document as any); // Type assertion for document creation
    console.log(`✅ Draft created: ${draftId}`);
    return draftId;
  } catch (error) {
    console.error('Error creating draft:', error);
    throw new Error(`Failed to create draft: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ===== JOURNAL ENTRY SUPPORT =====

interface JournalPayload {
  title: string;
  content: string; // Markdown
  excerpt?: string;
  coverImageUrl?: string;
  author?: string;
  publishedAt?: string; // ISO date string
  category?: 'field-notes' | 'behind-the-blend' | 'territory-spotlight' | 'collector-archives';
  territory?: 'ember' | 'petal' | 'tidal' | 'terra';
  featured?: boolean;
  seoDescription?: string;
  relatedProductSlugs?: string[]; // Slugs of related products
}

/**
 * Push a journal entry draft to Sanity (from Madison Studio)
 */
export async function pushJournalEntry(data: JournalPayload): Promise<string> {
  // Initialize Sanity client with write token
  const writeToken = process.env.SANITY_API_WRITE_TOKEN;
  if (!writeToken) {
    throw new Error('SANITY_API_WRITE_TOKEN environment variable is required');
  }

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01';

  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    token: writeToken,
    useCdn: false,
  }) as ReturnType<typeof createClient> & {
    assets: {
      upload: (type: 'image' | 'file', buffer: Buffer, options?: { filename?: string }) => Promise<{ _id: string }>;
    };
  };

  // Generate draft ID
  const draftId = `drafts.${uuidv4()}`;

  // Handle cover image upload if provided
  let coverImageAssetId: string | undefined;
  if (data.coverImageUrl) {
    coverImageAssetId = await uploadImageFromUrl(client, data.coverImageUrl);
  }

  // Resolve related products by slug
  let relatedProductRefs: Array<{ _type: string; _ref: string; _key: string }> = [];
  if (data.relatedProductSlugs && data.relatedProductSlugs.length > 0) {
    const productQuery = `*[_type == "product" && slug.current in $slugs && !(_id in path("drafts.**"))]{_id, "slug": slug.current}`;
    const products = await client.fetch(productQuery, { slugs: data.relatedProductSlugs });
    relatedProductRefs = products.map((p: { _id: string }, index: number) => ({
      _type: 'reference',
      _ref: p._id,
      _key: `ref-${index}`,
    }));
  }

  // Build the document
  const document: Record<string, unknown> = {
    _id: draftId,
    _type: 'journalEntry',
    generationSource: 'madison-studio',
    title: data.title,
    slug: {
      _type: 'slug',
      current: data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, ''),
    },
    content: markdownToBlocks(data.content),
    publishedAt: data.publishedAt || new Date().toISOString(),
    featured: data.featured || false,
  };

  // Add optional fields
  if (data.excerpt) {
    document.excerpt = data.excerpt;
  }
  if (data.author) {
    document.author = data.author;
  }
  if (data.category) {
    document.category = data.category;
  }
  if (data.territory) {
    document.territory = data.territory;
  }
  if (data.seoDescription) {
    document.seoDescription = data.seoDescription;
  }
  if (relatedProductRefs.length > 0) {
    document.relatedProducts = relatedProductRefs;
  }

  // Add cover image if uploaded
  if (coverImageAssetId) {
    document.coverImage = {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: coverImageAssetId,
      },
    };
  }

  // Create the document
  try {
    await client.create(document as any);
    console.log(`✅ Journal draft created: ${draftId}`);
    return draftId;
  } catch (error) {
    console.error('Error creating journal draft:', error);
    throw new Error(`Failed to create journal draft: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Type exports for external use
 */
export type { MadisonPayload, JournalPayload };
