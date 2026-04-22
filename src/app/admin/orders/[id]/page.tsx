'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, Truck, MessageCircle, Phone, Check, X, Send, Printer, AlertTriangle } from 'lucide-react';
import { AdminLayout } from '@/components/admin/Layout';
import { formatPrice } from '@/lib/utils';

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  variant: string;
  products: { name: string; images: string[] };
}

interface Order {
  id: string;
  order_id: string;
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  area: { name: string; district: string } | null;
  subtotal: number;
  delivery_charge: number;
  discount: number;
  total: number;
  payment_method: string;
  payment_status: string;
  status: string;
  courier: string | null;
  tracking_id: string | null;
  fraud_score: number | null;
  fraud_flag: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
  order_items: OrderItem[];
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const couriers = [
  { id: 'steadfast', name: 'Steadfast', desc: 'Best for Dhaka & major cities' },
  { id: 'redx', name: 'RedX', desc: 'Fast delivery outside Dhaka' },
  { id: 'pathao', name: 'Pathao', desc: 'Reliable nationwide' },
  { id: 'carrybee', name: 'Carrybee', desc: 'Economy option' },
];

export default function OrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showCourierModal, setShowCourierModal] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${params.id}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
        setSelectedCourier(data.order.courier || '');
      }
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status: string) => {
    setUpdating(true);
    try {
      await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: order?.order_id, action: 'status', data: { status } }),
      });
      fetchOrder();
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const assignCourier = async () => {
    if (!selectedCourier || !order) return;
    setUpdating(true);
    try {
      await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: order.order_id,
          action: 'courier',
          data: { courier: selectedCourier },
        }),
      });
      setShowCourierModal(false);
      fetchOrder();
    } catch (error) {
      console.error('Failed to assign courier:', error);
    } finally {
      setUpdating(false);
    }
  };

  const sendSMS = async () => {
    if (!order) return;
    setUpdating(true);
    try {
      await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: order.order_id, action: 'sms', data: {} }),
      });
      alert('SMS sent successfully!');
    } catch (error) {
      console.error('Failed to send SMS:', error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Order not found</p>
          <Link href="/admin/orders" className="text-primary hover:underline mt-2 inline-block">
            Back to Orders
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <Link href="/admin/orders" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary">
          <ArrowLeft size={20} /> Back to Orders
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.order_items?.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                    {item.products?.images?.[0] ? (
                      <img src={item.products.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={24} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.products?.name || 'Product'}</p>
                    <p className="text-sm text-gray-500">
                      {item.variant && `${item.variant} · `}Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                    <p className="text-sm text-gray-500">{formatPrice(item.price)} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{order.customer_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{order.customer_phone}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Shipping Address</p>
                <p className="font-medium">{order.shipping_address}</p>
                {order.area && (
                  <p className="text-sm text-gray-500">{order.area.name}, {order.area.district}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Order #{order.order_id}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status]}`}>
                {order.status}
              </span>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery</span>
                <span>{formatPrice(order.delivery_charge)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-3 border-t">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Payment</span>
                <span className="capitalize">{order.payment_method}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span className="capitalize">{order.payment_status}</span>
              </div>
            </div>
          </div>

          {/* Fraud Risk */}
          {(order.fraud_flag || order.fraud_score) && (
            <div className="bg-white rounded-xl border p-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="text-red-500" size={20} />
                <h2 className="text-lg font-semibold">Fraud Risk</h2>
              </div>
              <p className="text-gray-500">Score: {order.fraud_score}%</p>
              {order.fraud_flag && (
                <p className="text-red-600 font-medium">This order flagged as high risk!</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">Actions</h2>
            <div className="space-y-3">
              <select
                value={order.status}
                onChange={(e) => updateStatus(e.target.value)}
                disabled={updating}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <button
                onClick={() => setShowCourierModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                <Truck size={18} />
                {order.courier ? `Change Courier` : 'Assign Courier'}
              </button>

              <a
                href={`https://wa.me/${order.customer_phone}`}
                target="_blank"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border rounded-lg hover:bg-green-50 text-green-600"
              >
                <MessageCircle size={18} /> WhatsApp
              </a>

              <button
                onClick={sendSMS}
                disabled={updating}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                <Send size={18} /> Send Update SMS
              </button>

              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
                <Printer size={18} /> Print Invoice
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Courier Modal */}
      {showCourierModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Assign Courier</h3>
            <div className="space-y-3 mb-6">
              {couriers.map((courier) => (
                <button
                  key={courier.id}
                  onClick={() => setSelectedCourier(courier.id)}
                  className={`w-full p-4 border rounded-lg text-left ${
                    selectedCourier === courier.id ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <p className="font-medium">{courier.name}</p>
                  <p className="text-sm text-gray-500">{courier.desc}</p>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCourierModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={assignCourier}
                disabled={!selectedCourier || updating}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50"
              >
                {updating ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}