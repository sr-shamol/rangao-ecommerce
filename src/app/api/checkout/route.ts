import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/admin';
import { checkFraud, sendOrderConfirmationSMS, sendAbandonedCartSMS, sendFacebookEvent, getSettings, autoAssignCourier, sendSMS } from '@/lib/admin';
import { generateOrderId, isValidPhone } from '@/lib/utils';

const ipRequests = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = ipRequests.get(ip);
  if (!record || now > record.resetAt) {
    ipRequests.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (record.count >= RATE_LIMIT) return false;
  record.count++;
  return true;
}

function sanitizeString(str: string | undefined, maxLen: number = 500): string {
  if (!str) return '';
  return String(str).slice(0, maxLen).replace(/[<>]/g, '');
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please wait.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const {
      customer_name,
      customer_phone,
      shipping_address,
      area_id,
      payment_method,
      items,
      subtotal,
      delivery_charge,
      discount,
      total,
      coupon_code,
    } = body;

    if (!customer_name || !customer_phone || !items?.length) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!isValidPhone(customer_phone)) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number' },
        { status: 400 }
      );
    }

    if (items.length > 20 || items.some((i: any) => i.quantity > 10 || i.quantity < 1)) {
      return NextResponse.json(
        { success: false, error: 'Invalid items' },
        { status: 400 }
      );
    }

    const orderId = generateOrderId();
    const automationSettings = await getSettings('automation') || {};
    const fraudSettings = await getSettings('fraud') || {};

    let fraudCheckResult = null;
    const fraudEnabled = fraudSettings.enabled !== false;
    if (fraudEnabled) {
      fraudCheckResult = await checkFraud(customer_phone);
      if (fraudSettings.block_cod && fraudCheckResult?.is_risky && payment_method === 'cod') {
        return NextResponse.json(
          { success: false, error: 'COD not available for this order. Please pay online.', blocked: true },
          { status: 400 }
        );
      }
    }

    const orderData = {
      order_id: orderId,
      customer_name: sanitizeString(customer_name),
      customer_phone: sanitizeString(customer_phone, 20),
      shipping_address: sanitizeString(shipping_address),
      area_id,
      payment_method: sanitizeString(payment_method) || 'cod',
      payment_status: sanitizeString(payment_method) === 'cod' ? 'pending' : 'paid',
      subtotal: Math.max(0, Number(subtotal) || 0),
      delivery_charge: Math.max(0, Number(delivery_charge) || 0),
      discount: Math.max(0, Number(discount) || 0),
      total: Math.max(0, Number(total) || 0),
      status: 'pending',
      fraud_score: fraudCheckResult?.fraud_score || null,
      fraud_flag: fraudCheckResult?.is_risky || false,
    };

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      console.error('Order error:', orderError);
      return NextResponse.json(
        { success: false, error: 'Failed to create order' },
        { status: 500 }
      );
    }

    for (const item of items) {
      await supabaseAdmin.from('order_items').insert({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        variant: item.variant,
      });
    }

    if (coupon_code) {
      await supabaseAdmin.rpc('increment_coupon_uses', { code: coupon_code });
    }

    if (automationSettings.abandoned_cart_sms) {
      const existingCart = await supabaseAdmin
        .from('abandoned_carts')
        .select('id')
        .eq('phone', customer_phone)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (existingCart.data) {
        await supabaseAdmin
          .from('abandoned_carts')
          .update({ recovered: true, recovered_order_id: order.id })
          .eq('id', existingCart.data.id);

        await sendSMS(customer_phone, `Your previous cart has been converted to order ${orderId}! Thank you!`);
      }
    }

    if (automationSettings.facebook_capi) {
      await sendFacebookEvent('Purchase', {
        custom_data: {
          value: total,
          currency: 'BDT',
        },
        user_data: {
          ph: customer_phone,
        },
      });
    }

    return NextResponse.json({
      success: true,
      order_id: orderId,
      order,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { success: false, error: 'Checkout failed' },
      { status: 500 }
    );
  }
}