import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

export default function ProductCard({ product }) {
  const { id, name, price, discount_price, images, tags } = product;
  const primaryImage = images[0];
  const secondaryImage = images[1] || primaryImage;
  const currentPrice = discount_price || price;
  const hasDiscount = !!discount_price;

  return (
    <article className="group relative flex flex-col gap-3">
      {/* Image Container with aspect-square */}
      <Link href={`/products/${id}`} className="relative block aspect-square w-full overflow-hidden rounded-xl bg-accent">
        {/* Badges */}
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-2">
          {tags?.map(tag => (
            <span key={tag} className="bg-primary text-white text-xs font-bold px-2 py-1 rounded">
              {tag}
            </span>
          ))}
          {hasDiscount && (
            <span className="bg-secondary text-white text-xs font-bold px-2 py-1 rounded w-fit">
              -{Math.round((1 - discount_price / price) * 100)}%
            </span>
          )}
        </div>

        {/* Images */}
        <img 
          src={primaryImage} 
          alt={name} 
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500 group-hover:opacity-0"
        />
        <img 
          src={secondaryImage} 
          alt={`${name} secondary view`} 
          className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />

        {/* Quick Add Button */}
        <button className="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-12 opacity-0 flex items-center justify-center gap-2 bg-foreground text-background font-semibold w-11/12 py-3 rounded-lg shadow-lg transition-all duration-300 hover:bg-primary group-hover:translate-y-0 group-hover:opacity-100">
          <ShoppingCart size={18} />
          Quick Add
        </button>
      </Link>

      {/* Product Info */}
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-foreground line-clamp-2">
          <Link href={`/products/${id}`} className="hover:text-primary transition-colors">
            {name}
          </Link>
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold text-primary">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentPrice)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-foreground/60 line-through">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
