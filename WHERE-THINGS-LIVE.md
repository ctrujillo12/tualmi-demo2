# Where the images and copy live

A map of the site so you can change things yourself. Paths are from the project
root (`ecommerce-site/`).

---

## Link previews (the photo + text when a link is shared)

This is what shows in Linktree, iMessage, Instagram DMs, WhatsApp.

| What | Where |
|---|---|
| The images themselves | `public/og/` — `home-og.jpg`, `sierra-shorts-og.jpg`, `juniper-pant-og.jpg` |
| Script that builds them | `scripts/make-og-images.py` |
| Homepage preview text | `src/app/layout.tsx` → `openGraph` block |
| Product preview text | `src/app/products/[id]/page.tsx` → `PAGE_METADATA` |

**To change a preview photo:** open `scripts/make-og-images.py`, scroll to the
bottom, and swap the filename (e.g. `model/jam-4.jpg` → whichever photo you
prefer from `public/images-2/`). Then run:

```
python3 scripts/make-og-images.py
```

**To change preview wording:** edit the `title` / `description` inside the
`openGraph` blocks in the two files above. The text baked into the *image* is
set in the script instead.

All three images are 1200x630 and well under 1MB.

---

## Photos

| What | Where |
|---|---|
| Everything | `public/images-2/` — 180 files |
| Product shots by colorway | `public/images-2/model/` — `jam-*`, `picnic-*`, `confetti-*` (shorts), `birch-*`, `olive-*` (pant) |
| Videos | `public/videos/` |
| Which photos show on a product page | `src/lib/productColors.ts` |
| Link-preview images | `public/og/` |

Product page galleries are set per colorway in `productColors.ts` — the order
in each array is the order they appear. Swapping the first entry changes the
lead photo.

Note: product **prices and titles** come from Shopify, not from these files.

---

## Copy, page by page

| Page | File |
|---|---|
| Homepage | `src/app/page.tsx` |
| Our story | `src/app/story/page.tsx` |
| Product pages (fabric, care, fit, size chart) | `src/lib/productDetails.ts` |
| Product page SEO + preview text | `src/app/products/[id]/page.tsx` |
| Scrolling announcement bar | `src/components/AnnouncementBar.tsx` → `MESSAGE` |
| Footer links + "join the club" | `src/components/Footer.tsx` |
| Welcome popup | `src/components/WelcomePopup.tsx` |
| Phone/SMS opt-in wording | `src/components/PhoneOptIn.tsx` |
| Trailblazing club page | `src/app/invite/page.tsx` |
| Site title + description (search results) | `src/app/layout.tsx` |

### Policy pages

All under `src/app/footer-pages/`:

- `shipping/page.tsx`
- `returns/page.tsx`
- `exchanges/page.tsx` — the return/exchange form
- `size-fit/page.tsx`
- `garment-care/page.tsx`
- `privacy/page.tsx`
- `legal/page.tsx` — shows as "terms & conditions"

These all use the same building blocks from `src/components/PolicyPage.tsx`
(`<Section>`, `<P>`, `<Bullets>`, `<DataTable>`), so you can copy the pattern
from one page to another.

---

## Contact email

`hello@tualmi.com` appears in 17 places and is already the only address in the
codebase — verified. If people are still writing to an old address, it's coming
from outside the site: Shopify's order-confirmation sender address, Klaviyo's
campaign reply-to, or a social bio.

---

## Colors and fonts

Brand values are repeated in a few files. The policy pages define theirs at the
top of `src/components/PolicyPage.tsx`:

```
maroon  #A9445C
blush   #FBF1F5
soft    #C9849A
rule    #F0D9E1
```

Fonts load in `src/app/layout.tsx` (Montserrat is the main one).
Global styles: `src/app/globals.css`.

---

## After any change

```
git add .
git commit -m "describe what you changed"
git push
```

Vercel rebuilds automatically, about 2 minutes.

**Link previews are cached by each platform.** After changing an OG image, old
previews may persist for a while. Force a refresh at
[developers.facebook.com/tools/debug](https://developers.facebook.com/tools/debug/)
by pasting the URL and clicking "Scrape Again". iMessage caches hardest —
testing in a new conversation is the reliable way to see a change.
