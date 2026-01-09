'use client';

import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import CartItem from '@/components/CartItem';

export default function CartPage() {
  const { items, getTotal } = useCartStore();
  const total = getTotal();
  const shipping = total > 100 ? 0 : 10;
  const finalTotal = total + shipping;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-16">
          <svg className="w-24 h-24 text-sand-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h2 className="font-serif text-3xl font-bold text-sand-900 mb-4">
            Your cart is empty
          </h2>
          <p className="text-sand-600 mb-8">
            Add some beautiful swimwear to get started
          </p>
          <Link
            href="/products"
            className="inline-block bg-ocean-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-ocean-700 transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-serif text-4xl font-bold text-sand-900 mb-8">
        Shopping Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {items.map((item, index) => (
              <CartItem key={`${item.id}-${item.selectedSize}-${item.selectedColor}-${index}`} item={item} />
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
            <h2 className="font-serif text-2xl font-bold text-sand-900 mb-6">
              Order Summary
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sand-600">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sand-600">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
              </div>
              {total > 100 && (
                <div className="text-sm text-green-600">
                  🎉 You qualify for free shipping!
                </div>
              )}
              <div className="border-t border-sand-200 pt-3 flex justify-between font-semibold text-lg text-sand-900">
                <span>Total</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="block w-full bg-ocean-600 text-white py-3 rounded-md font-semibold text-center hover:bg-ocean-700 transition-colors mb-3"
            >
              Proceed to Checkout
            </Link>

            <Link
              href="/products"
              className="block w-full text-center text-ocean-600 hover:text-ocean-700 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}