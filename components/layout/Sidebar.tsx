'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PawIcon } from '@/components/icons/PawIcon';
import { cn } from '@/lib/utils';
import { useCustomization } from '@/context/CustomizationContext';

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

export function Sidebar() {
  const pathname = usePathname();
  const { settings } = useCustomization();

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-200">
        <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg overflow-hidden">
          {settings.companyLogo ? (
            <img src={settings.companyLogo} alt="Company Logo" className="w-full h-full object-contain p-1" />
          ) : (
            <PawIcon className="w-6 h-6 text-white" />
          )}
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{settings.companyName}</h1>
          <p className="text-xs text-gray-500">Credit Card Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
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
  );
}
