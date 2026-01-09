'use client';

import { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { useCartStore } from '@/store/cartStore';
import { getStripe } from '@/lib/stripe';
import CheckoutForm from '@/components/CheckoutForm';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const [orderComplete, setOrderComplete] = useState(false);

  const total = getTotal();
  const shipping = total > 100 ? 0 : 10;
  const finalTotal = total + shipping;

  const handleSuccess = () => {
    setOrderComplete(true);
    clearCart();
  };

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-16">
          <h2 className="font-serif text-3xl font-bold text-sand-900 mb-4">
            Your cart is empty
          </h2>
          <p className="text-sand-600 mb-8">
            Add some items to checkout
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

  if (orderComplete) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-serif text-3xl font-bold text-sand-900 mb-4">
            Order Confirmed!
          </h1>
          <p className="text-sand-600 mb-8">
            Thank you for your purchase. Your order has been successfully placed and you will receive a confirmation email shortly.
          </p>
          <div className="space-y-4">
            <Link
              href="/products"
              className="block w-full bg-ocean-600 text-white py-3 rounded-md font-semibold hover:bg-ocean-700 transition-colors"
            >
              Continue Shopping
            </Link>
            <Link
              href="/"
              className="block w-full border-2 border-sand-300 text-sand-700 py-3 rounded-md font-semibold hover:bg-sand-50 transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-serif text-4xl font-bold text-sand-900 mb-8">
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <Elements stripe={getStripe()}>
              <CheckoutForm total={finalTotal} onSuccess={handleSuccess} />
            </Elements>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
            <h2 className="font-serif text-2xl font-bold text-sand-900 mb-6">
              Order Summary
            </h2>

            <div className="space-y-4 mb-6">
              {items.map((item, index) => (
                <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}-${index}`} className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium text-sand-900">{item.name}</p>
                    <p className="text-sand-600">
                      {item.selectedSize} | {item.selectedColor} | Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium text-sand-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-sand-200 pt-4 space-y-2">
              <div className="flex justify-between text-sand-600">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sand-600">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg text-sand-900 pt-2 border-t border-sand-200">
                <span>Total</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}