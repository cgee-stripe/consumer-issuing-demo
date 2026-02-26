'use client';

import { useState } from 'react';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import { formatCurrency } from '@/lib/utils';
import { BalanceInfo, PaymentRequest } from '@/types/payment';

interface PaymentFormProps {
  balance: BalanceInfo;
  onPaymentSubmit: (payment: PaymentRequest) => Promise<void>;
}

export function PaymentForm({ balance, onPaymentSubmit }: PaymentFormProps) {
  const [amount, setAmount] = useState('');
  const [paymentType, setPaymentType] = useState<'minimum' | 'statement' | 'other'>('minimum');
  const [paymentMethod, setPaymentMethod] = useState<'bank_account'>('bank_account');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPaymentAmount = () => {
    if (paymentType === 'minimum') return balance.minimumPayment;
    if (paymentType === 'statement') return balance.statementBalance;
    return parseFloat(amount) || 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const paymentAmount = getPaymentAmount();

    // Validate payment amount doesn't exceed current balance
    if (paymentAmount > balance.currentBalance) {
      setError(`Payment amount ($${paymentAmount.toFixed(2)}) cannot exceed your current balance ($${balance.currentBalance.toFixed(2)})`);
      setIsSubmitting(false);
      return;
    }

    if (paymentAmount <= 0) {
      setError('Payment amount must be greater than $0');
      setIsSubmitting(false);
      return;
    }

    try {
      await onPaymentSubmit({
        amount: paymentAmount,
        paymentMethod,
      });

      // Reset form
      setAmount('');
      setPaymentType('minimum');
    } catch (error: any) {
      console.error('Payment failed:', error);
      setError(error?.message || 'Payment failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Make a Payment</h2>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-2xl">⚠️</div>
            <div>
              <h3 className="font-bold text-red-900 mb-1">Payment Failed</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Amount Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Payment Amount
          </label>
          <div className="space-y-3">
            <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="paymentType"
                value="minimum"
                checked={paymentType === 'minimum'}
                onChange={() => setPaymentType('minimum')}
                className="w-4 h-4 text-primary focus:ring-primary"
              />
              <div className="ml-3 flex-1 flex items-center justify-between">
                <span className="text-gray-900 font-medium">Minimum Payment</span>
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(balance.minimumPayment, balance.currency)}
                </span>
              </div>
            </label>

            <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="paymentType"
                value="statement"
                checked={paymentType === 'statement'}
                onChange={() => setPaymentType('statement')}
                className="w-4 h-4 text-primary focus:ring-primary"
              />
              <div className="ml-3 flex-1 flex items-center justify-between">
                <span className="text-gray-900 font-medium">Statement Balance</span>
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(balance.statementBalance, balance.currency)}
                </span>
              </div>
            </label>

            <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="paymentType"
                value="other"
                checked={paymentType === 'other'}
                onChange={() => setPaymentType('other')}
                className="w-4 h-4 text-primary focus:ring-primary"
              />
              <div className="ml-3 flex-1">
                <span className="text-gray-900 font-medium block mb-2">Other Amount</span>
                {paymentType === 'other' && (
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={balance.currentBalance}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Method
          </label>
          <div className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
            <div className="text-2xl">🏦</div>
            <div>
              <p className="font-medium text-gray-900">Bank Account</p>
              <p className="text-sm text-gray-600">Checking ****1234</p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={isSubmitting || (paymentType === 'other' && !amount)}
        >
          {isSubmitting ? 'Processing...' : `Pay ${formatCurrency(getPaymentAmount(), balance.currency)}`}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          💡 Demo Mode: Payments are processed instantly in test mode
        </p>
      </form>
    </Card>
  );
}
