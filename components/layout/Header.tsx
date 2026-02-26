'use client';

import { useCustomization } from '@/context/CustomizationContext';

export function Header() {
  const { settings } = useCustomization();

  // Get initials from customer name
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome back, {settings.customerName}! 🐕</h2>
          <p className="text-sm text-gray-600">Manage your {settings.companyName} credit card</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{settings.customerName}</p>
            <p className="text-xs text-gray-500">cgee+test@dogsrus.com</p>
          </div>
          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white font-bold">
            {getInitials(settings.customerName)}
          </div>
        </div>
      </div>
    </header>
  );
}
