#!/usr/bin/env node
/**
 * Load reviews from a CSV into Supabase.
 *
 *   node scripts/import-reviews.mjs reviews.csv
 *   node scripts/import-reviews.mjs reviews.csv --publish
 *
 * To get the CSV out of your Tally responses sheet:
 *   Google Sheets → File → Download → Comma Separated Values (.csv)
 *
 * Everything imports as status = 'pending' unless you pass --publish, so you
 * can read them in the Supabase table editor before any of it is public. That
 * default is deliberate: it is much easier to publish a good review than to
 * un-publish a bad one someone already screenshotted.
 *
 * ── COLUMN NAMES ──────────────────────────────────────────────────────────
 * Matched case-insensitively, ignoring spaces and underscores, so the messy
 * headers a form generates ("What is your height?") can be mapped below rather
 * than cleaned by hand in the sheet.
 *
 * Required:  product, rating, body, name
 * Optional:  title, color, height, usualsize, sizepurchased, email, source,
 *            verified, date
 *
 * Add your real Tally headers to HEADER_ALIASES and re-run — the script tells
 * you which columns it could not place before it writes anything.
 */

import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const HEADER_ALIASES = {
  product:       ['product', 'producthandle', 'item', 'whichproduct', 'whichproductdidyoubuy'],
  rating:        ['rating', 'stars', 'score', 'howwouldyourateit', 'overallrating'],
  title:         ['title', 'headline', 'summary'],
  body:          ['body', 'review', 'comments', 'feedback', 'yourreview', 'tellusmore'],
  name:          ['name', 'authorname', 'firstname', 'yourname'],
  email:         ['email', 'emailaddress'],
  color:         ['color', 'colour', 'colorway', 'whichcolor'],
  height:        ['height', 'howtallareyou', 'yourheight'],
  usualsize:     ['usualsize', 'normalsize', 'whatsizedoyouusuallywear', 'typicalsize'],
  sizepurchased: ['sizepurchased', 'sizebought', 'size', 'whatsizedidyoubuy'],
  source:        ['source'],
  verified:      ['verified', 'verifiedbuyer'],
  date:          ['date', 'submittedat', 'timestamp', 'createdat'],
};

const VALID_SOURCES = ['tally', 'manual', 'gifted', 'email'];

/** Handles quoted fields, embedded commas, embedded newlines and "" escapes. */
function parseCsv(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += ch;
      continue;
    }
    if (ch === '"') { inQuotes = true; continue; }
    if (ch === ',') { row.push(field); field = ''; continue; }
    if (ch === '\r') continue;
    if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; continue; }
    field += ch;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

const normalize = (h) => h.toLowerCase().replace(/[^a-z0-9]/g, '');

function buildColumnMap(headers) {
  const map = {};
  const unmatched = [];
  headers.forEach((header, index) => {
    const key = normalize(header);
    const field = Object.keys(HEADER_ALIASES).find((f) => HEADER_ALIASES[f].includes(key));
    if (field && !(field in map)) map[field] = index;
    else if (!field) unmatched.push(header);
  });
  return { map, unmatched };
}

