# Rangao - Islamic Decor E-Commerce Specification

## Project Overview
- **Brand Name**: Rangao (রাঙাও)
- **Type**: Premium Islamic Wall Decor & Gift E-commerce
- **Target**: Bangladesh middle & upper-middle class, Age 22-45
- **Goal**: High conversion, fast checkout, mobile-first

## Tech Stack
- **Frontend**: Next.js 14 (App Router)
- **Backend**: Supabase (DB + Auth + Storage)
- **Styling**: Tailwind CSS
- **State**: React Context + Zustand
- **Forms**: React Hook Form + Zod

## Design System

### Colors
- Primary: `#0F3D2E` (Deep Emerald Green)
- Accent: `#C9A24D` (Soft Gold)
- Background: `#FAFAFA` (Off-white)
- White: `#FFFFFF`
- Text Primary: `#1A1A1A`
- Text Secondary: `#6B7280`
- Success: `#059669`
- Error: `#DC2626`
- Warning: `#F59E0B`

### Typography
- **English Font**: Inter (400, 500, 600, 700)
- **Bangla Font**: Hind Siliguri (400, 500, 600, 700)
- **Headings**: Inter 700
- **Body**: Inter 400 / Hind Siliguri 400

### Spacing System
- Base unit: 4px
- Sections: py-16 md:py-24
- Cards: p-4 md:p-6
- Gap: 4, 6, 8, 12, 16, 24px

### Components
- Border radius: 8px (buttons), 12px (cards)
- Shadows: sm, md, lg
- Animations: 200ms ease transitions

## Pages Structure

### 1. Homepage (/)
- Hero Banner (carousel with offers)
- Featured Products (horizontal scroll)
- Combo Deals (priority section with savings badge)
- Categories Grid (4 columns mobile, 6 desktop)
- Customer Reviews with images
- Islamic Reminder Section
- Trust Badges (COD, Replacement, Fast Delivery)
- WhatsApp Float Button

### 2. Products Page (/products)
- Category filter
- Sort options
- Product grid (2 col mobile, 3 col tablet, 4 col desktop)
- Load more / Pagination

### 3. Product Detail Page (/products/[slug])
- Image gallery with zoom
- Thumbnail navigation
- Product title and price
- Discount badge
- Variant selector (size/design)
- Stock indicator
- Delivery info (Dhaka/Outside)
- Add to Cart button
- Buy Now button
- WhatsApp order button
- Reviews section

### 4. Cart Page (/cart)
- Product list with images
- Quantity controls (+/-)
- Remove item
- Coupon input
- Delivery charge preview
- Subtotal / Total
- Sticky checkout button

### 5. Checkout Page (/checkout)
- Single-page checkout
- Name input
- Phone with OTP verification
- Address textarea
- Area/District selector
- Delivery charge calculation
- Courier selection (Steadfast/RedX)
- Payment options:
  - Cash on Delivery
  - bKash
  - Nagad
  - Card (SSLCommerz)
- Sticky order summary
- Place Order button

### 6. Order Confirmation (/order/[id])
- Order success message
- Order ID display
- Delivery timeline
- WhatsApp support link

### 7. Admin Dashboard (/admin)
- Stats cards (Total sales, Orders today, Top products)
- Recent orders table
- Quick actions

## Product Types Logic
1. **Ready Product**: Instant order, COD allowed
2. **Custom Product**: Design approval needed, delivery delay notice
3. **Combo Product**: Bundle pricing, savings badge

## Database Schema (Supabase)

### Tables
- `products`: id, name, slug, description, price, old_price, category_id, images, variants, stock, type, is_featured, is_combo, created_at
- `categories`: id, name, slug, image, parent_id
- `orders`: id, user_id, status, items, shipping_address, phone, payment_method, subtotal, delivery_charge, total, courier, tracking_id, created_at
- `order_items`: id, order_id, product_id, quantity, price, variant
- `users`: id, phone, name, email, addresses, is_admin, created_at
- `reviews`: id, product_id, user_id, rating, comment, images, is_verified, created_at
- `coupons`: id, code, discount_type, discount_value, min_order, max_uses, valid_until
- `areas`: id, name, district, delivery_charge, courier

## Features

### Auth System
- Phone OTP login
- Guest checkout allowed
- Account dashboard (optional)

### Order Management
- Statuses: pending, confirmed, processing, shipped, delivered, cancelled

### Courier Integration
- Structure for Steadfast, RedX
- Auto courier selection
- Tracking ID storage

### Payment System
- COD
- bKash (manual)
- Nagad (manual)
- SSLCommerz (Card) - Ready structure

### Fraud Prevention
- OTP verification required
- Customer blacklist system

### Marketing
- Coupon system
- Bundle discounts
- First order discount

## Response Components
- Mobile responsive
- WhatsApp chat button
- Facebook Pixel ready
- Google Analytics ready

## Performance
- Image optimization (next/image with WebP)
- Lazy loading
- SSR for SEO pages
- Mobile optimized