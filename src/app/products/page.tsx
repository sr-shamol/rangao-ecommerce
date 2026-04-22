import { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';
import { MobileBottomNav } from '@/components/layout/Header';
import { ProductCard } from '@/components/product/ProductCard';
import { getProducts, getCategories, getCategoryBySlug } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Products',
  description: 'Browse our collection of premium Islamic wall decor, wooden items, and gift combos.',
};

interface ProductsPageProps {
  searchParams: Promise<{ category?: string; sort?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const categorySlug = params.category;
  const sortBy = params.sort || 'featured';

  let products: any[] = [];
  let categories: any[] = [];
  let currentCategory: any = null;

  try {
    categories = await getCategories();
    
    if (categorySlug) {
      currentCategory = await getCategoryBySlug(categorySlug);
    }

    let productsQuery: any[] = [];
    
    if (categorySlug && categorySlug !== 'all') {
      productsQuery = await getProducts({ category: currentCategory?.id });
    } else {
      productsQuery = await getProducts();
    }

    if (sortBy === 'price-low') {
      productsQuery.sort((a: any, b: any) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      productsQuery.sort((a: any, b: any) => b.price - a.price);
    } else if (sortBy === 'newest') {
      productsQuery.sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    
    products = productsQuery;
  } catch (error) {
    console.error('Error fetching products:', error);
  }

  const pageTitle = currentCategory?.name || 'All Products';

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pb-20 md:pb-0">
        {/* Page Header */}
        <section className="bg-primary text-white py-8">
          <div className="container-main">
            <nav className="flex items-center gap-2 text-sm text-white/70 mb-4">
              <Link href="/" className="hover:text-white">Home</Link>
              <span>/</span>
              <span className="text-white">{pageTitle}</span>
            </nav>
            <h1 className="text-2xl md:text-3xl font-bold">{pageTitle}</h1>
            <p className="text-white/70 mt-1">
              {products.length} products found
            </p>
          </div>
        </section>

        <section className="py-8">
          <div className="container-main">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Filters Sidebar */}
              <aside className="w-full md:w-64 flex-shrink-0">
                <div className="card p-4 sticky top-20">
                  <h3 className="font-semibold mb-4">Categories</h3>
                  <div className="space-y-2">
                    <Link
                      href="/products"
                      className={`block px-3 py-2 rounded-lg transition-colors ${
                        !categorySlug || categorySlug === 'all'
                          ? 'bg-primary text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      All Products
                    </Link>
                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/products?category=${category.slug}`}
                        className={`block px-3 py-2 rounded-lg transition-colors ${
                          categorySlug === category.slug
                            ? 'bg-primary text-white'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>

                  <h3 className="font-semibold mt-6 mb-4">Sort By</h3>
                  <div className="space-y-2">
                    {[
                      { value: 'featured', label: 'Featured' },
                      { value: 'newest', label: 'Newest' },
                      { value: 'price-low', label: 'Price: Low to High' },
                      { value: 'price-high', label: 'Price: High to Low' },
                    ].map((option) => (
                      <Link
                        key={option.value}
                        href={`/products?${categorySlug ? `category=${categorySlug}&` : ''}sort=${option.value}`}
                        className={`block px-3 py-2 rounded-lg transition-colors ${
                          sortBy === option.value
                            ? 'bg-primary text-white'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {option.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </aside>

              {/* Products Grid */}
              <div className="flex-1">
                {products.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">No products found</p>
                    <Link href="/products" className="text-primary font-medium hover:underline">
                      View All Products
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </div>
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