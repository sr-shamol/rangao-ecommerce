'use client';

import { useState, useEffect } from 'react';
import { Send, Users, Target, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { AdminLayout } from '@/components/admin/Layout';

interface CampaignStats {
  total: number;
  sent: number;
  pending: number;
  failed: number;
}

export default function MarketingPage() {
  const [campaignType, setCampaignType] = useState('all');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [stats, setStats] = useState<CampaignStats>({ total: 0, sent: 0, pending: 0, failed: 0 });
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/admin/marketing?type=logs');
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  };

  const sendCampaign = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await fetch('/api/admin/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: campaignType, message }),
      });
      setMessage('');
      fetchLogs();
      alert('Campaign sent!');
    } catch (error) {
      console.error('Failed to send campaign:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Marketing & SMS</h1>
        <p className="text-gray-500">Send bulk SMS campaigns</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border p-6">
          <Users className="text-primary mb-2" size={24} />
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-sm text-gray-500">Total SMS</p>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <CheckCircle className="text-green-500 mb-2" size={24} />
          <p className="text-2xl font-bold">{stats.sent}</p>
          <p className="text-sm text-gray-500">Delivered</p>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <MessageSquare className="text-yellow-500 mb-2" size={24} />
          <p className="text-2xl font-bold">{stats.pending}</p>
          <p className="text-sm text-gray-500">Pending</p>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <XCircle className="text-red-500 mb-2" size={24} />
          <p className="text-2xl font-bold">{stats.failed}</p>
          <p className="text-sm text-gray-500">Failed</p>
        </div>
      </div>

      {/* Send Campaign */}
      <div className="bg-white rounded-xl border p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Send Campaign</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Target Audience</label>
          <select
            value={campaignType}
            onChange={(e) => setCampaignType(e.target.value)}
            className="w-full max-w-xs px-4 py-2 border rounded-lg"
          >
            <option value="all">All Customers</option>
            <option value="repeat">Repeat Buyers</option>
            <option value="high_spenders">High Spenders (৳5000+)</option>
            <option value="pending">Pending Order Customers</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message in Bangla or English..."
            className="w-full h-32 px-4 py-2 border rounded-lg resize-none"
          />
          <p className="text-sm text-gray-500 mt-1">{message.length} characters</p>
        </div>

        <button
          onClick={sendCampaign}
          disabled={sending || !message.trim()}
          className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-light disabled:opacity-50"
        >
          <Send size={18} />
          {sending ? 'Sending...' : 'Send Campaign'}
        </button>
      </div>

      {/* Recent Logs */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4">Recent SMS Logs</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Phone</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Message</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.slice(0, 20).map((log, i) => (
                <tr key={i}>
                  <td className="px-4 py-2">{log.phone}</td>
                  <td className="px-4 py-2 max-w-xs truncate">{log.message}</td>
                  <td className="px-4 py-2 capitalize">{log.type}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      log.status === 'sent' ? 'bg-green-100 text-green-800' :
                      log.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {new Date(log.created_at).toLocaleDateString('en-BD')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}