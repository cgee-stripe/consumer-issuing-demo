import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const CONNECTED_ACCOUNT_ID = process.env.STRIPE_CONNECTED_ACCOUNT_ID;
const STRIPE_CARD_ID = process.env.STRIPE_CARD_ID;

export async function POST(request: NextRequest) {
  try {
    if (!CONNECTED_ACCOUNT_ID || !STRIPE_SECRET_KEY) {
      throw new Error('Stripe configuration missing');
    }

    // Step 1: Find the credit policy
    const policiesResponse = await fetch(
      `https://api.stripe.com/v1/issuing/credit_policies`,
      {
        headers: {
          Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
          'Stripe-Version': '2025-01-27.acacia; issuing_credit_beta=v3',
          'Stripe-Account': CONNECTED_ACCOUNT_ID,
        },
      }
    );

    if (!policiesResponse.ok) {
      const error = await policiesResponse.json();
      console.error('Failed to fetch credit policies:', error);
      throw new Error(error.error?.message || 'Failed to fetch credit policies');
    }

    const policiesData = await policiesResponse.json();

    if (policiesData.data.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No credit policy found. Consumer credit must be enabled on this account.',
      });
    }

    const creditPolicyId = policiesData.data[0].id;

    // Step 2: Trigger statement generation based on existing transactions
    const generateResponse = await fetch(
      `https://api.stripe.com/v1/test_helpers/issuing/credit_policies/${creditPolicyId}/enable_statement_generation`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
          'Stripe-Version': '2025-01-27.acacia; issuing_credit_beta=v3',
          'Stripe-Account': CONNECTED_ACCOUNT_ID,
        },
      }
    );

    if (!generateResponse.ok) {
      const error = await generateResponse.json();
      console.error('Failed to enable statement generation:', error);
      throw new Error(error.error?.message || 'Failed to enable statement generation');
    }

    return NextResponse.json({
      success: true,
      message: 'Statement generation triggered successfully for your existing transactions',
      credit_policy_id: creditPolicyId,
    });
  } catch (error: any) {
    console.error('Statement generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate statements',
      },
      { status: 500 }
    );
  }
}
