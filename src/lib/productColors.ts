// Shared color swatch definitions — used by ProductCard and ProductDetailClient.
// Keep these in sync with product.colors values from Shopify/localProducts.

export const PRODUCT_COLORS: Record<string, { name: string; value: string }[]> = {
  'trailblazing-fleece': [
    { name: 'Wildflower',  value: '#E8A0B8' },
    { name: 'Golden Hour', value: '#E8C84A' },
  ],
  'juniper-pant': [
    { name: 'Birch',       value: '#E4DCC8' },
    { name: 'Olive',       value: '#7A8352' },
  ],
  'alpine-baby-tee': [
    { name: 'Petal',       value: '#F2C4CE' },
    { name: 'Solstice',    value: '#D4A843' },
  ],
  // Order matches the image order in products.ts (berry → gingham → retro print)
  'sierra-shorts': [
    { name: 'Jam',      value: '#8E3A56' },
    { name: 'Picnic',   value: '#E7A6C0' },
    { name: 'Confetti', value: 'linear-gradient(135deg, #F2E9DA 0 25%, #A8C484 25% 50%, #7A5C3E 50% 75%, #E28FB4 75% 100%)' },
  ],
};

// Explicit gallery images per colorway (used when a product has different
// numbers of photos per color). Lead/front shot first.
const PP = '/images-2/model';
export const PRODUCT_COLOR_IMAGES: Record<string, Record<string, string[]>> = {
  'sierra-shorts': {
    // Lead shot first (clean full-body front), then back / lifestyle / detail.
    Jam:      [`${PP}/jam-4.jpg`, `${PP}/jam-6.jpg`, `${PP}/jam-3.jpg`, `${PP}/jam-5.jpg`, `${PP}/jam-1.jpg`, `${PP}/jam-2.jpg`],
    Picnic:   [`${PP}/picnic-2.jpg`, `${PP}/picnic-3.jpg`, `${PP}/picnic-1.jpg`],
    Confetti: [`${PP}/confetti-3.jpg`, `${PP}/confetti-5.jpg`, `${PP}/confetti-2.jpg`, `${PP}/confetti-4.jpg`, `${PP}/confetti-1.jpg`],
  },
  'juniper-pant': {
    Birch: [`${PP}/birch-3.jpg`, `${PP}/birch-7.jpg`, `${PP}/birch-4.jpg`, `${PP}/birch-1.jpg`, `${PP}/birch-2.jpg`],
    Olive: [`${PP}/olive-2.jpg`, `${PP}/olive-1.jpg`, `${PP}/olive-4.jpg`, `${PP}/olive-3.jpg`],
  },
};
