/**
 * Outlines for the countries we ship to outside the US, for the little inset
 * maps on /in-the-wild.
 *
 * This replaces auMap.ts, which did exactly this for Australia alone. The page
 * had grown to five countries and drew one of them, because Australia was the
 * only one with a shape to draw; the other four existed only as words in the
 * list under the map.
 *
 * Same idea as usMap.ts and generated the same way: offline, once, and checked
 * in, so the site still carries no mapping library and makes no requests to
 * draw a map. Source: world-atlas countries-110m (Natural Earth), simplified
 * on the TOPOLOGY -- so shared borders stay shared and nothing tears -- then
 * projected and rounded to one decimal. The whole set is under 4KB.
 *
 * -- ONE SQUARE BOX FOR EVERY COUNTRY ------------------------------------
 * Every outline is fitted into the same 120x120 box with a 7-unit margin, so
 * the insets line up like a sheet of stamps and each country fills its own
 * square. Fitting each to its own aspect ratio instead would draw Austria
 * (wide) and New Zealand (tall) at wildly different visual weights, for no
 * reason a visitor could infer.
 *
 * Islands smaller than 1.5 square pixels at that size were dropped: at this
 * scale they are specks indistinguishable from a stray pin, which is the one
 * thing an inset with pins on it must not contain. Overseas territories go
 * too -- Natural Earth hangs French Guiana off France, and fitting the box to
 * that would draw metropolitan France the size of a fingernail.
 *
 * -- THE PROJECTION -------------------------------------------------------
 * Plain spherical Mercator, fitted per country. Mercator distorts area badly
 * at high latitudes, which is the usual reason not to use it and is irrelevant
 * here: each box holds one country whose job is to be recognisable, not to be
 * compared by area against the box beside it.
 *
 * scale and translate come straight out of d3-geo's fitExtent for that
 * country, so projectCountry() and the path agree by construction. Regenerate
 * one and you have to regenerate the other -- they are one measurement.
 */

export const COUNTRY_VIEWBOX = { width: 120, height: 120 } as const;

export type CountryMap = {
  /** Must match the country strings in shippedPlaces.ts. */
  name: string;
  /** Outline, as an SVG path in COUNTRY_VIEWBOX. */
  path: string;
  /** Fitted d3.geoMercator() parameters -- see the note above. */
  scale: number;
  translate: readonly [number, number];
};

const BOX = COUNTRY_VIEWBOX;

