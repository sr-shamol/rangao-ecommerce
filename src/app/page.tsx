import { Metadata } from 'next';
import Link from 'next/link';
import { Star, Shield, Truck, RotateCcw, MessageCircle, ArrowRight } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';
import { MobileBottomNav } from '@/components/layout/Header';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getProducts, getCategories } from '@/lib/data';
import { formatPrice, calculateDiscount } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Rangao - Premium Islamic Wall Decor & Gifts | Bangladesh',
  description: 'Discover premium Islamic wall decor, wooden items, and gift combos. Perfect for Eid, Ramadan, and special occasions. Fast delivery across Bangladesh.',
};

const trustBadges = [
  { icon: '🚚', label: 'Fast Delivery', description: 'Same day dispatch' },
  { icon: '🔄', label: 'Easy Return', description: '7 days return policy' },
  { icon: '💯', label: 'COD Available', description: 'Pay on delivery' },
  { icon: '💬', label: 'WhatsApp Support', description: 'Quick chat support' },
];

const islamicReminders = [
  {
    arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    translation: 'Indeed, with hardship comes ease.',
    source: 'Surah Ash-Sharh (94:6)',
  },
];

export default async function HomePage() {
  let featuredProducts: any[] = [];
  let comboProducts: any[] = [];
  let categories: any[] = [];

  try {
    featuredProducts = await getProducts({ featured: true, limit: 8 });
    comboProducts = await getProducts({ combo: true });
    categories = await getCategories();
  } catch (error) {
    console.error('Error fetching data:', error);
  }

  const randomReminder = islamicReminders[0];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pb-20 md:pb-0">
        {/* Hero Banner */}
        <section className="relative bg-gradient-to-r from-primary to-primary-light text-white">
          <div className="container-main py-12 md:py-20">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="animate-fade-in">
                <Badge variant="accent" className="mb-4">
                  Eid Special Offer
                </Badge>
                <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                  Premium Islamic Decor for Your Peaceful Space
                </h1>
                <p className="text-lg md:text-xl text-white/80 mb-6">
                  Beautiful handcrafted wall art, wooden items & gift combos. 
                  Perfect for your home or as a meaningful gift.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/products">
                    <Button size="lg" variant="secondary">
                      Shop Now <ArrowRight size={20} />
                    </Button>
                  </Link>
                  <Link href="/products?category=combo">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                      View Combos
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative h-[300px] md:h-[400px] bg-primary/20 rounded-2xl flex items-center justify-center">
                <span className="text-white/50 text-lg">Rangao</span>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="bg-white border-b border-gray-100">
          <div className="container-main py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {trustBadges.map((badge, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    {index === 0 && <Truck className="w-6 h-6 text-primary" />}
                    {index === 1 && <RotateCcw className="w-6 h-6 text-primary" />}
                    {index === 2 && <Shield className="w-6 h-6 text-primary" />}
                    {index === 3 && <MessageCircle className="w-6 h-6 text-primary" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{badge.label}</p>
                    <p className="text-sm text-gray-500">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-12 md:py-16">
          <div className="container-main">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold">Shop by Category</h2>
              <Link href="/products" className="text-primary font-medium hover:underline">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${category.slug}`}
                  className="group card p-4 text-center hover:shadow-md transition-all duration-200"
                >
                  <div className="w-16 h-16 mx-auto mb-3 bg-primary/5 rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <span className="text-2xl font-bold text-primary">
                      {category.name?.charAt(0) || '?'}
                    </span>
                  </div>
                  <h3 className="font-medium text-gray-900">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category.name_bn}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="container-main">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold">Featured Products</h2>
              <Link href="/products" className="text-primary font-medium hover:underline">
                View All <ArrowRight size={16} className="inline" />
              </Link>
            </div>
            {featuredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {featuredProducts.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No products available</p>
            )}
          </div>
        </section>

        {/* Combo Deals */}
        {comboProducts.length > 0 && (
          <section className="py-12 md:py-16 bg-gradient-to-r from-accent/10 to-accent/5">
            <div className="container-main">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <Badge variant="accent" className="mb-2">Save More</Badge>
                  <h2 className="text-2xl md:text-3xl font-bold">Combo Deals</h2>
                  <p className="text-gray-600 mt-1">Bundle and save on premium gift combos</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {comboProducts.map((product: any) => {
                  const discount = product.old_price 
                    ? calculateDiscount(product.old_price, product.price) 
                    : 0;
                  const savings = product.old_price ? product.old_price - product.price : 0;
                  
                  return (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      className="card overflow-hidden group hover:shadow-lg transition-all duration-300"
                    >
                      <div className="relative h-48 md:h-64 bg-gray-100">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}
                        {discount > 0 && (
                          <div className="absolute top-3 left-3 bg-accent text-white px-3 py-1 rounded-full text-sm font-bold">
                            -{discount}% OFF
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">{product.name}</h3>
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-2xl font-bold text-primary">
                            {formatPrice(product.price)}
                          </span>
                          {product.old_price && (
                            <span className="text-gray-400 line-through">
                              {formatPrice(product.old_price)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          {savings > 0 && (
                            <span className="text-sm text-success font-medium">
                              Save {formatPrice(savings)}
                            </span>
                          )}
                          <Button size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Islamic Reminder Section */}
        <section className="py-12 md:py-16 bg-primary text-white">
          <div className="container-main text-center">
            <p className="text-4xl md:text-5xl font-arabic mb-4" dir="rtl">
              {randomReminder.arabic}
            </p>
            <p className="text-xl text-white/90 mb-2">{randomReminder.translation}</p>
            <p className="text-sm text-white/60">{randomReminder.source}</p>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-12 md:py-16">
          <div className="container-main">
            <div className="card p-8 md:p-12 text-center bg-gradient-to-r from-primary to-primary-light text-white">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Get Special Offers
              </h2>
              <p className="text-white/80 mb-6 max-w-xl mx-auto">
                Subscribe to get exclusive discounts and new product announcements
              </p>
              <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="tel"
                  placeholder="Your phone number"
                  className="flex-1 px-4 py-3 rounded-lg text-gray-900"
                />
                <Button type="submit" variant="secondary">
                  Subscribe
                </Button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
      <MobileBottomNav />
    </div>
  );
}