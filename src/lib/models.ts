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
 * to the photograph, which is the only level at which it is actually true.
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
  /** Bare size word; the article is added at render time. */
  size: string;
};

export const MODELS = {
  cheyenne:  { name: 'cheyenne',  height: `5'4"`,  size: 'small' },
  fia:       { name: 'fia',       height: `5'10"`, size: 'medium' },
  haley:     { name: 'haley',     height: `4'11"`, size: 'medium' },
  // Logan shot both the Picnic shorts and the Birch pant, at the same height
  // and the same size — one entry, referenced from both.
  logan:     { name: 'logan',     height: `5'7"`,  size: 'small' },
  stephanie: { name: 'stephanie', height: `5'2"`,  size: 'extra small' },
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
 * Picnic: Stephanie's frames are the zero-padded ones — sierra-picnic00.jpg
 * through sierra-picnic05.jpg. Note the pattern needs TWO digits, so
 * sierra-picnic0.jpg (Logan) does not match, and neither does picnic5.
 */
const BY_IMAGE: { test: RegExp; model: ModelKey }[] = [
  { test: /sierra-picnic0\d\.jpg$/, model: 'stephanie' },
];

const withArticle = (size: string) => (/^e/i.test(size) ? `an ${size}` : `a ${size}`);

export function modelForImage(handle: string, colorName: string, src: string): Model | undefined {
  for (const rule of BY_IMAGE) if (rule.test.test(src)) return MODELS[rule.model];
  const key = BY_COLORWAY[handle]?.[colorName];
  return key ? MODELS[key] : undefined;
}

/** Caption under a photo: "logan · 5'7" · wearing a small" */
export function modelTag(m: Model): string {
  return `${m.name} · ${m.height} · wearing ${withArticle(m.size)}`;
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
  return seen.map((m) => `${m.name} is ${m.height} and wearing ${withArticle(m.size)}`).join('; ');
}
