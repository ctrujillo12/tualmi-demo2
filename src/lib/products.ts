import { Product } from '@/types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Trailblazer Fleece',
    description: 'A timeless essential made from 100% organic cotton. Soft, breathable, and perfect for everyday wear. Features a relaxed fit and reinforced seams for lasting durability.',
    price: 11000, // $29.99 in cents
    images: [
      '/images-2/polka-fleece-bg.png',
    ],
    category: 'Fleece',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Pink', 'Polka', 'Green'],
    stock: 150,
  },
  {
    id: '2',
    name: 'Summit Pant',
    description: 'Classic denim jacket with a modern fit. Made from premium denim fabric with vintage wash finish. Features button closure, chest pockets, and adjustable cuffs.',
    price: 9000, // $89.99 in cents
    images: [
      '/images-2/olive-pants-bg.png',
    ],
    category: 'Pants',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Olive', 'Gray'],
    stock: 75,
  },
  {
    id: '3',
    name: 'Trail Capri',
    description: 'Contemporary slim-fit chinos crafted from stretch cotton twill. Perfect for both casual and smart-casual occasions. Features a mid-rise waist and tapered leg.',
    price: 7000, // $69.99 in cents
    images: [
      '/images-2/white-pants.png',
    ],
    category: 'Pants',
    sizes: ['28', '30', '32', '34', '36', '38'],
    colors: ['Khaki', 'Navy', 'Black', 'Olive'],
    stock: 120,
  },
  {
    id: '4',
    name: 'Horizon Shorts',
    description: 'Contemporary slim-fit chinos crafted from stretch cotton twill. Perfect for both casual and smart-casual occasions. Features a mid-rise waist and tapered leg.',
    price: 7000, // $69.99 in cents
    images: [
      '/images-2/yellow-shorts-bg.png',
    ],
    category: 'Pants',
    sizes: ['28', '30', '32', '34', '36', '38'],
    colors: ['Khaki', 'Navy', 'Black', 'Olive'],
    stock: 120,
  },
  {
    id: '5',
    name: 'Carabiner',
    description: 'Contemporary slim-fit chinos crafted from stretch cotton twill. Perfect for both casual and smart-casual occasions. Features a mid-rise waist and tapered leg.',
    price: 7000, // $69.99 in cents
    images: [
      '/images-2/carabiner.png',
    ],
    category: 'Pants',
    sizes: ['28', '30', '32', '34', '36', '38'],
    colors: ['Khaki', 'Navy', 'Black', 'Olive'],
    stock: 120,
  },
  
  
];