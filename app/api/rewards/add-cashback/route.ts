import { NextRequest, NextResponse } from 'next/server';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const connectedAccountId = process.env.STRIPE_CONNECTED_ACCOUNT_ID;

// Add cashback to the account by creating a debit ledger adjustment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, description } = body;

    if (!connectedAccountId || !STRIPE_SECRET_KEY) {
      throw new Error('Stripe configuration missing');
    }

    if (!amount || amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    // First, fetch the funding obligation
    const foResponse = await fetch(
      'https://api.stripe.com/v1/issuing/funding_obligations?limit=1',
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          'Stripe-Version': '2025-01-27.acacia; issuing_credit_beta=v3',
          'Stripe-Account': connectedAccountId,
        },
      }
    );

    if (!foResponse.ok) {
      const errorData = await foResponse.json();
      console.error('Failed to fetch funding obligation:', errorData);
      throw new Error('Failed to fetch funding obligation');
    }

    const foData = await foResponse.json();
    const fundingObligationId = foData.data?.[0]?.id;

    if (!fundingObligationId) {
      throw new Error('No funding obligation found');
    }

    // Create a debit ledger adjustment to ADD cashback
    const response = await fetch(
      'https://api.stripe.com/v1/issuing/credit_ledger_adjustments',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          'Stripe-Version': '2025-01-27.acacia; issuing_credit_beta=v3',
          'Stripe-Account': connectedAccountId,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          amount: String(amount * 100), // Convert dollars to cents
          amount_type: 'debit',
          currency: 'usd',
          reason: 'platform_issued_debit_memo',
          reason_description: description || `Manual cashback addition: $${amount}`,
          funding_obligation: fundingObligationId,
        }).toString(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Stripe API error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to create adjustment');
    }

    const adjustment = await response.json();

    return NextResponse.json({
      success: true,
      data: {
        adjustment,
        amount,
        description,
      },
      message: `Successfully added $${amount} cashback!`,
    });
  } catch (error: any) {
    console.error('Failed to add cashback:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to add cashback',
      },
      { status: 500 }
    );
  }
}
