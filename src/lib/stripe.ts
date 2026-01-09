import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    // Use your actual publishable key here
    // For demo purposes, using a placeholder
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder';
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};