import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
);

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export type AdminOrder = {
  id: string;
  order_id: string;
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  subtotal: number;
  delivery_charge: number;
  discount: number;
  total: number;
  payment_method: 'cod' | 'bkash' | 'nagad' | 'card';
  payment_status: 'pending' | 'paid' | 'failed';
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  courier: string | null;
  tracking_id: string | null;
  fraud_score: number | null;
  fraud_flag: boolean;
  created_at: string;
};

export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  old_price: number | null;
  category_id: string;
  images: string[];
  stock: number;
  type: 'ready' | 'custom' | 'combo';
  is_featured: boolean;
  is_combo: boolean;
  created_at: string;
};

export type AdminCustomer = {
  id: string;
  phone: string;
  name: string;
  order_count: number;
  total_spent: number;
  fraud_score: number;
  cod_eligible: boolean;
  created_at: string;
};

export type AdminStats = {
  today_orders: number;
  today_revenue: number;
  yesterday_orders: number;
  yesterday_revenue: number;
  total_products: number;
  total_customers: number;
  pending_orders: number;
  fraud_orders_today: number;
  avg_order_value: number;
  conversion_rate: number;
};

export async function getAdminStats(): Promise<AdminStats & { courier_success_rate: number; abandoned_carts: number; recovered_carts: number }> {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const [todayOrders, yesterdayOrders, allStats, fraudStats, pendingOrders, courierStats] = await Promise.all([
    supabase.from('orders').select('*').gte('created_at', today),
    supabase.from('orders').select('*').gte('created_at', yesterday).lt('created_at', today),
    supabase.from('orders').select('total, fraud_flag').eq('status', 'delivered'),
    supabase.from('orders').select('id').eq('fraud_flag', true).gte('created_at', today),
    supabase.from('orders').select('id', { count: 'exact' }).eq('status', 'pending'),
    supabase.from('courier_performance').select('*'),
  ]);

  const todayOrdersList = todayOrders.data || [];
  const yesterdayOrdersList = yesterdayOrders.data || [];

  const courierSuccessRate = courierStats.data?.length 
    ? courierStats.data.reduce((sum, c) => sum + (c.success_rate || 0), 0) / courierStats.data.length 
    : 0;

  const [abandonedCarts, recoveredCarts] = await Promise.all([
    supabase.from('abandoned_carts').select('id', { count: 'exact' }).eq('recovered', false),
    supabase.from('abandoned_carts').select('id', { count: 'exact' }).eq('recovered', true),
  ]);

  return {
    today_orders: todayOrdersList.length,
    today_revenue: todayOrdersList.reduce((sum, o) => sum + (o.total || 0), 0),
    yesterday_orders: yesterdayOrdersList.length,
    yesterday_revenue: yesterdayOrdersList.reduce((sum, o) => sum + (o.total || 0), 0),
    total_products: 0,
    total_customers: 0,
    pending_orders: pendingOrders.count || 0,
    fraud_orders_today: fraudStats.count || 0,
    avg_order_value: allStats.data?.length ? allStats.data.reduce((sum, o) => sum + (o.total || 0), 0) / allStats.data.length : 0,
    conversion_rate: 0,
    courier_success_rate: Math.round(courierSuccessRate),
    abandoned_carts: abandonedCarts.count || 0,
    recovered_carts: recoveredCarts.count || 0,
  };
}

export async function getOrders(filters?: {
  status?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  let query = supabase.from('orders').select('*, order_items(*)', { count: 'exact' });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.date_from) {
    query = query.gte('created_at', filters.date_from);
  }
  if (filters?.date_to) {
    query = query.lte('created_at', filters.date_to);
  }
  if (filters?.search) {
    query = query.or(`order_id.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%,customer_phone.ilike.%${filters.search}%`);
  }

  query = query.order('created_at', { ascending: false });
  
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  query = query.range((page - 1) * limit, page * limit);

  const result = await query;
  return {
    orders: result.data || [],
    total: result.count || 0,
    page,
    totalPages: Math.ceil((result.count || 0) / limit),
  };
}

export async function getOrderById(orderId: string) {
  const result = await supabase
    .from('orders')
    .select('*, order_items(*), areas(*)')
    .eq('order_id', orderId)
    .single();
  return result.data;
}

export async function updateOrderStatus(orderId: string, status: string) {
  return supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('order_id', orderId);
}

export async function assignCourier(orderId: string, courier: string, trackingId?: string) {
  return supabase
    .from('orders')
    .update({ courier, tracking_id: trackingId, updated_at: new Date().toISOString() })
    .eq('order_id', orderId);
}

