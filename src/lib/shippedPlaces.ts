/**
 * Places Tualmi has shipped to — the pins on the /in-the-wild map.
 *
 * ── KEEPING THIS CURRENT ─────────────────────────────────────────────────
 * Hand-maintained for now. Add a row when you ship somewhere new: the state's
 * two-letter code, and the town's latitude and longitude. The pin appears, and
 * the state lights up on the map automatically — the tinted states are derived
 * from this list, so there is nothing else to keep in sync.
 *
 * Getting coordinates: search the town on any maps site and read them off the
 * URL, or ask for "<town>, <state> lat long". Four decimal places is far more
 * precision than this map can draw; two is plenty.
 *
 * ── WHAT IS AND ISN'T SHOWN ──────────────────────────────────────────────
 * The `city` field is here so this file is maintainable by a human. It is
 * never rendered — this is a server component, so the names never reach the
 * browser. What a visitor sees is an unlabelled dot.
 *
 * That's deliberate. A dot on a town is interesting; a dot with a customer's
 * town and a name beside it is that customer's business. Order counts are left
 * out for the same reason — the map should say "we're everywhere", not "here
 * is precisely how many pairs we have sold".
 *
 * Towns close enough to overlap on the map merge into one pin (see the page
 * component), so a metro area reads as one place rather than a smudge.
 *
 * Seeded from the USPS labels in Shopify, extended 18 Aug 2026 from a second
 * batch of shipping addresses. Every coordinate below was checked
 * programmatically to fall inside the state it claims.
 *
 * ── MAKING IT SELF-MAINTAINING ───────────────────────────────────────────
 * getShippedPlaces() is a function so it can start reading real orders without
 * anything that renders the map having to change.
 *
 * The order webhook (src/app/api/webhooks/shopify/orders/route.ts) already
 * receives every order, shipping address included — it forwards to GA4 and
 * throws the rest away. The upgrade is:
 *
 *   1. add a `shipped_places` table in Supabase (state, city, lat, lon)
 *   2. in that webhook, upsert the shipping address — Shopify gives you
 *      province_code, city, latitude and longitude on the address object,
 *      so no geocoding is needed
 *   3. make this function async and select the distinct rows
 *
 * The list below then becomes the fallback for when Supabase is unreachable,
 * which is the right shape for it anyway: a map with no pins is worse than a
 * map with slightly stale ones.
 * ─────────────────────────────────────────────────────────────────────────
 */

export type ShippedPlace = {
  /** Two-letter USPS code. Drives which state gets tinted. */
  state: string;
  lat: number;
  lon: number;
  /** For your reference only — never rendered. */
  city: string;
};

