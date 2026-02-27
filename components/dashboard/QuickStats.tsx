import { BalanceInfo } from '@/types/payment';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card } from '@/components/shared/Card';
import { useCustomization } from '@/context/CustomizationContext';

interface QuickStatsProps {
  balance: BalanceInfo;
  rewardsPoints?: number;
}

export function QuickStats({ balance, rewardsPoints = 0 }: QuickStatsProps) {
  const { settings } = useCustomization();

  // Helper to create lighter shade of primary color for background
  const getLightBackground = (color: string) => {
    // Convert hex to RGB and create a very light version
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Create a very light tint (90% white mixed with color)
    const lightR = Math.round(r + (255 - r) * 0.9);
    const lightG = Math.round(g + (255 - g) * 0.9);
    const lightB = Math.round(b + (255 - b) * 0.9);

    return `rgb(${lightR}, ${lightG}, ${lightB})`;
  };

  const stats = [
    {
      label: 'Current Balance',
      value: formatCurrency(balance.currentBalance, balance.currency),
      icon: '💰',
    },
    {
      label: 'Available Credit',
      value: formatCurrency(balance.availableCredit, balance.currency),
      icon: '✅',
    },
    {
      label: 'Credit Limit',
      value: formatCurrency(balance.creditLimit, balance.currency),
      icon: '🎯',
    },
    {
      label: 'Cashback Balance',
      value: formatCurrency(rewardsPoints, 'usd'),
      icon: '💰',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} padding="sm">
          <div
            className="flex items-center justify-between p-4 rounded-lg"
            style={{ backgroundColor: getLightBackground(settings.primaryColor) }}
          >
            <div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p
                className="text-2xl font-bold"
                style={{ color: settings.primaryColor }}
              >
                <span className="mr-2">{stat.icon}</span>
                {stat.value}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
