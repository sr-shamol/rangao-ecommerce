import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrderStatus, assignCourier, sendShippingSMS, sendOrderConfirmationSMS, sendDeliverySMS, checkFraud } from '@/lib/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await getOrderById(id);
    
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Order fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, data } = body;
    
    if (action === 'status') {
      await updateOrderById(id, data.status);
      
      const order = await getOrderById(id);
      if (order && data.status === 'confirmed') {
        await sendOrderConfirmationSMS(order);
      } else if (order && data.status === 'shipped') {
        await sendShippingSMS(order);
      } else if (order && data.status === 'delivered') {
        await sendDeliverySMS(order);
      }
      
      return NextResponse.json({ success: true });
    }
    
    if (action === 'courier') {
      await assignCourierById(id, data.courier, data.tracking_id);
      return NextResponse.json({ success: true });
    }
    
    if (action === 'check_fraud') {
      const order = await getOrderById(id);
      if (!order) return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
      
      const result = await checkFraud(order.customer_phone, order.id);
      return NextResponse.json({ success: true, result });
    }
    
    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Order update error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update order' }, { status: 500 });
  }
}

async function updateOrderById(orderId: string, status: string) {
  const { supabaseAdmin } = await import('@/lib/admin');
  return supabaseAdmin.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('order_id', orderId);
}

async function assignCourierById(orderId: string, courier: string, trackingId?: string) {
  const { supabaseAdmin } = await import('@/lib/admin');
  return supabaseAdmin.from('orders').update({ courier, tracking_id: trackingId, updated_at: new Date().toISOString() }).eq('order_id', orderId);
}