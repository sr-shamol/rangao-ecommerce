'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Package, ShoppingBag, Users, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Plus, Search, Eye, Truck } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const stats = [
  { label: 'Total Sales', value: '৳ 4,52,000', change: '+12%', positive: true, icon: DollarSign },
  { label: 'Orders Today', value: '24', change: '+8%', positive: true, icon: Package },
  { label: 'Products', value: '156', change: '-3', positive: false, icon: ShoppingBag },
  { label: 'Customers', value: '1,234', change: '+25', positive: true, icon: Users },
];

const recentOrders = [
  { id: 'RNG-ABC123', customer: 'Ahmed Hassan', items: 2, total: 2499, status: 'pending', time: '5 min ago' },
  { id: 'RNG-DEF456', customer: 'Fatema Rahman', items: 1, total: 1299, status: 'processing', time: '15 min ago' },
  { id: 'RNG-GHI789', customer: 'Mahmood Ahmed', items: 3, total: 4999, status: 'shipped', time: '30 min ago' },
  { id: 'RNG-JKL012', customer: 'Sara Islam', items: 1, total: 3499, status: 'confirmed', time: '1 hour ago' },
  { id: 'RNG-MNO345', customer: 'Tariq Abdullah', items: 2, total: 1999, status: 'delivered', time: '2 hours ago' },
];

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusLabels = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 min-h-screen fixed top-16 bottom-0">
          <nav className="p-4 space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { id: 'orders', label: 'Orders', icon: Package },
              { id: 'products', label: 'Products', icon: ShoppingBag },
              { id: 'customers', label: 'Customers', icon: Users },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-500">Welcome back! Here's what's happening today.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/admin/products/new">
                <Button className="gap-2">
                  <Plus size={18} />
                  Add Product
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <stat.icon size={24} className="text-primary" />
                  </div>
                  <span className={`flex items-center text-sm font-medium ${
                    stat.positive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.positive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    {stat.change}
                  </span>
                </div>
                <p className="text-2xl font-bold mb-1">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-lg font-semibold">Recent Orders</h2>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search orders..."
                      className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <Link href="/admin/orders">
                    <Button variant="outline" size="sm">View All</Button>
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{order.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{order.customer}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{order.items}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">৳{order.total}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status as keyof typeof statusColors]}`}>
                          {statusLabels[order.status as keyof typeof statusLabels]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.time}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button className="p-1.5 text-gray-400 hover:text-primary transition-colors">
                            <Eye size={16} />
                          </button>
                          <button className="p-1.5 text-gray-400 hover:text-primary transition-colors">
                            <Truck size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <Link href="/admin/products/new" className="card p-6 hover:shadow-md transition-shadow">
              <Plus size={24} className="text-primary mb-2" />
              <p className="font-medium">Add New Product</p>
            </Link>
            <Link href="/admin/orders" className="card p-6 hover:shadow-md transition-shadow">
              <Package size={24} className="text-primary mb-2" />
              <p className="font-medium">Manage Orders</p>
            </Link>
            <Link href="/admin/customers" className="card p-6 hover:shadow-md transition-shadow">
              <Users size={24} className="text-primary mb-2" />
              <p className="font-medium">View Customers</p>
            </Link>
            <Link href="/admin/coupons" className="card p-6 hover:shadow-md transition-shadow">
              <DollarSign size={24} className="text-primary mb-2" />
              <p className="font-medium">Create Coupon</p>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}