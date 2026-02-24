import { Product } from '@/types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Trailblazer Fleece',
    description: 'A cozy fleece designed for the outdoors. Soft, breathable, and warm with a relaxed fit and reinforced seams. Perfect for hiking, camping, or everyday adventures.',
    price: 11000, // $29.99 in cents
    images: [
      '/images-2/polka-fleece-bg.png',
      '/images-2/pink-fleece-bg.png',
      '/images-2/yellow-fleece-bg.png'
    ],
    category: 'Outerwear',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Pink', 'Polka', 'Green'],
    stock: 150,
  },
  {
    id: '2',
    name: 'Summit Pant',
    description: 'Durable hiking pants built for all terrains. Stretch fabric for mobility, reinforced stitching, and multiple pockets for essentials.',
    price: 9000, // $89.99 in cents
    images: [
      '/images-2/olive-pants-bg.png',
      '/images-2/gray-pants-bg.png'
    ],
    category: 'Bottoms',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Olive', 'Gray'],
    stock: 75,
  },
  // {
  //   id: '3',
  //   name: 'Trail Capri',
  //   description: 'Contemporary slim-fit chinos crafted from stretch cotton twill. Perfect for both casual and smart-casual occasions. Features a mid-rise waist and tapered leg.',
  //   price: 7000, // $69.99 in cents
  //   images: [
  //     '/images-2/white-pants.png',
  //   ],
  //   category: 'Bottoms',
  //   sizes: ['28', '30', '32', '34', '36', '38'],
  //   colors: ['Khaki', 'Navy', 'Black', 'Olive'],
  //   stock: 120,
  // },
  {
    id: '4',
    name: 'Horizon Shorts',
    description: 'Lightweight, breathable shorts for summer hikes or trail running. Mid-rise waist, comfortable fit, and easy movement.',
    price: 7000, // $69.99 in cents
    images: [
      '/images-2/yellow-shorts-bg.png',
    ],
    category: 'Bottoms',
    sizes: ['28', '30', '32', '34', '36', '38'],
    colors: ['Yellow'],
    stock: 120,
  },
  {
    id: '5',
    name: 'Carabiner',
    description: 'A decorative carabiner for your adventures.',
    price: 1200, // $12.00 in cents
    images: [
      '/images-2/carabiner.png',
    ],
    category: 'Accessories',
    sizes: ['One Size'],
    colors: ['Pink'],
    stock: 120,
  },
  
  
];