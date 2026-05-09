// app/(dashboard)/settings/page.js
'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  const [commission, setCommission] = useState({ BASIC: 10, PRO: 8, PREMIUM: 7 });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/admin/settings', { defaultCommissions: commission });
      toast.success('Settings saved');
    } catch {
      toast.error('Could not save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 fade-in max-w-2xl">
      <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
        <Settings className="w-5 h-5 text-purple-600" /> Platform Settings
      </h2>

      {/* Commission Defaults */}
      <Section title="Default Commission Rates" sub="Applied when creating new salon plans">
        <div className="space-y-4">
          {[
            { plan: 'BASIC', label: 'Basic Plan', color: 'text-gray-600', bg: 'bg-gray-50' },
            { plan: 'PRO', label: 'Pro Plan', color: 'text-blue-600', bg: 'bg-blue-50' },
            { plan: 'PREMIUM', label: 'Premium Plan', color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(({ plan, label, color, bg }) => (
            <div key={plan} className={`flex items-center justify-between p-4 rounded-xl ${bg}`}>
              <div>
                <p className={`text-sm font-semibold ${color}`}>{label}</p>
                <p className="text-xs text-gray-400">Per completed booking</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0} max={50} step={0.5}
                  value={commission[plan]}
                  onChange={e => setCommission(prev => ({ ...prev, [plan]: +e.target.value }))}
                  className="w-20 text-center border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-500 font-medium">%</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Platform Info */}
      <Section title="Platform Information" sub="Displayed to users">
        <div className="space-y-3">
          <SettingField label="Platform Name" defaultValue="SalonBook" />
          <SettingField label="Support Email" defaultValue="support@salonbook.pk" type="email" />
          <SettingField label="Support Phone" defaultValue="0300 0000000" />
        </div>
      </Section>

      {/* Payout Settings */}
      <Section title="Payout Configuration" sub="Salon owner payment schedule">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm font-medium text-gray-700">Payout Frequency</p>
              <p className="text-xs text-gray-400">How often salons receive payouts</p>
            </div>
            <select className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="weekly">Weekly (Every Monday)</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm font-medium text-gray-700">Minimum Payout</p>
              <p className="text-xs text-gray-400">Minimum balance before payout</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">PKR</span>
              <input
                type="number"
                defaultValue={500}
                className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Notification Settings */}
      <Section title="Platform Notifications" sub="SMS and push notification toggles">
        {[
          { label: 'SMS on New Booking', key: 'sms_booking' },
          { label: 'SMS on Status Change', key: 'sms_status' },
          { label: 'Push Notifications for Owners', key: 'push_owners' },
          { label: 'Booking Reminder (1 hour before)', key: 'reminder' },
        ].map(({ label, key }) => (
          <div key={key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
            <p className="text-sm text-gray-700">{label}</p>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-purple-600 peer-focus:ring-2 peer-focus:ring-purple-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:w-4 after:h-4 after:transition-all peer-checked:after:translate-x-4" />
            </label>
          </div>
        ))}
      </Section>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700 disabled:opacity-60 transition-colors"
        >
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>
    </div>
  );
}

function Section({ title, sub, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
      </div>
      {children}
    </div>
  );
}

function SettingField({ label, defaultValue, type = 'text' }) {
  return (
    <div className="flex items-center gap-4">
      <label className="text-sm text-gray-600 w-36 flex-shrink-0">{label}</label>
      <input
        type={type}
        defaultValue={defaultValue}
        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
    </div>
  );
}
