// Shared color swatch definitions — used by ProductCard and ProductDetailClient.
// Keep these in sync with product.colors values from Shopify/localProducts.

export const PRODUCT_COLORS: Record<string, { name: string; value: string }[]> = {
  'trailblazing-fleece': [
    { name: 'Wildflower',  value: '#E8A0B8' },
    { name: 'Golden Hour', value: '#E8C84A' },
  ],
  'summit-pant': [
    { name: 'Moss',        value: '#7A8C52' },
    { name: 'Birch',       value: '#EDE8DF' },
  ],
  'alpine-baby-tee': [
    { name: 'Petal',       value: '#F2C4CE' },
    { name: 'Solstice',    value: '#D4A843' },
    
  ],
  'horizon-shorts': [
    { name: 'Meadow',      value: 'linear-gradient(135deg, #A8C484 50%, #7A9E6A 50%)' },
    { name: 'Dusk',        value: '#C49AB0' },
    { name: 'Canyon',      value: '#A85448' },
  ],
  'trailblazing-tote': [
    { name: 'Natural',     value: '#D6C9B0' },
  ],
};
