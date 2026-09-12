/**
 * Who is wearing the clothes in each photograph.
 *
 * ── WHY THIS IS PER-IMAGE AND NOT PER-PRODUCT ────────────────────────────
 * It used to be one line on the product: PRODUCT_DETAILS.modelNote, reading
 * "rachel is 5'6" and wearing a size small" for both the shorts and the pant.
 * That stopped being true the moment the September 2026 studio shoot used a
 * different model per colourway — and it was never going to survive Picnic,
 * which was shot with two models in the same gallery.
 *
 * A height on a product page is not decoration: it is the number a shopper
 * sizes herself against. A wrong one is a return. So attribution is attached
 * to the photograph, which is the only level at which it is actually true —
 * even though it now surfaces as one line in the fit block rather than as a
 * caption per photo. Picnic still needs the per-image mapping: it is what
 * makes that line name both models instead of only the first.
 *
 * A colourway with no entry here renders no line at all, rather than falling
 * back to something generic. Silence is the correct default: no claim beats a
 * claim that might be wrong.
 */

export type Model = {
  /** Lowercase — the site sets names in lowercase throughout. */
  name: string;
  /** As displayed, e.g. 5'7" */
  height: string;
  /** Size code, matching the size pills on the page: XS / S / M. */
  size: string;
};

export const MODELS = {
  cheyenne:  { name: 'cheyenne',  height: `5'4"`,  size: 'S' },
  fia:       { name: 'fia',       height: `5'10"`, size: 'M' },
  haley:     { name: 'haley',     height: `4'11"`, size: 'M' },
  // Logan shot both the Picnic shorts and the Birch pant, at the same height
  // and the same size — one entry, referenced from both.
  logan:     { name: 'logan',     height: `5'7"`,  size: 'S' },
  stephanie: { name: 'stephanie', height: `5'2"`,  size: 'XS' },
} satisfies Record<string, Model>;

type ModelKey = keyof typeof MODELS;

/** The model for a colourway, when the whole colourway is one model. */
const BY_COLORWAY: Record<string, Record<string, ModelKey>> = {
  'sierra-shorts': {
    Jam:      'fia',
    Picnic:   'logan',
    Confetti: 'haley',
  },
  'juniper-pant': {
    Birch: 'logan',
    Olive: 'cheyenne',
  },
};

/**
 * Per-image overrides, for a colourway shot with more than one model.
 *
 * Picnic: Stephanie's frames are now named for her — picnic-steph-*.jpg. This
 * used to key off zero-padded numbers in the old filenames, which worked but
 * was a trap: picnic05 was hers and picnic5 was Logan's. The re-edited set is
 * named by model, so the rule says what it means.
 */
const BY_IMAGE: { test: RegExp; model: ModelKey }[] = [
  { test: /picnic-steph-/, model: 'stephanie' },
];

export function modelForImage(handle: string, colorName: string, src: string): Model | undefined {
  for (const rule of BY_IMAGE) if (rule.test.test(src)) return MODELS[rule.model];
  const key = BY_COLORWAY[handle]?.[colorName];
  return key ? MODELS[key] : undefined;
}

/**
 * The fit-and-sizing line for a colourway, built from the models actually
 * present in the gallery being shown — so it can never drift out of step with
 * the photographs the way a hand-written sentence did.
 */
export function modelNoteFor(handle: string, colorName: string, images: string[]): string | undefined {
  const seen: Model[] = [];
  for (const src of images) {
    const m = modelForImage(handle, colorName, src);
    if (m && !seen.some((s) => s.name === m.name)) seen.push(m);
  }
  if (seen.length === 0) return undefined;
  return seen.map((m) => `${m.name} is ${m.height} and wearing ${m.size}`).join('; ');
}
