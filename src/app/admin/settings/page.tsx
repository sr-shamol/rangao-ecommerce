'use client';

import { useState, useEffect } from 'react';
import { Save, Truck, MessageSquare, Settings, Shield, Zap, Globe } from 'lucide-react';
import { AdminLayout } from '@/components/admin/Layout';

interface SettingsData {
  sms: { gateways: any[]; default_gateway: string; enabled: boolean };
  couriers: { enabled: string[]; auto_assign: boolean };
  checkout: { headline: string; urgency_text: string; offers: any[] };
  fraud: { enabled: boolean; threshold: number; block_cod: boolean };
  automation: { abandoned_cart_sms: boolean; auto_confirm: boolean; facebook_capi: boolean };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      alert('Settings saved!');
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => prev ? { ...prev, [key]: value } : null);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'couriers', label: 'Couriers', icon: Truck },
    { id: 'sms', label: 'SMS', icon: MessageSquare },
    { id: 'fraud', label: 'Fraud', icon: Shield },
    { id: 'automation', label: 'Automation', icon: Zap },
    { id: 'facebook', label: 'Facebook CAPI', icon: Globe },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-12 text-gray-500">Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-500">Configure your store settings</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-56 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left ${
                activeTab === tab.id
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-xl border p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Checkout Page Settings</h2>
              <div>
                <label className="block text-sm font-medium mb-1">Thank You Headline</label>
                <input
                  type="text"
                  value={settings?.checkout.headline || ''}
                  onChange={(e) => updateSetting('checkout', { ...settings?.checkout, headline: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Thank You!"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Urgency Text</label>
                <input
                  type="text"
                  value={settings?.checkout.urgency_text || ''}
                  onChange={(e) => updateSetting('checkout', { ...settings?.checkout, urgency_text: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Order before stock runs out!"
                />
              </div>
            </div>
          )}

          {activeTab === 'couriers' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Courier Settings</h2>
              <div>
                <label className="block text-sm font-medium mb-2">Enabled Couriers</label>
                <div className="space-y-2">
                  {['steadfast', 'redx', 'pathao', 'carrybee'].map((courier) => (
                    <label key={courier} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings?.couriers.enabled?.includes(courier) || false}
                        onChange={(e) => {
                          const enabled = settings?.couriers.enabled || [];
                          const newEnabled = e.target.checked
                            ? [...enabled, courier]
                            : enabled.filter((c) => c !== courier);
                          updateSetting('couriers', { ...settings?.couriers, enabled: newEnabled });
                        }}
                        className="rounded"
                      />
                      <span className="capitalize">{courier}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings?.couriers.auto_assign || false}
                    onChange={(e) => updateSetting('couriers', { ...settings?.couriers, auto_assign: e.target.checked })}
                    className="rounded"
                  />
                  <span>Auto-assign best courier based on location</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'sms' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">SMS Settings</h2>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings?.sms.enabled || false}
                    onChange={(e) => updateSetting('sms', { ...settings?.sms, enabled: e.target.checked })}
                    className="rounded"
                  />
                  <span>Enable SMS notifications</span>
                </label>
              </div>
              {settings?.sms.enabled && (
                <p className="text-sm text-gray-500">
                  Configure SMS gateway API keys in environment variables: SMS_API_KEY, SMS_GATEWAY_URL
                </p>
              )}
            </div>
          )}

          {activeTab === 'fraud' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Fraud Detection</h2>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings?.fraud.enabled || false}
                    onChange={(e) => updateSetting('fraud', { ...settings?.fraud, enabled: e.target.checked })}
                    className="rounded"
                  />
                  <span>Enable fraud detection</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Risk Threshold (%)</label>
                <input
                  type="number"
                  value={settings?.fraud.threshold || 60}
                  onChange={(e) => updateSetting('fraud', { ...settings?.fraud, threshold: parseInt(e.target.value) })}
                  className="w-32 px-4 py-2 border rounded-lg"
                />
                <p className="text-sm text-gray-500 mt-1">Orders above this score will be flagged</p>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings?.fraud.block_cod || false}
                    onChange={(e) => updateSetting('fraud', { ...settings?.fraud, block_cod: e.target.checked })}
                    className="rounded"
                  />
                  <span>Block COD for high-risk orders</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'automation' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Automation Settings</h2>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings?.automation.abandoned_cart_sms || false}
                    onChange={(e) => updateSetting('automation', { ...settings?.automation, abandoned_cart_sms: e.target.checked })}
                    className="rounded"
                  />
                  <span>Send SMS for abandoned carts (15-30 min)</span>
                </label>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings?.automation.auto_confirm || false}
                    onChange={(e) => updateSetting('automation', { ...settings?.automation, auto_confirm: e.target.checked })}
                    className="rounded"
                  />
                  <span>Auto-confirm orders after OTP verification</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'facebook' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Facebook CAPI</h2>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings?.automation.facebook_capi || false}
                    onChange={(e) => updateSetting('automation', { ...settings?.automation, facebook_capi: e.target.checked })}
                    className="rounded"
                  />
                  <span>Enable Facebook Server-Side Tracking</span>
                </label>
              </div>
              {settings?.automation.facebook_capi && (
                <p className="text-sm text-gray-500">
                  Configure Facebook Pixel ID and Access Token in environment variables: FACEBOOK_PIXEL_ID, FACEBOOK_ACCESS_TOKEN
                </p>
              )}
            </div>
          )}

          <div className="mt-8 pt-6 border-t">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-light disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}