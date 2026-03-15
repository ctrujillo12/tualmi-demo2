import { Product } from '@/types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Trailblazer Fleece',
    description: 'A cozy fleece designed for the outdoors. Soft, breathable, and warm with a relaxed fit and reinforced seams. Perfect for hiking, camping, or everyday adventures.',
    price: 11000, // $29.99 in cents
    images: [
      '/images-2/fleece-pink-bg.png',
      '/images-2/fleece-yellow-bg.png'
    ],
    category: 'Outerwear',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Pink', 'Lemon'],
    stock: 150,
  },
  {
    id: '2',
    name: 'Summit Pant',
    description: 'Durable hiking pants built for all terrains. Stretch fabric for mobility, reinforced stitching, and multiple pockets for essentials.',
    price: 9000, // $89.99 in cents
    images: [
      '/images-2/pants-olive.png',
      '/images-2/pants-white-bg.png'
    ],
    category: 'Bottoms',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Olive', 'Cream'],
    stock: 75,
  },
  {
    id: '3',
    name: 'Trail Baby Tee',
    description: 'Engineered with ultra-soft performance fabric, this tee offers a second-skin feel while providing UPF 40 protection and the perfect fit that flexes with your moves. Light, breathable, and designed with your workouts in mind, this tee is built to perform.',
    price: 3800, // $69.99 in cents
    images: [
      '/images-2/shirt-yellow-bg.png',
      '/images-2/shirt-pink-bg.png'
    ],
    category: 'Tops',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Lemon', 'Pink'],
    stock: 120,
  },
  {
    id: '4',
    name: 'Horizon Shorts',
    description: 'Lightweight, breathable shorts for summer hikes or trail running. Mid-rise waist, comfortable fit, and easy movement.',
    price: 7000, // $69.99 in cents
    images: [
      '/images-2/shorts-red-bg.png',
      '/images-2/shorts-pink-bg.png',
      '/images-2/shorts-pattern-bg.png'
    ],
    category: 'Bottoms',
    sizes: ['28', '30', '32', '34', '36', '38'],
    colors: ['Red', 'Plaid', 'Pink/Green'],
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
  {
    id: '6',
    name: 'Trailblazing Tote',
    description: 'Join the Club!',
    price: 1200, // $12.00 in cents
    images: [
      '/images-2/tote-bg.png',
    ],
    category: 'Accessories',
    sizes: ['One Size'],
    colors: ['Classic'],
    stock: 120,
  },
  
];