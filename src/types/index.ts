export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  oldPrice?: number;
  categoryId: string;
  category?: Category;
  images: string[];
  variants?: ProductVariant[];
  stock: number;
  type: 'ready' | 'custom' | 'combo';
  isFeatured: boolean;
  isCombo: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  priceModifier?: number;
}

export interface Category {
  id: string;
  name: string;
  nameBn: string;
  slug: string;
  image?: string;
  parentId?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  variant?: ProductVariant;
}

export interface Order {
  id: string;
  userId?: string;
  status: OrderStatus;
  items: OrderItem[];
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  areaId?: string;
  area?: Area;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  total: number;
  courier?: string;
  trackingId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product?: Product;
  quantity: number;
  price: number;
  variant?: string;
}

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled';

export type PaymentMethod = 'cod' | 'bkash' | 'nagad' | 'card';

export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface Area {
  id: string;
  name: string;
  district: string;
  deliveryCharge: number;
  courier?: string;
}

export interface Review {
  id: string;
  productId: string;
  userId?: string;
  userName: string;
  rating: number;
  comment: string;
  images?: string[];
  isVerified: boolean;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrder: number;
  maxUses?: number;
  usesCount: number;
  validUntil: string;
  isActive: boolean;
}

export interface User {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  addresses?: Address[];
  isAdmin: boolean;
  createdAt: string;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  areaId?: string;
  isDefault: boolean;
}