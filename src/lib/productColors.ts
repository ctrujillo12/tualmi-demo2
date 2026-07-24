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
  'trailblazing-tote': [
    { name: 'Natural',     value: '#D6C9B0' },
  ],
};

// Explicit gallery images per colorway (used when a product has different
// numbers of photos per color). Lead/front shot first.
const PP = '/images-2/product-photos';
export const PRODUCT_COLOR_IMAGES: Record<string, Record<string, string[]>> = {
  'sierra-shorts': {
    Jam:      [`${PP}/jam1.jpg`, `${PP}/jam2.jpg`, `${PP}/jam3.jpg`, `${PP}/jam4.jpg`, `${PP}/jam5.jpg`, `${PP}/jam6.jpg`],
    Picnic:   [`${PP}/picnic1.jpg`, `${PP}/picnic2.jpg`, `${PP}/picnic3.jpg`, `${PP}/picnic4.jpg`],
    Confetti: [`${PP}/confetti5.jpg`, `${PP}/confetti1.jpg`, `${PP}/confetti2.jpg`, `${PP}/confetti3.jpg`],
  },
  'juniper-pant': {
    Birch: [`${PP}/juniper4.jpg`, `${PP}/juniper3.jpg`, `${PP}/juniper2.jpg`, `${PP}/juniper1.jpg`],
    Olive: [`${PP}/olive1.jpg`, `${PP}/olive2.jpg`, `${PP}/olive3.jpg`, `${PP}/olive4.jpg`],
  },
};
