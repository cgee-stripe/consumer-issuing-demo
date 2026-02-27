'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCustomization } from '@/context/CustomizationContext';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
  { name: 'Store', href: '/store', icon: '🛒' },
  { name: 'Transactions', href: '/transactions', icon: '💳' },
  { name: 'Payments', href: '/payments', icon: '💵' },
  { name: 'Statements', href: '/statements', icon: '📄' },
  { name: 'Rewards', href: '/rewards', icon: '🎁' },
  { name: 'Card Details', href: '/card', icon: '💎' },
  { name: 'Account', href: '/account', icon: '⚙️' },
  { name: 'Admin', href: '/admin', icon: '🎨' },
];

export function Header() {
  const { settings } = useCustomization();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Desktop welcome message */}
          <div className="hidden md:block">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back, {settings.customerName}! 💳</h2>
            <p className="text-sm text-gray-600">Manage your {settings.companyName} credit card</p>
          </div>

          {/* Mobile - just show company name */}
          <div className="md:hidden flex-1 text-center">
            <h2 className="text-lg font-bold text-gray-900">{settings.companyName}</h2>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            {/* Desktop - show full user info */}
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">{settings.customerName}</p>
              <p className="text-xs text-gray-500">{settings.customerEmail}</p>
            </div>
            {/* Avatar (always visible) */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
              style={{ backgroundColor: '#5167FC' }}
            >
              S
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Menu panel */}
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-xl flex flex-col animate-slide-in-left">
            {/* Logo and close button */}
            <div className="flex items-center justify-between px-6 py-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg overflow-hidden flex-shrink-0">
                  {settings.companyLogo ? (
                    <img src={settings.companyLogo} alt="Company Logo" className="w-full h-full object-contain p-1" />
                  ) : (
                    <span className="text-white text-2xl">🐾</span>
                  )}
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl font-bold text-gray-900 truncate">{settings.companyName}</h1>
                  <p className="text-xs text-gray-500">Credit Card Portal</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                aria-label="Close menu"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    <span className="text-xl">{item.icon}</span>
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 text-xs text-gray-500">
              <p className="mb-1">Demo Portal v1.0</p>
              <p>Powered by Stripe Issuing</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