export async function getProducts(filters?: {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  let query = supabase.from('products').select('*', { count: 'exact' });

  if (filters?.category) {
    query = query.eq('category_id', filters.category);
  }
  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,slug.ilike.%${filters.search}%`);
  }

  query = query.order('created_at', { ascending: false });
  
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  query = query.range((page - 1) * limit, page * limit);

  const result = await query;
  return {
    products: result.data || [],
    total: result.count || 0,
  };
}

export async function getCategories() {
  const result = await supabase.from('categories').select('*').order('name');
  return result.data || [];
}

export async function createProduct(product: Partial<AdminProduct>) {
  return supabase.from('products').insert(product).select().single();
}

export async function updateProduct(id: string, product: Partial<AdminProduct>) {
  return supabase.from('products').update({ ...product, updated_at: new Date().toISOString() }).eq('id', id);
}

export async function getCustomers(filters?: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  let query = supabase.from('orders').select('customer_phone, customer_name, fraud_score, fraud_flag, total');

  if (filters?.search) {
    query = query.or(`customer_phone.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%`);
  }

  const result = await query;
  
  const customerMap = new Map<string, any>();
  for (const order of result.data || []) {
    const phone = order.customer_phone;
    if (!customerMap.has(phone)) {
      customerMap.set(phone, {
        phone,
        name: order.customer_name,
        fraud_score: order.fraud_score,
        fraud_flag: order.fraud_flag,
        order_count: 0,
        total_spent: 0,
      });
    }
    const customer = customerMap.get(phone);
    customer.order_count++;
    customer.total_spent += order.total || 0;
  }

  const customers = Array.from(customerMap.values());
  return {
    customers: customers.slice(0, filters?.limit || 20),
    total: customers.length,
  };
}

export async function createCoupon(coupon: {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order?: number;
  max_uses?: number;
  valid_until?: string;
}) {
  return supabase.from('coupons').insert(coupon).select().single();
}

export async function getCoupons() {
  const result = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
  return result.data || [];
}

export async function getSalesData(days: number = 7) {
  const startDate = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
  
  const result = await supabase
    .from('orders')
    .select('created_at, total')
    .gte('created_at', startDate)
    .eq('status', 'delivered');

  const dailyData: Record<string, { orders: number; revenue: number }> = {};
  
  for (let i = 0; i < days; i++) {
    const date = new Date(Date.now() - (days - 1 - i) * 86400000).toISOString().split('T')[0];
    dailyData[date] = { orders: 0, revenue: 0 };
  }

  for (const order of result.data || []) {
    const date = order.created_at.split('T')[0];
    if (dailyData[date]) {
      dailyData[date].orders++;
      dailyData[date].revenue += order.total || 0;
    }
  }

  return Object.entries(dailyData).map(([date, data]) => ({
    date,
    orders: data.orders,
    revenue: data.revenue,
  }));
}

export async function getLeads() {
  const result = await supabase
    .from('orders')
    .select('customer_phone, customer_name, shipping_address, created_at, status, total')
    .order('created_at', { ascending: false });

  const leadMap = new Map<string, any>();
  for (const order of result.data || []) {
    const phone = order.customer_phone;
    if (!leadMap.has(phone)) {
      leadMap.set(phone, {
        phone,
        name: order.customer_name,
        address: order.shipping_address,
        created_at: order.created_at,
        order_count: 0,
        orders: [],
      });
    }
    const lead = leadMap.get(phone);
    lead.order_count++;
    if (order.status === 'pending') {
      lead.orders.push(order);
    }
  }

  return Array.from(leadMap.values());
}

export type FraudCheck = {
  id: string;
  phone: string;
  order_id: string;
  fraud_score: number;
  is_risky: boolean;
  api_response: any;
  checked_at: string;
};

export type CourierConfig = {
  name: string;
  api_key: string;
  api_url: string;
  enabled: boolean;
  priority: number;
};

export type SMSConfig = {
  gateway: string;
  api_key: string;
  api_url: string;
  sender_id: string;
  enabled: boolean;
  default_gateway?: string;
  gateways?: SMSConfig[];
};

export async function checkFraud(phone: string, orderId?: string): Promise<FraudCheck | null> {
  const apiUrl = process.env.FRAUD_API_URL || 'https://bdcourier.com/api/fraud-check';
  const apiKey = process.env.FRAUD_API_KEY || '';
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ phone }),
    });
    
    const data = await response.json();
    const fraudScore = data.score || 0;
    const isRisky = fraudScore >= 60;
    
    const insertResult = await supabase.from('fraud_check').insert({
      phone,
      order_id: orderId,
      fraud_score: fraudScore,
      is_risky: isRisky,
      api_response: data,
    }).select().single();
    
    return insertResult.data;
  } catch (error) {
    console.error('Fraud check error:', error);
    return null;
  }
}

export async function sendSMS(phone: string, message: string, type: string = 'general'): Promise<boolean> {
  const settingsResult = await supabase.from('settings').select('value').eq('id', 'sms').single();
  const smsConfig: SMSConfig = settingsResult.data?.value || {};
  
  if (!smsConfig.enabled || !smsConfig.default_gateway) {
    console.log('SMS not enabled, logging only');
    await supabase.from('sms_log').insert({
      phone,
      message,
      type,
      status: 'pending',
      gateway: 'none',
    });
    return false;
  }
  
  const gateway = smsConfig.gateways?.find((g: SMSConfig) => g.gateway === smsConfig.default_gateway);
  if (!gateway) return false;
  
  try {
    const response = await fetch(gateway.api_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${gateway.api_key}`,
      },
      body: JSON.stringify({
        sender_id: gateway.sender_id,
        phone,
        message,
      }),
    });
    
    const data = await response.json();
    const success = data.success || response.ok;
    
    await supabase.from('sms_log').insert({
      phone,
      message,
      type,
      status: success ? 'sent' : 'failed',
      gateway: smsConfig.default_gateway,
    });
    
    return success;
  } catch (error) {
    console.error('SMS error:', error);
    await supabase.from('sms_log').insert({
      phone,
      message,
      type,
      status: 'failed',
      gateway: smsConfig.default_gateway,
    });
    return false;
  }
}

