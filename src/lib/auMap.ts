/**
 * Australia's outline and pin projection for the "in the wild" map's inset.
 *
 * Same idea as usMap.ts, and generated the same way: offline, once, and
 * checked in, so the site still carries no mapping library and makes no
 * requests to draw a map. Source: world-atlas countries-110m (Natural Earth),
 * simplified to ~35% of its points and rounded to one decimal place. That is
 * far coarser than the US map because this is drawn about a sixth of the size
 * — at 120px wide the extra points are sub-pixel — and it keeps the whole
 * outline under 1.6KB.
 *
 * Islands smaller than 1.5 square pixels at the draw size were dropped, which
 * leaves the mainland and Tasmania. Anything else was a speck indistinguishable
 * from a stray pin, which is precisely the thing this inset exists to show.
 *
 * ── THE PROJECTION ───────────────────────────────────────────────────────
 * Plain spherical Mercator, fitted to the viewBox below with a 4-unit margin.
 * Mercator badly distorts area at high latitudes, which is the usual reason
 * not to use it — irrelevant here, because the map is one country spanning
 * 33 degrees of latitude and its job is to be recognisable, not to compare
 * areas. Albers USA can't be reused: it's a US-only projection that returns
 * null for anything outside North America, Australia very much included.
 *
 * The two constants come straight out of d3-geo's fitExtent, so
 * projectAustralia() and the path below agree by construction.
 */

export const AU_VIEWBOX = { width: 200, height: 180 } as const;

/** Fitted d3.geoMercator() parameters — see the note above. */
const SCALE = 260.28654682590656;
const TRANSLATE: readonly [number, number] = [-506.3821054602538, -44.74391343416593];

/** Mainland Australia and Tasmania, as an SVG path in the viewBox above. */
export const AU_PATH =
  'M164.5,158.6L167.2,159.0L167.5,166.2L166.0,168.3L165.5,173.3L163.9,171.6L160.8,176L157.0,175.4L154.2,170.1L153.6,166.0L151.0,160.7L151.1,158.0L158.5,160.6ZM66.6,109.9L57.9,114.0L55.3,119.0L48.6,119.6L44.6,118.6L38.2,119.5L29.7,125.5L23.4,125.3L16.1,120.7L16.2,117.6L18.5,116.8L19.6,109.9L16.7,101.3L16.2,95.4L14.3,90.5L12.2,88.4L11.7,84.4L9.1,80.4L10.4,80.4L8.9,75.7L12.5,79.1L12.4,76.5L8.7,69.5L10.7,62.9L10.3,60.0L12.1,56.5L12.5,60.2L14.4,56.9L23.8,51.4L27.1,51.6L42.6,46.4L48.9,39.3L49.2,34.8L52.4,30.8L54.3,34.9L56.3,33.9L54.6,31.7L56.1,29.4L58.1,30.4L58.6,26.8L64.5,20.5L70.8,18.6L76.7,23.5L82.4,24.0L81.5,21.4L86.9,12.6L89.7,11.0L95.8,10.7L95.8,8.3L92.4,6.8L94.8,6.1L100.3,9.1L108.2,11.3L113.6,9.5L115.7,11.8L108.8,22.8L109.1,24.1L116.2,28.2L126.2,35.4L130.5,37.0L133.5,35.3L137.3,24.4L136.5,18.0L137.2,12.0L139.3,5.7L141.0,4L142.6,9.1L145.6,14.0L145.7,18.3L147.4,22.0L150.3,20.3L154.0,24.1L153.5,26.2L155.2,32.6L157.6,37.2L157.1,39.7L158.6,42.9L163.5,45.5L169.8,49.9L173.5,59.4L175.3,58.3L178.3,59.7L179.1,64.9L188.0,73.9L189.2,78.0L189.0,84.0L191.2,88.4L190.9,92.9L188.9,100.0L188.1,106.9L186.1,111.7L182.8,114.4L179.6,121.3L175.3,133.1L175.0,138.8L172.4,140.8L167.3,141.0L163.1,143.4L158.3,148.1L151.7,144.5L152.4,141.5L146.0,146.8L132.5,142.2L129.5,138.7L127.6,131.5L125.4,129.2L121.0,128.5L122.5,125.8L121.4,121.7L119.2,125.6L115.2,126.6L117.5,123.5L120.0,117.7L119.6,113.6L115.9,118.3L113.1,120.1L111.3,124.5L107.8,122.2L107.9,119.3L102.7,113.4L103.5,112.1L97.7,108.8L94.5,108.7L90.2,106.1L82.0,106.6L71.0,110.3Z';

/**
 * Latitude/longitude to a point in AU_VIEWBOX.
 *
 * Returns null outside the drawn area rather than a point off the edge of the
 * SVG, so a coordinate typo shows up as a missing pin instead of a pin quietly
 * clipped into nothing. Latitude is clamped short of the poles because
 * Mercator sends them to infinity.
 */
export function projectAustralia(lat: number, lon: number): [number, number] | null {
  if (lat <= -85 || lat >= 85) return null;
  const lambda = (lon * Math.PI) / 180;
  const phi = (lat * Math.PI) / 180;
  const x = TRANSLATE[0] + SCALE * lambda;
  const y = TRANSLATE[1] - SCALE * Math.log(Math.tan(Math.PI / 4 + phi / 2));
  if (x < 0 || x > AU_VIEWBOX.width || y < 0 || y > AU_VIEWBOX.height) return null;
  return [x, y];
}
