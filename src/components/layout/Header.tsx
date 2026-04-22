'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ShoppingCart, Menu, X, Phone, Search } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/products?category=wall-decor', label: 'Wall Decor' },
  { href: '/products?category=wooden', label: 'Wooden Items' },
  { href: '/products?category=combo', label: 'Combos' },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const itemCount = useCartStore((state) => state.getItemCount());

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="container-main">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">রা</span>
            </div>
            <span className="font-bold text-xl text-primary">Rangao</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                className="text-gray-600 hover:text-primary transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/cart"
              className="relative p-2 text-gray-600 hover:text-primary transition-colors"
            >
              <ShoppingCart size={24} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-accent text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  className="text-gray-600 hover:text-primary transition-colors font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

export function MobileBottomNav() {
  const itemCount = useCartStore((state) => state.getItemCount());

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 md:hidden z-50">
      <div className="flex items-center justify-around h-16">
        <Link href="/" className="flex flex-col items-center gap-0.5 p-2 text-gray-600">
          <span className="text-xs">Home</span>
        </Link>
        <Link href="/products" className="flex flex-col items-center gap-0.5 p-2 text-gray-600">
          <span className="text-xs">Products</span>
        </Link>
        <Link
          href="/cart"
          className="flex flex-col items-center gap-0.5 p-2 text-primary"
        >
          <div className="relative">
            <ShoppingCart size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </div>
          <span className="text-xs">Cart</span>
        </Link>
      </div>
    </div>
  );
}