import type { Metadata } from 'next';
import Link from 'next/link';
import { US_STATES, US_VIEWBOX, projectAlbersUsa } from '@/lib/usMap';
import Image from 'next/image';
import { getShippedPlaces, getShippedStates } from '@/lib/shippedPlaces';

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
        .wild-state { fill: #F5E3EA; stroke: #EACBD8; stroke-width: 1; }
        .wild-state[data-shipped='true'] { fill: #EFCBDA; }
        /* Smaller than a state-level pin would be: there are two dozen of
           these and several sit close together, so a fat dot turns the Bay
           Area into one blob. */
        .wild-pin { fill: ${maroon}; stroke: #fff; stroke-width: 1.6; r: 6; }
        /* The map scales to about a third of its drawn size on a phone, which
           would take a 6px pin to 2px. CSS geometry properties let the dot
           grow back without redrawing anything. */
        @media (max-width: 640px) { .wild-pin { r: 11; stroke-width: 2.6; } }

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
            and counting
          </h2>

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
                is that it doesn't. */}
            {pins.map((p) => (
              <circle
                key={`${p.state}-${Math.round(p.x)}-${Math.round(p.y)}`}
                className="wild-pin"
                cx={p.x}
                cy={p.y}
              />
            ))}
          </svg>

          {/* The same information as text — a screen reader shouldn't have to
              parse an SVG, and it gives the page something to be found by. */}
          <ul className="wild-statelist">
            {shippedStates.map((s) => (
              <li key={s.code}>{s.name}</li>
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
