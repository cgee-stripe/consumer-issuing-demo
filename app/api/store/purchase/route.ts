import { NextRequest, NextResponse } from 'next/server';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const CONNECTED_ACCOUNT_ID = process.env.STRIPE_CONNECTED_ACCOUNT_ID;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productName, amount, category } = body;

    if (!CONNECTED_ACCOUNT_ID || !STRIPE_SECRET_KEY) {
      throw new Error('Stripe configuration missing');
    }

    // Get the card from the connected account
    const cardsResponse = await fetch(
      `https://api.stripe.com/v1/issuing/cards?limit=1`,
      {
        headers: {
          Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
          'Stripe-Version': '2025-01-27.acacia; issuing_credit_beta=v3',
          'Stripe-Account': CONNECTED_ACCOUNT_ID,
        },
      }
    );

    const cards = await cardsResponse.json();

    if (!cards.data || cards.data.length === 0) {
      throw new Error('No card found');
    }

    const cardId = cards.data[0].id;

    // Create authorization (simulates card swipe)
    const authResponse = await fetch(
      'https://api.stripe.com/v1/test_helpers/issuing/authorizations',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
          'Stripe-Version': '2025-01-27.acacia',
          'Stripe-Account': CONNECTED_ACCOUNT_ID,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          amount: Math.round(amount * 100).toString(),
          card: cardId,
          currency: 'usd',
          'merchant_data[name]': productName,
          'merchant_data[category]': category,
        }).toString(),
      }
    );

    const authorization = await authResponse.json();

    if (!authResponse.ok) {
      console.error('Authorization error:', authorization);
      throw new Error(authorization.error?.message || 'Failed to create authorization');
    }

    // Capture the authorization to create actual transaction
    const captureResponse = await fetch(
      `https://api.stripe.com/v1/test_helpers/issuing/authorizations/${authorization.id}/capture`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
          'Stripe-Version': '2025-01-27.acacia',
          'Stripe-Account': CONNECTED_ACCOUNT_ID,
        },
      }
    );

    const capture = await captureResponse.json();

    if (!captureResponse.ok) {
      console.error('Capture error:', capture);
      throw new Error(capture.error?.message || 'Failed to capture transaction');
    }

    return NextResponse.json({
      success: true,
      data: {
        authorizationId: authorization.id,
        amount,
        merchant: productName,
      },
      message: 'Purchase successful',
    });
  } catch (error: any) {
    console.error('Purchase error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process purchase',
      },
      { status: 500 }
    );
  }
}
