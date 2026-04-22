-- Rangao E-Commerce Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT UNIQUE NOT NULL,
  name TEXT,
  email TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_bn TEXT,
  slug TEXT UNIQUE NOT NULL,
  image TEXT,
  parent_id UUID REFERENCES categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  old_price NUMERIC,
  category_id UUID REFERENCES categories(id),
  images TEXT[],
  variants JSONB,
  stock INTEGER DEFAULT 0,
  type TEXT DEFAULT 'ready' CHECK (type IN ('ready', 'custom', 'combo')),
  is_featured BOOLEAN DEFAULT false,
  is_combo BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Areas table (for delivery charges)
CREATE TABLE areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  district TEXT NOT NULL,
  delivery_charge NUMERIC DEFAULT 60,
  courier TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_address TEXT,
  area_id UUID REFERENCES areas(id),
  payment_method TEXT DEFAULT 'cod' CHECK (payment_method IN ('cod', 'bkash', 'nagad', 'card')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  subtotal NUMERIC NOT NULL,
  delivery_charge NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  courier TEXT,
  tracking_id TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  variant TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  user_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  images TEXT[],
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coupons table
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL,
  min_order NUMERIC DEFAULT 0,
  max_uses INTEGER,
  uses_count INTEGER DEFAULT 0,
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blacklist table (for fraud prevention)
CREATE TABLE blacklist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT UNIQUE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_products_combo ON products(is_combo);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_reviews_product ON reviews(product_id);

-- Insert sample categories
INSERT INTO categories (name, name_bn, slug) VALUES
  ('Wall Decor', 'দেয়াল সজ্জা', 'wall-decor'),
  ('Wooden Items', 'কাঠের জিনিস', 'wooden'),
  ('Combo Gifts', 'কম্বো উপহার', 'combo'),
  ('Islamic Art', 'ইসলামিক আর্ট', 'islamic-art'),
  ('Calligraphy', 'ক্যালিগ্রাফি', 'calligraphy'),
  ('Home Decor', 'বাড়ি সজ্জা', 'home-decor');

-- Insert sample areas
INSERT INTO areas (name, district, delivery_charge, courier) VALUES
  ('Dhaka Metro', 'Dhaka', 60, 'steadfast'),
  ('Chittagong Metro', 'Chittagong', 120, 'steadfast'),
  ('Sylhet Metro', 'Sylhet', 120, 'redx'),
  ('Rajshahi Metro', 'Rajshahi', 120, 'steadfast'),
  ('Khulna Metro', 'Khulna', 120, 'redx'),
  ('Barishal Metro', 'Barishal', 130, 'steadfast'),
  ('Rangpur Metro', 'Rangpur', 130, 'redx'),
  ('Mymensingh Metro', 'Mymensingh', 130, 'steadfast'),
  ('Other Districts', 'Other', 150, 'steadfast');

-- Insert sample products
INSERT INTO products (name, slug, description, price, old_price, category_id, images, stock, type, is_featured, is_combo) VALUES
  ('Allah Calligraphy Wall Art', 'allah-calligraphy-wall-art', 'Beautiful handmade Allah calligraphy wall art with premium finish. Perfect for living room, bedroom, or office.', 2499, 3499, (SELECT id FROM categories WHERE slug = 'wall-decor'), ARRAY['https://placehold.co/800x800/0F3D2E/FFFFFF?text=Allah+Calligraphy'], 25, 'ready', true, false),
  ('Bismillah Wooden Engraved Plaque', 'bismillah-wooden-plaque', 'Elegant Bismillah wooden plaque with intricate laser engraving.', 1299, 1799, (SELECT id FROM categories WHERE slug = 'wooden'), ARRAY['https://placehold.co/800x800/0F3D2E/FFFFFF?text=Bismillah+Plaque'], 40, 'ready', true, false),
  ('Eid Gift Combo - Ultimate', 'eid-gift-combo', 'Premium gift combo with calligraphy, wooden plaque, prayer beads and candle.', 4999, 6999, (SELECT id FROM categories WHERE slug = 'combo'), ARRAY['https://placehold.co/800x800/C9A24D/FFFFFF?text=Eid+Combo'], 15, 'combo', true, true),
  ('Islamic Geometric Mirror', 'islamic-geometric-mirror', 'Stunning wall mirror with Islamic geometric patterns.', 3499, 4499, (SELECT id FROM categories WHERE slug = 'wall-decor'), ARRAY['https://placehold.co/800x800/0F3D2E/FFFFFF?text=Geometric+Mirror'], 8, 'ready', true, false),
  ('Ramadan Kareem Set', 'ramadan-kareem-set', 'Beautiful Ramadan decorative set with calligraphy and lanterns.', 1999, 2799, (SELECT id FROM categories WHERE slug = 'islamic-art'), ARRAY['https://placehold.co/800x800/0F3D2E/FFFFFF?text=Ramadan+Kareem'], 30, 'ready', true, false),
  ('Wedding Gift Combo Premium', 'wedding-gift-combo-premium', 'Elegant wedding gift combo with dual name calligraphy.', 5999, 7999, (SELECT id FROM categories WHERE slug = 'combo'), ARRAY['https://placehold.co/800x800/C9A24D/FFFFFF?text=Wedding+Combo'], 10, 'custom', true, true),
  ('99 Names of Allah Frame', '99-names-allah-frame', 'Beautiful framed display of 99 Names of Allah.', 3999, 4999, (SELECT id FROM categories WHERE slug = 'calligraphy'), ARRAY['https://placehold.co/800x800/0F3D2E/FFFFFF?text=99+Names'], 20, 'ready', false, false),
  ('Islamic Quote LED Sign', 'islamic-quote-led-sign', 'Modern LED light box with beautiful Islamic quotes.', 1499, 1999, (SELECT id FROM categories WHERE slug = 'wall-decor'), ARRAY['https://placehold.co/800x800/0F3D2E/FFFFFF?text=LED+Sign'], 35, 'ready', false, false);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Public read for products and categories
CREATE POLICY "Public can view products" ON products FOR SELECT USING (true);
CREATE POLICY "Public can view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public can view areas" ON areas FOR SELECT USING (true);

-- RLS Policies - Authenticated can manage their own data
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);