import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, sendSMS } from '@/lib/admin';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    
    if (type === 'logs') {
      const result = await supabaseAdmin
        .from('sms_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      const logs = result.data || [];
      const stats = {
        total: logs.length,
        sent: logs.filter(l => l.status === 'sent').length,
        pending: logs.filter(l => l.status === 'pending').length,
        failed: logs.filter(l => l.status === 'failed').length,
      };
      
      return NextResponse.json({ success: true, logs, stats });
    }
    
    return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('Marketing fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, message } = body;
    
    let phones: string[] = [];
    
    if (type === 'all') {
      const result = await supabaseAdmin
        .from('orders')
        .select('customer_phone')
        .order('created_at', { ascending: false })
        .limit(500);
      phones = [...new Set((result.data || []).map(o => o.customer_phone))];
    } else if (type === 'repeat') {
      const result = await supabaseAdmin
        .from('orders')
        .select('customer_phone, customer_name');
      
      const phoneCounts = new Map<string, number>();
      for (const order of result.data || []) {
        const phone = order.customer_phone;
        phoneCounts.set(phone, (phoneCounts.get(phone) || 0) + 1);
      }
      phones = [...new Set((result.data || [])
        .filter(o => (phoneCounts.get(o.customer_phone) || 0) > 1)
        .map(o => o.customer_phone))
      ];
    } else if (type === 'high_spenders') {
      const result = await supabaseAdmin
        .from('orders')
        .select('customer_phone, total')
        .gte('total', 5000);
      phones = [...new Set((result.data || []).map(o => o.customer_phone))];
    } else if (type === 'pending') {
      const result = await supabaseAdmin
        .from('orders')
        .select('customer_phone')
        .eq('status', 'pending');
      phones = [...new Set((result.data || []).map(o => o.customer_phone))];
    }
    
    const results = [];
    for (const phone of phones.slice(0, 100)) {
      const success = await sendSMS(phone, message, 'marketing');
      results.push({ phone, success });
    }
    
    const sent = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    return NextResponse.json({
      success: true,
      results: { total: phones.length, sent, failed },
    });
  } catch (error) {
    console.error('Marketing send error:', error);
    return NextResponse.json({ success: false, error: 'Failed to send campaign' }, { status: 500 });
  }
}