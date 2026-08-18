/**
 * Behavioural checks for the availability rules. Run: npx tsx scripts/inventory.test.ts
 * Not wired into CI — a scratch harness for verifying the inventory logic.
 */
import assert from 'node:assert/strict';
import {
  availability,
  findVariant,
  isSoldOut,
  isColorSoldOut,
  maxPurchasable,
} from '../src/lib/inventory';
import type { Product } from '../src/types';
import type { ShopifyVariant } from '../src/lib/shopify';

function v(
  color: string,
  size: string,
  availableForSale: boolean,
  quantityAvailable?: number | null,
  currentlyNotInStock = false,
): ShopifyVariant {
  return {
    id: `gid://shopify/ProductVariant/${color}-${size}`,
    title: `${color} / ${size}`,
    price: { amount: '108.00', currencyCode: 'USD' },
    availableForSale,
    quantityAvailable,
    currentlyNotInStock,
    selectedOptions: [
      { name: 'Color', value: color },
      { name: 'Size', value: size },
    ],
  };
}

function product(variants: ShopifyVariant[], sizes = ['S', 'M', 'L']): Product {
  return {
    id: 'sierra-shorts',
    handle: 'sierra-shorts',
    name: 'Sierra Shorts',
    description: '',
    price: 10800,
    images: [],
    category: 'Bottoms',
    sizes,
    colors: ['Picnic', 'Jam'],
    stock: 0,
    variants,
  };
}

let passed = 0;
function check(name: string, fn: () => void) {
  fn();
  passed++;
  console.log(`  ok  ${name}`);
}

console.log('\nquantities readable');
{
  const p = product([
    v('Picnic', 'S', true, 2),
    v('Picnic', 'M', true, 40),
    v('Picnic', 'L', false, 0),
    v('Jam', 'S', true, 12),
    v('Jam', 'M', false, 0),
    v('Jam', 'L', false, 0),
  ]);

  check('a sold-out size is sold out', () => {
    assert.equal(isSoldOut(p, 'Picnic', 'L'), true);
  });
  check('a stocked size is not', () => {
    assert.equal(isSoldOut(p, 'Picnic', 'M'), false);
  });
  check('2 units reads as low, 40 does not', () => {
    assert.equal(availability(p, 'Picnic', 'S').low, true);
    assert.equal(availability(p, 'Picnic', 'M').low, false);
  });
  check('the boundary is "10 or fewer" — 10 is low, 11 is not', () => {
    const q = product([v('Picnic', 'S', true, 10), v('Picnic', 'M', true, 11)]);
    assert.equal(availability(q, 'Picnic', 'S').low, true);
    assert.equal(availability(q, 'Picnic', 'M').low, false);
  });
  check('the real count comes through for the message', () => {
    assert.equal(availability(p, 'Picnic', 'S').quantity, 2);
  });
  check('case and whitespace do not matter', () => {
    assert.equal(isSoldOut(p, ' picnic ', 'l'), true);
  });
  check('the stepper caps at real stock', () => {
    assert.equal(maxPurchasable(p, 'Picnic', 'S', 10), 2);
    assert.equal(maxPurchasable(p, 'Picnic', 'M', 10), 10);
    assert.equal(maxPurchasable(p, 'Picnic', 'L', 10), 0);
  });
  check('a colourway is only sold out when EVERY size is', () => {
    assert.equal(isColorSoldOut(p, 'Picnic'), false); // S and M remain
    assert.equal(isColorSoldOut(p, 'Jam'), false);    // S remains
  });
  check('a fully-gone colourway is sold out', () => {
    const gone = product([
      v('Jam', 'S', false, 0),
      v('Jam', 'M', false, 0),
      v('Jam', 'L', false, 0),
    ]);
    assert.equal(isColorSoldOut(gone, 'Jam'), true);
  });
}

