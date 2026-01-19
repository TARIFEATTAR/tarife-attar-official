/**
 * Gather Fragrance Notes from Shopify + Sanity
 * 
 * Creates a consolidated report of all products with:
 * - Current name (Atlas rebrand)
 * - Legacy name (for matching with Etsy)
 * - Shopify description (may contain notes)
 * - Current notes in Sanity (if any)
 * 
 * Usage:
 *   node scripts/gather-fragrance-notes.mjs
 */

import { createClient } from '@sanity/client';

const sanityClient = createClient({
  projectId: '8h5l91ut',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

// Shopify Storefront API
const SHOPIFY_STORE = 'vasana-perfumes.myshopify.com';
const SHOPIFY_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

async function fetchShopifyProducts() {
  const query = `
    query {
      products(first: 100) {
        edges {
          node {
            id
            title
            handle
            description
            descriptionHtml
            tags
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(`https://${SHOPIFY_STORE}/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_TOKEN,
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();
    return data.data?.products?.edges?.map(e => e.node) || [];
  } catch (error) {
    console.error('Shopify fetch error:', error.message);
    return [];
  }
}

async function fetchSanityProducts() {
  return await sanityClient.fetch(`
    *[_type == "product"] | order(title asc) {
      _id,
      title,
      internalName,
      legacyName,
      collectionType,
      "territory": atlasData.atmosphere,
      sku,
      notes,
      scentProfile,
      inspiredBy,
      shopifyHandle,
      "shopifyDescription": store.descriptionHtml
    }
  `);
}

// Try to extract notes from description text
function extractNotesFromDescription(description) {
  if (!description) return null;
  
  const notes = {
    top: [],
    heart: [],
    base: [],
    raw: null
  };
  
  const text = description.toLowerCase();
  
  // Common patterns for notes
  const topPatterns = [
    /top\s*notes?\s*[:\-–]\s*([^\.]+)/i,
    /opening\s*[:\-–]\s*([^\.]+)/i,
  ];
  
  const heartPatterns = [
    /heart\s*notes?\s*[:\-–]\s*([^\.]+)/i,
    /middle\s*notes?\s*[:\-–]\s*([^\.]+)/i,
  ];
  
  const basePatterns = [
    /base\s*notes?\s*[:\-–]\s*([^\.]+)/i,
    /dry\s*down\s*[:\-–]\s*([^\.]+)/i,
  ];
  
  for (const pattern of topPatterns) {
    const match = description.match(pattern);
    if (match) {
      notes.top = match[1].split(/[,&]/).map(n => n.trim()).filter(Boolean);
      break;
    }
  }
  
  for (const pattern of heartPatterns) {
    const match = description.match(pattern);
    if (match) {
      notes.heart = match[1].split(/[,&]/).map(n => n.trim()).filter(Boolean);
      break;
    }
  }
  
  for (const pattern of basePatterns) {
    const match = description.match(pattern);
    if (match) {
      notes.base = match[1].split(/[,&]/).map(n => n.trim()).filter(Boolean);
      break;
    }
  }
  
  // If we found any notes, return them
  if (notes.top.length || notes.heart.length || notes.base.length) {
    return notes;
  }
  
  // Otherwise, look for any ingredient-like words
  const ingredients = description.match(/\b(oud|rose|saffron|amber|musk|sandalwood|jasmine|vanilla|bergamot|cedar|vetiver|patchouli|frankincense|myrrh|honey|tobacco|leather|iris|violet|tuberose|gardenia|neroli|orange blossom|ylang|lavender|geranium|cardamom|cinnamon|clove|nutmeg|pepper|ginger|incense|agarwood|benzoin|labdanum|tonka|coumarin|heliotrope|orris)\b/gi);
  
  if (ingredients && ingredients.length > 0) {
    notes.raw = [...new Set(ingredients.map(i => i.toLowerCase()))];
    return notes;
  }
  
  return null;
}

async function main() {
  console.log('\n🔍 GATHERING FRAGRANCE NOTES\n');
  console.log('═'.repeat(70));
  
  // Fetch data
  console.log('\nFetching from Shopify...');
  const shopifyProducts = await fetchShopifyProducts();
  console.log(`  Found ${shopifyProducts.length} Shopify products`);
  
  console.log('\nFetching from Sanity...');
  const sanityProducts = await fetchSanityProducts();
  console.log(`  Found ${sanityProducts.length} Sanity products`);
  
  // Create lookup by handle
  const shopifyByHandle = {};
  for (const p of shopifyProducts) {
    shopifyByHandle[p.handle] = p;
  }
  
  // Separate by collection
  const atlasProducts = sanityProducts.filter(p => p.collectionType === 'atlas');
  const relicProducts = sanityProducts.filter(p => p.collectionType === 'relic');
  
  console.log('\n');
  console.log('═'.repeat(70));
  console.log('\n🗺️  ATLAS COLLECTION (Journey Fragrances)\n');
  console.log('═'.repeat(70));
  
  for (const product of atlasProducts) {
    const shopify = shopifyByHandle[product.shopifyHandle] || {};
    const hasNotes = product.notes?.top?.length || product.notes?.heart?.length || product.notes?.base?.length;
    const extractedNotes = extractNotesFromDescription(shopify.description || product.shopifyDescription);
    
    console.log(`\n┌─ ${product.title || 'UNNAMED'}`);
    console.log(`│  SKU: ${product.sku || 'N/A'}`);
    console.log(`│  Territory: ${product.territory || 'N/A'}`);
    
    if (product.legacyName) {
      console.log(`│  Legacy Name: "${product.legacyName}" ← Search Etsy for this`);
    }
    
    if (product.scentProfile) {
      console.log(`│  Scent Profile: ${product.scentProfile}`);
    }
    
    if (product.inspiredBy) {
      console.log(`│  Inspired By: ${product.inspiredBy}`);
    }
    
    console.log(`│`);
    
    if (hasNotes) {
      console.log(`│  ✅ NOTES IN SANITY:`);
      if (product.notes.top?.length) console.log(`│     Top: ${product.notes.top.join(', ')}`);
      if (product.notes.heart?.length) console.log(`│     Heart: ${product.notes.heart.join(', ')}`);
      if (product.notes.base?.length) console.log(`│     Base: ${product.notes.base.join(', ')}`);
    } else if (extractedNotes) {
      console.log(`│  📝 EXTRACTED FROM SHOPIFY:`);
      if (extractedNotes.top?.length) console.log(`│     Top: ${extractedNotes.top.join(', ')}`);
      if (extractedNotes.heart?.length) console.log(`│     Heart: ${extractedNotes.heart.join(', ')}`);
      if (extractedNotes.base?.length) console.log(`│     Base: ${extractedNotes.base.join(', ')}`);
      if (extractedNotes.raw?.length) console.log(`│     Detected ingredients: ${extractedNotes.raw.join(', ')}`);
    } else {
      console.log(`│  ❌ NO NOTES FOUND - Need to add manually`);
    }
    
    if (shopify.description) {
      const shortDesc = shopify.description.substring(0, 150).replace(/\n/g, ' ');
      console.log(`│`);
      console.log(`│  Shopify Description: "${shortDesc}..."`);
    }
    
    console.log(`└${'─'.repeat(68)}`);
  }
  
  console.log('\n\n');
  console.log('═'.repeat(70));
  console.log('\n🏛️  RELIC COLLECTION (Pure Materials)\n');
  console.log('═'.repeat(70));
  
  for (const product of relicProducts) {
    const shopify = shopifyByHandle[product.shopifyHandle] || {};
    const hasNotes = product.notes?.top?.length || product.notes?.heart?.length || product.notes?.base?.length;
    
    console.log(`\n┌─ ${product.title || 'UNNAMED'}`);
    console.log(`│  SKU: ${product.sku || 'N/A'}`);
    
    if (product.legacyName) {
      console.log(`│  Legacy Name: "${product.legacyName}" ← Search Etsy for this`);
    }
    
    if (hasNotes) {
      console.log(`│  ✅ NOTES IN SANITY:`);
      if (product.notes.top?.length) console.log(`│     Top: ${product.notes.top.join(', ')}`);
      if (product.notes.heart?.length) console.log(`│     Heart: ${product.notes.heart.join(', ')}`);
      if (product.notes.base?.length) console.log(`│     Base: ${product.notes.base.join(', ')}`);
    } else {
      console.log(`│  ❌ NO NOTES - Relic products may have single-note profiles`);
    }
    
    console.log(`└${'─'.repeat(68)}`);
  }
  
  // Summary
  const atlasWithNotes = atlasProducts.filter(p => p.notes?.top?.length || p.notes?.heart?.length || p.notes?.base?.length).length;
  const relicWithNotes = relicProducts.filter(p => p.notes?.top?.length || p.notes?.heart?.length || p.notes?.base?.length).length;
  
  console.log('\n\n');
  console.log('═'.repeat(70));
  console.log('\n📊 SUMMARY\n');
  console.log('═'.repeat(70));
  console.log(`\n  Atlas Products: ${atlasProducts.length} total, ${atlasWithNotes} with notes, ${atlasProducts.length - atlasWithNotes} need notes`);
  console.log(`  Relic Products: ${relicProducts.length} total, ${relicWithNotes} with notes`);
  console.log(`\n  Products with Legacy Names (search Etsy for these):`);
  
  const withLegacy = sanityProducts.filter(p => p.legacyName);
  for (const p of withLegacy) {
    console.log(`    • ${p.title} ← "${p.legacyName}"`);
  }
  
  console.log('\n\n📋 NEXT STEPS:');
  console.log('  1. Search Etsy listings for legacy names shown above');
  console.log('  2. Copy fragrance notes from those listings');
  console.log('  3. We can then bulk-import them into Sanity');
  console.log('\n  💡 TIP: Export this output to a file:');
  console.log('     node scripts/gather-fragrance-notes.mjs > fragrance-notes-report.txt\n');
}

main().catch(console.error);
