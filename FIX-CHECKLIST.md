# Fix checklist

No KV, no database. **Klaviyo is the only place the data goes.**
Do these in order — Step 1 is the one that actually fixes things.

---

## Step 1. Add your Klaviyo key to Vercel

This is the root cause. Your `KLAVIYO_API_KEY` exists on your computer
(`.env.local`) but is **not** in Vercel — so the live site has no key, and every
form submission has been going nowhere.

### 1a. Get a key from Klaviyo

1. Go to **klaviyo.com** → click your account name (bottom left) → **Settings**
2. Click the **API keys** tab
3. Click **Create Private API Key**
4. Name it `tualmi-website`
5. Choose **Full Access**
6. **Copy the key now** — Klaviyo only shows it once

You also need your list ID:

1. Klaviyo → **Audience** → **Lists & Segments**
2. Click your main list
3. The ID is in the browser address bar, and under **Settings** for that list.
   It's a short code like `XyZ123`

### 1b. Put both into Vercel

1. Go to **vercel.com** → your project → **Settings** → **Environment Variables**
2. Click **Add New**
   - Name: `KLAVIYO_API_KEY`
   - Value: the key you copied
   - Environments: check **all three** (Production, Preview, Development)
   - **Save**
3. Click **Add New** again
   - Name: `KLAVIYO_LIST_ID`
   - Value: your list ID
   - Environments: all three
   - **Save**

### 1c. Redeploy

Environment variables only take effect on a new deployment.

1. Vercel → **Deployments** tab
2. Click the **⋯** menu on the most recent one → **Redeploy**

---

## Step 2. Push the code changes

In a terminal, in your project folder:

```
git add src/app/api/returns/route.ts src/app/api/subscribe/route.ts src/app/layout.tsx src/app/invite/page.tsx src/app/footer-pages/shipping/page.tsx src/components/Footer.tsx src/components/PhoneOptIn.tsx src/lib/attribution.ts src/components/AttributionTracker.tsx FIX-CHECKLIST.md

git commit -m "Fail loudly on Klaviyo errors, add GA4 + attribution, update shipping"

git push
```

Your project has ~40 other uncommitted files from earlier work — the command
above deliberately commits only what we changed. Run `git status` first if you
want to see the rest.

If git complains about `index.lock`, delete the file
`.git/index.lock` in your project folder and try again.

Vercel deploys automatically on push (~2 min).

---

## Step 3. Test it

1. Go to **tualmi.com/footer-pages/exchanges**
2. Fill it in with your own email, order number `TEST-001`
3. Submit

**If you see "got it — thank you!"** → it worked. Confirm in Klaviyo:
Analytics → Metrics → **"Return or Exchange Request"**. Your test is there.

**If you see an error asking you to email us** → it failed, and that's the new
behavior working correctly. Go to Vercel → Logs, search `[returns]`, and the
error plus the full submission will be there. Send me what it says.

---

## Step 4. Get notified when someone submits

Nothing emails you when a request comes in. Set this up once:

1. Klaviyo → **Flows** → **Create Flow** → **Create From Scratch**
2. Name it `Return request alert`
3. Trigger: **Metric** → **Return or Exchange Request**
4. Add an **Email** action
5. Recipient: your own address
6. Body — paste these tags so the email contains the details:

   ```
   Order: {{ event.order_number }}
   Type: {{ event.request_type }}
   Item: {{ event.item }}
   Has size: {{ event.size_have }}
   Wants size: {{ event.size_want }}
   Reason: {{ event.reason }}
   ```

7. Set the flow **Live**

Only works after Step 1 — the metric has to exist before you can trigger on it.

---

## Step 5. Check whether you've been losing newsletter signups too

The signup forms had the same flaw: no key meant the email was dropped while
the visitor still saw "you're in."

1. Klaviyo → **Audience** → **Profiles**
2. Sort by newest
3. Do the numbers look right for your traffic since launch?

If it's emptier than expected, those signups are gone — the same root cause.
Nothing to recover, but it's fixed going forward, and failures now log the
email address so you'd at least see who was affected.

---

## Step 6. The customer from today

Her submission is unrecoverable — the logs expired. Reach out and ask her to
resubmit once Step 3 passes:

> Hi! So sorry — our returns form had a technical problem and your request
> didn't reach us. Would you mind resubmitting at
> tualmi.com/footer-pages/exchanges? It's fixed now. Really sorry for the hassle.

---

## About those "Needs Attention" KV variables

Ignore them. They're leftovers from an Upstash database that was set up in March
and never used by any code. Nothing in your site reads them.

You can delete `KV_REST_API_TOKEN`, `KV_REST_API_READ_ONLY_TOKEN`, `KV_URL`, and
`REDIS_URL` from Vercel if you want a tidier list. They're not causing the
problem and they're not part of the fix.

---

## Later, whenever

- **Google Analytics**: the tag deploys with Step 2. Verify at
  analytics.google.com → Reports → **Realtime**, with your site open in another
  tab. You should show up within ~30 seconds.
- Footer copyright says `@ 2026, tualmi` — should be `©`
- `KLAVIYO_PRIVATE_KEY` in `.env.local` is an unused duplicate — safe to delete

---

## What the code does now

| File | Change |
|---|---|
| `api/returns/route.ts` | Klaviyo is the only destination. On **any** failure it logs the full submission and returns an error, so the form tells the customer to email you. It can no longer show a fake success. |
| `api/subscribe/route.ts` | Failures now log the email address, so lost signups are traceable. Also stores UTM/referrer on the profile. |
| `lib/attribution.ts` *(new)* | Records where a visitor came from on first page load |
| `components/AttributionTracker.tsx` *(new)* | Runs that capture site-wide |
| `app/layout.tsx` | Google Analytics tag + attribution tracker |
| `app/invite/page.tsx` | Signup is 2 steps instead of 3 |
| `footer-pages/shipping/page.tsx` | International shipping, rates, duties |
