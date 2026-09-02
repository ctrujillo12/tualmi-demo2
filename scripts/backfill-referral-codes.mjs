#!/usr/bin/env node
/**
 * Give every existing subscriber a referral code and link.
 *
 *   node scripts/backfill-referral-codes.mjs --dry-run   ← always start here
 *   node scripts/backfill-referral-codes.mjs
 *
 * ── WHY THIS IS NEEDED ────────────────────────────────────────────────────
 * Referral codes are issued at signup, by app/api/subscribe/route.ts. Everyone
 * who joined the list before that shipped has no code — which means
 * {{ person.referral_link }} renders as nothing for them, and a campaign
 * announcing the programme would go out with a blank link to your entire list.
 *
 * This walks the Klaviyo list, issues a code for anyone missing one, and
 * writes referral_code / referral_link back onto their Klaviyo profile.
 *
 * Safe to re-run: anyone who already has a code keeps it.
 *
 * ── ON THE DUPLICATED LOGIC ───────────────────────────────────────────────
 * normalizeEmail and the code alphabet are copied from src/lib/referrals.ts
 * rather than imported, because that file is TypeScript and this is a plain
 * script. They must stay in step — if you change how emails are normalised
 * there, change it here too, or the same person can end up with two codes.
 */

import fs from 'node:fs';
import path from 'node:path';

const DRY_RUN = process.argv.includes('--dry-run');

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

const KLAVIYO_KEY = env.KLAVIYO_PRIVATE_KEY || env.KLAVIYO_API_KEY;
const LIST_ID     = env.KLAVIYO_LIST_ID;
const SUPA_URL    = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPA_KEY    = env.SUPABASE_SERVICE_ROLE_KEY;

for (const [name, value] of Object.entries({
  KLAVIYO_PRIVATE_KEY: KLAVIYO_KEY, KLAVIYO_LIST_ID: LIST_ID,
  NEXT_PUBLIC_SUPABASE_URL: SUPA_URL, SUPABASE_SERVICE_ROLE_KEY: SUPA_KEY,
})) {
  if (!value) { console.error(`${name} missing from .env.local`); process.exit(1); }
}

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** MUST match src/lib/referrals.ts. See the note at the top. */
function normalizeEmail(raw) {
  const email = String(raw).trim().toLowerCase();
  const at = email.lastIndexOf('@');
  if (at < 1) return email;
  let local = email.slice(0, at);
  const domain = email.slice(at + 1);
  const plus = local.indexOf('+');
  if (plus > 0) local = local.slice(0, plus);
  if (domain === 'gmail.com' || domain === 'googlemail.com') local = local.replace(/\./g, '');
  return `${local}@${domain}`;
}

const makeCode = () =>
  Array.from({ length: 6 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join('');

async function supa(pathAndQuery, init = {}) {
  const res = await fetch(`${SUPA_URL}/rest/v1/${pathAndQuery}`, {
    ...init,
    headers: {
      apikey: SUPA_KEY,
      Authorization: `Bearer ${SUPA_KEY}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

/** Every profile on the list, following Klaviyo's pagination. */
async function fetchListProfiles() {
  const profiles = [];
  let url = `https://a.klaviyo.com/api/lists/${LIST_ID}/profiles/?page[size]=100`;
  while (url) {
    const res = await fetch(url, {
      headers: { Authorization: `Klaviyo-API-Key ${KLAVIYO_KEY}`, revision: '2024-02-15' },
    });
    if (!res.ok) throw new Error(`Klaviyo ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const json = await res.json();
    for (const p of json.data ?? []) {
      if (p.attributes?.email) profiles.push(p.attributes.email);
    }
    url = json.links?.next ?? null;
    process.stdout.write(`\r  fetched ${profiles.length} profiles…`);
    await sleep(120); // stay well under Klaviyo's read rate limit
  }
  process.stdout.write('\n');
  return profiles;
}

async function main() {
  console.log(DRY_RUN ? 'DRY RUN — nothing will be written.\n' : 'Backfilling referral codes.\n');

  const emails = await fetchListProfiles();
  console.log(`  ${emails.length} subscribers on the list\n`);

  const existing = await supa('referral_codes?select=normalized,code');
  const byNormalized = new Map(existing.map((r) => [r.normalized, r.code]));
  console.log(`  ${byNormalized.size} already have a code\n`);

  let issued = 0, pushed = 0, skipped = 0, failed = 0;

  for (const email of emails) {
    const normalized = normalizeEmail(email);
    let code = byNormalized.get(normalized);

    if (!code) {
      code = makeCode();
      if (DRY_RUN) {
        issued++;
      } else {
        try {
          await supa('referral_codes', {
            method: 'POST',
            headers: { Prefer: 'return=minimal' },
            body: JSON.stringify({ code, email: email.trim().toLowerCase(), normalized }),
          });
          byNormalized.set(normalized, code);
          issued++;
        } catch (err) {
          // Almost always a duplicate: two spellings of one mailbox appearing
          // twice in the list. Re-read rather than guess.
          const found = await supa(
            `referral_codes?select=code&normalized=eq.${encodeURIComponent(normalized)}`,
          ).catch(() => null);
          if (found?.[0]?.code) { code = found[0].code; skipped++; }
          else { console.error(`\n  ! ${email}: ${err.message}`); failed++; continue; }
        }
      }
    } else {
      skipped++;
    }

    if (!DRY_RUN) {
      try {
        const res = await fetch('https://a.klaviyo.com/api/profile-import/', {
          method: 'POST',
          headers: {
            Authorization: `Klaviyo-API-Key ${KLAVIYO_KEY}`,
            'Content-Type': 'application/json',
            revision: '2024-02-15',
          },
          body: JSON.stringify({
            data: {
              type: 'profile',
              attributes: {
                email,
                properties: {
                  referral_code: code,
                  referral_link: `https://tualmi.com/invite?ref=${code}`,
                },
              },
            },
          }),
        });
        if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 150)}`);
        pushed++;
      } catch (err) {
        console.error(`\n  ! could not update ${email}: ${err.message}`);
        failed++;
      }
      await sleep(120); // Klaviyo profile writes are rate limited
    }

    process.stdout.write(`\r  processed ${issued + skipped}/${emails.length}…`);
  }

  console.log('\n');
  console.log(`  codes issued : ${issued}`);
  console.log(`  already had  : ${skipped}`);
  if (!DRY_RUN) console.log(`  profiles updated in Klaviyo: ${pushed}`);
  if (failed) console.log(`  FAILED       : ${failed}  (re-run — it is safe)`);
  if (DRY_RUN) console.log('\nRe-run without --dry-run to apply.');
  else console.log('\nDone. {{ person.referral_link }} now resolves for everyone above.');
}

main().catch((err) => { console.error('\n', err); process.exit(1); });
