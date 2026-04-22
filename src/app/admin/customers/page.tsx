'use client';

import { useState, useEffect } from 'react';
import { Search, UserCheck, UserX, Phone, ShoppingBag } from 'lucide-react';
import { AdminLayout } from '@/components/admin/Layout';
import { formatPrice } from '@/lib/utils';

interface Customer {
  phone: string;
  name: string;
  order_count: number;
  total_spent: number;
  fraud_score: number;
  fraud_flag: boolean;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);

      const res = await fetch(`/api/admin/customers?${params}`);
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers);
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Customers</h1>
        <p className="text-gray-500">View customer database and manage access</p>
      </div>

      {/* Search */}
      <div className="mb-6 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="search"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Spent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Loading...</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No customers found</td>
                </tr>
              ) : (
                customers.map((customer, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium">{customer.name || 'N/A'}</p>
                      <p className="text-sm text-gray-500">{customer.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <ShoppingBag size={16} className="text-gray-400" />
                        <span>{customer.order_count}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold">{formatPrice(customer.total_spent)}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {formatPrice(customer.order_count > 0 ? customer.total_spent / customer.order_count : 0)}
                    </td>
                    <td className="px-6 py-4">
                      {customer.fraud_flag ? (
                        <span className="inline-flex items-center gap-1 text-red-600 font-medium">
                          <UserX size={16} /> High Risk
                        </span>
                      ) : customer.fraud_score > 30 ? (
                        <span className="text-yellow-600">Medium Risk</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-green-600">
                          <UserCheck size={16} /> Safe
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <a
                          href={`https://wa.me/${customer.phone}`}
                          target="_blank"
                          className="p-2 text-gray-400 hover:text-green-500 transition-colors"
                        >
                          <Phone size={16} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}