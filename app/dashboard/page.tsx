'use client';

import { useEffect, useState } from 'react';
import { CardDisplay } from '@/components/dashboard/CardDisplay';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { apiClient } from '@/lib/api-client';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';
import type { Card as CardType } from '@/types/card';
import type { BalanceInfo } from '@/types/payment';
import type { Transaction } from '@/types/transaction';

export default function DashboardPage() {
  const [card, setCard] = useState<CardType | null>(null);
  const [balance, setBalance] = useState<BalanceInfo | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rewardsPoints, setRewardsPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch card details
        const cardData = await apiClient.get('/api/card', {
          apiName: 'Get Card Details',
          apiCategory: 'Card',
          stripeEndpoint: 'GET /v1/issuing/cards',
        });
        setCard(cardData.data);

        // Fetch balance info
        const balanceData = await apiClient.get('/api/payments/balance', {
          apiName: 'Get Balance Info',
          apiCategory: 'Ledger',
          stripeEndpoint: 'GET /v1/issuing/credit_ledger',
        });
        setBalance(balanceData.data);

        // Fetch recent transactions
        const transactionsData = await apiClient.get('/api/transactions', {
          apiName: 'List Transactions',
          apiCategory: 'Transactions',
          stripeEndpoint: 'GET /v1/issuing/transactions',
        });
        setTransactions(transactionsData.data.transactions);

        // Fetch rewards (calculated from credit ledger adjustments)
        const rewardsData = await apiClient.get('/api/rewards', {
          apiName: 'List Credit Ledger Adjustments',
          apiCategory: 'Ledger',
          stripeEndpoint: 'GET /v1/issuing/credit_ledger_adjustments',
        });
        setRewardsPoints(rewardsData.data.balance.points);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      {/* Card Display */}
      <div className="max-w-7xl mx-auto">
        {card && <CardDisplay card={card} />}
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto">
        {balance && <QuickStats balance={balance} rewardsPoints={rewardsPoints} />}
      </div>

      {/* Payment Due Banner */}
      {balance && (
        <div className="max-w-7xl mx-auto">
          <Card className="bg-gradient-to-r from-primary-50 to-accent-50 border-primary-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                  Payment Due: {formatDate(balance.dueDate, 'long')}
                </h3>
                <p className="text-sm sm:text-base text-gray-700">
                  Minimum payment:{' '}
                  <span className="font-bold">
                    {formatCurrency(balance.minimumPayment, balance.currency)}
                  </span>
                </p>
              </div>
              <Link href="/payments" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto">Make Payment</Button>
              </Link>
            </div>
          </Card>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="max-w-7xl mx-auto">
        <RecentTransactions transactions={transactions} />
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto">
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/payments">
              <button className="w-full p-6 text-left rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-primary-50 transition-all">
                <div className="text-3xl mb-2">💵</div>
                <h3 className="font-semibold text-gray-900 mb-1">Make a Payment</h3>
                <p className="text-sm text-gray-600">Pay your balance or schedule a payment</p>
              </button>
            </Link>
            <Link href="/rewards">
              <button className="w-full p-6 text-left rounded-lg border-2 border-gray-200 hover:border-accent hover:bg-accent-50 transition-all">
                <div className="text-3xl mb-2">🎁</div>
                <h3 className="font-semibold text-gray-900 mb-1">Redeem Rewards</h3>
                <p className="text-sm text-gray-600">
                  You have {rewardsPoints} Paw Points to spend
                </p>
              </button>
            </Link>
            <Link href="/card">
              <button className="w-full p-6 text-left rounded-lg border-2 border-gray-200 hover:border-secondary hover:bg-secondary-50 transition-all">
                <div className="text-3xl mb-2">💎</div>
                <h3 className="font-semibold text-gray-900 mb-1">Manage Card</h3>
                <p className="text-sm text-gray-600">View details, freeze/unfreeze, set limits</p>
              </button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
