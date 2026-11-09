/**
 * Every photo and video of people wearing Tualmi, in one list.
 *
 * TO ADD CREATOR OR CUSTOMER CONTENT: put the file in public/images-2/wild/ (or
 * public/videos/), add an entry to CUSTOMERS or SOCIAL below, and fill in
 * credit, height and size where you have them. Blank fields simply don't show.
 * Only add people who have given permission, and set `gifted: true` for anyone
 * who received free product.
 */
export type CommunityItem = {
  id: string;
  type: 'image' | 'video';
  src: string;
  poster?: string;
  alt: string;
  kind: 'editorial' | 'customer' | 'social';
  handle?: 'juniper-pant' | 'sierra-shorts';
  color?: string;
  credit?: string;
  height?: string;
  size?: string;
  place?: string;
  gifted?: boolean;
  externalUrl?: string;
};

const J = '/images-2/jackson-hole';
const W = '/images-2/wild';

export type JhShot = {
  n: number;
  color: 'Birch' | 'Olive' | 'both';
  alt: string;
  wide?: boolean;
};

export const jh = (n: number) => `${J}/jh-${n}.jpg`;

/** The Jackson Hole shoot, in lookbook order. */
export const JACKSON_HOLE: JhShot[] = [
  { n: 138, color: 'both', alt: 'Two women in Juniper Pants in a sagebrush meadow under clouded peaks' },
  { n: 146, color: 'Birch', alt: 'Standing on one leg in the Birch Juniper Pant, peaks behind' },
  { n: 113, color: 'Olive', alt: 'Walking along a mountain road in the Olive Juniper Pant' },
  { n: 129, color: 'both', alt: 'Two friends dancing down a mountain road in Juniper Pants', wide: true },
  { n: 104, color: 'Birch', alt: 'Hair mid-flip on a mountain road in the Birch Juniper Pant' },
  { n: 158, color: 'Olive', alt: 'Leaning on a split-rail fence in the Olive Juniper Pant, horses behind' },
  { n: 26, color: 'both', alt: 'Two friends balancing on a fallen log in Juniper Pants', wide: true },
  { n: 22, color: 'Birch', alt: 'Sitting on a rock above a lake in the Birch Juniper Pant' },
  { n: 31, color: 'Olive', alt: 'Standing on a log among pines in the Olive Juniper Pant' },
  { n: 119, color: 'Olive', alt: 'Sitting on the center line of a mountain road in the Olive Juniper Pant' },
  { n: 125, color: 'Birch', alt: 'Handstand on a mountain road in the Birch Juniper Pant' },
  { n: 189, color: 'both', alt: 'Two friends at a ranch fence beside a horse, mountains behind', wide: true },
  { n: 201, color: 'Birch', alt: 'Legs up on a ranch fence in the Birch Juniper Pant and turquoise boots' },
  { n: 207, color: 'both', alt: 'Pulling on a boot at a ranch fence in Juniper Pants' },
  { n: 193, color: 'Olive', alt: 'Stretched across a ranch fence in the Olive Juniper Pant', wide: true },
  { n: 73, color: 'both', alt: 'Two friends hiking a forest trail in Juniper Pants' },
  { n: 90, color: 'Olive', alt: 'Reaching skyward on the trail in the Olive Juniper Pant' },
  { n: 142, color: 'both', alt: 'Two friends from behind in Juniper Pants, facing the peaks', wide: true },
  { n: 115, color: 'Olive', alt: 'Waist and cargo pocket detail of the Olive Juniper Pant' },
  { n: 224, color: 'Birch', alt: 'Flared hem of the Birch Juniper Pant over turquoise boots' },
];

const place = 'jackson hole, wy';

const EDITORIAL: CommunityItem[] = JACKSON_HOLE.filter((s) => !s.wide)
  .slice(0, 10)
  .map((s) => ({
    id: `jh-${s.n}`,
    type: 'image' as const,
    src: jh(s.n),
    alt: s.alt,
    kind: 'editorial' as const,
    handle: 'juniper-pant' as const,
    color: s.color === 'both' ? undefined : s.color,
    place,
  }));

