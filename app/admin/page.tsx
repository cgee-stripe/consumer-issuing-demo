'use client';

import { useState, useRef } from 'react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { useCustomization } from '@/context/CustomizationContext';

export default function AdminPage() {
  const { settings, updateSettings, resetToDefaults } = useCustomization();
  const [customerName, setCustomerName] = useState(settings.customerName);
  const [companyName, setCompanyName] = useState(settings.companyName);
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor);
  const [logoPreview, setLogoPreview] = useState<string | null>(settings.companyLogo);
  const [showSuccess, setShowSuccess] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Rewards configuration state
  const [rewardsTiers, setRewardsTiers] = useState(settings.rewardsTiers);
  const [rewardsItems, setRewardsItems] = useState(settings.rewardsItems);
  const [cashbackRules, setCashbackRules] = useState(settings.cashbackRules);
  const [storeItems, setStoreItems] = useState(settings.storeItems);

  // Add cashback state
  const [cashbackAmount, setCashbackAmount] = useState<number>(10);
  const [cashbackDescription, setCashbackDescription] = useState<string>('');
  const [isAddingCashback, setIsAddingCashback] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image must be smaller than 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setLogoPreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    updateSettings({
      customerName,
      companyName,
      primaryColor,
      companyLogo: logoPreview,
      rewardsTiers,
      rewardsItems,
      cashbackRules,
      storeItems,
    });

    setShowSuccess(true);
    // Auto-hide after 5 seconds
    setTimeout(() => setShowSuccess(false), 5000);
  };

  const handleReset = () => {
    if (confirm('Reset to Dogs R Us defaults? This cannot be undone.')) {
      resetToDefaults();
      setCustomerName('Christina');
      setCompanyName('Dogs R Us');
      setPrimaryColor('#FF6B35');
      setLogoPreview(null);
      setRewardsTiers(settings.rewardsTiers);
      setRewardsItems(settings.rewardsItems);
      setCashbackRules(settings.cashbackRules);
      setStoreItems(settings.storeItems);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddReward = () => {
    const newReward = {
      id: `rwd_${Date.now()}`,
      name: '',
      description: '',
      cost: 5,
      category: 'toys' as const,
      emoji: '🎁',
      available: true,
    };
    setRewardsItems([...rewardsItems, newReward]);
  };

  const handleUpdateReward = (index: number, field: string, value: any) => {
    const updated = [...rewardsItems];
    updated[index] = { ...updated[index], [field]: value };
    setRewardsItems(updated);
  };

  const handleDeleteReward = (index: number) => {
    if (confirm('Delete this reward?')) {
      setRewardsItems(rewardsItems.filter((_, i) => i !== index));
    }
  };

  const handleUpdateTier = (index: number, field: string, value: any) => {
    const updated = [...rewardsTiers];
    updated[index] = { ...updated[index], [field]: value };
    setRewardsTiers(updated);
  };

  const handleUpdateCashbackRule = (index: number, field: string, value: any) => {
    const updated = [...cashbackRules];
    updated[index] = { ...updated[index], [field]: value };
    setCashbackRules(updated);
  };

  const handleAddCashbackRule = () => {
    const newRule = {
      id: `cbr_${Date.now()}`,
      name: '',
      description: '',
      percentage: 1,
      emoji: '💳',
    };
    setCashbackRules([...cashbackRules, newRule]);
  };

  const handleDeleteCashbackRule = (index: number) => {
    if (confirm('Delete this cashback earning rule?')) {
      setCashbackRules(cashbackRules.filter((_, i) => i !== index));
    }
  };

  const handleAddStoreItem = () => {
    const newItem = {
      id: `prod_${Date.now()}`,
      name: '',
      description: '',
      price: 10,
      category: 'pet_shops_pet_food_and_supplies',
      emoji: '🛍️',
      available: true,
    };
    setStoreItems([...storeItems, newItem]);
  };

  const handleUpdateStoreItem = (index: number, field: string, value: any) => {
    const updated = [...storeItems];
    updated[index] = { ...updated[index], [field]: value };
    setStoreItems(updated);
  };

  const handleDeleteStoreItem = (index: number) => {
    if (confirm('Delete this store item?')) {
      setStoreItems(storeItems.filter((_, i) => i !== index));
    }
  };

  const handleExtractBrand = async () => {
    if (!websiteUrl.trim()) {
      alert('Please enter a website URL');
      return;
    }

    setIsExtracting(true);

    try {
      const response = await fetch('/api/brand-extractor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: websiteUrl }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        const { companyName: extractedName, primaryColor: extractedColor, logoUrl } = result.data;

        // Update all fields
        if (extractedName) setCompanyName(extractedName);
        if (extractedColor) setPrimaryColor(extractedColor);
        if (logoUrl) setLogoPreview(logoUrl);

        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
      } else {
        alert(`Failed to extract brand: ${result.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Brand extraction error:', error);
      alert(`Failed to extract brand: ${error.message || 'Please try again.'}`);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAddCashback = async () => {
    if (cashbackAmount <= 0) {
      alert('Please enter a positive amount');
      return;
    }

    setIsAddingCashback(true);

    try {
      const response = await fetch('/api/rewards/add-cashback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: cashbackAmount,
          description: cashbackDescription || `Admin added $${cashbackAmount} cashback`,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(`Successfully added $${cashbackAmount} cashback! Refresh the Rewards page to see the update.`);
        setCashbackAmount(10);
        setCashbackDescription('');
      } else {
        alert(`Failed to add cashback: ${result.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Add cashback error:', error);
      alert(`Failed to add cashback: ${error.message || 'Please try again.'}`);
    } finally {
      setIsAddingCashback(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Settings</h1>
          <p className="text-gray-600">
            Customize the portal for your sales demos and customer presentations
          </p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top duration-300">
            <Card className="bg-green-50 border-green-500 border-2 shadow-lg min-w-[400px]">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-green-900 text-lg">Customizations Saved!</h3>
                  <p className="text-green-700 text-sm">
                    All changes have been applied and saved successfully.
                  </p>
                </div>
                <button
                  onClick={() => setShowSuccess(false)}
                  className="flex-shrink-0 text-green-700 hover:text-green-900 text-xl font-bold"
                >
                  ×
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* Quick Setup from Website */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="flex items-start gap-3 mb-4">
            <div className="text-3xl">✨</div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Quick Setup from Website</h2>
              <p className="text-sm text-gray-600 mb-4">
                Paste any company website URL and we&apos;ll automatically extract their logo, brand color, and company name!
              </p>

              <div className="flex gap-3">
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  disabled={isExtracting}
                />
                <Button
                  onClick={handleExtractBrand}
                  disabled={isExtracting || !websiteUrl.trim()}
                  size="md"
                >
                  {isExtracting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Analyzing...
                    </span>
                  ) : (
                    '🔍 Extract Brand'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Manual Customization Form */}
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Manual Customization</h2>
          <p className="text-sm text-gray-600 mb-6">Or customize each field manually below</p>

          <div className="space-y-6">
            {/* Customer Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Customer Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <p className="text-xs text-gray-500 mt-1">
                This name will appear in the header and throughout the portal
              </p>
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter company name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <p className="text-xs text-gray-500 mt-1">
                This will replace &quot;Dogs R Us&quot; throughout the portal
              </p>
            </div>

            {/* Company Logo */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Company Logo
              </label>
              <div className="flex items-center gap-4">
                {logoPreview ? (
                  <div className="w-24 h-24 border-2 border-gray-300 rounded-lg flex items-center justify-center bg-white overflow-hidden">
                    <img src={logoPreview} alt="Logo preview" className="max-w-full max-h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                    <span className="text-4xl">🐾</span>
                  </div>
                )}
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label htmlFor="logo-upload" className="cursor-pointer">
                    <span className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      Upload Logo
                    </span>
                  </label>
                  {logoPreview && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setLogoPreview(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="ml-2 text-red-600"
                    >
                      Remove
                    </Button>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Upload a square logo (PNG, JPG, or SVG). Max 2MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Primary Color */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Brand Color
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-20 h-12 border-2 border-gray-300 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="#FF6B35"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-mono"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                This color will be used for buttons, links, and accents throughout the portal
              </p>
            </div>

            {/* Preview */}
            <div className="pt-6 border-t">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Preview
              </label>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden" style={{ backgroundColor: primaryColor }}>
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="w-8 h-8 object-contain" />
                    ) : (
                      <span className="text-white text-xl">🐾</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{companyName || 'Company Name'}</h3>
                    <p className="text-sm text-gray-600">Credit Card Portal</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  style={{ backgroundColor: primaryColor }}
                  className="hover:opacity-90"
                >
                  Sample Button
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Add Cashback for Testing */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-start gap-3 mb-4">
            <div className="text-3xl">💵</div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Add Cashback for Testing</h2>
              <p className="text-sm text-gray-600 mb-4">
                Add cashback to the account for demo purposes. This creates a debit ledger adjustment via Stripe API.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    value={cashbackAmount}
                    onChange={(e) => setCashbackAmount(parseFloat(e.target.value))}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="10.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={cashbackDescription}
                    onChange={(e) => setCashbackDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., Welcome bonus"
                  />
                </div>
              </div>

              <Button
                onClick={handleAddCashback}
                disabled={isAddingCashback || cashbackAmount <= 0}
                size="md"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isAddingCashback ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Adding Cashback...
                  </span>
                ) : (
                  `💰 Add $${cashbackAmount.toFixed(2)} Cashback`
                )}
              </Button>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> This will call the Stripe API to create a credit ledger adjustment with amount_type=&quot;debit&quot; and reason=&quot;platform_issued_debit_memo&quot;. The cashback will be visible in the Rewards page after refreshing.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Rewards Program Configuration */}
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-2">💰 Rewards Program Configuration</h2>
          <p className="text-sm text-gray-600 mb-6">Customize the cashback tiers and rewards catalog</p>

          {/* Tier Configuration */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cashback Tiers</h3>
            <div className="space-y-4">
              {rewardsTiers.map((tier, index) => (
                <div key={tier.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Tier Name
                    </label>
                    <input
                      type="text"
                      value={tier.name}
                      onChange={(e) => handleUpdateTier(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Threshold (Cashback $)
                    </label>
                    <input
                      type="number"
                      value={tier.threshold}
                      onChange={(e) => handleUpdateTier(index, 'threshold', parseInt(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      disabled={index === 0}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Color
                    </label>
                    <input
                      type="color"
                      value={tier.color}
                      onChange={(e) => handleUpdateTier(index, 'color', e.target.value)}
                      className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div className="flex items-end">
                    <div
                      className="w-full px-3 py-2 rounded-lg text-white text-sm font-medium text-center"
                      style={{ backgroundColor: tier.color }}
                    >
                      {tier.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cashback Earning Rules */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Cashback Earning Rules</h3>
              <Button onClick={handleAddCashbackRule} size="sm" variant="secondary">
                + Add Rule
              </Button>
            </div>
            <div className="space-y-4">
              {cashbackRules.map((rule, index) => (
                <div key={rule.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Percentage (%)
                      </label>
                      <input
                        type="number"
                        value={rule.percentage}
                        onChange={(e) => handleUpdateCashbackRule(index, 'percentage', parseFloat(e.target.value))}
                        min="0"
                        step="0.1"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Emoji
                      </label>
                      <input
                        type="text"
                        value={rule.emoji}
                        onChange={(e) => handleUpdateCashbackRule(index, 'emoji', e.target.value)}
                        maxLength={2}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-center text-xl"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={rule.description}
                          onChange={(e) => handleUpdateCashbackRule(index, 'description', e.target.value)}
                          placeholder="e.g., On all purchases"
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                        <button
                          onClick={() => handleDeleteCashbackRule(index)}
                          className="text-red-600 hover:text-red-700 px-3 text-sm font-medium"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rewards Catalog */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Rewards Catalog</h3>
              <Button onClick={handleAddReward} size="sm" variant="secondary">
                + Add Reward
              </Button>
            </div>
            <div className="space-y-4">
              {rewardsItems.map((reward, index) => (
                <div key={reward.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Reward Name
                      </label>
                      <input
                        type="text"
                        value={reward.name}
                        onChange={(e) => handleUpdateReward(index, 'name', e.target.value)}
                        placeholder="Enter reward name"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Cost ($)
                        </label>
                        <input
                          type="number"
                          value={reward.cost}
                          onChange={(e) => handleUpdateReward(index, 'cost', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Category
                        </label>
                        <select
                          value={reward.category}
                          onChange={(e) => handleUpdateReward(index, 'category', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        >
                          <option value="toys">Toys</option>
                          <option value="treats">Treats</option>
                          <option value="supplies">Supplies</option>
                          <option value="services">Services</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Emoji
                        </label>
                        <input
                          type="text"
                          value={reward.emoji}
                          onChange={(e) => handleUpdateReward(index, 'emoji', e.target.value)}
                          maxLength={2}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-center"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={reward.description}
                      onChange={(e) => handleUpdateReward(index, 'description', e.target.value)}
                      placeholder="Enter reward description"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={reward.available}
                        onChange={(e) => handleUpdateReward(index, 'available', e.target.checked)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      Available for redemption
                    </label>
                    <button
                      onClick={() => handleDeleteReward(index)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Store Items Configuration */}
          <div className="mt-8 pt-8 border-t">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Store Items</h3>
                <p className="text-sm text-gray-600">Manage products available in the Store</p>
              </div>
              <Button onClick={handleAddStoreItem} size="sm" variant="secondary">
                + Add Store Item
              </Button>
            </div>
            <div className="space-y-4">
              {storeItems.map((item, index) => (
                <div key={item.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Product Name
                      </label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleUpdateStoreItem(index, 'name', e.target.value)}
                        placeholder="Enter product name"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Price ($)
                        </label>
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => handleUpdateStoreItem(index, 'price', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Category
                        </label>
                        <select
                          value={item.category}
                          onChange={(e) => handleUpdateStoreItem(index, 'category', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        >
                          <option value="pet_shops_pet_food_and_supplies">Pet Supplies</option>
                          <option value="veterinary_services">Veterinary</option>
                          <option value="laundry_cleaning_services">Services</option>
                          <option value="miscellaneous_and_specialty_retail_stores">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Emoji
                        </label>
                        <input
                          type="text"
                          value={item.emoji}
                          onChange={(e) => handleUpdateStoreItem(index, 'emoji', e.target.value)}
                          maxLength={2}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-center"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleUpdateStoreItem(index, 'description', e.target.value)}
                      placeholder="Enter product description"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={item.available}
                        onChange={(e) => handleUpdateStoreItem(index, 'available', e.target.checked)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      Available in store
                    </label>
                    <button
                      onClick={() => handleDeleteStoreItem(index)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button onClick={handleSave} size="lg" className="flex-1">
            💾 Save Customizations
          </Button>
          <Button onClick={handleReset} variant="ghost" size="lg" className="text-red-600 hover:bg-red-50">
            Reset to Defaults
          </Button>
        </div>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <h3 className="font-bold text-blue-900 mb-1">For Sales Teams</h3>
              <p className="text-blue-700 text-sm mb-2">
                Use this admin panel to customize the portal before customer demos:
              </p>
              <ul className="text-blue-700 text-sm space-y-1 list-disc list-inside">
                <li>Upload the customer&apos;s company logo</li>
                <li>Set their brand color to match their website</li>
                <li>Enter the customer contact&apos;s name for personalization</li>
                <li>Click Save to apply changes instantly</li>
              </ul>
              <p className="text-blue-700 text-sm mt-2">
                Settings are saved locally and will persist across browser sessions.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