export async function sendOrderConfirmationSMS(order: AdminOrder): Promise<boolean> {
  const message = `Dear ${order.customer_name}, your order ${order.order_id} of ${formatPrice(order.total)} has been confirmed. We will notify you when shipped. - Rangao`;
  return sendSMS(order.customer_phone, message, 'order_confirmation');
}

export async function sendShippingSMS(order: AdminOrder): Promise<boolean> {
  const trackingInfo = order.tracking_id ? ` (Tracking: ${order.tracking_id})` : '';
  const message = `Your order ${order.order_id} has been shipped via ${order.courier}${trackingInfo}. Track: rangao.com/order/${order.order_id} - Rangao`;
  return sendSMS(order.customer_phone, message, 'shipping');
}

export async function sendDeliverySMS(order: AdminOrder): Promise<boolean> {
  const message = `Your order ${order.order_id} has been delivered! Thank you for shopping with Rangao. Please rate us!`;
  return sendSMS(order.customer_phone, message, 'delivery');
}

export async function sendAbandonedCartSMS(phone: string, products: any[], total: number): Promise<boolean> {
  const productNames = products.map(p => p.name).join(', ');
  const message = `আপনার পণ্য ${productNames} এখনও কার্টে আছে! অর্ডার করতে ক্লিক করুন: rangao.com/cart - Rangao`;
  
  await supabase.from('abandoned_carts').insert({
    phone,
    products,
    total,
    sms_sent: true,
  });
  
  return sendSMS(phone, message, 'abandoned_cart');
}

export type CourierAPI = {
  name: string;
  api_key: string;
  base_url: string;
};

export const courierConfigs: Record<string, CourierAPI> = {
  steadfast: {
    name: 'Steadfast',
    api_key: process.env.STEADFAST_API_KEY || '',
    base_url: 'https://api.steadfast.com.bd/api/v1',
  },
  redx: {
    name: 'RedX',
    api_key: process.env.REDX_API_KEY || '',
    base_url: 'https://api.redx.com.bd/v1',
  },
  pathao: {
    name: 'Pathao',
    api_key: process.env.PATHAO_API_KEY || '',
    base_url: 'https://api.pathao.com',
  },
  carrybee: {
    name: 'Carrybee',
    api_key: process.env.CARRYBEE_API_KEY || '',
    base_url: 'https://api.carrybee.com',
  },
};

