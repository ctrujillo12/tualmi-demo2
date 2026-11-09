# Tualmi GEO audit (Nov 5, 2026)

GEO = getting Tualmi named in answers from ChatGPT, Perplexity, Gemini and Google AI Overviews.

## Where the site already stood

The technical SEO work done for the Merchant Center appeal had already covered most of what a GEO checklist asks for:

- Product pages are server-rendered, with canonicals, per-product titles and OG images.
- `ProductGroup` markup with a variant per colorway, live availability, return policy, shipping and aggregate rating. The rating only appears once there are real reviews (7 on each product).
- Organization markup with a verifiable address, phone and email, all read from one place (`lib/business.ts`).
- A sitemap and robots file. The robots file already allowed OAI-SearchBot.
- Breadcrumbs, and `/collections` as a crawlable shop page.

## What was actually holding it back (fixed in code)

| # | Problem | Fix | File |
|---|---|---|---|
| 1 | **Accordion content wasn't in the HTML.** "Questions we get", fabric composition, size guide and shipping & returns only rendered after a click. A live fetch of /products/juniper-pant showed the headings with no answers. To Google and the AI crawlers, the pant had no FAQ and no fabric spec. | The content is always rendered and hidden with `hidden` when collapsed, plus `aria-expanded`/`aria-controls`. It looks the same to shoppers. | `components/ProductDetailClient.tsx` |
| 2 | Nothing above the fold said what the product *is*. The H1 is "Juniper Pant". | Added a small descriptor line under the H1 ("women's flare cargo hiking pants" / "women's mid-rise hiking shorts"), set in `descriptor` in productDetails. | `ProductDetailClient.tsx`, `lib/productDetails.ts` |
| 3 | Product markup didn't say who the product is for or what it's made of. | `category`, `material` (shell fabric) and `audience: female` added to the group and every variant, all read from productDetails. | `app/products/[id]/page.tsx` |
| 4 | There was no machine-readable Q&A. | `FAQPage` JSON-LD built from the same FAQ the page shows. Sierra had no FAQ, so it got 4 questions. Each answer only restates a claim the page already makes. | `[id]/page.tsx`, `productDetails.ts` |
| 5 | Titles and descriptions left out "women's", sizes and colorways. | New titles: "juniper pant — women's flare cargo hiking pants" and "sierra shorts — women's recycled nylon hiking shorts". Descriptions now include the inseam, sizes and colorways. | `[id]/page.tsx` |
| 6 | **The homepage had hand-typed Product markup that had drifted.** It said Sierra was InStock while Picnic is on preorder. A hand-typed second source for availability is a Misrepresentation risk. | Replaced it with an `ItemList` that points at the product pages, so the product pages are the only source of truth. | `app/page.tsx` |
| 7 | The Organization entity was thin. It had no "Tualmi Outdoors" name, no founders and no entity id. | Added `@id`, `alternateName: Tualmi Outdoors`, `slogan`, `founder`, a rewritten category description, better `knowsAbout`, and `sameAs` read from `BUSINESS.socialProfiles`. WebSite now points at the org by `@id`. | `app/layout.tsx`, `lib/business.ts` |
| 8 | The size + fit page had no measurements on it. | Both full size charts are now rendered there from the same data as the product pages. The title is now "size chart + fit guide". | `footer-pages/size-fit/page.tsx` |
| 9 | robots: OAI-SearchBot had a separate rule set that left /share, /review and /discount open to it. | One shared disallow list. The AI search bots (OAI-SearchBot, ChatGPT-User, PerplexityBot, Claude-SearchBot, Google-Extended) are named so nobody removes them by accident. | `app/robots.ts` |
| 10 | The story page didn't mark itself as the "about" page. | Added `AboutPage` JSON-LD tied to the org, and a meta description that names Rachel Ma and LA. | `app/story/page.tsx` |

`tsc --noEmit` passes. I didn't run a full `next build` because the sandbox can't download Google Fonts. Run one locally before pushing.

### TODOs left in code (need your input)
- `lib/business.ts` → `founders`: add Cheyenne's full name, exactly as it appears on LinkedIn.
- `lib/business.ts` → `socialProfiles`: add the LinkedIn company page URL and the Pinterest profile URL.

## Manual: Shopify

1. **Online Store → Preferences / each product's "Search engine listing":** these feed the Google & YouTube channel and Shop. Set:
   - Juniper Pant SEO title: `Tualmi Juniper Pant – Women's Flare Cargo Hiking Pants`
   - Sierra Shorts SEO title: `Tualmi Sierra Shorts – Women's Recycled Nylon Hiking Shorts`
   - Keep the product **title** itself as "Juniper Pant" / "Sierra Shorts". It drives the H1, the cart, emails and the existing feed history.
