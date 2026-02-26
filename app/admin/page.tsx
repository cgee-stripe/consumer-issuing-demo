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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    });

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleReset = () => {
    if (confirm('Reset to Dogs R Us defaults? This cannot be undone.')) {
      resetToDefaults();
      setCustomerName('Christina');
      setCompanyName('Dogs R Us');
      setPrimaryColor('#FF6B35');
      setLogoPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
          <Card className="mb-6 bg-green-50 border-green-200">
            <div className="flex items-center gap-3">
              <div className="text-3xl">✅</div>
              <div>
                <h3 className="font-bold text-green-900">Settings Saved!</h3>
                <p className="text-green-700">
                  Your customizations have been applied to the portal.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Customization Form */}
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Portal Customization</h2>

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
                  <label htmlFor="logo-upload">
                    <Button as="span" variant="secondary" size="sm">
                      Upload Logo
                    </Button>
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
