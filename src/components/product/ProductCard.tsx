'use client';

import Link from 'next/link';
import { Plus, ShoppingCart } from 'lucide-react';
import { formatPrice, calculateDiscount, cn } from '@/lib/utils';
import { useCartStore } from '@/store/cart';
import { DiscountBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  product: any;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const discount = product.old_price 
    ? calculateDiscount(product.old_price, product.price) 
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      price: product.price,
      oldPrice: product.old_price,
      categoryId: product.category_id,
      images: product.images || [],
      stock: product.stock,
      type: product.type,
      isFeatured: product.is_featured,
      isCombo: product.is_combo,
      createdAt: product.created_at,
    }, 1);
  };

  return (
    <Link href={`/products/${product.slug}`} className={cn('group block', className)}>
      <div className="card overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-300">
              <ShoppingCart size={48} />
            </div>
          )}
          <DiscountBadge discount={discount} />
          {product.is_combo && (
            <div className="absolute top-2 right-2 bg-accent text-white px-2 py-1 rounded-md text-xs font-bold">
              COMBO
            </div>
          )}
          <button
            onClick={handleAddToCart}
            className="absolute bottom-3 right-3 bg-primary text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-primary-light hover:scale-110"
            aria-label="Add to cart"
          >
            <Plus size={20} />
          </button>
        </div>
        <div className="p-4">
          <h3 className="font-medium text-gray-900 line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-lg font-bold text-primary">
              {formatPrice(product.price)}
            </span>
            {product.old_price && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.old_price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

interface ProductCardHorizontalProps {
  product: any;
  className?: string;
}

export function ProductCardHorizontal({ product, className }: ProductCardHorizontalProps) {
  const addItem = useCartStore((state) => state.addItem);
  const discount = product.old_price 
    ? calculateDiscount(product.old_price, product.price) 
    : 0;

  return (
    <Link href={`/products/${product.slug}`} className={cn('flex gap-4 group', className)}>
      <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-300">
            <ShoppingCart size={24} />
          </div>
        )}
        {discount > 0 && (
          <div className="absolute top-0 left-0 bg-error text-white px-1.5 py-0.5 rounded-tl-lg text-xs font-bold">
            -{discount}%
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 line-clamp-2">
          {product.name}
        </h3>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-lg font-bold text-primary">
            {formatPrice(product.price)}
          </span>
          {product.old_price && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.old_price)}
            </span>
          )}
        </div>
        <Button
          size="sm"
          className="mt-2"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addItem({
              id: product.id,
              name: product.name,
              slug: product.slug,
              description: product.description || '',
              price: product.price,
              oldPrice: product.old_price,
              categoryId: product.category_id,
              images: product.images || [],
              stock: product.stock,
              type: product.type,
              isFeatured: product.is_featured,
              isCombo: product.is_combo,
              createdAt: product.created_at,
            }, 1);
          }}
        >
          Add to Cart
        </Button>
      </div>
    </Link>
  );
}