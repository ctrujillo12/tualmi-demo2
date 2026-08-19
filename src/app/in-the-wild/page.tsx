import type { Metadata } from 'next';
import Link from 'next/link';
import { US_STATES, US_VIEWBOX, projectAlbersUsa } from '@/lib/usMap';
import { AU_PATH, AU_VIEWBOX, projectAustralia } from '@/lib/auMap';
import Image from 'next/image';
import {
  getInternationalCountries,
  getInternationalPins,
  getShippedPlaces,
  getShippedStates,
} from '@/lib/shippedPlaces';

export const metadata: Metadata = {
  title: 'in the wild',
  description:
    'Where Tualmi shorts have turned up — a map of every town we have shipped a pair to.',
  alternates: { canonical: '/in-the-wild' },
};

// ─── Landing-page design tokens ───────────────────────────────────────────────
const sans    = 'var(--font-montserrat), system-ui, sans-serif';
const maroon  = '#A9445C';
const blushBg = '#FBF1F5';
const soft    = '#C9849A';

/**
 * ── THE COLLAGE ──────────────────────────────────────────────────────────
 * Real customer photos, in /public/images-2/wild/.
 *
 * `ratio` is each photo's own shape, so nothing is cropped — a masonry of
 * mixed shapes is what makes it read as a collage rather than a product grid.
 * When you add one, put the file in that folder and give its real pixel
 * dimensions as the ratio.
 */
type Shot = { src: string; alt: string; ratio: string };

const W = '/images-2/wild';
const COLLAGE: Shot[] = [
  { src: `${W}/wild-1.jpg`, alt: 'Hiker in Sierra Shorts on a rocky ridge above a snowfield',   ratio: '900 / 1600' },
  { src: `${W}/wild-5.jpg`, alt: 'Confetti Sierra Shorts at altitude, mountains behind',        ratio: '1600 / 1433' },
  { src: `${W}/wild-3.jpg`, alt: 'Cyclist in Sierra Shorts on a boardwalk trail through pines', ratio: '1200 / 1600' },
  { src: `${W}/wild-4.jpg`, alt: 'Sitting on a picnic table in the Picnic Sierra Shorts',       ratio: '1199 / 1600' },
  { src: `${W}/wild-6.jpg`, alt: 'Looking out from a ridgeline in the Confetti Sierra Shorts',  ratio: '1289 / 1183' },
  { src: `${W}/wild-2.jpg`, alt: 'Hiker in the Confetti Sierra Shorts below jagged peaks',      ratio: '1200 / 1600' },
  { src: `${W}/wild-7.jpg`, alt: 'Swinging from a tree branch over a creek in Sierra Shorts',   ratio: '1150 / 1526' },
];

/**
 * How far apart two places can be and still share one pin, in viewBox units.
 * The map is 960 units across for roughly 4,700km, so 17 units is about 83km —
 * near enough to a metro radius.
 *
 * The point of the map is "which cities has this reached", not "here is every
 * order". Four separate dots over greater Los Angeles say nothing that one dot
 * doesn't, and they make LA look like four cities.
 *
 * 17 was picked by sweeping the threshold from 10 to 26 and looking for a
 * plateau — a range where the answer stops changing, so the result isn't
 * balanced on a cliff edge. 16, 17 and 18 all produce the same 33 pins. Below
 * 15 the Bay Area splits up; at 19 Buffalo absorbs Olean and Seattle absorbs
 * Anacortes, which are 95km and 110km away and not the same place.
 */
const MERGE_UNITS = 17;

type Pin = { state: string; x: number; y: number; n: number };

