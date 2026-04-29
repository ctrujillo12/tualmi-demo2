'use client';

// components/AddToCartButton.tsx
// On the landing page this button links to the product detail page.
// Actual checkout happens on the product detail page.

import Link from 'next/link';

const sans  = "'Jost', 'DM Sans', system-ui, sans-serif";
const black = '#3B2F1E';

interface AddToCartButtonProps {
  product: { handle?: string; id: string };
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const href = `/products/${product.handle ?? product.id}`;

  return (
    <Link
      href={href}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'center',
        border: `1px solid ${black}`,
        padding: '14px 40px',
        fontSize: '10px',
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        color: black,
        textDecoration: 'none',
        fontFamily: sans,
        transition: 'background-color 0.2s ease, color 0.2s ease',
      }}
    >
      Shop now
    </Link>
  );
}