export const CUSTOMERS: CommunityItem[] = [
  { id: 'wild-2', type: 'image', src: `${W}/wild-2.jpg`, alt: 'Hiker in the Confetti Sierra Shorts below jagged peaks', kind: 'customer', handle: 'sierra-shorts', color: 'Confetti' },
  { id: 'wild-4', type: 'image', src: `${W}/wild-4.jpg`, alt: 'Sitting on a picnic table in the Picnic Sierra Shorts', kind: 'customer', handle: 'sierra-shorts', color: 'Picnic' },
  { id: 'wild-6', type: 'image', src: `${W}/wild-6.jpg`, alt: 'Looking out from a ridgeline in the Confetti Sierra Shorts', kind: 'customer', handle: 'sierra-shorts', color: 'Confetti' },
  { id: 'wild-3', type: 'image', src: `${W}/wild-3.jpg`, alt: 'Cyclist in Sierra Shorts on a boardwalk trail through pines', kind: 'customer', handle: 'sierra-shorts', color: 'Picnic' },
  { id: 'wild-1', type: 'image', src: `${W}/wild-1.jpg`, alt: 'Hiker in Sierra Shorts on a rocky ridge above a snowfield', kind: 'customer', handle: 'sierra-shorts' },
  { id: 'wild-7', type: 'image', src: `${W}/wild-7.jpg`, alt: 'Swinging from a tree branch over a creek in Sierra Shorts', kind: 'customer', handle: 'sierra-shorts' },
  { id: 'wild-5', type: 'image', src: `${W}/wild-5.jpg`, alt: 'Confetti Sierra Shorts at altitude, mountains behind', kind: 'customer', handle: 'sierra-shorts', color: 'Confetti' },
];

/** Placeholder-quality exports for now. Swap `src` when the raw videos arrive. */
export const SOCIAL: CommunityItem[] = [
  { id: 'clip-1', type: 'video', src: '/videos/clip-1.mp4', poster: '/videos/poster-1.jpg', alt: 'Tualmi TikTok', kind: 'social', externalUrl: 'https://www.tiktok.com/@tualmi.outdoors/video/7625759601576660238' },
  { id: 'clip-2', type: 'video', src: '/videos/clip-2.mp4', poster: '/videos/poster-2.jpg', alt: 'Tualmi TikTok', kind: 'social', externalUrl: 'https://www.tiktok.com/@tualmi.outdoors/video/7611273720295984398' },
  { id: 'clip-3', type: 'video', src: '/videos/clip-3.mp4', poster: '/videos/poster-3.jpg', alt: 'Tualmi TikTok', kind: 'social', externalUrl: 'https://www.tiktok.com/@tualmi.outdoors/video/7666576797592456461' },
  { id: 'clip-4', type: 'video', src: '/videos/clip-4.mp4', poster: '/videos/poster-4.jpg', alt: 'Tualmi TikTok', kind: 'social', externalUrl: 'https://www.tiktok.com/@tualmi.outdoors' },
];

/** Weaves two lists together so one kind of content never clumps. */
function weave(a: CommunityItem[], b: CommunityItem[]) {
  const out: CommunityItem[] = [];
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i]) out.push(a[i]);
    if (b[i]) out.push(b[i]);
  }
  return out;
}

export const HOME_ROW = weave(SOCIAL, CUSTOMERS.slice(0, 4));
export const WILD_GALLERY = [...weave(CUSTOMERS, SOCIAL), ...EDITORIAL];

const LIFE = '/images-2/lifestyle';
/** Sierra lifestyle shots that used to sit in the buy box. Flat lays left out. */
const SIERRA_LIFESTYLE: CommunityItem[] = [
  ...['picnic-life-1', 'picnic-life-3', 'picnic-life-5', 'picnic-life-2', 'picnic-life-4'].map((f) => ({ f, color: 'Picnic' })),
  ...['confetti-life-1', 'confetti-life-3', 'confetti-life-4', 'confetti-life-2', 'confetti-life-5'].map((f) => ({ f, color: 'Confetti' })),
  ...['jam-life-1', 'jam-life-2', 'jam-life-3'].map((f) => ({ f, color: 'Jam' })),
].map(({ f, color }) => ({
  id: f,
  type: 'image' as const,
  src: `${LIFE}/${f}.jpg`,
  alt: `Sierra Shorts in ${color}, worn outdoors`,
  kind: 'editorial' as const,
  handle: 'sierra-shorts' as const,
  color,
}));

export const itemsForProduct = (handle: string) =>
  handle === 'juniper-pant'
    ? EDITORIAL
    : handle === 'sierra-shorts'
      ? weave(CUSTOMERS, SIERRA_LIFESTYLE)
      : [];

/** Lead photo per colorway for shop cards. Sierra uses its studio product photos. */
export const SHOP_COVERS: Record<string, Record<string, string>> = {
  'juniper-pant': { Birch: jh(146), Olive: jh(113) },
};

/** Jackson Hole frame that opens the Juniper gallery, per colorway. */
export const PDP_LEAD: Record<string, Record<string, string[]>> = {
  'juniper-pant': { Birch: [jh(146)], Olive: [jh(113)] },
};

export const productLabel = (h?: string) =>
  h === 'juniper-pant' ? 'juniper pant' : h === 'sierra-shorts' ? 'sierra shorts' : '';
