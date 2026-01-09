import { Product } from '@/types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Azure Wave Bikini',
    description: 'Elegant two-piece bikini with adjustable straps and full coverage. Perfect for beach days and poolside relaxation.',
    price: 89.99,
    image: '/images-2/collec1.jpg',
    category: 'Bikini',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Ocean Blue', 'Coral Pink', 'White'],
  },
  {
    id: '2',
    name: 'Sunset One-Piece',
    description: 'Sophisticated one-piece swimsuit with flattering cut and supportive fit. Features a modern silhouette.',
    price: 119.99,
    image: '/images-2/collec2.jpg',
    category: 'One-Piece',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Sunset Orange', 'Black', 'Navy'],
  },
  {
    id: '3',
    name: 'Paradise High-Waist Set',
    description: 'Retro-inspired high-waisted bikini set with modern details. Offers excellent coverage and style.',
    price: 94.99,
    image: '/images-2/pinterest.jpg',
    category: 'Bikini',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Mint Green', 'Lavender', 'Peach'],
  },
  {
    id: '4',
    name: 'Coastal Breeze Bikini',
    description: 'Classic triangle bikini with tie details. Lightweight and comfortable for all-day wear.',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1551225183-94acb7d595b6?w=800&q=80',
    category: 'Bikini',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['White', 'Sky Blue', 'Sand'],
  },
  {
    id: '5',
    name: 'Serene Waters One-Piece',
    description: 'Timeless one-piece with elegant neckline and back detail. Perfect for confident swimming and sunbathing.',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1591137127259-a5f4c86d0344?w=800&q=80',
    category: 'One-Piece',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Emerald', 'Ruby Red', 'Black'],
  },
  {
    id: '6',
    name: 'Island Paradise Bikini',
    description: 'Vibrant print bikini with adjustable coverage. Made from premium, quick-dry fabric.',
    price: 84.99,
    image: 'https://images.unsplash.com/photo-1580533129823-86eedf7eb4c5?w=800&q=80',
    category: 'Bikini',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Tropical Print', 'Floral Blue', 'Sunset'],
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find(product => product.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter(product => product.category === category);
}