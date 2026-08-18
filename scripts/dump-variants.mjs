/**
 * Prints exactly what Shopify reports for every product: the option names, and
 * each variant's options, sellability and stock count.
 *
 * Run from the repo root:
 *
 *   node scripts/dump-variants.mjs
 *
 * Reads the domain and Storefront token from .env.local. Prints neither — the
 * output is safe to paste anywhere.
 *
 * Use it to answer "is the number on the product page the number in Shopify?"
 * without trusting any of the storefront's own code. It talks to the API
 * directly and reports what comes back, including a check for the two things
 * that quietly break variant matching:
 *
 *   1. Options not named "Size" and "Color" — matching keys off those names.
 *   2. Two variants sharing one size+colour — then no lookup can be unique.
 */

import fs from 'node:fs';
import path from 'node:path';

const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.error(`Could not find ${envPath}. Run this from the repo root.`);
  process.exit(1);
}

const env = {};
for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
}

const domain = env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const token = env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN;
const version = env.NEXT_PUBLIC_SHOPIFY_API_VERSION || '2024-01';

if (!domain || !token) {
  console.error('NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN or NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN missing from .env.local');
  process.exit(1);
}

const query = `
query DumpVariants {
  products(first: 20) {
    edges { node {
      handle
      title
      options { name values }
      variants(first: 100) { edges { node {
        title
        availableForSale
        quantityAvailable
        currentlyNotInStock
        selectedOptions { name value }
      } } }
    } }
  }
}`;

const res = await fetch(`https://${domain}/api/${version}/graphql.json`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Shopify-Storefront-Access-Token': token,
  },
  body: JSON.stringify({ query }),
});

if (!res.ok) {
  console.error(`Shopify returned HTTP ${res.status} ${res.statusText}`);
  process.exit(1);
}

const json = await res.json();

if (json.errors) {
  console.error('Shopify returned GraphQL errors:');
  for (const e of json.errors) console.error('  - ' + e.message);
  if (JSON.stringify(json.errors).includes('quantityAvailable')) {
    console.error('\nThat looks like the missing inventory scope. Quantities will read as null.');
  }
  if (!json.data) process.exit(1);
}

console.log(`Store:       ${domain}`);
console.log(`API version: ${version}\n`);

let quantitiesVisible = false;
const problems = [];

for (const { node: p } of json.data.products.edges) {
  console.log('='.repeat(70));
  console.log(`${p.handle}  —  ${p.title}`);

  const optionNames = (p.options ?? []).map((o) => o.name);
  console.log(`  Shopify option names: ${optionNames.map((n) => `"${n}"`).join(', ') || '(none)'}`);

  const lower = optionNames.map((n) => n.trim().toLowerCase());
  const sized = lower.includes('size');
  const coloured = lower.includes('color');
  const onlyDefault = lower.length === 1 && lower[0] === 'title';

  if (!onlyDefault && !sized) {
    problems.push(`${p.handle}: no option named "Size" (found ${optionNames.join(', ') || 'none'})`);
  }
  if (!onlyDefault && !coloured && lower.length > 1) {
    problems.push(`${p.handle}: no option named "Color" (found ${optionNames.join(', ') || 'none'})`);
  }

  const seen = new Map();
  console.log('  Variants:');
  for (const { node: v } of p.variants.edges) {
    const size = v.selectedOptions.find((o) => o.name.trim().toLowerCase() === 'size')?.value ?? '—';
    const color = v.selectedOptions.find((o) => o.name.trim().toLowerCase() === 'color')?.value ?? '—';
    const qty = v.quantityAvailable;
    if (typeof qty === 'number') quantitiesVisible = true;

    const key = `${color.toLowerCase()}|${size.toLowerCase()}`;
    if (seen.has(key)) problems.push(`${p.handle}: two variants share ${color} / ${size}`);
    seen.set(key, true);

    const qtyText = typeof qty === 'number' ? String(qty).padStart(4) : '   ?';
    const flags = [
      v.availableForSale ? 'sellable ' : 'SOLD OUT ',
      v.currentlyNotInStock ? 'backorder' : '         ',
    ].join(' ');
    console.log(`    color=${color.padEnd(12)} size=${size.padEnd(6)} qty=${qtyText}  ${flags}  (${v.title})`);
  }
  console.log();
}

console.log('='.repeat(70));
console.log(quantitiesVisible
  ? 'Inventory quantities ARE readable — the scope is live.'
  : 'Inventory quantities are NOT readable (all "?"). The token is missing the\n`unauthenticated_read_product_inventory` scope.');

if (problems.length) {
  console.log('\nPROBLEMS FOUND — these break variant matching:');
  for (const p of [...new Set(problems)]) console.log('  ! ' + p);
} else {
  console.log('\nNo option-naming or duplicate-variant problems found.');
}

console.log('\nWhat to check: pick a size on the product page and confirm the number it');
console.log('shows matches the qty above for that SAME colour + size. The storefront');
console.log('shows stock per colourway, not totalled across colourways.');
