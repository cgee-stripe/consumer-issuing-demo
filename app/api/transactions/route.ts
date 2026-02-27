import { NextRequest, NextResponse } from 'next/server';
import { mockTransactions } from '@/lib/mock-data';
import { TransactionListResponse } from '@/types/transaction';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const CONNECTED_ACCOUNT_ID = process.env.STRIPE_CONNECTED_ACCOUNT_ID;

export async function GET(request: NextRequest) {
  try {
    // Use real Stripe API if Connected Account ID is configured
    if (CONNECTED_ACCOUNT_ID && STRIPE_SECRET_KEY && !STRIPE_SECRET_KEY.includes('placeholder')) {
      // Fetch issuing transactions (purchases)
      const transactionsUrl = new URL('https://api.stripe.com/v1/issuing/transactions');
      transactionsUrl.searchParams.append('limit', '50');

      const transactionsResponse = await fetch(transactionsUrl.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          'Stripe-Version': '2025-01-27.acacia; issuing_credit_beta=v3',
          'Stripe-Account': CONNECTED_ACCOUNT_ID,
        },
      });

      if (!transactionsResponse.ok) {
        const errorData = await transactionsResponse.json();
        console.error('Stripe API error:', errorData);
        throw new Error(errorData.error?.message || 'Failed to fetch transactions');
      }

      const issuingTransactions = await transactionsResponse.json();

      // Fetch repayments (credit ledger adjustments)
      const repaymentsUrl = new URL('https://api.stripe.com/v1/issuing/credit_ledger_adjustments');
      repaymentsUrl.searchParams.append('limit', '50');

      const repaymentsResponse = await fetch(repaymentsUrl.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          'Stripe-Account': CONNECTED_ACCOUNT_ID,
          'Stripe-Version': '2025-01-27.acacia; issuing_credit_beta=v3',
        },
      });

      let repayments: any[] = [];
      if (repaymentsResponse.ok) {
        const repaymentsData = await repaymentsResponse.json();
        // Filter for payment credits (our repayments)
        repayments = (repaymentsData.data || []).filter((adj: any) =>
          adj.amount_type === 'credit' &&
          adj.reason === 'platform_issued_credit_memo' &&
          adj.reason_description?.includes('Payment received')
        );
      }

      // Transform issuing transactions (purchases - already negative from Stripe)
      const purchaseTransactions = issuingTransactions.data.map((tx: any) => {
        const merchantName = tx.merchant_data?.name || 'Unknown Merchant';
        const merchantCategory = tx.merchant_data?.category || 'other';

        return {
          id: tx.id,
          amount: tx.amount / 100, // Stripe returns purchases as negative already
          currency: tx.currency.toUpperCase(),
          merchant: merchantName,
          merchantCategory: merchantCategory.replace(/_/g, ' '),
          status: 'completed' as const,
          date: new Date(tx.created * 1000).toISOString(),
          description: `${merchantName} - ${tx.merchant_data?.city || 'Online'}`,
          category: merchantCategory.replace(/_/g, ' '),
        };
      });

      // Transform repayments (payments toward balance - positive because reducing debt)
      const paymentTransactions = repayments.map((adjustment: any) => {
        return {
          id: adjustment.id,
          amount: (adjustment.amount || 0) / 100, // Convert cents to dollars (already positive)
          currency: (adjustment.currency || 'usd').toUpperCase(),
          merchant: 'Repayment',
          merchantCategory: 'payment',
          status: 'completed' as const,
          date: new Date((adjustment.created || Date.now() / 1000) * 1000).toISOString(),
          description: adjustment.reason_description || 'Credit Card Payment',
          category: 'Payment',
        };
      });

      // Combine and sort by date (most recent first)
      const allTransactions = [...purchaseTransactions, ...paymentTransactions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      const transactionResponse: TransactionListResponse = {
        transactions: allTransactions,
        hasMore: issuingTransactions.has_more,
        total: allTransactions.length,
      };

      return NextResponse.json({
        success: true,
        data: transactionResponse,
        source: 'stripe_api',
      });
    }

    // Fall back to mock data if no Connected Account ID
    await new Promise((resolve) => setTimeout(resolve, 300));

    const response: TransactionListResponse = {
      transactions: mockTransactions,
      hasMore: false,
      total: mockTransactions.length,
    };

    return NextResponse.json({
      success: true,
      data: response,
      source: 'mock_data',
    });
  } catch (error) {
    console.error('Transactions fetch error:', error);

    // Fall back to mock data on error
    const response: TransactionListResponse = {
      transactions: mockTransactions,
      hasMore: false,
      total: mockTransactions.length,
    };

    return NextResponse.json({
      success: true,
      data: response,
      source: 'mock_data_fallback',
      error_message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
