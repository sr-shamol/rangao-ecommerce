import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Star, Minus, Plus, Truck, Shield, RotateCcw, MessageCircle, ShoppingCart, Zap } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';
import { MobileBottomNav } from '@/components/layout/Header';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import { Badge, DiscountBadge, StockBadge } from '@/components/ui/badge';
import { getProductBySlug, getProducts, getCategories } from '@/lib/data';
import { formatPrice, calculateDiscount } from '@/lib/utils';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  
  if (!product) {
    return { title: 'Product Not Found' };
  }
  
  return {
    title: product.name,
    description: product.description,
  };
}

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product: any) => ({
    slug: product.slug,
  }));
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  
  if (!product) {
    notFound();
  }
  
  const discount = product.old_price 
    ? calculateDiscount(product.old_price, product.price) 
    : 0;
  
  const relatedProducts = await getProducts({ category: product.category_id });

  const whatsappMessage = encodeURIComponent(
    `Hi, I'm interested in: ${product.name}\nPrice: ${formatPrice(product.price)}`
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pb-20 md:pb-0">
        {/* Breadcrumb */}
        <section className="bg-gray-50 border-b border-gray-100">
          <div className="container-main py-4">
            <nav className="flex items-center gap-2 text-sm text-gray-500">
              <Link href="/" className="hover:text-primary">Home</Link>
              <span>/</span>
              <Link href="/products" className="hover:text-primary">Products</Link>
              <span>/</span>
              <span className="text-gray-900">{product.name}</span>
            </nav>
          </div>
        </section>

        {/* Product Section */}
        <section className="py-8">
          <div className="container-main">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Image Gallery */}
              <div className="relative">
                <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image Available
                    </div>
                  )}
                  <DiscountBadge discount={discount} />
                  {product.is_combo && (
                    <Badge variant="accent" className="absolute top-4 left-4">
                      COMBO
                    </Badge>
                  )}
                </div>
                {/* Thumbnails */}
                {product.images && product.images.length > 1 && (
                  <div className="flex gap-2 mt-4">
                    {product.images.map((image: string, index: number) => (
                      <div
                        key={index}
                        className="w-20 h-20 relative bg-gray-100 rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-colors cursor-pointer"
                      >
                        <img
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  {product.name}
                </h1>

                {/* Price */}
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl font-bold text-primary">
                    {formatPrice(product.price)}
                  </span>
                  {product.old_price && (
                    <>
                      <span className="text-xl text-gray-400 line-through">
                        {formatPrice(product.old_price)}
                      </span>
                      <Badge variant="error">-{discount}%</Badge>
                    </>
                  )}
                </div>

                {/* Stock */}
                <div className="mb-6">
                  <StockBadge stock={product.stock} />
                </div>

                {/* Product Type Badge */}
                {product.type === 'custom' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-yellow-800">
                      <strong>Custom Product:</strong> This item requires design approval. 
                      Delivery may take 3-5 extra days.
                    </p>
                  </div>
                )}

                {product.type === 'combo' && product.old_price && (
                  <div className="bg-accent/10 rounded-lg p-4 mb-6">
                    <p className="text-sm text-accent-dark">
                      <strong>Combo Deal:</strong> Save {formatPrice(product.old_price - product.price)} 
                      with this bundle!
                    </p>
                  </div>
                )}

                {/* Description */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-600">{product.description}</p>
                </div>

                {/* Quantity Selector */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Quantity</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button className="p-3 hover:bg-gray-100 transition-colors">
                        <Minus size={18} />
                      </button>
                      <span className="w-12 text-center font-medium">1</span>
                      <button className="p-3 hover:bg-gray-100 transition-colors">
                        <Plus size={18} />
                      </button>
                    </div>
                    <span className="text-sm text-gray-500">
                      {product.stock} available
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                  <Button size="lg" className="flex-1 gap-2">
                    <ShoppingCart size={20} />
                    Add to Cart
                  </Button>
                  <Button size="lg" variant="secondary" className="flex-1 gap-2">
                    <Zap size={20} />
                    Buy Now
                  </Button>
                  <a
                    href={`https://wa.me/8801973811114?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button size="lg" variant="outline" className="w-full gap-2">
                      <MessageCircle size={20} />
                      WhatsApp
                    </Button>
                  </a>
                </div>

                {/* Delivery Info */}
                <div className="card p-4 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Truck size={18} className="text-primary" />
                    <div>
                      <p className="font-medium">Inside Dhaka: 60 Taka</p>
                      <p className="text-gray-500">Outside Dhaka: 120 Taka</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <RotateCcw size={18} className="text-primary" />
                    <div>
                      <p className="font-medium">7 Days Easy Return</p>
                      <p className="text-gray-500">If product has issues</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Shield size={18} className="text-primary" />
                    <div>
                      <p className="font-medium">100% Genuine Product</p>
                      <p className="text-gray-500">Quality guaranteed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 1 && (
          <section className="py-12">
            <div className="container-main">
              <h2 className="text-2xl font-bold mb-8">Related Products</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relatedProducts.filter((p: any) => p.id !== product.id).slice(0, 4).map((p: any) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
      <WhatsAppButton />
      <MobileBottomNav />
    </div>
  );
}