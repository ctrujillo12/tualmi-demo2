'use client';

import Link from 'next/link';
import CheckoutForm from '@/components/CheckoutForm';

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link
            href="/cart"
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
          >
            ← Back to Cart
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <CheckoutForm />
      </div>
    </div>
  );
}