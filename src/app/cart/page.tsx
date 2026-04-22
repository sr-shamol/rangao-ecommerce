'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const [couponCode, setCouponCode] = useState('');
  const { items, updateQuantity, removeItem, getSubtotal, getDiscount, appliedCoupon } = useCartStore();
  
  const subtotal = getSubtotal();
  const discount = getDiscount();
  const deliveryCharge = 60;
  const total = subtotal - discount + deliveryCharge;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pb-20 md:pb-0">
        <section className="bg-primary text-white py-8">
          <div className="container-main">
            <h1 className="text-2xl md:text-3xl font-bold">Shopping Cart</h1>
            <p className="text-white/70 mt-1">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </p>
          </div>
        </section>

        <section className="py-8">
          <div className="container-main">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <ShoppingBag size={40} className="text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
                <p className="text-gray-500 mb-6">
                  Add some beautiful items to your cart!
                </p>
                <Link href="/products">
                  <Button>Browse Products</Button>
                </Link>
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                  {items.map((item) => (
                    <div key={`${item.product.id}-${item.variant?.id}`} className="card p-4">
                      <div className="flex gap-4">
                        <Link href={`/products/${item.product.slug}`} className="flex-shrink-0">
                          <div className="w-24 h-24 md:w-32 md:h-32 relative bg-gray-100 rounded-lg overflow-hidden">
                            {item.product.images[0] && (
                              <Image
                                src={item.product.images[0]}
                                alt={item.product.name}
                                fill
                                className="object-cover"
                              />
                            )}
                          </div>
                        </Link>
                        
                        <div className="flex-1 min-w-0">
                          <Link href={`/products/${item.product.slug}`}>
                            <h3 className="font-medium text-gray-900 line-clamp-2 hover:text-primary transition-colors">
                              {item.product.name}
                            </h3>
                          </Link>
                          
                          {item.variant && (
                            <p className="text-sm text-gray-500 mt-1">
                              {item.variant.name}: {item.variant.value}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variant?.id)}
                                className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="w-8 text-center font-medium">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variant?.id)}
                                className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            
                            <span className="font-bold text-primary">
                              {formatPrice(item.product.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => removeItem(item.product.id, item.variant?.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors self-start"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <div className="card p-6 sticky top-20">
                    <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                    
                    {/* Coupon Input */}
                    {!appliedCoupon && (
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          <Tag size={14} className="inline mr-1" />
                          Have a coupon?
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            placeholder="Enter coupon code"
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                          <Button variant="outline" size="sm">Apply</Button>
                        </div>
                      </div>
                    )}
                    
                    {appliedCoupon && (
                      <div className="mb-6 p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-green-700">
                            Coupon: {appliedCoupon.code}
                          </span>
                          <button className="text-sm text-red-500 hover:underline">
                            Remove
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Subtotal</span>
                        <span>{formatPrice(subtotal)}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Discount</span>
                          <span>-{formatPrice(discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Delivery (Dhaka)</span>
                        <span>{formatPrice(deliveryCharge)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg pt-3 border-t">
                        <span>Total</span>
                        <span className="text-primary">{formatPrice(total)}</span>
                      </div>
                    </div>

                    <Link href="/checkout">
                      <Button className="w-full gap-2">
                        Proceed to Checkout
                        <ArrowRight size={18} />
                      </Button>
                    </Link>
                    
                    <p className="text-xs text-gray-500 text-center mt-4">
                      Cash on Delivery available
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}