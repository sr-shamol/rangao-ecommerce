import { supabase } from './supabase';

export async function getProducts(options?: {
  category?: string;
  featured?: boolean;
  combo?: boolean;
  limit?: number;
}) {
  if (!supabase) {
    console.warn('Supabase not configured');
    return [];
  }

  let query = supabase
    .from('products')
    .select('*');

  if (options?.category) {
    query = query.eq('category_id', options.category);
  }

  if (options?.featured) {
    query = query.eq('is_featured', true);
  }

  if (options?.combo) {
    query = query.eq('is_combo', true);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return data || [];
}

export async function getProductBySlug(slug: string) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }

  return data;
}

export async function getCategories() {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data || [];
}

export async function getCategoryBySlug(slug: string) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching category:', error);
    return null;
  }

  return data;
}

export async function getAreas() {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('areas')
    .select('*')
    .order('district');

  if (error) {
    console.error('Error fetching areas:', error);
    return [];
  }

  return data || [];
}

export async function createOrder(orderData: {
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  area_id?: string;
  payment_method: string;
  subtotal: number;
  delivery_charge: number;
  discount: number;
  total: number;
  items: { product_id: string; quantity: number; price: number; variant?: string }[];
}) {
  if (!supabase) return null;

  const orderId = `RNG-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_id: orderId,
      customer_name: orderData.customer_name,
      customer_phone: orderData.customer_phone,
      shipping_address: orderData.shipping_address,
      area_id: orderData.area_id,
      payment_method: orderData.payment_method,
      subtotal: orderData.subtotal,
      delivery_charge: orderData.delivery_charge,
      discount: orderData.discount,
      total: orderData.total,
      status: 'pending',
    })
    .select()
    .single();

  if (orderError) {
    console.error('Error creating order:', orderError);
    return null;
  }

  const orderItems = orderData.items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.price,
    variant: item.variant,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    console.error('Error creating order items:', itemsError);
  }

  return order;
}

export async function getOrders(phone?: string) {
  if (!supabase) return [];

  let query = supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });

  if (phone) {
    query = query.eq('customer_phone', phone);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }

  return data || [];
}

export async function getOrderById(orderId: string) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*), areas(*)')
    .eq('order_id', orderId)
    .single();

  if (error) {
    console.error('Error fetching order:', error);
    return null;
  }

  return data;
}

export async function validateCoupon(code: string, subtotal: number) {
  if (!supabase) return { valid: false, discount: 0 };

  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single();

  if (error || !data) {
    return { valid: false, discount: 0 };
  }

  if (new Date(data.valid_until) < new Date()) {
    return { valid: false, discount: 0, message: 'Coupon expired' };
  }

  if (data.max_uses && data.uses_count >= data.max_uses) {
    return { valid: false, discount: 0, message: 'Coupon usage limit reached' };
  }

  if (subtotal < data.min_order) {
    return { valid: false, discount: 0, message: `Minimum order ${data.min_order} required` };
  }

  let discount = 0;
  if (data.discount_type === 'percentage') {
    discount = (subtotal * data.discount_value) / 100;
  } else {
    discount = data.discount_value;
  }

  return { valid: true, discount, coupon: data };
}