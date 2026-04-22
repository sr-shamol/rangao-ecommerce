import { cn } from '@/lib/utils';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'accent';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    accent: 'bg-accent text-white',
  };

  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  );
}

interface DiscountBadgeProps {
  discount: number;
  className?: string;
}

export function DiscountBadge({ discount, className }: DiscountBadgeProps) {
  if (discount <= 0) return null;
  
  return (
    <span className={cn('absolute top-2 left-2 bg-error text-white px-2 py-1 rounded-md text-sm font-bold', className)}>
      -{discount}%
    </span>
  );
}

interface StockBadgeProps {
  stock: number;
  className?: string;
}

export function StockBadge({ stock, className }: StockBadgeProps) {
  if (stock <= 0) {
    return (
      <span className={cn('inline-flex items-center gap-1 text-error text-sm font-medium', className)}>
        <span className="w-2 h-2 rounded-full bg-error" />
        Stock Out
      </span>
    );
  }
  
  if (stock <= 10) {
    return (
      <span className={cn('inline-flex items-center gap-1 text-warning text-sm font-medium', className)}>
        <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
        Only {stock} left
      </span>
    );
  }
  
  return (
    <span className={cn('inline-flex items-center gap-1 text-success text-sm font-medium', className)}>
      <span className="w-2 h-2 rounded-full bg-success" />
      In Stock
    </span>
  );
}