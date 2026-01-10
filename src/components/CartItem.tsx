'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CartItem as CartItemType } from '@/types';
import { useCartStore } from '@/store/cartStore';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore();

  const handleQuantityChange = (newQuantity: number) => {
    updateQuantity(
      item.product.id,
      item.selectedSize,
      item.selectedColor,
      newQuantity
    );
  };

  const handleRemove = () => {
    removeItem(item.product.id, item.selectedSize, item.selectedColor);
  };

  return (
    <div className="flex gap-4 py-6 border-b border-gray-200">
      {/* Product Image */}
      <Link
        href={`/products/${item.product.id}`}
        className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100"
      >
        <Image
          src={item.product.images[0]}
          alt={item.product.name}
          fill
          className="object-cover"
        />
      </Link>

      {/* Product Details */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between">
            <div>
              <Link
                href={`/products/${item.product.id}`}
                className="text-lg font-medium text-gray-900 hover:text-gray-700"
              >
                {item.product.name}
              </Link>
              <div className="mt-1 text-sm text-gray-600">
                <p>Size: {item.selectedSize}</p>
                <p>Color: {item.selectedColor}</p>
              </div>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              ${((item.product.price * item.quantity) / 100).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Quantity and Remove */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50"
            >
              -
            </button>
            <span className="text-sm font-medium w-8 text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50"
            >
              +
            </button>
          </div>

          <button
            onClick={handleRemove}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}