console.log('\nno inventory scope — availableForSale only');
{
  const p = product([
    v('Picnic', 'S', true, undefined),
    v('Picnic', 'M', true, undefined),
    v('Picnic', 'L', false, undefined),
  ]);
  check('sold out is still detected', () => {
    assert.equal(isSoldOut(p, 'Picnic', 'L'), true);
  });
  check('quantity is null, never 0', () => {
    assert.equal(availability(p, 'Picnic', 'S').quantity, null);
  });
  check('the manual override drives low stock', () => {
    // lib/lowStock.ts has 'sierra-shorts|Picnic': ['S']
    assert.equal(availability(p, 'Picnic', 'S').low, true);
    assert.equal(availability(p, 'Picnic', 'M').low, false);
  });
  check('the stepper falls back to the plain cap', () => {
    assert.equal(maxPurchasable(p, 'Picnic', 'S', 10), 10);
  });
}

console.log('\nunknown must never block a sale');
{
  const offline = product([]); // Shopify unreachable — local fallback data
  check('no variants at all = not sold out', () => {
    assert.equal(isSoldOut(offline, 'Picnic', 'S'), false);
    assert.equal(availability(offline, 'Picnic', 'S').status, 'unknown');
  });
  check('no variants = colourway not sold out', () => {
    assert.equal(isColorSoldOut(offline, 'Picnic'), false);
  });
  check('no variants = stepper cap unchanged', () => {
    assert.equal(maxPurchasable(offline, 'Picnic', 'S', 10), 10);
  });

  const p = product([v('Picnic', 'S', true, 5)]);
  check('a combination Shopify does not have is unknown, not sold out', () => {
    assert.equal(availability(p, 'Confetti', 'S').status, 'unknown');
    assert.equal(isSoldOut(p, 'Confetti', 'S'), false);
  });
  check('no size chosen yet is unknown', () => {
    assert.equal(availability(p, 'Picnic', '').status, 'unknown');
  });
}

console.log('\nsizes exempt from the low-stock dot (2XS / 2XL)');
{
  const sizes = ['XXS', '2XS', 'S', 'XXL', '2XL'];
  const p = product(
    [
      v('Picnic', 'XXS', true, 2),
      v('Picnic', '2XS', true, 2),
      v('Picnic', 'S', true, 2),
      v('Picnic', 'XXL', true, 2),
      v('Picnic', '2XL', true, 2),
    ],
    sizes,
  );

  check('no dot on XXS / 2XS / XXL / 2XL even at 2 units', () => {
    for (const s of ['XXS', '2XS', 'XXL', '2XL']) {
      assert.equal(availability(p, 'Picnic', s).low, false, `${s} should not be flagged`);
    }
  });
  check('a normal size at the same count still gets the dot', () => {
    assert.equal(availability(p, 'Picnic', 'S').low, true);
  });
  check('the real quantity is still reported, just not flagged', () => {
    assert.equal(availability(p, 'Picnic', '2XL').quantity, 2);
  });
  check('an exempt size that hits zero is STILL sold out', () => {
    const gone = product([v('Picnic', '2XL', false, 0)], ['2XL']);
    assert.equal(isSoldOut(gone, 'Picnic', '2XL'), true);
    assert.equal(maxPurchasable(gone, 'Picnic', '2XL', 10), 0);
  });
  check('exemption overrides the manual list too', () => {
    // No readable quantities, so the manual overrides would normally apply.
    const manual = product([v('Picnic', '2XL', true, undefined)], ['2XL']);
    assert.equal(availability(manual, 'Picnic', '2XL').low, false);
  });
}

console.log('\nbackorders (continue selling when out of stock)');
{
  const p = product([v('Picnic', 'S', true, 0, true)]);
  check('still sellable', () => {
    assert.equal(isSoldOut(p, 'Picnic', 'S'), false);
  });
  check('not flagged as low — it is a backorder, not scarcity', () => {
    assert.equal(availability(p, 'Picnic', 'S').low, false);
    assert.equal(availability(p, 'Picnic', 'S').backorder, true);
  });
  check('quantity is not capped to zero', () => {
    assert.equal(maxPurchasable(p, 'Picnic', 'S', 10), 10);
  });
}

