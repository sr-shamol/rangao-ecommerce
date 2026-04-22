'use client';

import { useState, useEffect } from 'react';
import { Plus, Copy, Trash2, Calendar } from 'lucide-react';
import { AdminLayout } from '@/components/admin/Layout';
import { formatPrice } from '@/lib/utils';

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order: number;
  max_uses: number | null;
  uses_count: number;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: 0,
    min_order: 0,
    max_uses: 0,
    valid_until: '',
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/products?type=coupons');
      const data = await res.json();
      if (data.success) {
        setCoupons(data.coupons);
      }
    } catch (error) {
      console.error('Failed to fetch coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/products?type=coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setShowForm(false);
      setForm({ code: '', discount_type: 'percentage', discount_value: 0, min_order: 0, max_uses: 0, valid_until: '' });
      fetchCoupons();
    } catch (error) {
      console.error('Failed to create coupon:', error);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert('Coupon code copied!');
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Coupons</h1>
          <p className="text-gray-500">Manage discount codes</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-light"
        >
          <Plus size={20} />
          Create Coupon
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white rounded-xl border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Create New Coupon</h2>
          <form onSubmit={createCoupon} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Coupon Code</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="e.g., SAVE20"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Discount Type</label>
              <select
                value={form.discount_type}
                onChange={(e) => setForm({ ...form, discount_type: e.target.value as 'percentage' | 'fixed' })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (৳)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Discount Value</label>
              <input
                type="number"
                value={form.discount_value}
                onChange={(e) => setForm({ ...form, discount_value: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Min Order (৳)</label>
              <input
                type="number"
                value={form.min_order}
                onChange={(e) => setForm({ ...form, min_order: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Uses</label>
              <input
                type="number"
                value={form.max_uses}
                onChange={(e) => setForm({ ...form, max_uses: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Leave empty for unlimited"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Valid Until</label>
              <input
                type="date"
                value={form.valid_until}
                onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="lg:col-span-2 flex items-end gap-2">
              <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-light">
                Create Coupon
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 border rounded-lg">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No coupons created yet</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((coupon) => (
            <div key={coupon.id} className="bg-white rounded-xl border p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <code className="bg-gray-100 px-3 py-1 rounded font-mono font-bold text-lg">{coupon.code}</code>
                  <button onClick={() => copyCode(coupon.code)} className="text-gray-400 hover:text-primary">
                    <Copy size={16} />
                  </button>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${coupon.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  {coupon.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="mb-4">
                <p className="text-2xl font-bold text-primary">
                  {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : formatPrice(coupon.discount_value)}
                  <span className="text-sm font-normal text-gray-500"> OFF</span>
                </p>
              </div>

              <div className="space-y-2 text-sm text-gray-500">
                <p>Min order: {formatPrice(coupon.min_order)}</p>
                <p>Uses: {coupon.uses_count} {coupon.max_uses ? `/ ${coupon.max_uses}` : '(unlimited)'}</p>
                {coupon.valid_until && (
                  <p className="flex items-center gap-1">
                    <Calendar size={14} />
                    Valid until: {new Date(coupon.valid_until).toLocaleDateString('en-BD')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}