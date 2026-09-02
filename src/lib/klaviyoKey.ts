/**
 * The one Klaviyo private API key, read in one place.
 *
 * ── WHY THIS FILE EXISTS ─────────────────────────────────────────────────
 * Three server routes talk to Klaviyo — reviews, returns and newsletter
 * signups — and they used to read the same credential under two different
 * names: KLAVIYO_PRIVATE_KEY in one, KLAVIYO_API_KEY in the others. Nothing
 * enforced that the two held the same value, so they drifted: one was updated
 * and the other wasn't, and the routes reading the stale name started failing
 * with 401s that nobody saw, because each failure only surfaced to the one
 * customer who hit that form.
 *
 * One credential should have one name. KLAVIYO_PRIVATE_KEY is that name.
 *
 * KLAVIYO_API_KEY is still read as a fallback so nothing breaks between
 * deploying this and updating the environment. Once KLAVIYO_PRIVATE_KEY is set
 * in Vercel and a review, a return and a signup have each gone through, delete
 * KLAVIYO_API_KEY from Vercel and from .env.local, and then delete this
 * fallback line.
 *
 * Server-only — never import this into a client component. It is deliberately
 * separate from lib/klaviyo.ts, which runs in the browser and must never see
 * a private key.
 */
export function klaviyoPrivateKey(): string | undefined {
  return process.env.KLAVIYO_PRIVATE_KEY || process.env.KLAVIYO_API_KEY;
}

/** Names the missing variable in logs, so a 401 isn't a guessing game. */
export const KLAVIYO_KEY_HINT =
  'Set KLAVIYO_PRIVATE_KEY in Vercel (Settings → Environment Variables) and redeploy — ' +
  'env changes only apply to new builds.';
