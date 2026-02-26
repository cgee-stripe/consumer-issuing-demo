import { NextRequest, NextResponse } from 'next/server';
import { mockBalanceInfo } from '@/lib/mock-data';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const CONNECTED_ACCOUNT_ID = process.env.STRIPE_CONNECTED_ACCOUNT_ID;

export async function GET(request: NextRequest) {
  try {
    // Use real Stripe API if Connected Account ID is configured
    if (CONNECTED_ACCOUNT_ID && STRIPE_SECRET_KEY && !STRIPE_SECRET_KEY.includes('placeholder')) {
      const response = await fetch('https://api.stripe.com/v1/issuing/credit_ledger', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          'Stripe-Version': '2025-01-27.acacia; issuing_credit_beta=v3',
          'Stripe-Account': CONNECTED_ACCOUNT_ID,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Stripe API error:', errorData);
        throw new Error(errorData.error?.message || 'Failed to fetch from Stripe');
      }

      const creditLedger = await response.json();

      // Transform Stripe response to match our BalanceInfo type
      const balanceInfo = {
        currentBalance: (creditLedger.obligations?.accruing || 0) / 100, // Convert from cents
        availableCredit: (creditLedger.credit_available || 0) / 100,
        creditLimit: (creditLedger.credit_limit || 0) / 100,
        minimumPayment: (creditLedger.minimum_payment_amount || 0) / 100,
        statementBalance: (creditLedger.obligations?.accruing || 0) / 100, // Should match current balance
        dueDate: creditLedger.due_at
          ? new Date(creditLedger.due_at * 1000).toISOString()
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        currency: creditLedger.currency.toUpperCase(),
      };

      return NextResponse.json({
        success: true,
        data: balanceInfo,
        source: 'stripe_api',
      });
    }

    // Fall back to mock data if no Connected Account ID
    await new Promise((resolve) => setTimeout(resolve, 200));

    return NextResponse.json({
      success: true,
      data: mockBalanceInfo,
      source: 'mock_data',
    });
  } catch (error) {
    console.error('Balance fetch error:', error);

    // Fall back to mock data on error
    return NextResponse.json({
      success: true,
      data: mockBalanceInfo,
      source: 'mock_data_fallback',
      error_message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