const PLACES: ShippedPlace[] = [
  { state: 'AZ', city: 'Phoenix',          lat:  33.3860, lon:  -112.0530 },
  { state: 'CA', city: 'Davis',            lat:  38.5449, lon:  -121.7405 },
  { state: 'CA', city: 'Huntington Beach', lat:  33.6595, lon:  -117.9988 },
  { state: 'CA', city: 'La Jolla',         lat:  32.8328, lon:  -117.2713 },
  { state: 'CA', city: 'Lomita',           lat:  33.7922, lon:  -118.3151 },
  { state: 'CA', city: 'Los Angeles',      lat:  34.0280, lon:  -118.4110 },
  { state: 'CA', city: 'Menlo Park',       lat:  37.4530, lon:  -122.1817 },
  { state: 'CA', city: 'Mill Valley',      lat:  37.9061, lon:  -122.5450 },
  { state: 'CA', city: 'Monterey',         lat:  36.6002, lon:  -121.8947 },
  { state: 'CA', city: 'Pacific Grove',    lat:  36.6177, lon:  -121.9166 },
  { state: 'CA', city: 'Richmond',         lat:  37.9358, lon:  -122.3477 },
  { state: 'CA', city: 'Salinas',          lat:  36.6777, lon:  -121.6555 },
  { state: 'CA', city: 'San Diego',        lat:  32.7530, lon:  -117.2010 },
  { state: 'CA', city: 'San Francisco',    lat:  37.7749, lon:  -122.4194 },
  { state: 'CA', city: 'San Jose',         lat:  37.2900, lon:  -121.7600 },
  { state: 'CA', city: 'Solana Beach',     lat:  32.9912, lon:  -117.2712 },
  { state: 'CA', city: 'Stockton',         lat:  37.9577, lon:  -121.2908 },
  { state: 'CA', city: 'Torrance',         lat:  33.8400, lon:  -118.3560 },
  { state: 'CA', city: 'Ventura',          lat:  34.2783, lon:  -119.2932 },
  { state: 'CO', city: 'Aspen',            lat:  39.1911, lon:  -106.8175 },
  { state: 'CO', city: 'Broomfield',       lat:  39.9205, lon:  -105.0867 },
  { state: 'CO', city: 'Canon City',       lat:  38.4409, lon:  -105.2422 },
  { state: 'CO', city: 'Fort Collins',     lat:  40.5853, lon:  -105.0844 },
  { state: 'CO', city: 'Pine',             lat:  39.4180, lon:  -105.3450 },
  { state: 'CO', city: 'Westminster',      lat:  39.8367, lon:  -105.0372 },
  { state: 'CO', city: 'Windsor',          lat:  40.4775, lon:  -104.9014 },
  { state: 'HI', city: 'Honolulu',         lat:  21.2793, lon:  -157.8270 },
  { state: 'ID', city: 'Driggs',           lat:  43.7230, lon:  -111.1110 },
  { state: 'IL', city: 'Northfield',       lat:  42.0989, lon:   -87.7795 },
  { state: 'MD', city: 'Columbia',         lat:  39.2037, lon:   -76.8610 },
  { state: 'ME', city: 'Falmouth',         lat:  43.7276, lon:   -70.2420 },
  { state: 'ME', city: 'Kittery',          lat:  43.0898, lon:   -70.7361 },
  { state: 'MN', city: 'Mound',            lat:  44.9366, lon:   -93.6661 },
  { state: 'NC', city: 'Durham',           lat:  35.9940, lon:   -78.8986 },
  { state: 'NM', city: 'Albuquerque',      lat:  35.0844, lon:  -106.6504 },
  { state: 'NY', city: 'Buffalo',          lat:  42.8864, lon:   -78.8784 },
  { state: 'NY', city: 'New York',         lat:  40.7850, lon:   -73.9770 },
  { state: 'NY', city: 'Olean',            lat:  42.0776, lon:   -78.4297 },
  { state: 'OH', city: 'Massillon',        lat:  40.7967, lon:   -81.5215 },
  { state: 'OR', city: 'Portland',         lat:  45.5152, lon:  -122.6784 },
  { state: 'TN', city: 'Knoxville',        lat:  35.9200, lon:   -83.9400 },
  { state: 'UT', city: 'Herriman',         lat:  40.4970, lon:  -112.0330 },
  { state: 'UT', city: 'Highland',         lat:  40.4272, lon:  -111.7930 },
  { state: 'UT', city: 'North Salt Lake',  lat:  40.8460, lon:  -111.9069 },
  { state: 'UT', city: 'Salt Lake City',   lat:  40.7608, lon:  -111.8880 },
  { state: 'UT', city: 'Washington',       lat:  37.1305, lon:  -113.5083 },
  { state: 'VA', city: 'Arlington',        lat:  38.8816, lon:   -77.0910 },
  { state: 'VA', city: 'Chester',          lat:  37.3568, lon:   -77.4416 },
  { state: 'VA', city: 'Clifton',          lat:  38.7801, lon:   -77.3866 },
  { state: 'WA', city: 'Anacortes',        lat:  48.5126, lon:  -122.6127 },
  { state: 'WA', city: 'Seattle',          lat:  47.6062, lon:  -122.3321 },
  { state: 'WA', city: 'Tukwila',          lat:  47.4640, lon:  -122.2880 },
  { state: 'WY', city: 'Jackson',          lat:  43.4799, lon:  -110.7624 },
];

/**
 * Orders that landed outside the United States.
 *
 * Albers USA is a US-only projection, so none of these can go on the main map —
 * feeding them to it returns null and they would vanish without a trace.
 * Instead they join the list of places under the map by country name.
 *
 * Countries only in what's rendered. A town of a few hundred people plus a
 * country is a small enough haystack that naming it stops being anonymous —
 * `city` is here for the same reason it is on ShippedPlace above, so a human
 * can maintain the file, and is never sent to the browser.
 *
 * `lat`/`lon` are optional and only worth filling in for a country that has
 * its own inset map to be drawn on. Right now that's Australia (see
 * src/lib/auMap.ts). Everywhere else the coordinates would go unused, so
 * they're left off rather than collected for nothing.
 */
export type InternationalPlace = {
  country: string;
  /** For your reference only — never rendered. */
  city?: string;
  lat?: number;
  lon?: number;
};

const INTERNATIONAL: InternationalPlace[] = [
  { country: 'Australia', city: 'Mount Evelyn, Victoria', lat: -37.7833, lon: 145.3833 },
  { country: 'Austria' },
  { country: 'France' },
  { country: 'New Zealand' },
];

/** Countries shipped to outside the US, alphabetical. */
export function getInternationalCountries(): string[] {
  return Array.from(new Set(INTERNATIONAL.map((p) => p.country))).sort((a, b) =>
    a.localeCompare(b),
  );
}

/** An international row that has coordinates, so it can actually be drawn. */
export type InternationalPin = InternationalPlace & { lat: number; lon: number };

/**
 * The rows for one country that carry coordinates, for that country's inset
 * map. Returns an empty array for a country we only know by name, which is
 * what lets the page skip drawing an inset rather than draw an empty one.
 */
export function getInternationalPins(country: string): InternationalPin[] {
  return INTERNATIONAL.filter(
    (p): p is InternationalPin =>
      p.country === country && p.lat != null && p.lon != null,
  );
}

/** Every place, normalised. See the note above before editing. */
export function getShippedPlaces(): ShippedPlace[] {
  return PLACES.map((p) => ({ ...p, state: p.state.trim().toUpperCase() }));
}

/** The states to tint — derived, so it can never disagree with the pins. */
export function getShippedStates(): string[] {
  return Array.from(new Set(getShippedPlaces().map((p) => p.state)));
}
