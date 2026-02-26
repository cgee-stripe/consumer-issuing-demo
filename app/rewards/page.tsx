'use client';

import { useEffect, useState } from 'react';
import { RewardsBalance } from '@/components/rewards/RewardsBalance';
import { RewardsCatalog } from '@/components/rewards/RewardsCatalog';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Card } from '@/components/shared/Card';
import { apiClient } from '@/lib/api-client';
import { Reward, RewardsBalance as Balance } from '@/types/card';

export default function RewardsPage() {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRedeemSuccess, setShowRedeemSuccess] = useState(false);
  const [redeemedReward, setRedeemedReward] = useState<Reward | null>(null);

  useEffect(() => {
    async function fetchRewards() {
      try {
        const data = await apiClient.get('/api/rewards', {
          apiName: 'List Credit Ledger Adjustments',
          apiCategory: 'Ledger',
          stripeEndpoint: 'GET /v1/issuing/credit_ledger_adjustments',
        });
        setBalance(data.data.balance);
        setRewards(data.data.rewards);
      } catch (error) {
        console.error('Failed to fetch rewards:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRewards();
  }, []);

  const handleRedeem = async (reward: Reward) => {
    try {
      // Call the API to create a credit ledger adjustment for the reward
      const response = await apiClient.post('/api/rewards', {
        apiName: 'Create Credit Ledger Adjustment',
        apiCategory: 'Ledger',
        body: {
          rewardId: reward.id,
          pointsCost: reward.pointsCost,
          rewardName: reward.name,
        },
      });

      setRedeemedReward(reward);
      setShowRedeemSuccess(true);

      // Update balance locally
      if (balance) {
        setBalance({
          ...balance,
          points: balance.points - reward.pointsCost,
        });
      }

      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowRedeemSuccess(false);
        setRedeemedReward(null);
      }, 5000);
    } catch (error) {
      console.error('Failed to redeem reward:', error);
      alert('Failed to redeem reward. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!balance) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600">Failed to load rewards</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Paw Points Rewards 🐾</h1>
          <p className="text-gray-600">
            Earn points on every purchase and redeem them for awesome dog-themed rewards
          </p>
        </div>

        {/* Success Message */}
        {showRedeemSuccess && redeemedReward && (
          <Card className="bg-green-50 border-green-200">
            <div className="flex items-center gap-3">
              <div className="text-4xl">🎉</div>
              <div>
                <h3 className="font-bold text-green-900">Reward Redeemed!</h3>
                <p className="text-sm text-green-700">
                  You&apos;ve successfully redeemed <strong>{redeemedReward.name}</strong>. Check your
                  email for delivery details.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Balance Card */}
        <RewardsBalance balance={balance} />

        {/* Rewards Catalog */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Rewards</h2>
          <RewardsCatalog
            rewards={rewards}
            availablePoints={balance.points}
            onRedeem={handleRedeem}
          />
        </div>

        {/* Information Card */}
        <Card className="bg-blue-50 border-blue-200">
          <h3 className="font-bold text-blue-900 mb-3">💡 Rewards Program Tips</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Points never expire - save up for big rewards!</li>
            <li>• Earn bonus points during special promotions</li>
            <li>• Share your referral code to earn 500 bonus points</li>
            <li>• Higher tiers unlock exclusive rewards and better earn rates</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
