'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/shared/Card';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { apiClient } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';
import { AccountStatus } from '@/types/card';

export default function AccountPage() {
  const [account, setAccount] = useState<AccountStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedAccount, setEditedAccount] = useState<Partial<AccountStatus>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function fetchAccount() {
      try {
        const data = await apiClient.get('/api/account', {
          apiName: 'Retrieve Customer',
          apiCategory: 'Account',
          stripeEndpoint: 'GET /v1/customers/:id',
        });
        setAccount(data.data);
        setEditedAccount(data.data);
      } catch (error) {
        console.error('Failed to fetch account:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAccount();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setSaveSuccess(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedAccount(account || {});
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const data = await apiClient.patch('/api/account', {
        apiName: 'Update Customer',
        apiCategory: 'Account',
        stripeEndpoint: 'POST /v1/customers/:id',
        body: {
          name: editedAccount.accountHolder,
          email: editedAccount.email,
          phone: editedAccount.phone,
        },
      });
      setAccount(data.data);
      setEditedAccount(data.data);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: any) {
      console.error('Failed to update account:', error);
      alert(`Failed to update account: ${error.message || 'Please try again.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600">Failed to load account information</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>

        {saveSuccess && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top duration-300">
            <Card className="bg-green-50 border-green-500 border-2 shadow-lg min-w-[400px]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-green-900 text-lg">Account Updated!</h3>
                  <p className="text-green-700 text-sm">Your changes have been saved successfully.</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Account Information */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Account Information</h2>
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
                >
                  ✏️ Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : '💾 Save'}
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">Account ID</label>
                <p className="font-mono text-sm mt-1">{account.accountId}</p>
              </div>

              <div>
                <label className="text-sm text-gray-600 block mb-1">Account Holder</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedAccount.accountHolder || ''}
                    onChange={(e) => setEditedAccount({ ...editedAccount, accountHolder: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                ) : (
                  <p className="text-lg">{account.accountHolder}</p>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-600 block mb-1">Email Address</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedAccount.email || ''}
                    onChange={(e) => setEditedAccount({ ...editedAccount, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                ) : (
                  <p className="text-lg">{account.email}</p>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-600 block mb-1">Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedAccount.phone || ''}
                    onChange={(e) => setEditedAccount({ ...editedAccount, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                ) : (
                  <p className="text-lg">{account.phone}</p>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-600">Member Since</label>
                <p className="text-lg mt-1">{formatDate(account.since, 'long')}</p>
              </div>

              <div>
                <label className="text-sm text-gray-600">Account Status</label>
                <p className="text-lg mt-1 capitalize">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      account.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : account.status === 'suspended'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {account.status}
                  </span>
                </p>
              </div>
            </div>
          </Card>

          {/* Preferences */}
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Preferences</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-600">Receive updates about your account</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">Transaction Alerts</p>
                  <p className="text-sm text-gray-600">Get notified for each transaction</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">Payment Reminders</p>
                  <p className="text-sm text-gray-600">Reminders before payment due dates</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">Promotional Emails</p>
                  <p className="text-sm text-gray-600">Special offers and rewards updates</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </Card>
        </div>

        {/* Security Section */}
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Security</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-6 text-left rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-primary-50 transition-all">
              <div className="text-3xl mb-2">🔑</div>
              <h3 className="font-semibold text-gray-900 mb-1">Change Password</h3>
              <p className="text-sm text-gray-600">Update your account password</p>
            </button>

            <button className="p-6 text-left rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-primary-50 transition-all">
              <div className="text-3xl mb-2">📱</div>
              <h3 className="font-semibold text-gray-900 mb-1">Two-Factor Auth</h3>
              <p className="text-sm text-gray-600">Add an extra layer of security</p>
            </button>

            <button className="p-6 text-left rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-primary-50 transition-all">
              <div className="text-3xl mb-2">🔐</div>
              <h3 className="font-semibold text-gray-900 mb-1">Login History</h3>
              <p className="text-sm text-gray-600">View recent account activity</p>
            </button>
          </div>
        </Card>

        {/* Support */}
        <Card className="bg-gradient-to-r from-primary-50 to-accent-50 border-primary-200">
          <div className="flex items-center gap-4">
            <div className="text-5xl">🐕</div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Need Help?</h3>
              <p className="text-gray-700 mb-4">
                Our customer support team is here to help with any questions or concerns
              </p>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors">
                  📧 Email Support
                </button>
                <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  💬 Live Chat
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
