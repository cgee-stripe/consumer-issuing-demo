import { BalanceInfo } from '@/types/payment';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card } from '@/components/shared/Card';

interface QuickStatsProps {
  balance: BalanceInfo;
  rewardsPoints?: number;
}

export function QuickStats({ balance, rewardsPoints = 0 }: QuickStatsProps) {
  const stats = [
    {
      label: 'Current Balance',
      value: formatCurrency(balance.currentBalance, balance.currency),
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      label: 'Available Credit',
      value: formatCurrency(balance.availableCredit, balance.currency),
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Credit Limit',
      value: formatCurrency(balance.creditLimit, balance.currency),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Paw Points',
      value: rewardsPoints.toLocaleString(),
      color: 'text-accent-600',
      bgColor: 'bg-accent-50',
      icon: '🐾',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} padding="sm">
          <div className={`flex items-center justify-between p-4 rounded-lg ${stat.bgColor}`}>
            <div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>
                {stat.icon && <span className="mr-2">{stat.icon}</span>}
                {stat.value}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
