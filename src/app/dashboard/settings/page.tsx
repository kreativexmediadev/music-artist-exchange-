'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState({
    priceAlerts: true,
    newsUpdates: true,
    tradeConfirmations: true,
    marketingSummary: false,
  });

  const [preferences, setPreferences] = useState({
    theme: 'dark',
    currency: 'USD',
    language: 'en',
  });

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handlePreferenceChange = (key: keyof typeof preferences, value: string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white mb-8">Settings</h1>

      {/* Profile Settings */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Profile Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Full Name
            </label>
            <input
              type="text"
              className="input w-full"
              value={`${session?.user?.firstName || ''} ${session?.user?.lastName || ''}`}
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Email
            </label>
            <input
              type="email"
              className="input w-full"
              value={session?.user?.email || ''}
              disabled
            />
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Notifications</h2>
        <div className="space-y-4">
          {Object.entries(notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </h3>
                <p className="text-sm text-gray-400">
                  {getNotificationDescription(key as keyof typeof notifications)}
                </p>
              </div>
              <button
                onClick={() => handleNotificationChange(key as keyof typeof notifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  value ? 'bg-accent-yellow' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    value ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Preferences */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Preferences</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Theme
            </label>
            <select
              value={preferences.theme}
              onChange={(e) => handlePreferenceChange('theme', e.target.value)}
              className="input w-full"
            >
              <option value="dark">Dark</option>
              <option value="light">Light (Coming Soon)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Currency
            </label>
            <select
              value={preferences.currency}
              onChange={(e) => handlePreferenceChange('currency', e.target.value)}
              className="input w-full"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Language
            </label>
            <select
              value={preferences.language}
              onChange={(e) => handlePreferenceChange('language', e.target.value)}
              className="input w-full"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Security</h2>
        <div className="space-y-4">
          <button className="btn-primary w-full">
            Change Password
          </button>
          <button className="btn-secondary w-full">
            Enable Two-Factor Authentication
          </button>
        </div>
      </div>
    </div>
  );
}

function getNotificationDescription(key: keyof typeof notifications): string {
  const descriptions = {
    priceAlerts: 'Receive alerts when artist token prices change significantly',
    newsUpdates: 'Get updates about artist announcements and market news',
    tradeConfirmations: 'Receive confirmations for your trades',
    marketingSummary: 'Weekly summary of market trends and opportunities',
  };
  return descriptions[key];
} 