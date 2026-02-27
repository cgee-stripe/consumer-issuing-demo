import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

const CUSTOMER_ID = process.env.STRIPE_CUSTOMER_ID;
const CONNECTED_ACCOUNT_ID = process.env.STRIPE_CONNECTED_ACCOUNT_ID;

export async function GET(request: NextRequest) {
  try {
    if (!CUSTOMER_ID || !CONNECTED_ACCOUNT_ID) {
      return NextResponse.json(
        {
          success: false,
          error: 'Stripe configuration missing',
        },
        { status: 500 }
      );
    }

    // Fetch customer information from Stripe
    const customer = await stripe.customers.retrieve(CUSTOMER_ID, {
      stripeAccount: CONNECTED_ACCOUNT_ID,
    });

    if (customer.deleted) {
      return NextResponse.json(
        {
          success: false,
          error: 'Customer not found',
        },
        { status: 404 }
      );
    }

    // Map Stripe customer status to our account status
    // Stripe customers don't have a direct status field, so we infer it
    let accountStatus: 'active' | 'suspended' | 'closed' = 'active';

    // If customer is deleted, mark as closed
    if (customer.deleted) {
      accountStatus = 'closed';
    }
    // You could add more logic here based on other Stripe fields
    // For example, check if there are any holds, disputes, or delinquency status

    return NextResponse.json({
      success: true,
      data: {
        accountId: customer.id,
        status: accountStatus,
        accountHolder: customer.name || 'Unknown',
        email: customer.email || 'No email on file',
        phone: customer.phone || 'No phone on file',
        since: new Date((customer.created || 0) * 1000).toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Failed to fetch account status:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch account status',
      },
      { status: 500 }
    );
  }
}