2. **Product description (Shopify body):** this renders below the buy box and goes into the Merchant feed. Add one factual sentence to each:
   - Juniper: "Women's flare cargo hiking pants in 88% nylon / 12% spandex with 4-way stretch, a fold-over waist, two snap cargo pockets, cinchable hems and a 29" inseam. Sizes XXS–XXL in Birch and Olive."
   - Sierra: "Women's hiking shorts in 100% recycled nylon: water-repellent, fast-dry, with deep side pockets that fit your whole phone and a 1.5" inseam. Sizes XXS–XXL in Jam, Picnic and Confetti."
   - Don't use the strategy doc's draft line "moisture-wicking" for Juniper, or "2XS–2XL" if the site says XXS–XXL. Neither is confirmed or consistent with the site.
3. **Product category / Google attributes (Google & YouTube app → product):** category = Apparel > Clothing > Pants (or Shorts), gender = female, age group = adult, color per variant, size per variant, material.
4. **GTINs:** if you don't have barcodes, set "This product has no GTIN" (identifier_exists = no) so it isn't flagged.
5. **Picnic preorder vs. feed:** S/M Picnic sell through "Continue selling when out of stock". The Google channel will likely list them as in stock while they ship late Dec – early Jan. Either set those variants' availability to `preorder` with an availability date in the Google app, or exclude them from the feed until the stock lands. This is the same mismatch class as the earlier suspension.

## Manual: Google Merchant Center, Search Console, Bing

1. **Merchant Center:** before requesting another review, check the account's business info. Name, address (145 N Rossmore Ave, Los Angeles 90004; confirm the ZIP), phone and return policy (14 days, free US returns) should match the site word for word. Also confirm that the shipping settings match: $125 free-shipping threshold, flat rate otherwise. If the Misrepresentation status is still on, appeal only after the feed and site agree.
2. **Search Console:** resubmit `sitemap.xml`. Use URL Inspection → "Request indexing" on both product pages, /collections, /story and /footer-pages/size-fit. Two weeks after deploy, check Enhancements → Merchant listings and Product snippets for errors.
3. **Rich Results Test:** run each product page through search.google.com/test/rich-results after deploy.
4. **Bing Webmaster Tools:** `BingSiteAuth.xml` is already there. Submit the sitemap there too. ChatGPT search leans heavily on Bing's index, so this matters more for GEO than it looks.

## Manual: entity consistency (same sentence everywhere)

Use one sentence, adapted to each bio's length limit:

> Tualmi Outdoors is a women-founded outdoor apparel brand from LA making cute, functional hiking clothes for young women.

- Instagram / TikTok / Pinterest bios. Each one should link to `www.tualmi.com`, not a Linktree root (a Linktree link is fine if tualmi.com is on it).
- LinkedIn company page: name it "Tualmi Outdoors", and use that sentence as the tagline.
- Both founders' LinkedIn profiles: experience entry "Co-founder, Tualmi Outdoors", linked to the company page.
- Press boilerplate and media kit. Ask The Hive (Claremont) to link to tualmi.com if their article doesn't already.

## Manual: copy you may want to change

These are supplied copy, so I didn't touch them:

- **Homepage H1** is the slogan, "gear for a new kind of outdoorsy." That's fine, but the paragraph under it never uses the words "hiking pants" or "hiking shorts". Consider: "Tualmi makes hiking pants and shorts designed for women from the start…"
- **Story page:** add Rachel's surname and "Los Angeles" in the visible text. AI answers to "who founded Tualmi?" quote visible text.
- **/collections H1** is just "shop". "shop women's hiking clothes" would say more.
- **/in-the-wild** isn't linked from anywhere and isn't in the sitemap. Link it from the footer if you want it found. If it's meant to be hidden, leave it.

## Off-site (the bigger lever, from the strategy doc)

Code fixes make Tualmi *legible*. Whether it gets *recommended* depends on third-party mentions: Treeline Review's women-owned brand roundups, The Trek, creator reviews with "Tualmi Juniper Pant review" in the title, and genuine Reddit threads. The site work should be in place before that outreach starts.

## Monthly benchmark

Run each prompt in ChatGPT (search on), Perplexity, Gemini and Google AI Mode. For each, record: does Tualmi appear, is it recommended or only mentioned, is the description accurate, is tualmi.com cited, which competitors appear, and which sources are cited.

1. What are the best cute hiking clothing brands for Gen Z women?
2. What are some feminine outdoor apparel brands?
3. Where can I buy stylish hiking pants for women?
4. What are alternatives to Patagonia for young women who like colorful outdoor clothing?
5. What are the best women-owned outdoor apparel brands?
6. What are some emerging outdoor brands founded by young women?
7. What are comfortable hiking pants with flattering fits and functional pockets?
8. What are cute outdoor clothing brands that make technical gear?

Add one control prompt: "What is Tualmi Outdoors?" It tests whether the entity resolves at all.
