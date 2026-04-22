'use client';

import { useState, useEffect } from 'react';
import { Search, Phone, MapPin, Package, Users, Megaphone } from 'lucide-react';
import { AdminLayout } from '@/components/admin/Layout';
import { formatPrice } from '@/lib/utils';

interface Lead {
  phone: string;
  name: string;
  address: string;
  order_count: number;
  orders: any[];
  created_at: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLeads();
  }, [search]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/leads');
      const data = await res.json();
      if (data.success) {
        setLeads(data.leads);
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const pendingLeads = leads.filter(l => l.orders.some((o: any) => o.status === 'pending'));
  const duplicateLeads = leads.filter(l => l.order_count > 1);

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="text-gray-500">Track potential customers and inquiries</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="text-primary" size={24} />
            <span className="text-gray-500">Total Leads</span>
          </div>
          <p className="text-2xl font-bold">{leads.length}</p>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-2">
            <Megaphone className="text-yellow-500" size={24} />
            <span className="text-gray-500">Pending Orders</span>
          </div>
          <p className="text-2xl font-bold">{pendingLeads.length}</p>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-2">
            <Package className="text-green-500" size={24} />
            <span className="text-gray-500">Repeat Customers</span>
          </div>
          <p className="text-2xl font-bold">{duplicateLeads.length}</p>
        </div>
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

      {/* Leads Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Spent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Loading...</td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No leads found</td>
                </tr>
              ) : (
                leads.map((lead, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium">{lead.name || 'N/A'}</p>
                      <p className="text-xs text-gray-400">Since: {new Date(lead.created_at).toLocaleDateString('en-BD')}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <a href={`tel:${lead.phone}`} className="flex items-center gap-1 text-sm text-primary hover:underline">
                          <Phone size={14} /> {lead.phone}
                        </a>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin size={14} /> {lead.address || 'No address'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">{lead.order_count}</td>
                    <td className="px-6 py-4">{formatPrice(lead.orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0))}</td>
                    <td className="px-6 py-4">
                      {lead.order_count > 1 ? (
                        <span className="text-green-600 font-medium">Repeat</span>
                      ) : (
                        <span className="text-gray-500">New</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={`https://wa.me/${lead.phone}`}
                        target="_blank"
                        className="text-green-500 hover:underline text-sm"
                      >
                        WhatsApp
                      </a>
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