/**
 * Agglomerative clustering with complete linkage: repeatedly merge the two
 * closest clusters whose furthest-apart members are still within MERGE_UNITS.
 *
 * Both halves of that matter, and the naive version got both wrong:
 *
 *   - COMPLETE linkage (furthest pair, not nearest or average) stops chains.
 *     With nearest-neighbour, Fort Collins joined Denver by hopping through
 *     Windsor even though the two are 100km apart. Here, everything sharing a
 *     pin is within 83km of everything else sharing it — no exceptions.
 *   - Merging the CLOSEST pair each round makes it order-independent. A
 *     single pass down the list put San Jose with Monterey rather than the
 *     Bay Area purely because the list happens to be alphabetical.
 *
 * O(n³) as written, which is nothing for a few dozen places and keeps it
 * readable. If this ever holds thousands of orders it wants a real spatial
 * index — but by then it should be reading from Supabase anyway.
 */
function clusterPins(places: { state: string; lat: number; lon: number }[]): Pin[] {
  type Cluster = { state: string; pts: [number, number][] };

  let clusters: Cluster[] = [];
  for (const place of places) {
    const point = projectAlbersUsa(place.lat, place.lon);
    if (!point) continue;                    // outside the map — nothing to draw
    clusters.push({ state: place.state, pts: [point] });
  }

  const linkage = (a: Cluster, b: Cluster) => {
    let furthest = 0;
    for (const p of a.pts) {
      for (const q of b.pts) {
        furthest = Math.max(furthest, Math.hypot(p[0] - q[0], p[1] - q[1]));
      }
    }
    return furthest;
  };

  for (;;) {
    let bestPair: [number, number] | null = null;
    let bestDistance = Infinity;
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        // Never across a state line: one pin drifting between two tinted
        // states reads as a bug rather than as a metro area.
        if (clusters[i].state !== clusters[j].state) continue;
        const d = linkage(clusters[i], clusters[j]);
        if (d <= MERGE_UNITS && d < bestDistance) {
          bestDistance = d;
          bestPair = [i, j];
        }
      }
    }
    if (!bestPair) break;
    const [i, j] = bestPair;
    clusters[i] = { state: clusters[i].state, pts: [...clusters[i].pts, ...clusters[j].pts] };
    clusters.splice(j, 1);
  }

  return clusters.map((c) => ({
    state: c.state,
    x: c.pts.reduce((sum, p) => sum + p[0], 0) / c.pts.length,
    y: c.pts.reduce((sum, p) => sum + p[1], 0) / c.pts.length,
    n: c.pts.length,
  }));
}

