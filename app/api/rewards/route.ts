import { NextRequest, NextResponse } from 'next/server';
import { mockRewards } from '@/lib/mock-data';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const connectedAccountId = process.env.STRIPE_CONNECTED_ACCOUNT_ID;

export async function GET(request: NextRequest) {
  try {
    if (!connectedAccountId || !STRIPE_SECRET_KEY) {
      throw new Error('Stripe configuration missing');
    }

    // Fetch credit ledger adjustments using raw fetch
    const response = await fetch(
      'https://api.stripe.com/v1/issuing/credit_ledger_adjustments?limit=100',
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          'Stripe-Version': '2025-01-27.acacia; issuing_credit_beta=v3',
          'Stripe-Account': connectedAccountId,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Stripe API error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to fetch adjustments');
    }

    const adjustmentsResponse = await response.json();
    const adjustments = adjustmentsResponse.data || [];

    // Calculate total cashback from credit adjustments
    let totalCashback = 24.50; // Starting balance in dollars
    adjustments.forEach((adjustment: any) => {
      if (adjustment.reason === 'platform_issued_credit_memo' && adjustment.amount_type === 'credit') {
        // Subtract redeemed cashback (credits reduce the available balance)
        totalCashback -= adjustment.amount / 100; // Convert cents to dollars
      } else if (adjustment.reason === 'platform_issued_debit_memo' && adjustment.amount_type === 'debit') {
        // Add manually added cashback (debits increase the available balance)
        totalCashback += adjustment.amount / 100; // Convert cents to dollars
      }
    });

    // Determine tier based on cashback (every $20 = next tier)
    let tier = 'basic';
    let cashbackToNextTier = 20 - totalCashback;

    if (totalCashback >= 80) {
      tier = 'platinum';
      cashbackToNextTier = 0;
    } else if (totalCashback >= 60) {
      tier = 'gold';
      cashbackToNextTier = 80 - totalCashback;
    } else if (totalCashback >= 40) {
      tier = 'silver';
      cashbackToNextTier = 60 - totalCashback;
    } else if (totalCashback >= 20) {
      tier = 'bronze';
      cashbackToNextTier = 40 - totalCashback;
    }

    return NextResponse.json({
      success: true,
      data: {
        rewards: mockRewards, // Keep catalog as mock for now
        balance: {
          points: totalCashback, // Using 'points' field for backwards compatibility, but it's dollars
          tier: tier,
          pointsToNextTier: cashbackToNextTier,
          lifetimePoints: totalCashback,
        },
        adjustments: adjustments,
      },
    });
  } catch (error: any) {
    console.error('Failed to fetch rewards:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch rewards',
      },
      { status: 500 }
    );
  }
}

// Redeem a reward by creating a credit ledger adjustment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rewardId, pointsCost, rewardName } = body;

    if (!connectedAccountId || !STRIPE_SECRET_KEY) {
      throw new Error('Stripe configuration missing');
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

    // Create a credit ledger adjustment using raw fetch
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
          amount: String(pointsCost * 100), // Convert points to cents
          amount_type: 'credit',
          currency: 'usd',
          reason: 'platform_issued_credit_memo',
          reason_description: `Reward redemption: ${rewardName} (${pointsCost} Paw Points)`,
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
        rewardId,
        pointsCost,
        rewardName,
      },
      message: `Successfully redeemed ${rewardName}!`,
    });
  } catch (error: any) {
    console.error('Reward redemption failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to redeem reward',
      },
      { status: 500 }
    );
  }
}
