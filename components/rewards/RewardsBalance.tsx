import { RewardsBalance as Balance } from '@/types/card';
import { Card } from '@/components/shared/Card';
import Image from 'next/image';

interface RewardsBalanceProps {
  balance: Balance;
}

import { formatCurrency } from '@/lib/utils';
import { useCustomization } from '@/context/CustomizationContext';

export function RewardsBalance({ balance }: RewardsBalanceProps) {
  const { settings } = useCustomization();

  // Find current tier from settings
  const currentTierIndex = settings.rewardsTiers.findIndex(t => t.id === balance.tier);
  const currentTier = settings.rewardsTiers[currentTierIndex];
  const nextTier = currentTierIndex < settings.rewardsTiers.length - 1
    ? settings.rewardsTiers[currentTierIndex + 1]
    : null;

  // Convert hex color to gradient classes
  const getGradientClass = (color: string) => {
    return `bg-gradient-to-r`;
  };

  const progress = balance.pointsToNextTier > 0 && nextTier
    ? ((balance.points - currentTier.threshold) / (nextTier.threshold - currentTier.threshold)) * 100
    : 100;

  return (
    <Card padding="none">
      <div
        className="p-8 text-white"
        style={{ background: `linear-gradient(135deg, ${currentTier.color} 0%, ${currentTier.color}dd 100%)` }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm opacity-90 mb-1">Your Tier</p>
            <h2 className="text-3xl font-bold flex items-center gap-2">
              {settings.companyLogo ? (
                <Image
                  src={settings.companyLogo}
                  alt={settings.companyName}
                  width={32}
                  height={32}
                  className="rounded"
                />
              ) : (
                <span className="text-2xl">💳</span>
              )}
              {currentTier.name}
            </h2>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-90 mb-1">Total Cashback</p>
            <p className="text-4xl font-bold">{formatCurrency(balance.points, 'usd')}</p>
          </div>
        </div>

        {nextTier && balance.pointsToNextTier > 0 && (
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Progress to {nextTier.name}</span>
              <span>{formatCurrency(balance.pointsToNextTier, 'usd')} to go</span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="font-bold text-gray-900 mb-4">How to Earn Cashback</h3>
        <div className="space-y-3">
          {settings.cashbackRules.map((rule) => (
            <div key={rule.id} className="flex items-center gap-3">
              <div className="text-2xl">{rule.emoji}</div>
              <div>
                <p className="font-medium text-gray-900">{rule.percentage}% cashback</p>
                <p className="text-sm text-gray-600">{rule.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
