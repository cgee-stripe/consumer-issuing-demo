import { RewardsBalance as Balance } from '@/types/card';
import { Card } from '@/components/shared/Card';
import { PawIcon } from '@/components/icons/PawIcon';

interface RewardsBalanceProps {
  balance: Balance;
}

const tierInfo = {
  puppy: { name: 'Puppy', color: 'from-gray-400 to-gray-500', next: 'Good Boy' },
  'good-boy': { name: 'Good Boy', color: 'from-blue-400 to-blue-500', next: 'Best Friend' },
  'best-friend': { name: 'Best Friend', color: 'from-purple-400 to-purple-500', next: 'Top Dog' },
  'top-dog': { name: 'Top Dog', color: 'from-primary to-accent', next: null },
};

export function RewardsBalance({ balance }: RewardsBalanceProps) {
  const tier = tierInfo[balance.tier];
  const progress = balance.pointsToNextTier > 0
    ? ((balance.points % 2000) / 2000) * 100
    : 100;

  return (
    <Card padding="none">
      <div className={`bg-gradient-to-r ${tier.color} p-8 text-white`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm opacity-90 mb-1">Your Tier</p>
            <h2 className="text-3xl font-bold flex items-center gap-2">
              <PawIcon className="w-8 h-8" />
              {tier.name}
            </h2>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-90 mb-1">Total Points</p>
            <p className="text-4xl font-bold">{balance.points.toLocaleString()}</p>
          </div>
        </div>

        {tier.next && (
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Progress to {tier.next}</span>
              <span>{balance.pointsToNextTier} points to go</span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="font-bold text-gray-900 mb-4">How to Earn Points</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="text-2xl">💳</div>
            <div>
              <p className="font-medium text-gray-900">1 point per $1 spent</p>
              <p className="text-sm text-gray-600">On all purchases</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-2xl">🐕</div>
            <div>
              <p className="font-medium text-gray-900">2x points on pet supplies</p>
              <p className="text-sm text-gray-600">At participating retailers</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-2xl">🏥</div>
            <div>
              <p className="font-medium text-gray-900">3x points on veterinary care</p>
              <p className="text-sm text-gray-600">Help keep your pup healthy</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
