
import { createClient } from '@sanity/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, ...values] = line.split('=');
        if (key && values.length > 0) {
            const val = values.join('=').trim();
            process.env[key.trim()] = val;
        }
    });
}

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    token: process.env.SANITY_API_WRITE_TOKEN,
    apiVersion: '2024-01-01',
    useCdn: false,
});

async function diagnose() {
    console.log('Fetching all products and territories...');

    const products = await client.fetch(`*[_type == "product"]{
    _id,
    title,
    "slug": slug.current,
    notes,
    atlasData,
    sillage
  }`);

    const territories = await client.fetch(`*[_type == "territory"]{
    _id,
    name
  }`);

    console.log(`\nFound ${territories.length} territories:`);
    territories.forEach(t => console.log(`- ${t.name} (${t._id})`));

    console.log(`\nFound ${products.length} products:`);

    // Group by slug to find duplicates
    const bySlug = {};
    products.forEach(p => {
        const s = p.slug || 'NO_SLUG';
        if (!bySlug[s]) bySlug[s] = [];
        bySlug[s].push(p);
    });

    Object.entries(bySlug).forEach(([slug, items]) => {
        if (items.length > 1) {
            console.log(`\n⚠️ DUPLICATE DETECTED for slug: "${slug}"`);
            items.forEach(p => {
                console.log(`   ID: ${p._id} | Title: ${p.title} | Has Sillage: ${!!p.sillage} | Has AtlasData: ${!!p.atlasData}`);
            });
        } else {
            const p = items[0];
            // console.log(`OK: ${p.title} (${p._id})`);
        }
    });

    console.log('\n--- Duplicate Summary ---');
    const duplicateCount = Object.values(bySlug).filter(arr => arr.length > 1).length;
    console.log(`Total sets of duplicates: ${duplicateCount}`);
}

diagnose().catch(console.error);
