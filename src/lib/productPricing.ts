import type { Product } from '@/types';

export function getVariantPricing(
  product: Pick<Product, 'price' | 'compareAtPrice' | 'variants'>,
  size: string,
  color: string,
): { price: number; compareAtPrice?: number } {
  const normalizedSize = size.toLowerCase();
  const normalizedColor = color.toLowerCase();
  const variant = product.variants.find((candidate) => {
    const options = candidate.selectedOptions.map((option) => ({
      name: option.name.toLowerCase(),
      value: option.value.toLowerCase(),
    }));
    return options.some((option) => option.name === 'size' && option.value === normalizedSize)
      && options.some((option) => option.name === 'color' && option.value === normalizedColor);
  });

  if (!variant) return { price: product.price, compareAtPrice: product.compareAtPrice };

  return {
    price: Math.round(parseFloat(variant.price.amount) * 100),
    compareAtPrice: variant.compareAtPrice
      ? Math.round(parseFloat(variant.compareAtPrice.amount) * 100)
      : undefined,
  };
}