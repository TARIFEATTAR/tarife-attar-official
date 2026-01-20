/**
 * Pull Fragrance Notes from Shopify
 * 
 * Extracts fragrance notes from Shopify product descriptions and metafields
 * and outputs them in a structured format for Sanity import.
 * 
 * Usage:
 *   node scripts/pull-fragrance-notes.mjs
 */

const SHOPIFY_STORE = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || 'vasana-perfumes.myshopify.com';
const SHOPIFY_ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const SHOPIFY_API_VERSION = '2024-10';

// Common fragrance note keywords to look for
const NOTE_KEYWORDS = {
  top: ['top notes', 'top note', 'opening', 'head notes'],
  heart: ['heart notes', 'heart note', 'middle notes', 'middle note', 'body'],
  base: ['base notes', 'base note', 'dry down', 'drydown', 'bottom notes'],
};

// Known fragrance ingredients
const FRAGRANCE_INGREDIENTS = [
  // Woods
  'oud', 'oudh', 'agarwood', 'sandalwood', 'cedarwood', 'cedar', 'pine', 'vetiver',
  // Florals
  'rose', 'jasmine', 'tuberose', 'lily', 'gardenia', 'lotus', 'violet', 'iris', 'peony',
  // Resins
  'frankincense', 'myrrh', 'amber', 'benzoin', 'labdanum', 'copal',
  // Spices
  'saffron', 'cardamom', 'cinnamon', 'clove', 'nutmeg', 'pepper', 'ginger',
  // Musks
  'musk', 'white musk', 'black musk', 'red musk', 'egyptian musk', 'kashmiri musk',
  // Citrus
  'bergamot', 'lemon', 'orange', 'grapefruit', 'lime', 'mandarin', 'neroli',
  // Other
  'vanilla', 'honey', 'tobacco', 'leather', 'patchouli', 'lavender', 'coconut',
  'peach', 'apricot', 'plum', 'fig', 'date', 'incense',
];

