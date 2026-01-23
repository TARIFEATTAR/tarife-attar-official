/**
 * Generate Shopify Import CSV for New Products
 * 
 * Creates a CSV file that can be imported into Shopify to create products
 * that exist in Sanity but not in Shopify.
 * 
 * The CSV includes:
 * - Product titles (new names)
 * - SKUs (from Sanity)
 * - Variants (6ml, 12ml for Atlas)
 * - Prices (from Sanity or defaults)
 * - Handles (from Sanity slugs)
 * 
 * Usage:
 *   node scripts/generate-shopify-import-csv.mjs
 * 
 * Then import the CSV in Shopify Admin → Products → Import
 */

// Load environment variables from .env.local
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env.local');

try {
  const envFile = readFileSync(envPath, 'utf-8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match && !match[1].startsWith('#')) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
} catch (error) {
  // .env.local might not exist, that's okay
}

import { createClient } from '@sanity/client';

const client = createClient({
  projectId: '8h5l91ut',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

// Territory pricing (from your pricing structure)
const TERRITORY_PRICING = {
  ember: { '6ml': 28, '12ml': 48 },
  petal: { '6ml': 30, '12ml': 50 },
  tidal: { '6ml': 30, '12ml': 50 },
  terra: { '6ml': 33, '12ml': 55 },
};

// Territory codes
const TERRITORY_MAP = {
  'ember': 'EMBER',
  'petal': 'PETAL',
  'tidal': 'TIDAL',
  'terra': 'TERRA',
};

// Escape CSV field
function escapeCsv(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Convert PortableText blocks to HTML (simple version for CSV)
function portableTextToHtml(blocks) {
  if (!blocks || !Array.isArray(blocks)) return '';
  
  return blocks.map(block => {
    if (block._type === 'block') {
      const text = block.children?.map(child => {
        if (child._type === 'span') {
          let content = child.text || '';
          if (child.marks) {
            child.marks.forEach(mark => {
              if (mark === 'strong' || mark === 'b') {
                content = `<strong>${content}</strong>`;
              } else if (mark === 'em' || mark === 'i') {
                content = `<em>${content}</em>`;
              }
            });
          }
          return content;
        }
        return '';
      }).join('') || '';
      
      if (block.style === 'h2') {
        return `<h2>${text}</h2>`;
      } else if (block.style === 'h3') {
        return `<h3>${text}</h3>`;
      } else if (block.style === 'blockquote') {
        return `<blockquote>${text}</blockquote>`;
      } else {
        return `<p>${text}</p>`;
      }
    }
    return '';
  }).join('');
}

// Build rich HTML description from Sanity product data
function buildRichDescription(product) {
  const parts = [];
  
  // Title + Legacy Name
  const legacyName = product.legacyName && product.showLegacyName 
    ? ` (formerly ${product.legacyName})` 
    : '';
  parts.push(`<p><strong>${product.title}${legacyName}</strong></p>`);
  
  // Evocation Story (Atlas only)
  if (product.collectionType === 'atlas' && product.atlasData?.evocationStory && product.atlasData.evocationStory.length > 0) {
    parts.push('<h3>Evocation</h3>');
    product.atlasData.evocationStory.forEach(paragraph => {
      if (paragraph && paragraph.trim()) {
        parts.push(`<p>${paragraph}</p>`);
      }
    });
  }
  
  // On Skin Story (Atlas only)
  if (product.collectionType === 'atlas' && product.atlasData?.onSkinStory && product.atlasData.onSkinStory.length > 0) {
    parts.push('<h3>On Skin</h3>');
    product.atlasData.onSkinStory.forEach(paragraph => {
      if (paragraph && paragraph.trim()) {
        parts.push(`<p>${paragraph}</p>`);
      }
    });
  }
  
  // Travel Log (Atlas) or Museum Description (Relic)
  if (product.collectionType === 'atlas' && product.atlasData?.travelLog) {
    const travelLogHtml = portableTextToHtml(product.atlasData.travelLog);
    if (travelLogHtml) {
      parts.push('<h3>The Journey</h3>');
      parts.push(travelLogHtml);
    }
  } else if (product.collectionType === 'relic' && product.relicData?.museumDescription) {
    const museumHtml = portableTextToHtml(product.relicData.museumDescription);
    if (museumHtml) {
      parts.push('<h3>Curator\'s Notes</h3>');
      parts.push(museumHtml);
    }
  }
  
  return parts.join('\n');
}

// Generate image URL from Sanity image
function getImageUrl(product) {
  // Priority: shopifyPreviewImageUrl > shopifyImage > mainImage from Sanity
  if (product.shopifyPreviewImageUrl) {
    return product.shopifyPreviewImageUrl;
  }
  
  if (product.shopifyImage) {
    return product.shopifyImage;
  }
  
  // Generate Sanity CDN URL from asset
  if (product.mainImage?.asset) {
    // If we have a direct URL from the asset, use it (with size modification)
    if (product.mainImage.asset.url) {
      const url = product.mainImage.asset.url;
      // Sanity URLs format: https://cdn.sanity.io/images/{project}/{dataset}/{id}-{width}x{height}.{ext}
      // Replace dimensions with 1200x1200 for Shopify
      if (url.includes('-') && url.match(/\d+x\d+/)) {
        return url.replace(/\d+x\d+/, '1200x1200');
      }
      // If no dimensions, try to add them
      const match = url.match(/^(.+)\/([^\/]+)\.([^.]+)$/);
      if (match) {
        const [, base, filename, ext] = match;
        return `${base}/${filename}-1200x1200.${ext}`;
      }
      return url;
    }
    
    // If we have asset ID, construct URL manually
    if (product.mainImage.asset._id) {
      const assetId = product.mainImage.asset._id;
      const projectId = '8h5l91ut';
      const dataset = 'production';
      
      // Sanity asset IDs can be in format: image-{hash} or just {hash}
      // Extract hash (everything after 'image-')
      let hash = assetId.replace(/^image-/, '');
      
      // Remove any existing dimensions from hash (format: hash-widthxheight-ext)
      hash = hash.replace(/-\d+x\d+-[^.]+$/, '');
      hash = hash.replace(/-\d+x\d+$/, '');
      
      // Use 1200x1200 for Shopify product images (good quality)
      return `https://cdn.sanity.io/images/${projectId}/${dataset}/${hash}-1200x1200.jpg`;
    }
  }
  
  return '';
}

async function main() {
  console.log('\n📦 GENERATE SHOPIFY IMPORT CSV\n');
  console.log('═'.repeat(70));
  
  // Fetch all products from Sanity (including images and story content)
  const sanityProducts = await client.fetch(`
    *[_type == "product" && !(_id in path("drafts.**")) && defined(title) && title != ""] {
      _id,
      title,
      "slug": slug.current,
      collectionType,
      "territory": atlasData.atmosphere,
      price,
      sku,
      sku6ml,
      sku12ml,
      inStock,
      "legacyName": legacyName,
      "showLegacyName": showLegacyName,
      atlasData {
        evocationStory,
        onSkinStory,
        travelLog
      },
      relicData {
        museumDescription
      },
      mainImage {
        asset-> {
          _id,
          url,
          _ref,
          metadata {
            dimensions {
              width,
              height
            }
          }
        },
        _type
      },
      "shopifyPreviewImageUrl": shopifyPreviewImageUrl,
      "shopifyImage": store.previewImageUrl
    }
  `);
  
  console.log(`\n📚 Found ${sanityProducts.length} products in Sanity\n`);
  
  // Fetch products from Shopify to see which ones already exist
  const SHOPIFY_STORE = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || 'vasana-perfumes.myshopify.com';
  const SHOPIFY_ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  
  if (!SHOPIFY_ADMIN_TOKEN) {
    console.error('❌ Missing SHOPIFY_ADMIN_ACCESS_TOKEN');
    console.log('   Set it in .env.local to check which products exist in Shopify');
    console.log('   Continuing with CSV generation for all products...\n');
  }
  
  let existingShopifyHandles = new Set();
  
  if (SHOPIFY_ADMIN_TOKEN) {
    try {
      console.log('🛒 Checking existing Shopify products...\n');
      
      const response = await fetch(
        `https://${SHOPIFY_STORE}/admin/api/2024-10/products.json?limit=250`,
        {
          headers: {
            'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        existingShopifyHandles = new Set(data.products.map(p => p.handle));
        console.log(`   Found ${existingShopifyHandles.size} existing products in Shopify\n`);
      }
    } catch (error) {
      console.log(`   ⚠️  Could not fetch Shopify products: ${error.message}`);
      console.log('   Continuing with CSV generation for all products...\n');
    }
  }
  
  // Filter products that don't exist in Shopify
  const newProducts = sanityProducts.filter(p => 
    !existingShopifyHandles.has(p.slug)
  );
  
  console.log(`📝 Products to create in Shopify: ${newProducts.length}`);
  console.log(`✅ Products already in Shopify: ${sanityProducts.length - newProducts.length}\n`);
  
  if (newProducts.length === 0) {
    console.log('✅ All products already exist in Shopify!');
    console.log('   Use sync-skus-to-shopify.mjs to update SKUs instead.\n');
    return;
  }
  
  // Generate CSV rows
  const csvRows = [];
  
  // CSV Header (Shopify product import format)
  csvRows.push([
    'Handle',
    'Title',
    'Body (HTML)',
    'Vendor',
    'Type',
    'Tags',
    'Published',
    'Option1 Name',
    'Option1 Value',
    'Variant SKU',
    'Variant Grams',
    'Variant Inventory Tracker',
    'Variant Inventory Qty',
    'Variant Inventory Policy',
    'Variant Fulfillment Service',
    'Variant Price',
    'Variant Compare At Price',
    'Variant Requires Shipping',
    'Variant Taxable',
    'Variant Barcode',
    'Image Src',
    'Image Position',
    'Image Alt Text',
    'Gift Card',
    'SEO Title',
    'SEO Description',
    'Google Shopping / Google Product Category',
    'Google Shopping / Gender',
    'Google Shopping / Age Group',
    'Google Shopping / MPN',
    'Google Shopping / AdWords Grouping',
    'Google Shopping / AdWords Labels',
    'Google Shopping / Condition',
    'Google Shopping / Custom Product',
    'Google Shopping / Custom Label 0',
    'Google Shopping / Custom Label 1',
    'Google Shopping / Custom Label 2',
    'Google Shopping / Custom Label 3',
    'Google Shopping / Custom Label 4',
    'Variant Image',
    'Variant Weight Unit',
    'Variant Tax Code',
    'Cost per item',
    'Status',
  ].map(escapeCsv).join(','));
  
  // Generate rows for each product
  for (const product of newProducts) {
    const handle = product.slug;
    const title = product.title;
    const legacyName = product.legacyName && product.showLegacyName 
      ? ` (formerly ${product.legacyName})` 
      : '';
    const bodyHtml = buildRichDescription(product); // Rich description with Evocation, On Skin, Travel Log
    const vendor = 'Tarife Attär';
    const productType = product.collectionType === 'atlas' ? 'Atlas Collection' : 'Relic Collection';
    const tags = product.collectionType === 'atlas' 
      ? `Atlas, ${TERRITORY_MAP[product.territory] || 'Atlas'}` 
      : 'Relic';
    const published = product.inStock ? 'TRUE' : 'FALSE';
    const status = published === 'TRUE' ? 'active' : 'draft'; // Status must match Published
    const imageUrl = getImageUrl(product);
    
    // For Atlas products with variants
    if (product.collectionType === 'atlas' && product.sku6ml && product.sku12ml) {
      const territory = product.territory;
      const pricing = territory ? TERRITORY_PRICING[territory] : null;
      
      // 6ml variant
      csvRows.push([
        handle,
        title,
        bodyHtml,
        vendor,
        productType,
        tags,
        published,
        'Size',
        '6ml',
        product.sku6ml || '',
        '',
        'shopify',
        product.inStock ? '1' : '0',
        'deny',
        'manual',
        pricing ? pricing['6ml'].toString() : (product.price || ''),
        '',
        'TRUE',
        'TRUE',
        '',
        imageUrl, // Image Src - from Sanity
        '1',
        title,
        'FALSE',
        title,
        `${title}${legacyName} - ${productType}`,
        '', '', '', '', '', '', '', '', '', '', '', '', '', // Google Shopping columns (13 empty)
        '', // Variant Image
        'g',
        '',
        '',
        status,
      ].map(escapeCsv).join(','));
      
      // 12ml variant
      csvRows.push([
        handle,
        title,
        bodyHtml,
        vendor,
        productType,
        tags,
        published,
        'Size',
        '12ml',
        product.sku12ml || '',
        '',
        'shopify',
        product.inStock ? '1' : '0',
        'deny',
        'manual',
        pricing ? pricing['12ml'].toString() : (product.price || ''),
        '',
        'TRUE',
        'TRUE',
        '',
        imageUrl, // Image Src - from Sanity (same image for both variants)
        '2',
        title,
        'FALSE',
        title,
        `${title}${legacyName} - ${productType}`,
        '', '', '', '', '', '', '', '', '', '', '', '', '', // Google Shopping columns (13 empty)
        '', // Variant Image
        'g',
        '',
        '',
        status,
      ].map(escapeCsv).join(','));
    } else {
      // Single variant (Relic or single-variant Atlas)
      csvRows.push([
        handle,
        title,
        bodyHtml,
        vendor,
        productType,
        tags,
        published,
        '',
        'Default Title',
        product.sku || '',
        '',
        'shopify',
        product.inStock ? '1' : '0',
        'deny',
        'manual',
        product.price || '',
        '',
        'TRUE',
        'TRUE',
        '',
        imageUrl, // Image Src - from Sanity
        '1',
        title,
        'FALSE',
        title,
        `${title}${legacyName} - ${productType}`,
        '', '', '', '', '', '', '', '', '', '', '', '', '', // Google Shopping columns (13 empty)
        '', // Variant Image
        'g',
        '',
        '',
        status,
      ].map(escapeCsv).join(','));
    }
  }
  
  // Write CSV file
  const csvContent = csvRows.join('\n');
  const outputPath = join(__dirname, '..', 'shopify-import-products.csv');
  writeFileSync(outputPath, csvContent, 'utf-8');
  
  console.log('═'.repeat(70));
  console.log('\n✅ CSV FILE GENERATED\n');
  console.log(`   File: ${outputPath}`);
  console.log(`   Products: ${newProducts.length}`);
  console.log(`   Total rows: ${csvRows.length - 1} (including header)\n`);
  
  console.log('📋 NEXT STEPS:\n');
  console.log('   1. Review the CSV file: shopify-import-products.csv');
  console.log('   2. Go to Shopify Admin → Products → Import');
  console.log('   3. Upload the CSV file');
  console.log('   4. Review the import preview');
  console.log('   5. Complete the import');
  console.log('   6. Run: node scripts/sync-skus-to-shopify.mjs');
  console.log('      (This will ensure SKUs match exactly)\n');
  
  console.log('⚠️  IMPORTANT NOTES:\n');
  console.log('   - The CSV includes product titles, SKUs, pricing, and image URLs');
  console.log('   - Images are pulled from Sanity CDN (should import automatically)');
  console.log('   - If images don\'t import, they may need to be uploaded manually');
  console.log('   - After import, verify SKUs and images match Sanity');
  console.log('   - Run sync-skus-to-shopify.mjs to ensure exact match\n');
  
  // Count products with/without images
  const withImages = newProducts.filter(p => getImageUrl(p)).length;
  const withoutImages = newProducts.length - withImages;
  
  if (withoutImages > 0) {
    console.log(`⚠️  ${withoutImages} products without images - these will need manual image upload\n`);
  }
  
  console.log('═'.repeat(70));
  console.log('\n✅ CSV generation complete!\n');
}

main().catch(console.error);
