import { Transaction } from '@/types/transaction';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card } from '@/components/shared/Card';
import Link from 'next/link';
import { Button } from '@/components/shared/Button';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const recentTransactions = transactions.slice(0, 5);

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
        <Link href="/transactions">
          <Button variant="ghost" size="sm">
            View All →
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        {recentTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-xl">
                {transaction.merchantCategory === 'payment' && '💵'}
                {transaction.merchantCategory === 'Pet Supplies' && '🛍️'}
                {transaction.merchantCategory === 'Healthcare' && '🏥'}
                {transaction.merchantCategory === 'Services' && '✂️'}
                {transaction.merchantCategory === 'Food & Beverage' && '☕'}
                {!['payment', 'Pet Supplies', 'Healthcare', 'Services', 'Food & Beverage'].includes(
                  transaction.merchantCategory
                ) && '💳'}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{transaction.merchant}</p>
                <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
              </div>
            </div>
            <div className="text-right">
              <p
                className={`font-bold ${
                  transaction.amount > 0 ? 'text-green-600' : 'text-gray-900'
                }`}
              >
                {transaction.amount > 0 ? '+' : ''}
                {transaction.amount < 0 ? '-' : ''}
                {formatCurrency(Math.abs(transaction.amount), transaction.currency)}
              </p>
              <p className="text-xs text-gray-500 capitalize">{transaction.status}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