export default function InTheWildPage() {
  const places = getShippedPlaces();
  const pins = clusterPins(places);
  const shipped = new Set(getShippedStates());
  // Sorted so the written list under the map reads alphabetically by name
  // rather than in whatever order someone typed the codes.
  const shippedStates = US_STATES.filter((s) => shipped.has(s.code)).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  // Orders that landed outside the US. They can't go on an Albers USA map, so
  // they reach the page two ways: every one of them by name in the list under
  // the map, and Australia — the only one we hold coordinates for — as a pin
  // on its own small inset beside the big map.
  const countries = getInternationalCountries();
  const auPins = getInternationalPins('Australia')
    .map((p) => projectAustralia(p.lat, p.lon))
    .filter((p): p is [number, number] => p !== null);

  // The written list under the map: states first, then countries.
  const everywhere = [...shippedStates.map((s) => s.name), ...countries];

  return (
    <div style={{ backgroundColor: blushBg, minHeight: '100vh' }}>
      <style>{`
        .wild-wrap {
          max-width: 1100px;
          margin: 0 auto;
          padding: clamp(104px, 15vw, 168px) clamp(20px, 5vw, 48px) clamp(72px, 10vw, 120px);
        }

        /* ── Map ──
           Capped rather than full-bleed: at the 1100px content width the map
           was the loudest thing on the page, and it's context, not the point.
           Left-aligned so it sits under the heading rather than floating. */
        .wild-map {
          width: 100%;
          max-width: 720px;
          height: auto;
          display: block;
        }
        @media (max-width: 640px) { .wild-map { max-width: none; } }

        /* ── The two maps side by side ──
           Australia rides along as an inset rather than as its own section:
           the US map already tucks Alaska and Hawaii into corner insets, so a
           second box in the same row reads as part of one map, not a second
           map. Bottom-aligned, because the inset is much shorter and hanging
           it off the top of the row would leave a hole under it.

           At phone width the row wraps and the inset would sit alone on a
           line at 120px wide, which looks like a mistake. Below 640px it goes
           full-width under the US map instead and is allowed to grow. */
        .wild-maps {
          display: flex;
          align-items: flex-end;
          gap: clamp(16px, 3vw, 36px);
          flex-wrap: wrap;
        }
        .wild-inset { flex: 0 0 auto; }
        .wild-inset-map {
          width: clamp(96px, 13vw, 132px);
          height: auto;
          display: block;
        }
        .wild-inset-label {
          font-family: ${sans};
          font-size: 11px;
          font-weight: 600;
          color: ${soft};
          text-transform: lowercase;
          margin: 6px 0 0;
        }
        @media (max-width: 640px) {
          .wild-maps { display: block; }
          .wild-inset { margin-top: 24px; }
          .wild-inset-map { width: 40%; }
        }

        .wild-state { fill: #F5E3EA; stroke: #EACBD8; stroke-width: 1; }
        .wild-state[data-shipped='true'] { fill: #EFCBDA; }
        /* The inset country is always somewhere we've shipped — it only gets
           drawn because there's a pin to put on it. */
        .wild-country { fill: #EFCBDA; stroke: #EACBD8; stroke-width: 1; }
        /* Colour only. Pin SIZE lives on the elements themselves as real SVG
           r / stroke-width attributes — see the note above the two <g> groups
           in the markup for why it can't live here. */
        .wild-pin { fill: ${maroon}; stroke: #fff; }
        /* Which of the two pin sets is drawn. Phone gets the larger one
           because the map renders at roughly a third of its desktop size
           there, and a 6-unit dot lands at about 2px. */
        .wild-pins--phone { display: none; }
        @media (max-width: 640px) {
          .wild-pins--wide { display: none; }
          .wild-pins--phone { display: inline; }
        }

        .wild-statelist {
          display: flex;
          flex-wrap: wrap;
          gap: 6px 0;
          margin: 22px 0 0;
          padding: 0;
          list-style: none;
        }
        .wild-statelist li {
          font-family: ${sans};
          font-size: clamp(11px, 1.3vw, 13px);
          font-weight: 600;
          color: ${soft};
          text-transform: lowercase;
        }
        .wild-statelist li::after {
          content: '·';
          margin: 0 8px;
          opacity: 0.5;
        }
        .wild-statelist li:last-child::after { content: ''; margin: 0; }

        /* ── Collage ──
           Columns, not grid: a masonry flow lets each photo keep its own
           shape instead of being forced to a common row height. */
        .wild-collage {
          columns: 3;
          column-gap: clamp(10px, 1.4vw, 16px);
        }
        @media (max-width: 900px) { .wild-collage { columns: 2; } }
        @media (max-width: 520px) { .wild-collage { columns: 2; } }

        .wild-shot {
          break-inside: avoid;
          margin: 0 0 clamp(10px, 1.4vw, 16px);
        }
        .wild-photo {
          position: relative;
          width: 100%;
          border-radius: 10px;
          overflow: hidden;
          background: #F3DCE5;
        }

      `}</style>

      <main className="wild-wrap">

        {/* ══ 1 · INTRO ═══════════════════════════════════════════════════ */}
        <p style={{ fontFamily: sans, fontWeight: 700, fontSize: '13px', letterSpacing: '0.14em', color: soft, margin: '0 0 14px', textTransform: 'lowercase' }}>
          in the wild
        </p>
        <h1 style={{ fontFamily: sans, fontWeight: 700, fontSize: 'clamp(30px, 5vw, 56px)', letterSpacing: '-0.03em', lineHeight: 1.05, color: maroon, margin: 0, textTransform: 'lowercase' }}>
          we&apos;re here for women exploring.
        </h1>

        {/* ══ 2 · MAP ═════════════════════════════════════════════════════ */}
        {/* Sits closer to the h1 than the collage does to it: with the intro
            paragraph gone, the heading and the map read as one block, and the
            collage is the first real section break on the page. */}
        <section style={{ marginTop: 'clamp(40px, 6vw, 64px)' }} aria-labelledby="wild-map-heading">
          {/* Still an h2 so the page keeps a real outline for screen readers
              and search, but styled as a line of copy — at title size it was
              competing with the h1 directly above it. */}
          <h2
            id="wild-map-heading"
            style={{
              fontFamily: sans,
              fontWeight: 500,
              fontSize: 'clamp(14px, 1.7vw, 17px)',
              letterSpacing: 0,
              lineHeight: 1.7,
              color: soft,
              margin: '0 0 clamp(22px, 3vw, 30px)',
              textTransform: 'lowercase',
            }}
          >
            tualmi is trailblazing in{' '}
            <strong style={{ fontWeight: 700, color: maroon }}>
              {shippedStates.length} states
            </strong>{' '}
            and{' '}
            <strong style={{ fontWeight: 700, color: maroon }}>
              {countries.length} countries
            </strong>{' '}
            and counting
          </h2>

          <div className="wild-maps">
          <svg
            className="wild-map"
            viewBox={`0 0 ${US_VIEWBOX.width} ${US_VIEWBOX.height}`}
            role="img"
            aria-label={`Map of the United States with ${shippedStates.length} states marked: ${shippedStates.map((s) => s.name).join(', ')}.`}
          >
            {/* Every state, so the country still reads as the country. */}
            {US_STATES.map((s) => (
              <path key={s.code} className="wild-state" data-shipped={shipped.has(s.code)} d={s.d}>
                <title>{s.name}</title>
              </path>
            ))}
            {/* Pins last so they sit above every outline. No <title>: the
                tooltip would name the town, and the point of an unlabelled dot
                is that it doesn't.

                ── WHY THE PINS ARE DRAWN TWICE ─────────────────────────────
                The radius used to come from CSS alone — `.wild-pin { r: 6 }`,
                with `r: 11` in a phone media query — and these circles carried
                no `r` attribute at all. A circle whose radius resolves to
                nothing is a circle of radius ZERO, so the moment a browser
                declined that declaration the pins didn't shrink, they vanished
                outright, leaving a map of tinted states and nothing on it.
                That's what was happening on iOS.

                The declaration was `r: 6` — no unit. Chromium accepts that;
                per spec a non-zero <length> requires one, and WebKit is strict
                about it. Adding "px" would fix the immediate symptom but keeps
                the fragile part: the size still lives in a CSS property that
                only some engines honour, and the failure mode is still total
                invisibility rather than a wrong size.

                So the size is back on the elements as plain SVG attributes,
                which every renderer has understood forever, and the phone/wide
                switch is a `display` toggle between two groups — also
                universally supported. Sixty-odd extra circles in the DOM is a
                cheap price for a map that cannot silently empty itself. */}
            <g className="wild-pins wild-pins--wide">
              {pins.map((p) => (
                <circle
                  key={`${p.state}-${Math.round(p.x)}-${Math.round(p.y)}`}
                  className="wild-pin"
                  cx={p.x}
                  cy={p.y}
                  r={6}
                  strokeWidth={1.6}
                />
              ))}
            </g>
            <g className="wild-pins wild-pins--phone">
              {pins.map((p) => (
                <circle
                  key={`${p.state}-${Math.round(p.x)}-${Math.round(p.y)}`}
                  className="wild-pin"
                  cx={p.x}
                  cy={p.y}
                  r={11}
                  strokeWidth={2.6}
                />
              ))}
            </g>
          </svg>

          {/* ── Australia ──
              Drawn only when there's actually a pin to put on it. An empty
              country outline sitting next to the US map would be a claim we
              haven't earned, and this way the inset disappears by itself if
              the order data ever stops including one. Same fill, stroke and
              pin colours as the main map, so it reads as the same drawing.

              The pin size is a plain SVG attribute for exactly the reason
              spelled out over the US pins below — a CSS `r` is not something
              every renderer honours, and the failure mode is an invisible pin
              rather than a small one. No phone/wide pair here because this
              box barely changes size between breakpoints. */}
          {auPins.length > 0 && (
            <div className="wild-inset">
              <svg
                className="wild-inset-map"
                viewBox={`0 0 ${AU_VIEWBOX.width} ${AU_VIEWBOX.height}`}
                role="img"
                aria-label="Map of Australia with one place marked, near Melbourne."
              >
                <path className="wild-country" d={AU_PATH} />
                {auPins.map(([x, y]) => (
                  <circle
                    key={`au-${Math.round(x)}-${Math.round(y)}`}
                    className="wild-pin"
                    cx={x}
                    cy={y}
                    r={9}
                    strokeWidth={2.2}
                  />
                ))}
              </svg>
              {/* Labelled, unlike the states. A tinted state sits inside a
                  recognisable US outline; a small shape on its own does not
                  identify itself, and "which country is that" is a worse
                  question to leave hanging than the label is clutter. */}
              <p className="wild-inset-label">australia</p>
            </div>
          )}
          </div>

          {/* The same information as text — a screen reader shouldn't have to
              parse an SVG, and it gives the page something to be found by.
              States first, then countries, each group alphabetical: mixing
              "Australia" in among the American states would read as a state
              nobody has heard of. */}
          <ul className="wild-statelist">
            {everywhere.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>

        </section>

        {/* ══ 3 · COLLAGE ════════════════════════════════════════════════ */}
        {/* No heading: the photos say what they are. aria-label rather than
            aria-labelledby, since there's no longer an element to point at. */}
        <section style={{ marginTop: 'clamp(48px, 7vw, 80px)' }} aria-label="Customers wearing Tualmi outdoors">
          <div className="wild-collage">
            {COLLAGE.map((shot) => (
              <figure key={shot.src} className="wild-shot">
                <div className="wild-photo" style={{ aspectRatio: shot.ratio }}>
                  <Image
                    src={shot.src}
                    alt={shot.alt}
                    fill
                    sizes="(max-width: 900px) 46vw, 340px"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              </figure>
            ))}
          </div>
        </section>

        {/* ══ 4 · CTA ═════════════════════════════════════════════════════ */}
        <section
          style={{
            marginTop: 'clamp(56px, 8vw, 92px)',
            paddingTop: 'clamp(32px, 5vw, 48px)',
            borderTop: '1px solid #F0D9E1',
            textAlign: 'center',
          }}
        >
          <h2 style={{ fontFamily: sans, fontWeight: 700, fontSize: 'clamp(20px, 2.6vw, 28px)', letterSpacing: '-0.02em', color: maroon, margin: 0, textTransform: 'lowercase' }}>
            want to be here?
          </h2>
          <p style={{ fontFamily: sans, fontWeight: 500, fontSize: 'clamp(13px, 1.5vw, 15px)', lineHeight: 1.8, color: soft, margin: '10px auto 24px', maxWidth: '440px' }}>
            Tag{' '}
            <a
              href="https://instagram.com/tualmioutdoors"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: maroon, fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: '3px' }}
            >
              @tualmioutdoors
            </a>{' '}
            and you might end up on this page.
          </p>
          <Link
            href="/products/sierra-shorts"
            style={{
              display: 'inline-block',
              backgroundColor: maroon,
              color: 'white',
              padding: '15px 38px',
              fontFamily: sans,
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              borderRadius: '100px',
              textDecoration: 'none',
              textTransform: 'lowercase',
            }}
          >
            shop the shorts
          </Link>
        </section>

      </main>
    </div>
  );
}
