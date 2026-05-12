'use client';

import { useState } from 'react';
import Link from 'next/link';
import CartItem from '@/components/CartItem';
import { useCartStore } from '@/store/cartStore';
import HeaderStaticBlack from '@/components/HeaderStaticBlack';

export default function CartPage() {
  const { items, getTotal, hasPreorderItems, redirectToShopifyCheckout } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = getTotal();
  const tax = total * 0.08;
  const grandTotal = total + tax;
  const containsPreorder = hasPreorderItems();

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await redirectToShopifyCheckout();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <>
        <HeaderStaticBlack />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <h1 className="text-lg font-normal tracking-[0.3em] uppercase mb-12">Cart</h1>
          <div className="text-center space-y-4">
            <div className="text-4xl">🛒</div>
            <p className="text-sm text-sand-600">Your cart is empty</p>
            <Link href="/" className="inline-block text-sm underline underline-offset-4 hover:opacity-70 transition">
              Continue Shopping
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <HeaderStaticBlack />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h1 className="text-lg font-normal tracking-[0.3em] uppercase mb-16">Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

          <div className="lg:col-span-2 space-y-8">
            {items.map((item, index) => (
              <CartItem
                key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}-${index}`}
                item={item}
              />
            ))}
            <Link href="/" className="inline-block text-xs text-sand-600 hover:text-sand-900 transition">
              ← Continue Shopping
            </Link>
          </div>

          <div className="space-y-6">
            <h2 className="text-sm tracking-widest uppercase text-sand-700">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-sand-600">Subtotal</span>
                <span>${(total / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sand-600">Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sand-600">Est. Tax</span>
                <span>${(tax / 100).toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t border-sand-300 pt-4 flex justify-between text-sm">
              <span className="uppercase tracking-wide">Total</span>
              <span>${(grandTotal / 100).toFixed(2)}</span>
            </div>

            {containsPreorder && (
              <p className="text-xs text-[#8C7B6B] leading-relaxed">
                Your cart contains pre-order items. You'll be charged at checkout, and pre-order items will ship when the collection drops.
              </p>
            )}

            {error && (
              <p className="text-xs text-red-600">{error}</p>
            )}

            <button
              onClick={handleCheckout}
              disabled={isLoading}
              className="w-full border border-black py-3 text-sm uppercase tracking-wide hover:bg-black hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Redirecting…' : 'Checkout'}
            </button>

            <p className="text-xs text-sand-500 text-center">
              Secure checkout powered by Shopify
            </p>
          </div>
        </div>
      </main>
    </>
  );
}