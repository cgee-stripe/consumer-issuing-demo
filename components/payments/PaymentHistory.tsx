import { Payment } from '@/types/payment';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card } from '@/components/shared/Card';

interface PaymentHistoryProps {
  payments: Payment[];
}

export function PaymentHistory({ payments }: PaymentHistoryProps) {
  return (
    <Card>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment History</h2>

      {payments.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-5xl mb-3">💵</div>
          <p className="text-gray-600">No payment history yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                    payment.status === 'completed'
                      ? 'bg-green-500'
                      : payment.status === 'pending'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                >
                  {payment.status === 'completed' && '✓'}
                  {payment.status === 'pending' && '⏱'}
                  {payment.status === 'failed' && '✗'}
                </div>
                <div>
                  <p className="font-semibold text-green-600">
                    + {formatCurrency(payment.amount, payment.currency)}
                  </p>
                  <p className="text-sm text-gray-600">{formatDate(payment.date, 'long')}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {payment.status}
                </p>
                {payment.confirmationNumber && (
                  <p className="text-xs text-gray-500">{payment.confirmationNumber}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
