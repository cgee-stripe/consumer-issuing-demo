import { Transaction } from '@/types/transaction';
import { formatCurrency, formatDate } from '@/lib/utils';

interface TransactionListProps {
  transactions: Transaction[];
  onTransactionClick?: (transaction: Transaction) => void;
}

export function TransactionList({ transactions, onTransactionClick }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🐕</div>
        <p className="text-gray-600">No transactions found</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                Merchant
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                Category
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr
                key={transaction.id}
                onClick={() => onTransactionClick?.(transaction)}
                className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="py-4 px-4 text-sm text-gray-900">
                  {formatDate(transaction.date)}
                </td>
                <td className="py-4 px-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{transaction.merchant}</p>
                    {transaction.description && (
                      <p className="text-xs text-gray-500">{transaction.description}</p>
                    )}
                  </div>
                </td>
                <td className="py-4 px-4 text-sm text-gray-600">
                  {transaction.merchantCategory}
                </td>
                <td className="py-4 px-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      transaction.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : transaction.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {transaction.status}
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <span
                    className={`text-sm font-bold font-tabular ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-gray-900'
                    }`}
                  >
                    {transaction.amount > 0 ? '+' : ''}
                    {transaction.amount < 0 ? '-' : ''}
                    {formatCurrency(Math.abs(transaction.amount), transaction.currency)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            onClick={() => onTransactionClick?.(transaction)}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            {/* Header - Merchant and Amount */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {transaction.merchant}
                </p>
                {transaction.description && (
                  <p className="text-xs text-gray-500 truncate">{transaction.description}</p>
                )}
              </div>
              <span
                className={`text-base font-bold font-tabular ml-3 flex-shrink-0 ${
                  transaction.amount > 0 ? 'text-green-600' : 'text-gray-900'
                }`}
              >
                {transaction.amount > 0 ? '+' : ''}
                {transaction.amount < 0 ? '-' : ''}
                {formatCurrency(Math.abs(transaction.amount), transaction.currency)}
              </span>
            </div>

            {/* Details Row */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3 text-gray-600">
                <span>{formatDate(transaction.date)}</span>
                <span>•</span>
                <span className="truncate">{transaction.merchantCategory}</span>
              </div>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  transaction.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : transaction.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {transaction.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
