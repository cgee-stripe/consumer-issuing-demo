'use client';

import { useEffect, useState } from 'react';
import { PaymentForm } from '@/components/payments/PaymentForm';
import { PaymentHistory } from '@/components/payments/PaymentHistory';
import { Card } from '@/components/shared/Card';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { apiClient } from '@/lib/api-client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { BalanceInfo, Payment, PaymentRequest } from '@/types/payment';

export default function PaymentsPage() {
  const [balance, setBalance] = useState<BalanceInfo | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      // Fetch balance
      const balanceData = await apiClient.get('/api/payments/balance', {
        apiName: 'Get Balance Info',
        apiCategory: 'Ledger',
        stripeEndpoint: 'GET /v1/issuing/credit_ledger',
      });
      setBalance(balanceData.data);

      // Fetch payment history
      const paymentsData = await apiClient.get('/api/payments', {
        apiName: 'List Repayments',
        apiCategory: 'Repayments',
        stripeEndpoint: 'GET /v1/issuing/credit_repayments',
      });
      setPayments(paymentsData.data.payments);
    } catch (error) {
      console.error('Failed to fetch payment data:', error);
    } finally {
      setLoading(false);
    }
  }

  const handlePaymentSubmit = async (payment: PaymentRequest) => {
    try {
      const result = await apiClient.post('/api/payments', {
        apiName: 'Create Repayment',
        apiCategory: 'Repayments',
        stripeEndpoint: 'POST /v1/issuing/credit_repayments',
        body: payment,
      });

      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);

      // Wait a moment for Stripe to process, then refresh data
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(true);
      await fetchData();
      setLoading(false);
    } catch (error) {
      console.error('Payment failed:', error);
      throw error;
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
        <p className="text-gray-600">Failed to load payment information</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Payments</h1>
          <p className="text-sm md:text-base text-gray-600">Make payments and view your payment history</p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <Card className="bg-green-50 border-green-200">
            <div className="flex items-center gap-3">
              <div className="text-3xl">✅</div>
              <div>
                <h3 className="font-bold text-green-900">Payment Processed!</h3>
                <p className="text-sm text-green-700">
                  Your payment has been successfully processed and your balance has been updated.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Balance Overview */}
        <Card className="bg-gradient-to-r from-secondary-50 to-primary-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Current Balance</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(balance.currentBalance, balance.currency)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Minimum Payment Due</p>
              <p className="text-3xl font-bold text-primary">
                {formatCurrency(balance.minimumPayment, balance.currency)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Due Date</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatDate(balance.dueDate, 'short')}
              </p>
            </div>
          </div>
        </Card>

        {/* Payment Form and History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <PaymentForm balance={balance} onPaymentSubmit={handlePaymentSubmit} />
          <PaymentHistory payments={payments} />
        </div>
      </div>
    </div>
  );
}