export const COUNTRY_MAPS: Record<string, CountryMap> = {
  "Australia": {
    name: "Australia",
    scale: 150.964253,
    translate: [-291.625951, -18.150463],
    path:
      "M97.5,99.8L99.1,100L99.3,104.2L98.4,105.5L98.1,108.3L97.2,107.4L95.3,109.9L93.2,109.6L91.6,106.5L91.2,104.1L89.7,101.1L89.8,99.5L91.5,99.8L94,101ZM40.7,71.6L38,73.2L35.7,73.9L34.2,76.9L30.3,77.2L28,76.6L24.3,77.1L22.7,78.8L21.9,78.7L19.4,80.6L15.7,80.5L12.9,78.4L11.4,77.8L11.5,76L12.8,75.6L13.5,71.6L13.2,69.7L11.8,66.6L11.5,63.1L10.4,60.3L9.2,59.1L8.9,56.8L7.4,54.4L7,53.2L8.2,54.4L7.3,51.7L9.4,53.7L9.3,52.2L7.1,48.1L8.3,44.3L8.1,42.6L9.1,40.6L9.3,42.8L10.5,40.8L12.6,39.9L13.9,38.7L15.9,37.6L17.8,37.7L19.9,36.7L21.5,36.4L22.6,35.5L24,35.6L26.8,34.8L28.2,33.5L28.9,32L30.5,30.6L30.6,28L32.5,25.7L33.6,28.1L34.7,27.5L33.8,26.2L34.6,24.9L35.8,25.5L36.1,23.4L38.2,21L39.5,20.5L39.5,19.7L43.2,18.6L45.1,19.9L46.6,21.5L49.9,21.7L49.3,20.3L50.6,18.1L51.8,17.4L51.4,16.7L52.5,15.1L54.1,14.2L55.5,14.5L57.7,14L57.6,12.6L55.7,11.7L57.1,11.4L58.9,12L60.3,13.1L62.5,13.8L63.2,13.5L64.9,14.4L68,13.3L69.2,14.6L67.5,17.2L66.6,17.3L66.9,18.4L65.2,21.1L65.4,21.8L67.5,23.3L69.5,24.2L72.8,26.8L74.9,27.5L75.3,28.3L77.8,29.3L79.6,28.3L81.7,22L81.3,18.3L81.7,14.8L82.9,11.1L83.9,10.1L84.6,11.4L84.8,13.1L86.5,16L86.6,18.5L87.6,20.6L89.3,19.6L91.4,21.8L91.1,23L92.1,26.7L92.8,27.1L93.5,29.4L93.2,30.9L94.1,32.7L96.9,34.2L100.6,36.7L100.2,37.4L101.7,39.2L102.7,42.3L103.8,41.6L104.9,42.9L105.5,42.4L106,45.5L109.1,48.3L111.1,50.7L111.9,53L111.7,56.5L113,59.1L112.8,61.7L111.7,65.8L111.7,67.6L111.2,69.8L110.1,72.6L108.1,74.2L106.3,78.2L105.5,81L104.5,82.6L103.8,85L103.6,88.3L102.1,89.5L99.1,89.6L96.7,91L93.9,93.7L91.7,92.2L90.1,91.6L90.5,89.9L89.1,90.5L86.8,93L83,91.5L78.9,90.3L77.2,88.3L76.1,84.1L74.8,82.8L72.3,82.4L73.2,80.8L72.5,78.4L71.2,80.6L68.9,81.2L70.3,79.5L70.7,77.6L71.7,76.1L71.5,73.7L69.3,76.4L67.7,77.5L66.7,80.1L64.6,78.7L64.7,77L63.1,74.7L61.7,73.6L62.2,72.8L58.8,71L56.9,70.9L54.4,69.4L49.7,69.7L43.3,71.8Z",
  },
  "Austria": {
    name: "Austria",
    scale: 809.901837,
    translate: [-127.013922, 830.230263],
    path:
      "M113,52.2L111.9,60.8L104,60.8L106.7,65.4L102,78.8L99.3,82.3L86.9,82.7L79.8,87.4L68.2,85.8L47.9,80.5L44.8,73.3L30.8,76.9L29.2,80.9L20.6,77.9L7,73.6L8.6,64.8L20,69.4L22,63.9L34.5,64.8L44.6,61L57.1,62.4L55.1,48.6L60.2,45.9L65.2,36.1L75.6,43L88.6,32.6L99.6,39.1L112.7,42.1Z",
  },
  "France": {
    name: "France",
    scale: 428.191720,
    translate: [41.436000, 453.276285],
    path:
      "M87.7,26.7L91.2,29.7L102,31.8L98.2,39.6L97.2,47.5L91.8,48.4L92,51.2L86.6,57.4L86.4,62.3L90,60.6L92.6,65.3L94.5,72.4L91.9,75.6L93.8,83.7L97.9,85L97,89.5L90.2,95.3L75.5,92.6L64.6,95.9L63.8,102L55.1,103.3L46.7,98.7L44,100.9L30.2,96.3L27.2,92.3L31.1,86.1L32.5,65.1L24.8,53.7L19.3,48.1L7.9,43.8L7.1,35.6L16.8,33.1L29.3,36.1L27,23.1L34.1,28L51.4,19L53.7,9.4L60.2,7L61.3,11.2L64.8,11.4L73.5,21.6L77.3,20.7L83.9,25.9ZM106.8,100.5L111.6,96.6L112.9,105.3L110.4,113L107,111L105.3,104.2Z",
  },
  "Germany": {
    name: "Germany",
    scale: 494.558814,
    translate: [-30.659438, 577.586249],
    path:
      "M91.2,25.2L93.2,32.6L90.8,36.4L96.1,49L95.4,53.9L99,62.7L92.8,62.6L81.3,71.2L75,74.2L77.4,83.8L86.7,92.7L83.6,98.7L80.5,100.3L81.8,108.7L74.1,107.9L68,110.2L60.3,109.6L59.1,113L52.2,110.2L42.9,106.2L41.1,109L33.8,108.9L34.9,99.7L39.2,90.8L26.8,88.4L22.7,84.9L21.5,76L22.5,66.9L21,52.4L26.2,52.4L28.4,47.1L30.5,34.1L29,29.2L30.6,26.1L37.8,25.3L39.5,28.5L45.3,21.3L42.9,7.3L49.5,9.3L55,7L55.1,12.8L63.9,16.2L63.8,21.5L72.6,18.7L77.4,14.7L87.1,20.5Z",
  },
  "New Zealand": {
    name: "New Zealand",
    scale: 376.830179,
    translate: [-1074.610237, -234.618909],
    path:
      "M88.8,53.4L83,64L77.9,67.6L74.1,64L77.8,56.8L75.7,52.1L68.6,48.7L68.8,45.6L73.6,42.6L74.7,36.2L74.4,30.8L71.9,23.8L63.6,13.3L60.8,7.6L63.3,7L66.8,11.4L71.9,13.5L73.8,20.7L78.6,29.4L78.7,23.8L81.7,26L82.6,32.2L88,34.9L92.4,35.6L96.1,32.4L99.5,33.4L97.9,40.8L95.9,45.8L90.9,45.6L89.1,48.2ZM41.3,84.2L46.9,79.5L50.9,74.9L53.8,68.2L56.3,66L57.3,61.1L61.9,57.1L64.8,64.4L69.5,60.9L71.4,64.6L71.4,68.3L64.7,79L61.3,82.6L63.7,87L58.7,87.1L53,90.5L47.5,106L39.1,113L33,112.8L28.8,109.7L21.6,109L20.5,105.5L24,98.5L32.3,89.4Z",
  },
};

const RAD = Math.PI / 180;

/**
 * Latitude/longitude to a point in that country's box.
 *
 * Returns null for a country we hold no outline for, and for a coordinate that
 * lands outside the drawn box -- so a typo shows up as a missing pin rather
 * than as a dot silently clipped into nothing, or worse, a dot floating in the
 * sea beside the wrong country. Latitude is clamped short of the poles because
 * Mercator sends them to infinity.
 */
export function projectCountry(
  country: string,
  lat: number,
  lon: number,
): [number, number] | null {
  const map = COUNTRY_MAPS[country];
  if (!map) return null;
  if (lat <= -85 || lat >= 85) return null;

  const x = map.translate[0] + map.scale * (lon * RAD);
  const y = map.translate[1] - map.scale * Math.log(Math.tan(Math.PI / 4 + (lat * RAD) / 2));
  if (x < 0 || x > BOX.width || y < 0 || y > BOX.height) return null;
  return [x, y];
}

/** True when there is an outline to draw for this country. */
export function hasCountryMap(country: string): boolean {
  return country in COUNTRY_MAPS;
}