export async function createSteadfastOrder(order: AdminOrder): Promise<{ success: boolean; tracking_id?: string; error?: string }> {
  const config = courierConfigs.steadfast;
  if (!config.api_key) return { success: false, error: 'API key not configured' };
  
  try {
    const response = await fetch(`${config.base_url}/create_order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': config.api_key,
        'Secret-Key': process.env.STEADFAST_SECRET_KEY || '',
      },
      body: JSON.stringify({
        invoice: order.order_id,
        recipient_name: order.customer_name,
        recipient_phone: order.customer_phone,
        recipient_address: order.shipping_address,
        amount: order.total,
        collection_amount: order.payment_method === 'cod' ? order.total : 0,
      }),
    });
    
    const data = await response.json();
    return {
      success: data.success || response.ok,
      tracking_id: data.tracking_id,
      error: data.error,
    };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function createRedXOrder(order: AdminOrder): Promise<{ success: boolean; tracking_id?: string; error?: string }> {
  const config = courierConfigs.redx;
  if (!config.api_key) return { success: false, error: 'API key not configured' };
  
  try {
    const response = await fetch(`${config.base_url}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.api_key}`,
      },
      body: JSON.stringify({
        order_id: order.order_id,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        delivery_address: order.shipping_address,
        collect_amount: order.payment_method === 'cod' ? order.total : 0,
      }),
    });
    
    const data = await response.json();
    return {
      success: data.error === null,
      tracking_id: data.tracking_id,
      error: data.error?.message,
    };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function autoAssignCourier(order: AdminOrder): Promise<{ courier: string; tracking_id?: string }> {
  const areaResult = await supabase.from('areas').select('*').ilike('name', `%${order.shipping_address}%`).limit(1);
  const area = areaResult.data?.[0];
  
  const isDhaka = area?.district?.toLowerCase().includes('dhaka') || order.shipping_address?.toLowerCase().includes('dhaka');
  const preferredCourier = isDhaka ? 'steadfast' : 'redx';
  
  let result = { courier: preferredCourier, tracking_id: undefined as string | undefined };
  
  if (preferredCourier === 'steadfast') {
    const sfResult = await createSteadfastOrder(order);
    if (sfResult.success) {
      result.tracking_id = sfResult.tracking_id;
    }
  } else {
    const rxResult = await createRedXOrder(order);
    if (rxResult.success) {
      result.tracking_id = rxResult.tracking_id;
    }
  }
  
  return result;
}

export async function getCourierPerformance() {
  const result = await supabase.from('courier_performance').select('*').order('success_rate', { ascending: false });
  return result.data || [];
}

export async function updateCourierStats(courierName: string, delivered: boolean) {
  const existing = await supabase.from('courier_performance').select('*').eq('courier_name', courierName).single();
  
  if (existing.data) {
    const updates = {
      total_shipments: existing.data.total_shipments + 1,
      successful_deliveries: delivered ? existing.data.successful_deliveries + 1 : existing.data.successful_deliveries,
      failed_deliveries: !delivered ? existing.data.failed_deliveries + 1 : existing.data.failed_deliveries,
      success_rate: 0,
      last_updated: new Date().toISOString(),
    };
    updates.success_rate = Math.round((updates.successful_deliveries / updates.total_shipments) * 100);
    
    await supabase.from('courier_performance').update(updates).eq('courier_name', courierName);
  } else {
    await supabase.from('courier_performance').insert({
      courier_name: courierName,
      total_shipments: 1,
      successful_deliveries: delivered ? 1 : 0,
      failed_deliveries: !delivered ? 1 : 0,
      success_rate: delivered ? 100 : 0,
    });
  }
}

export async function getSettings(key: string) {
  const result = await supabase.from('settings').select('value').eq('id', key).single();
  return result.data?.value;
}

export async function updateSettings(key: string, value: any) {
  return supabase.from('settings').upsert({
    id: key,
    value,
    updated_at: new Date().toISOString(),
  });
}

export async function sendFacebookEvent(eventName: string, eventData: any) {
  const pixelId = process.env.FACEBOOK_PIXEL_ID;
  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
  
  if (!pixelId || !accessToken) {
    console.log('Facebook CAPI not configured');
    await supabase.from('facebook_events').insert({
      event_name: eventName,
      event_data: eventData,
      sent_to_facebook: false,
    });
    return false;
  }
  
  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/${pixelId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_token: accessToken,
        events: [{
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          user_data: eventData.user_data,
          custom_data: eventData.custom_data,
        }],
      }),
    });
    
    const data = await response.json();
    
    await supabase.from('facebook_events').insert({
      event_name: eventName,
      event_data: eventData,
      sent_to_facebook: data.id ? true : false,
    });
    
    return !!data.id;
  } catch (error) {
    console.error('Facebook CAPI error:', error);
    return false;
  }
}

export async function getLeadsFromDb(filters?: { status?: string; search?: string; page?: number }) {
  let query = supabase.from('leads').select('*', { count: 'exact' });
  
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.search) {
    query = query.or(`phone.ilike.%${filters.search}%,name.ilike.%${filters.search}%`);
  }
  
  query = query.order('created_at', { ascending: false });
  
  const page = filters?.page || 1;
  query = query.range((page - 1) * 20, page * 20);
  
  const result = await query;
  return {
    leads: result.data || [],
    total: result.count || 0,
  };
}

export async function createLead(lead: { phone: string; name?: string; source?: string; notes?: string }) {
  return supabase.from('leads').insert(lead).select().single();
}

export async function updateLead(id: string, updates: { status?: string; notes?: string }) {
  return supabase.from('leads').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
}

export async function getAbandonedCarts() {
  const result = await supabase
    .from('abandoned_carts')
    .select('*')
    .eq('recovered', false)
    .order('created_at', { ascending: false });
  return result.data || [];
}

export async function markCartRecovered(cartId: string, orderId: string) {
  return supabase.from('abandoned_carts').update({ recovered: true, recovered_order_id: orderId }).eq('id', cartId);
}