/** "4", "4/5", "★★★★", "4 stars" → 4 */
function parseRating(raw) {
  if (!raw) return null;
  const stars = (raw.match(/★/g) || []).length;
  if (stars) return stars;
  const n = parseFloat(String(raw).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? Math.round(n) : null;
}

function main() {
  const args = process.argv.slice(2);
  const publish = args.includes('--publish');
  const file = args.find((a) => !a.startsWith('--'));

  if (!file) {
    console.error('Usage: node scripts/import-reviews.mjs <file.csv> [--publish]');
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n' +
      'The service role key is in Supabase → Project Settings → API. It bypasses\n' +
      'row level security, so keep it out of anything prefixed NEXT_PUBLIC_.',
    );
    process.exit(1);
  }

  const rows = parseCsv(readFileSync(file, 'utf8'));
  if (rows.length < 2) { console.error('Nothing in that file but a header row.'); process.exit(1); }

  const [headers, ...dataRows] = rows;
  const { map, unmatched } = buildColumnMap(headers);

  const missing = ['product', 'rating', 'body', 'name'].filter((f) => !(f in map));
  if (missing.length) {
    console.error(`Could not find a column for: ${missing.join(', ')}`);
    console.error(`Headers in the file: ${headers.join(' | ')}`);
    console.error('Add the real header text to HEADER_ALIASES at the top of this script.');
    process.exit(1);
  }
  if (unmatched.length) {
    console.log(`Ignoring unmapped columns: ${unmatched.join(', ')}\n`);
  }

  const at = (row, field) => (map[field] === undefined ? null : (row[map[field]] ?? '').trim() || null);

  const records = [];
  const skipped = [];

  dataRows.forEach((row, i) => {
    const lineNo = i + 2; // 1-indexed, plus the header
    const rating = parseRating(at(row, 'rating'));
    const body = at(row, 'body');
    const product = at(row, 'product');
    const name = at(row, 'name');

    if (!product || !body || !name || rating === null) {
      skipped.push(`line ${lineNo}: missing product, rating, review text or name`);
      return;
    }
    if (rating < 1 || rating > 5) {
      skipped.push(`line ${lineNo}: rating "${at(row, 'rating')}" is not 1–5`);
      return;
    }

    const rawSource = (at(row, 'source') || 'tally').toLowerCase();
    const source = VALID_SOURCES.includes(rawSource) ? rawSource : 'tally';
    if (rawSource !== source) skipped.push(`line ${lineNo}: source "${rawSource}" not recognised, filed as tally`);

    const date = at(row, 'date');
    const parsedDate = date ? new Date(date) : null;

    records.push({
      product_handle: product.toLowerCase().trim(),
      color:          at(row, 'color'),
      rating,
      title:          at(row, 'title'),
      body,
      author_name:    name,
      email:          at(row, 'email'),
      height:         at(row, 'height'),
      usual_size:     at(row, 'usualsize'),
      size_purchased: at(row, 'sizepurchased'),
      source,
      verified:       /^(true|yes|y|1)$/i.test(at(row, 'verified') ?? ''),
      status:         publish ? 'published' : 'pending',
      ...(parsedDate && !Number.isNaN(parsedDate.valueOf())
        ? { created_at: parsedDate.toISOString() }
        : {}),
    });
  });

  if (skipped.length) {
    console.log('Skipped or adjusted:');
    skipped.forEach((s) => console.log(`  ${s}`));
    console.log('');
  }
  if (!records.length) { console.error('Nothing importable in that file.'); process.exit(1); }

  const byProduct = records.reduce((acc, r) => {
    acc[r.product_handle] = (acc[r.product_handle] ?? 0) + 1;
    return acc;
  }, {});
  console.log(`Importing ${records.length} review(s) as ${publish ? 'PUBLISHED' : 'pending'}:`);
  Object.entries(byProduct).forEach(([handle, n]) => console.log(`  ${handle}: ${n}`));
  console.log('');

  createClient(url, key)
    .from('reviews')
    .insert(records)
    .select('id')
    .then(({ data, error }) => {
      if (error) { console.error('Insert failed:', error.message); process.exit(1); }
      console.log(`Done — ${data.length} row(s) written.`);
      if (!publish) {
        console.log('They are pending. Review them in the Supabase table editor and set');
        console.log('status to "published" on the ones you want live.');
      }
      const unknown = Object.keys(byProduct).filter((h) => !['sierra-shorts', 'juniper-pant'].includes(h));
      if (unknown.length) {
        console.log(`\nHeads up — these handles have no product page: ${unknown.join(', ')}`);
        console.log('Reviews filed under them will never render. Expected: sierra-shorts, juniper-pant.');
      }
    });
}

main();
