import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

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

    // Fetch cards from Stripe Issuing
    const cards = await stripe.issuing.cards.list(
      { limit: 1 },
      {
        stripeAccount: connectedAccountId,
        apiVersion: '2025-01-27.acacia; issuing_credit_beta=v3' as any,
      }
    );

    if (!cards.data || cards.data.length === 0) {
      throw new Error('No card found');
    }

    const stripeCard = cards.data[0];

    // Transform to match our Card type
    const card = {
      id: stripeCard.id,
      last4: stripeCard.last4,
      brand: stripeCard.brand,
      expiryMonth: stripeCard.exp_month,
      expiryYear: stripeCard.exp_year,
      cardholderName: stripeCard.cardholder.name,
      status: stripeCard.status,
      spendingLimit: stripeCard.spending_controls?.spending_limits?.[0]?.amount || 0,
      spendingLimitInterval: stripeCard.spending_controls?.spending_limits?.[0]?.interval || 'monthly',
    };

    return NextResponse.json({
      success: true,
      data: card,
    });
  } catch (error: any) {
    console.error('Card API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch card details',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    await new Promise((resolve) => setTimeout(resolve, 300));

    // In a real app, we'd call Stripe API here
    // const card = await stripe.issuing.cards.update(cardId, {...});

    const updatedCard = {
      ...mockCard,
      ...body,
    };

    return NextResponse.json({
      success: true,
      data: updatedCard,
      message: 'Card updated successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update card',
      },
      { status: 500 }
    );
  }
}
