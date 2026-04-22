'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package, AlertTriangle, Truck } from 'lucide-react';
import { AdminLayout } from '@/components/admin/Layout';
import { formatPrice } from '@/lib/utils';

interface AnalyticsData {
  sales_7days: { date: string; orders: number; revenue: number }[];
  sales_30days: { date: string; orders: number; revenue: number }[];
  top_products: { name: string; orders: number; revenue: number }[];
  top_categories: { name: string; orders: number; revenue: number }[];
  conversion_rate: number;
  avg_order_value: number;
  repeat_customer_rate: number;
  fraud_rate: number;
  courier_stats: { courier: string; total: number; success_rate: number }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7' | '30'>('7');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?period=${period}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const maxRevenue = data ? Math.max(...(period === '7' ? data.sales_7days : data.sales_30days).map(d => d.revenue), 1) : 1;

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-gray-500">Track your store performance</p>
      </div>

      {/* Period Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setPeriod('7')}
          className={`px-4 py-2 rounded-lg ${period === '7' ? 'bg-primary text-white' : 'bg-white border'}`}
        >
          7 Days
        </button>
        <button
          onClick={() => setPeriod('30')}
          className={`px-4 py-2 rounded-lg ${period === '30' ? 'bg-primary text-white' : 'bg-white border'}`}
        >
          30 Days
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="text-green-500" size={24} />
            <TrendingUp className="text-green-500" size={16} />
          </div>
          <p className="text-2xl font-bold">{formatPrice(data?.sales_7days.reduce((sum, d) => sum + d.revenue, 0) || 0)}</p>
          <p className="text-sm text-gray-500">Total Revenue ({period} days)</p>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-2">
            <ShoppingCart className="text-primary" size={24} />
          </div>
          <p className="text-2xl font-bold">{data?.sales_7days.reduce((sum, d) => sum + d.orders, 0) || 0}</p>
          <p className="text-sm text-gray-500">Total Orders ({period} days)</p>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="text-blue-500" size={24} />
          </div>
          <p className="text-2xl font-bold">{(data?.repeat_customer_rate || 0).toFixed(1)}%</p>
          <p className="text-sm text-gray-500">Repeat Customer Rate</p>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="text-red-500" size={24} />
          </div>
          <p className="text-2xl font-bold">{(data?.fraud_rate || 0).toFixed(1)}%</p>
          <p className="text-sm text-gray-500">Fraud Rate</p>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="bg-white rounded-xl border p-6 mb-8">
        <h2 className="text-lg font-semibold mb-6">Sales Trend</h2>
        {loading ? (
          <div className="h-64 flex items-center justify-center text-gray-400">Loading...</div>
        ) : (
          <div className="h-64 flex items-end gap-1">
            {(period === '7' ? data?.sales_7days : data?.sales_30days)?.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-primary/80 rounded-t-lg transition-all hover:bg-primary"
                  style={{ height: `${(day.revenue / maxRevenue) * 100}%`, minHeight: day.revenue > 0 ? '4px' : '0' }}
                />
                <span className="text-xs text-gray-500 mt-1 truncate w-full text-center">
                  {new Date(day.date).toLocaleDateString('en', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4">Top Products</h2>
          <div className="space-y-4">
            {data?.top_products?.slice(0, 5).map((product, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                    {i + 1}
                  </span>
                  <span className="font-medium truncate max-w-[200px]">{product.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatPrice(product.revenue)}</p>
                  <p className="text-xs text-gray-500">{product.orders} orders</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Courier Performance */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4">Courier Performance</h2>
          <div className="space-y-4">
            {data?.courier_stats?.map((courier, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium capitalize">{courier.courier}</span>
                  <span className="text-sm text-gray-500">{courier.total} shipments</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${courier.success_rate >= 80 ? 'bg-green-500' : courier.success_rate >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${courier.success_rate}%` }}
                  />
                </div>
                <p className="text-sm text-right mt-1">{courier.success_rate}% success rate</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}