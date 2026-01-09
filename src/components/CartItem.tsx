'use client';

import Image from 'next/image';
import { CartItem as CartItemType } from '@/types';
import { useCartStore } from '@/store/cartStore';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { removeItem, updateQuantity } = useCartStore();

  const handleQuantityChange = (newQuantity: number) => {
    updateQuantity(item.id, item.selectedSize, item.selectedColor, newQuantity);
  };

  const handleRemove = () => {
    removeItem(item.id, item.selectedSize, item.selectedColor);
  };

  return (
    <div className="flex gap-4 py-6 border-b border-sand-200">
      <div className="relative w-24 h-24 flex-shrink-0">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover rounded"
          sizes="96px"
        />
      </div>

      <div className="flex-1">
        <div className="flex justify-between">
          <div>
            <h3 className="font-semibold text-sand-900">{item.name}</h3>
            <p className="text-sm text-sand-600 mt-1">
              Size: {item.selectedSize} | Color: {item.selectedColor}
            </p>
          </div>
          <p className="font-semibold text-sand-900">
            ${(item.price * item.quantity).toFixed(2)}
          </p>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              className="w-8 h-8 flex items-center justify-center border border-sand-300 rounded hover:bg-sand-100 transition-colors"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-8 text-center font-medium">{item.quantity}</span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              className="w-8 h-8 flex items-center justify-center border border-sand-300 rounded hover:bg-sand-100 transition-colors"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <button
            onClick={handleRemove}
            className="text-sm text-red-600 hover:text-red-700 transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}