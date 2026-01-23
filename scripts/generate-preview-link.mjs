/**
 * Generate Preview Link for a Shopify Product
 * 
 * Quick script to generate a headless site preview URL for a product.
 * 
 * Usage:
 *   node scripts/generate-preview-link.mjs <shopify-handle>
 *   node scripts/generate-preview-link.mjs dune
 */

// Load environment variables
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadEnvFile(filename) {
  const envPath = join(__dirname, '..', filename);
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
    // File might not exist
  }
}

loadEnvFile('.env');
loadEnvFile('.env.local');

const HEADLESS_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tarifeattar.com';

const handle = process.argv[2];

if (!handle) {
  console.log('\n🔗 GENERATE PREVIEW LINK\n');
  console.log('Usage: node scripts/generate-preview-link.mjs <shopify-handle>');
  console.log('Example: node scripts/generate-preview-link.mjs dune\n');
  process.exit(1);
}

const previewUrl = `${HEADLESS_SITE_URL}/product/${handle}`;

console.log('\n🔗 PREVIEW LINK\n');
console.log('═'.repeat(70));
console.log(`\n   Product Handle: ${handle}`);
console.log(`   Preview URL:     ${previewUrl}\n`);
console.log('═'.repeat(70));
console.log('\n💡 TIP: Copy this URL and open it in a new tab to preview the product on your headless site.\n');
