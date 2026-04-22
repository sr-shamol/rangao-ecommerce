'use client';

import Link from 'next/link';
import { Phone, MessageCircle, MapPin, Mail } from 'lucide-react';

const footerLinks = {
  shop: [
    { href: '/products', label: 'All Products' },
    { href: '/products?category=wall-decor', label: 'Wall Decor' },
    { href: '/products?category=wooden', label: 'Wooden Items' },
    { href: '/products?category=combo', label: 'Gift Combos' },
  ],
  customer: [
    { href: '/track-order', label: 'Track Order' },
    { href: '/return-policy', label: 'Return Policy' },
    { href: '/faq', label: 'FAQ' },
    { href: '/contact', label: 'Contact Us' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="container-main py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">রা</span>
              </div>
              <span className="font-bold text-xl">Rangao</span>
            </div>
            <p className="text-white/70 text-sm mb-4">
              Premium Islamic wall decor and wooden items for your home and gifts. 
              Quality products with love for your peaceful space.
            </p>
            <div className="flex gap-3">
              <a
                href="https://wa.me/8801XXXXXXXXX"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <MessageCircle size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2">
              {footerLinks.customer.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-white/70 text-sm">
                <MapPin size={18} className="flex-shrink-0 mt-0.5" />
                <span>Dhaka, Bangladesh</span>
              </li>
              <li className="flex items-center gap-2 text-white/70 text-sm">
                <Phone size={18} className="flex-shrink-0" />
                <a href="tel:+8801XXXXXXXXX">+880 1XX XXX XXX</a>
              </li>
              <li className="flex items-center gap-2 text-white/70 text-sm">
                <Mail size={18} className="flex-shrink-0" />
                <a href="mailto:hello@rangao.com">hello@rangao.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/50 text-sm">
            © {new Date().getFullYear()} Rangao. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-white/50 hover:text-white text-sm">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-white/50 hover:text-white text-sm">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}