import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { mockRewards, mockRewardsBalance } from '@/lib/mock-data';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia' as any,
});

const connectedAccountId = process.env.STRIPE_CONNECTED_ACCOUNT_ID;

export async function GET(request: NextRequest) {
  try {
    if (!connectedAccountId) {
      throw new Error('STRIPE_CONNECTED_ACCOUNT_ID not configured');
    }

    // Fetch credit ledger adjustments to calculate rewards points
    // In a real system, you'd filter by reason to get only reward-related adjustments
    const adjustments = await stripe.issuing.creditLedgerAdjustments.list(
      {
        limit: 100,
      },
      {
        stripeAccount: connectedAccountId,
        apiVersion: '2025-01-27.acacia; issuing_credit_beta=v3' as any,
      }
    );

    // Calculate total rewards points from credit adjustments
    // For demo purposes, we'll count credits as positive points
    let totalPoints = 2450; // Starting balance
    if (adjustments.data) {
      adjustments.data.forEach((adjustment: any) => {
        if (adjustment.reason === 'platform_issued_credit_memo' && adjustment.amount_type === 'credit') {
          // Subtract redeemed points (credits reduce the available points)
          totalPoints -= adjustment.amount / 100; // Convert cents back to points
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        rewards: mockRewards, // Keep catalog as mock for now
        balance: {
          points: totalPoints,
          tier: 'Gold Paws',
          nextTierPoints: 3000,
          lifetimePoints: 5240,
        },
        adjustments: adjustments.data,
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

    if (!connectedAccountId) {
      throw new Error('STRIPE_CONNECTED_ACCOUNT_ID not configured');
    }

    // Create a credit ledger adjustment for the reward redemption
    // This credits the account for the reward value
    const adjustment = await stripe.issuing.creditLedgerAdjustments.create(
      {
        amount: pointsCost * 100, // Convert points to cents (1 point = $1)
        amount_type: 'credit',
        currency: 'usd',
        reason: 'platform_issued_credit_memo',
        reason_description: `Reward redemption: ${rewardName} (${pointsCost} Paw Points)`,
      },
      {
        stripeAccount: connectedAccountId,
        apiVersion: '2025-01-27.acacia; issuing_credit_beta=v3' as any,
      }
    );

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
