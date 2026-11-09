import Image from 'next/image';
import Link from 'next/link';
import QuickAdd from '@/components/QuickAdd';
import { priceLabel, type DropProduct } from '@/lib/dropProducts';
import { SHOP_COVERS } from '@/lib/community';
import type { Product } from '@/types';

/**
 * One colorway in a shop grid: on-body photo first, the studio frame on hover,
 * then name, color, price and quick add. Shared by the homepage and /collections.
 */
export default function ShopCard({
  drop,
  colorway,
  product,
  sizes = '(max-width: 899px) 50vw, 25vw',
}: {
  drop: DropProduct;
  colorway: DropProduct['colorways'][number];
  product: Product | null;
  sizes?: string;
}) {
  const name = drop.name.replace(/^the /, '');
  const price = product?.price ?? drop.price;
  const compareAt = product?.compareAtPrice;
  const onSale = compareAt !== undefined && compareAt > price;
  const cover = SHOP_COVERS[drop.handle]?.[colorway.color] ?? colorway.image;
  return (
    <div className="shop-card">
      <Link href={`/products/${drop.handle}?color=${encodeURIComponent(colorway.color)}`} className="shop-card-link">
        <div className="shop-card-photo">
          <Image src={cover} alt={`${name} in ${colorway.color}, worn outdoors`} fill sizes={sizes} className="shop-card-img" />
          {cover !== colorway.image && (
            <Image src={colorway.image} alt="" fill sizes={sizes} className="shop-card-img shop-card-img-alt" />
          )}
        </div>
        <p className="shop-card-name">{name}</p>
        <p className="shop-card-meta">
          <span className="shop-card-swatch" style={{ background: colorway.swatch }} />
          {colorway.color.toLowerCase()}
        </p>
        <p className="shop-card-price">
          {onSale && <s>{priceLabel(compareAt)}</s>}
          {priceLabel(price)}
        </p>
      </Link>
      <QuickAdd product={product} color={colorway.color} accent="#34402B" sizeVariant="link" />
    </div>
  );
}