async function shopifyAdmin(query, variables = {}) {
  const response = await fetch(
    `https://${SHOPIFY_STORE}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    }
  );
  
  const json = await response.json();
  if (json.errors) {
    console.error('Shopify API Error:', json.errors);
  }
  return json.data;
}

async function fetchAllProducts() {
  const products = [];
  let cursor = null;
  
  do {
    const query = `
      query GetProducts($cursor: String) {
        products(first: 50, after: $cursor) {
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            id
            title
            handle
            description
            descriptionHtml
            tags
            metafields(first: 20) {
              nodes {
                namespace
                key
                value
              }
            }
          }
        }
      }
    `;
    
    const data = await shopifyAdmin(query, { cursor });
    if (data?.products?.nodes) {
      products.push(...data.products.nodes);
      cursor = data.products.pageInfo.hasNextPage ? data.products.pageInfo.endCursor : null;
    } else {
      break;
    }
  } while (cursor);
  
  return products;
}

function extractNotesFromDescription(description) {
  if (!description) return null;
  
  const notes = { top: [], heart: [], base: [], detected: [] };
  const lowerDesc = description.toLowerCase();
  
  // Try to find structured notes (Top/Heart/Base)
  for (const [noteType, keywords] of Object.entries(NOTE_KEYWORDS)) {
    for (const keyword of keywords) {
      const regex = new RegExp(`${keyword}[:\\s]+([^.\\n]+)`, 'i');
      const match = description.match(regex);
      if (match) {
        const noteText = match[1].trim();
        // Split by commas, &, and, etc.
        const ingredients = noteText.split(/[,&]|\sand\s/i)
          .map(s => s.trim())
          .filter(s => s.length > 0 && s.length < 50);
        notes[noteType] = ingredients;
      }
    }
  }
  
  // Also detect any mentioned ingredients
  for (const ingredient of FRAGRANCE_INGREDIENTS) {
    if (lowerDesc.includes(ingredient.toLowerCase())) {
      if (!notes.detected.includes(ingredient)) {
        notes.detected.push(ingredient);
      }
    }
  }
  
  return notes;
}

function extractNotesFromMetafields(metafields) {
  const notes = { top: [], heart: [], base: [] };
  
  if (!metafields?.nodes) return notes;
  
  for (const mf of metafields.nodes) {
    const key = mf.key?.toLowerCase();
    const value = mf.value;
    
    if (!value) continue;
    
    if (key?.includes('top') || key?.includes('opening')) {
      notes.top = parseNoteValue(value);
    } else if (key?.includes('heart') || key?.includes('middle')) {
      notes.heart = parseNoteValue(value);
    } else if (key?.includes('base') || key?.includes('dry')) {
      notes.base = parseNoteValue(value);
    } else if (key?.includes('note') || key?.includes('ingredient')) {
      // Generic notes field
      const parsed = parseNoteValue(value);
      notes.detected = parsed;
    }
  }
  
  return notes;
}

function parseNoteValue(value) {
  if (!value) return [];
  
  // Try to parse as JSON array
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {
    // Not JSON, continue
  }
  
  // Split by common delimiters
  return value.split(/[,;|]|\sand\s/i)
    .map(s => s.trim())
    .filter(s => s.length > 0 && s.length < 50);
}

async function main() {
  console.log('\n🌸 FRAGRANCE NOTES EXTRACTOR\n');
  console.log('═'.repeat(70));
  
  if (!SHOPIFY_ADMIN_TOKEN) {
    console.error('❌ Missing SHOPIFY_ADMIN_ACCESS_TOKEN');
    process.exit(1);
  }
  
  console.log('\n📦 Fetching products from Shopify...');
  const products = await fetchAllProducts();
  console.log(`   Found ${products.length} products\n`);
  
  const fragranceData = [];
  
  console.log('🔍 Extracting fragrance notes...\n');
  console.log('─'.repeat(70));
  
  for (const product of products) {
    const notesFromDesc = extractNotesFromDescription(product.description || product.descriptionHtml);
    const notesFromMeta = extractNotesFromMetafields(product.metafields);
    
    // Merge notes from both sources
    const notes = {
      top: [...new Set([...(notesFromMeta.top || []), ...(notesFromDesc?.top || [])])],
      heart: [...new Set([...(notesFromMeta.heart || []), ...(notesFromDesc?.heart || [])])],
      base: [...new Set([...(notesFromMeta.base || []), ...(notesFromDesc?.base || [])])],
      detected: notesFromDesc?.detected || [],
    };
    
    const hasNotes = notes.top.length > 0 || notes.heart.length > 0 || 
                     notes.base.length > 0 || notes.detected.length > 0;
    
    if (hasNotes) {
      console.log(`\n📍 ${product.title}`);
      console.log(`   Handle: ${product.handle}`);
      
      if (notes.top.length > 0) {
        console.log(`   🔝 Top: ${notes.top.join(', ')}`);
      }
      if (notes.heart.length > 0) {
        console.log(`   💗 Heart: ${notes.heart.join(', ')}`);
      }
      if (notes.base.length > 0) {
        console.log(`   🌳 Base: ${notes.base.join(', ')}`);
      }
      if (notes.detected.length > 0 && notes.top.length === 0 && notes.heart.length === 0 && notes.base.length === 0) {
        console.log(`   🔍 Detected ingredients: ${notes.detected.join(', ')}`);
      }
      
      fragranceData.push({
        shopifyId: product.id,
        title: product.title,
        handle: product.handle,
        notes: {
          top: notes.top,
          heart: notes.heart,
          base: notes.base,
        },
        detectedIngredients: notes.detected,
        tags: product.tags,
      });
    }
  }
  
  // Summary
  console.log('\n' + '═'.repeat(70));
  console.log('\n📊 SUMMARY\n');
  console.log(`   Products analyzed: ${products.length}`);
  console.log(`   Products with notes: ${fragranceData.length}`);
  console.log(`   Products without notes: ${products.length - fragranceData.length}`);
  
  // Output as JSON for easy import
  console.log('\n' + '─'.repeat(70));
  console.log('\n📁 FRAGRANCE DATA (JSON)\n');
  console.log('Copy this data to use for Sanity import:\n');
  
  // Only output products with actual structured notes
  const structuredNotes = fragranceData.filter(p => 
    p.notes.top.length > 0 || p.notes.heart.length > 0 || p.notes.base.length > 0
  );
  
  if (structuredNotes.length > 0) {
    console.log(JSON.stringify(structuredNotes, null, 2));
  } else {
    console.log('No structured notes (top/heart/base) found in product descriptions.');
    console.log('\nDetected ingredients are listed above for manual categorization.');
  }
  
  // Products that need manual review
  const needsReview = fragranceData.filter(p => 
    p.notes.top.length === 0 && p.notes.heart.length === 0 && p.notes.base.length === 0 && p.detectedIngredients.length > 0
  );
  
  if (needsReview.length > 0) {
    console.log('\n' + '─'.repeat(70));
    console.log('\n⚠️  NEEDS MANUAL REVIEW (has ingredients but no structure):\n');
    for (const p of needsReview) {
      console.log(`   • ${p.title}: ${p.detectedIngredients.join(', ')}`);
    }
  }
  
  console.log('\n');
}

main().catch(console.error);
