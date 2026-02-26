import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const CONNECTED_ACCOUNT_ID = process.env.STRIPE_CONNECTED_ACCOUNT_ID;

// Get current test clock status
export async function GET(request: NextRequest) {
  try {
    if (!CONNECTED_ACCOUNT_ID || !STRIPE_SECRET_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Stripe configuration missing',
      }, { status: 500 });
    }

    // Fetch the connected account to see if it has a test clock
    const response = await fetch(
      `https://api.stripe.com/v1/accounts/${CONNECTED_ACCOUNT_ID}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          'Stripe-Version': '2025-01-27.acacia',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Stripe API error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to fetch account');
    }

    const account = await response.json();

    // Check if there's a test clock associated with this account
    // We need to list test clocks and find one that's active
    const testClocksResponse = await fetch(
      'https://api.stripe.com/v1/test_helpers/test_clocks?limit=10',
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          'Stripe-Version': '2025-01-27.acacia',
        },
      }
    );

    if (!testClocksResponse.ok) {
      const errorData = await testClocksResponse.json();
      console.error('Test clocks API error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to fetch test clocks');
    }

    const testClocksData = await testClocksResponse.json();
    const testClocks = testClocksData.data || [];

    // Find the most recent test clock in "ready" status
    const activeTestClock = testClocks.find((clock: any) => clock.status === 'ready' || clock.status === 'advancing');

    return NextResponse.json({
      success: true,
      data: {
        hasTestClock: !!activeTestClock,
        testClock: activeTestClock || null,
        currentTime: activeTestClock ? new Date(activeTestClock.frozen_time * 1000).toISOString() : new Date().toISOString(),
        realTime: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Test clock fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch test clock',
      },
      { status: 500 }
    );
  }
}

// Create a new test clock
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, frozen_time, advance_to } = body;

    if (!STRIPE_SECRET_KEY || !CONNECTED_ACCOUNT_ID) {
      throw new Error('Stripe configuration missing');
    }

    if (action === 'create') {
      // Create a new test clock
      const testClockResponse = await fetch(
        'https://api.stripe.com/v1/test_helpers/test_clocks',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
            'Stripe-Version': '2025-01-27.acacia',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            frozen_time: frozen_time || Math.floor(Date.now() / 1000).toString(),
            name: 'Dogs R Us Demo Clock',
          }).toString(),
        }
      );

      if (!testClockResponse.ok) {
        const errorData = await testClockResponse.json();
        console.error('Stripe API error:', errorData);
        throw new Error(errorData.error?.message || 'Failed to create test clock');
      }

      const testClock = await testClockResponse.json();

      return NextResponse.json({
        success: true,
        data: testClock,
        message: 'Test clock created successfully',
      });
    } else if (action === 'advance') {
      const { test_clock_id } = body;

      if (!test_clock_id || !advance_to) {
        throw new Error('test_clock_id and advance_to are required');
      }

      // Advance the test clock
      const response = await fetch(
        `https://api.stripe.com/v1/test_helpers/test_clocks/${test_clock_id}/advance`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
            'Stripe-Version': '2025-01-27.acacia',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            frozen_time: advance_to.toString(),
          }).toString(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Stripe API error:', errorData);
        throw new Error(errorData.error?.message || 'Failed to advance test clock');
      }

      const testClock = await response.json();

      return NextResponse.json({
        success: true,
        data: testClock,
        message: 'Test clock advanced successfully',
      });
    } else if (action === 'delete') {
      const { test_clock_id } = body;

      if (!test_clock_id) {
        throw new Error('test_clock_id is required');
      }

      // Delete the test clock
      const response = await fetch(
        `https://api.stripe.com/v1/test_helpers/test_clocks/${test_clock_id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
            'Stripe-Version': '2025-01-27.acacia',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Stripe API error:', errorData);
        throw new Error(errorData.error?.message || 'Failed to delete test clock');
      }

      const result = await response.json();

      return NextResponse.json({
        success: true,
        data: result,
        message: 'Test clock deleted successfully',
      });
    } else {
      throw new Error('Invalid action. Must be create, advance, or delete');
    }
  } catch (error: any) {
    console.error('Test clock operation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Test clock operation failed',
      },
      { status: 500 }
    );
  }
}
