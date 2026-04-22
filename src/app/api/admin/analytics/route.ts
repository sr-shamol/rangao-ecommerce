import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/admin';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = parseInt(searchParams.get('period') || '7');
    const days = period;

    const startDate = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];

    const [ordersResult, productsResult] = await Promise.all([
      supabaseAdmin
        .from('orders')
        .select('created_at, total, status, courier, fraud_flag, customer_phone')
        .gte('created_at', startDate),
      supabaseAdmin
        .from('order_items')
        .select('order_id, price, quantity')
        .gte('created_at', startDate),
    ]);

    const orders = ordersResult.data || [] as any[];
    const orderItems = productsResult.data || [];

    const dailyData: Record<string, { orders: number; revenue: number }> = {};
    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() - (days - 1 - i) * 86400000).toISOString().split('T')[0];
      dailyData[date] = { orders: 0, revenue: 0 };
    }

    for (const order of orders as any[]) {
      const date = order.created_at.split('T')[0];
      if (dailyData[date]) {
        dailyData[date].orders++;
        dailyData[date].revenue += order.total || 0;
      }
    }

    const productMap = new Map<string, { orders: number; revenue: number }>();
    for (const item of orderItems as any[]) {
      const name = 'Product';
      if (!productMap.has(name)) {
        productMap.set(name, { orders: 0, revenue: 0 });
      }
      const p = productMap.get(name)!;
      p.orders += item.quantity || 0;
      p.revenue += (item.price || 0) * (item.quantity || 0);
    }

    const topProducts = Array.from(productMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const uniquePhones = new Set(orders.map((o: any) => o.customer_phone));
    const customerOrderCounts = new Map<string, number>();
    for (const order of orders as any[]) {
      const phone = order.customer_phone;
      customerOrderCounts.set(phone, (customerOrderCounts.get(phone) || 0) + 1);
    }
    const repeatCustomers = Array.from(customerOrderCounts.values()).filter(c => c > 1).length;
    const repeatCustomerRate = uniquePhones.size > 0 ? (repeatCustomers / uniquePhones.size) * 100 : 0;

    const fraudOrders = orders.filter(o => o.fraud_flag).length;
    const fraudRate = orders.length > 0 ? (fraudOrders / orders.length) * 100 : 0;

    const courierMap = new Map<string, { total: number; success: number }>();
    for (const order of orders as any[]) {
      if (order.courier) {
        const c = courierMap.get(order.courier) || { total: 0, success: 0 };
        c.total++;
        if (order.status === 'delivered') c.success++;
        courierMap.set(order.courier, c);
      }
    }

    const courierStats = Array.from(courierMap.entries())
      .map(([courier, data]) => ({
        courier,
        total: data.total,
        success_rate: data.total > 0 ? Math.round((data.success / data.total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);

    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    return NextResponse.json({
      success: true,
      data: {
        sales_7days: Object.entries(dailyData).slice(-7).map(([date, data]) => ({ date, ...data })),
        sales_30days: Object.entries(dailyData).map(([date, data]) => ({ date, ...data })),
        top_products: topProducts,
        top_categories: [],
        conversion_rate: 0,
        avg_order_value: avgOrderValue,
        repeat_customer_rate: repeatCustomerRate,
        fraud_rate: fraudRate,
        courier_stats: courierStats,
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch analytics' }, { status: 500 });
  }
}