console.log('\nthe substitution bug');
{
  const p = product([
    v('Picnic', 'S', false, 0),
    v('Jam', 'S', true, 20),
    v('Jam', 'M', true, 20),
  ]);
  check('Picnic/S resolves to Picnic/S, never Jam/S', () => {
    const found = findVariant(p, 'Picnic', 'S');
    assert.equal(found?.id, 'gid://shopify/ProductVariant/Picnic-S');
    assert.equal(found?.availableForSale, false);
  });
  check('a colourway with no variants at all resolves to nothing', () => {
    assert.equal(findVariant(p, 'Confetti', 'S'), null);
  });
  check('a size with no variant resolves to nothing', () => {
    assert.equal(findVariant(p, 'Picnic', 'XXL'), null);
  });
}

console.log('\nno size may ever show another size\'s number');
{
  // Distinct counts per size, so any cross-wiring shows up immediately.
  const p = product([
    v('Picnic', 'XS', true, 3),
    v('Picnic', 'S', true, 8),
    v('Picnic', 'M', true, 21),
    v('Jam', 'XS', true, 99),
    v('Jam', 'S', true, 55),
    v('Jam', 'M', true, 44),
  ], ['XS', 'S', 'M']);

  check('every size reports its own count, per colourway', () => {
    assert.equal(availability(p, 'Picnic', 'XS').quantity, 3);
    assert.equal(availability(p, 'Picnic', 'S').quantity, 8);
    assert.equal(availability(p, 'Picnic', 'M').quantity, 21);
    assert.equal(availability(p, 'Jam', 'XS').quantity, 99);
    assert.equal(availability(p, 'Jam', 'S').quantity, 55);
    assert.equal(availability(p, 'Jam', 'M').quantity, 44);
  });
  check('no two sizes in a colourway resolve to the same variant', () => {
    const ids = ['XS', 'S', 'M'].map((s) => findVariant(p, 'Picnic', s)?.id);
    assert.equal(new Set(ids).size, 3);
    assert.ok(ids.every(Boolean));
  });
  check('switching colourway changes the number, not just the label', () => {
    assert.notEqual(
      availability(p, 'Picnic', 'S').quantity,
      availability(p, 'Jam', 'S').quantity,
    );
  });
}

console.log('\noptions named something other than Size/Color');
{
  // The dangerous case: nothing declares "size", so the old per-variant logic
  // matched the FIRST variant for every size and showed its count everywhere.
  const odd = (waist: string, qty: number): ShopifyVariant => ({
    id: `gid://shopify/ProductVariant/waist-${waist}`,
    title: waist,
    price: { amount: '108.00', currencyCode: 'USD' },
    availableForSale: true,
    quantityAvailable: qty,
    currentlyNotInStock: false,
    selectedOptions: [{ name: 'Waist', value: waist }],
  });
  const p = product([odd('24', 8), odd('26', 40), odd('28', 2)], ['XS', 'S', 'M']);

  check('resolves to nothing rather than guessing a variant', () => {
    assert.equal(findVariant(p, 'Picnic', 'XS'), null);
    assert.equal(findVariant(p, 'Picnic', 'S'), null);
  });
  check('no size shows a fabricated count', () => {
    for (const s of ['XS', 'S', 'M']) {
      assert.equal(availability(p, 'Picnic', s).quantity, null, `${s} must not report a count`);
      assert.equal(availability(p, 'Picnic', s).status, 'unknown');
      assert.equal(availability(p, 'Picnic', s).low, false);
    }
  });
  check('and nothing is blocked from being bought', () => {
    for (const s of ['XS', 'S', 'M']) {
      assert.equal(isSoldOut(p, 'Picnic', s), false);
      assert.equal(maxPurchasable(p, 'Picnic', s, 10), 10);
    }
  });
}

console.log('\none-size products (no Size option)');
{
  const oneSize: ShopifyVariant = {
    id: 'gid://shopify/ProductVariant/onesize',
    title: 'Default',
    price: { amount: '20.00', currencyCode: 'USD' },
    availableForSale: true,
    quantityAvailable: 3,
    currentlyNotInStock: false,
    selectedOptions: [{ name: 'Title', value: 'Default Title' }],
  };
  const p = product([oneSize], ['One Size']);
  check('matches with nothing selected', () => {
    assert.equal(findVariant(p, undefined, undefined)?.id, oneSize.id);
    assert.equal(availability(p, undefined, undefined).quantity, 3);
  });
}

console.log(`\n${passed} checks passed\n`);
