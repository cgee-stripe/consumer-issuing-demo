'use client';

import { useState } from 'react';
import { Reward } from '@/types/card';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';

import { formatCurrency } from '@/lib/utils';

interface RewardsCatalogProps {
  rewards: Reward[];
  availablePoints: number;
  onRedeem: (reward: Reward) => void;
}

const categoryEmojis = {
  toys: '🎾',
  treats: '🦴',
  supplies: '🛍️',
  services: '✂️',
};

export function RewardsCatalog({ rewards, availablePoints, onRedeem }: RewardsCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredRewards =
    selectedCategory === 'all'
      ? rewards
      : rewards.filter((r) => r.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Rewards
        </button>
        {Object.entries(categoryEmojis).map(([category, emoji]) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {emoji} {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRewards.map((reward) => {
          const canAfford = availablePoints >= reward.pointsCost;

          return (
            <Card key={reward.id} padding="none" className="overflow-hidden">
              {/* Reward Image Placeholder */}
              <div className="h-40 bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center text-6xl">
                {categoryEmojis[reward.category]}
              </div>

              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-2">{reward.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{reward.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-2xl font-bold text-primary">
                      {formatCurrency(reward.pointsCost, 'usd')}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant={canAfford ? 'primary' : 'outline'}
                    disabled={!canAfford || !reward.available}
                    onClick={() => onRedeem(reward)}
                  >
                    {!reward.available
                      ? 'Out of Stock'
                      : canAfford
                      ? 'Redeem'
                      : 'Not Enough Cashback'}
                  </Button>
                </div>
              </div>

              {!canAfford && reward.available && (
                <div className="px-4 pb-4">
                  <p className="text-xs text-gray-500">
                    Need {formatCurrency(reward.pointsCost - availablePoints, 'usd')} more cashback
                  </p>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {filteredRewards.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🐕</div>
          <p className="text-gray-600">No rewards in this category</p>
        </div>
      )}
    </div>
  );
}
