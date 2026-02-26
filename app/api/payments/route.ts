import { NextRequest, NextResponse } from 'next/server';
import { mockPayments } from '@/lib/mock-data';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const CONNECTED_ACCOUNT_ID = process.env.STRIPE_CONNECTED_ACCOUNT_ID;
const STRIPE_CUSTOMER_ID = process.env.STRIPE_CUSTOMER_ID;
const STRIPE_PAYMENT_METHOD_ID = process.env.STRIPE_PAYMENT_METHOD_ID;

export async function GET(request: NextRequest) {
  try {
    // Use real Stripe API if Connected Account ID is configured
    if (CONNECTED_ACCOUNT_ID && STRIPE_SECRET_KEY && !STRIPE_SECRET_KEY.includes('placeholder')) {
      // List repayments for the connected account (filter by account parameter)
      const response = await fetch(
        `https://api.stripe.com/v1/issuing/credit_repayments?account=${CONNECTED_ACCOUNT_ID}&limit=20`,
        {
          headers: {
            Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
            'Stripe-Version': '2025-01-27.acacia; issuing_credit_beta=v3',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Stripe API error:', errorData);
        throw new Error(errorData.error?.message || 'Failed to fetch repayments');
      }

      const repaymentsData = await response.json();

      // Transform Stripe repayments to match our Payment type
      const payments = repaymentsData.data.map((repayment: any) => {
        // Get created timestamp from credit_ledger_entries if available
        const createdTimestamp = repayment.credit_ledger_entries?.[0]?.created || Date.now() / 1000;

        return {
          id: repayment.id,
          amount: repayment.amount?.value ? repayment.amount.value / 100 : 0, // Convert cents to dollars
          currency: (repayment.amount?.currency || 'usd').toUpperCase(),
          status: repayment.status === 'succeeded' ? 'completed' :
                  repayment.status === 'pending' ? 'pending' :
                  repayment.status === 'created' ? 'completed' : 'failed',
          date: new Date(createdTimestamp * 1000).toISOString(),
          paymentMethod: 'Bank Account ****6789',
          confirmationNumber: repayment.id,
        };
      });

      return NextResponse.json({
        success: true,
        data: {
          payments,
          total: payments.length,
        },
        source: 'stripe_api',
      });
    }

    // Fall back to mock data if no Connected Account ID
    return NextResponse.json({
      success: true,
      data: {
        payments: mockPayments,
        total: mockPayments.length,
      },
      source: 'mock_data',
    });
  } catch (error) {
    console.error('Failed to fetch payment history:', error);

    // Fall back to mock data on error
    return NextResponse.json({
      success: true,
      data: {
        payments: mockPayments,
        total: mockPayments.length,
      },
      source: 'mock_data_fallback',
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, paymentMethod } = body;

    if (!CONNECTED_ACCOUNT_ID || !STRIPE_SECRET_KEY || !STRIPE_CUSTOMER_ID) {
      throw new Error('Stripe configuration missing');
    }

    // Create repayment using Stripe credit_repayments API
    // Using test token pm_usBankAccount_success for a verified bank account
    // Note: amount[value] expects cents as an integer
    const amountInCents = Math.round(amount * 100);

    const response = await fetch(
      'https://api.stripe.com/v1/issuing/credit_repayments',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
          'Stripe-Version': '2025-01-27.acacia; issuing_credit_beta=v3',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          account: CONNECTED_ACCOUNT_ID,
          customer: STRIPE_CUSTOMER_ID,
          'instructed_by[type]': 'credit_repayments_api',
          'instructed_by[credit_repayments_api][payment_method]': 'pm_usBankAccount_success',
          'amount[value]': amountInCents.toString(),
          'amount[currency]': 'usd',
          credit_statement_descriptor: 'Thank you for your payment.',
        }).toString(),
      }
    );

    const repayment = await response.json();

    if (!response.ok) {
      console.error('Repayment creation error:', repayment);
      throw new Error(repayment.error?.message || 'Failed to create repayment');
    }

    // Transform to match our Payment type
    const newPayment = {
      id: repayment.id,
      amount: repayment.amount?.value ? repayment.amount.value / 100 : amount, // Convert cents to dollars
      currency: (repayment.amount?.currency || 'usd').toUpperCase(),
      status: 'completed' as const,
      date: new Date().toISOString(),
      paymentMethod: 'Bank Account ****6789',
      confirmationNumber: repayment.id,
    };

    return NextResponse.json({
      success: true,
      data: newPayment,
      message: 'Payment processed successfully',
    });
  } catch (error: any) {
    console.error('Payment processing error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process payment',
      },
      { status: 500 }
    );
  }
}
