'use client';

import Link from 'next/link';
import { use } from 'react';
import { CheckCircle, Package, Truck, Home, MessageCircle, Clock, Phone } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface OrderConfirmPageProps {
  params: Promise<{ id: string }>;
}

export default function OrderConfirmPage({ params }: OrderConfirmPageProps) {
  const { id } = use(params);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pb-20 md:pb-0">
        <section className="bg-primary text-white py-12">
          <div className="container-main text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
              <CheckCircle size={40} />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-white/80">
              Thank you for your order. We will contact you shortly.
            </p>
          </div>
        </section>

        <section className="py-8">
          <div className="container-main">
            <div className="max-w-xl mx-auto space-y-6">
              {/* Order ID */}
              <div className="card p-6 text-center">
                <p className="text-sm text-gray-500 mb-1">Order ID</p>
                <p className="text-2xl font-bold text-primary">{id}</p>
                <Badge variant="success" className="mt-2">Confirmed</Badge>
              </div>

              {/* Delivery Timeline */}
              <div className="card p-6">
                <h2 className="text-lg font-semibold mb-6">Delivery Timeline</h2>
                
                <div className="space-y-6">
                  {[
                    { icon: CheckCircle, label: 'Order Confirmed', desc: 'Your order has been received', done: true },
                    { icon: Package, label: 'Processing', desc: 'We are preparing your order', done: false },
                    { icon: Truck, label: 'Shipped', desc: 'Order dispatched from our warehouse', done: false },
                    { icon: Home, label: 'Delivered', desc: 'Order delivered to your address', done: false },
                  ].map((step, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        step.done ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        <step.icon size={20} />
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${step.done ? 'text-gray-900' : 'text-gray-500'}`}>
                          {step.label}
                        </p>
                        <p className="text-sm text-gray-500">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Estimated Delivery */}
              <div className="card p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Clock size={24} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Estimated Delivery</p>
                    <p className="text-sm text-gray-500">3-5 Business Days</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Inside Dhaka: 2-3 days | Outside Dhaka: 4-5 days
                </p>
              </div>

              {/* What Happens Next */}
              <div className="card p-6">
                <h2 className="text-lg font-semibold mb-4">What Happens Next?</h2>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-green-500 mt-0.5" />
                    You will receive an SMS/WhatsApp confirmation shortly
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-green-500 mt-0.5" />
                    Our team will call you to confirm the order
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-green-500 mt-0.5" />
                    You will receive tracking info once shipped
                  </li>
                </ul>
              </div>

              {/* Support */}
              <div className="card p-6">
                <h2 className="text-lg font-semibold mb-4">Need Help?</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Have questions about your order? Contact us anytime!
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="https://wa.me/8801973811114"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button variant="outline" className="w-full gap-2">
                      <MessageCircle size={18} />
                      WhatsApp
                    </Button>
                  </a>
                  <a href="tel:+8801973811114" className="flex-1">
                    <Button variant="outline" className="w-full gap-2">
                      <Phone size={18} />
                      Call Us
                    </Button>
                  </a>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/" className="flex-1">
                  <Button className="w-full">Back to Home</Button>
                </Link>
                <Link href="/products" className="flex-1">
                  <Button variant="outline" className="w-full">Continue Shopping</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}