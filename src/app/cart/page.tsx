'use client';

import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import CartItem from '@/components/CartItem';
import HeaderStaticBlack from '@/components/HeaderStaticBlack';

export default function CartPage() {
  const { items, getTotal } = useCartStore();
  const total = getTotal();
  const shipping = total > 100 ? 0 : 10;
  const finalTotal = total + shipping;

  // Empty cart view
  if (items.length === 0) {
    return (
      <>
        <HeaderStaticBlack />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center py-16">
            <svg
              className="w-24 h-24 text-sand-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>

            <h2 className="font-serif text-2xl md:text-3xl font-normal text-sand-900 mb-4 tracking-wide">
              Your cart is empty
            </h2>

            <p className="text-sand-600 text-sm md:text-base mb-8 leading-relaxed">
              Add some beautiful gear to get started
            </p>

            <Link
              href="/products"
              className="inline-block bg-sand-900 text-white px-6 md:px-8 py-2 md:py-3 rounded-md font-semibold text-sm md:text-base tracking-wide hover:bg-black transition-colors"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </>
    );
  }

  // Cart with items
  return (
    <>
      <HeaderStaticBlack />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h1 className="font-serif text-2xl md:text-4xl font-normal text-sand-900 mb-8 tracking-wide">
          Shopping Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-sand-50 rounded-lg shadow-sm p-6 space-y-4">
              {items.map((item, index) => (
                <CartItem
                  key={`${item.id}-${item.selectedSize}-${item.selectedColor}-${index}`}
                  item={item}
                />
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-sand-50 rounded-lg shadow-sm p-6 sticky top-24 space-y-4">
              <h2 className="font-serif text-xl md:text-2xl font-normal text-sand-900 mb-4 tracking-wide">
                Order Summary
              </h2>

              <div className="space-y-2">
                <div className="flex justify-between text-sand-600 text-sm md:text-base">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sand-600 text-sm md:text-base">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                </div>
                {total > 100 && (
                  <div className="text-sm text-green-600">🎉 You qualify for free shipping!</div>
                )}
                <div className="border-t border-sand-200 pt-3 flex justify-between font-serif font-semibold text-base md:text-lg text-sand-900 tracking-wide">
                  <span>Total</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="block w-full bg-sand-900 text-white py-2 md:py-3 rounded-md font-semibold text-sm md:text-base text-center tracking-wide hover:bg-black transition-colors"
              >
                Proceed to Checkout
              </Link>

              <Link
                href="/products"
                className="block w-full text-center text-sand-900 hover:text-black text-sm md:text-base tracking-wide transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
