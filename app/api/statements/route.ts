import { NextRequest, NextResponse } from 'next/server';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const CONNECTED_ACCOUNT_ID = process.env.STRIPE_CONNECTED_ACCOUNT_ID;

export async function GET(request: NextRequest) {
  try {
    if (!CONNECTED_ACCOUNT_ID || !STRIPE_SECRET_KEY || STRIPE_SECRET_KEY.includes('placeholder')) {
      return NextResponse.json({
        success: true,
        data: { statements: [] },
        source: 'mock_data',
      });
    }

    // List credit statements for the connected account
    const response = await fetch(
      `https://api.stripe.com/v1/issuing/credit_statements`,
      {
        headers: {
          Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
          'Stripe-Version': '2025-01-27.acacia; issuing_credit_beta=v3',
          'Stripe-Account': CONNECTED_ACCOUNT_ID,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Stripe API error fetching statements:', errorData);
      throw new Error(errorData.error?.message || 'Failed to fetch statements');
    }

    const statementsData = await response.json();

    console.log('Raw statements data from Stripe:', JSON.stringify(statementsData, null, 2));

    // Transform statements to include relevant fields
    const statements = statementsData.data.map((statement: any) => {
      // Helper function to safely convert date strings to Unix timestamps
      const toTimestamp = (dateStr: any) => {
        if (!dateStr) return null;
        try {
          // If it's a date string like "2026-02-16", convert to Unix timestamp
          const date = new Date(dateStr + 'T00:00:00Z');
          return Math.floor(date.getTime() / 1000);
        } catch (e) {
          console.error('Failed to convert date:', dateStr, e);
          return null;
        }
      };

      return {
        id: statement.id,
        period_start: toTimestamp(statement.credit_period_start_date),
        period_end: toTimestamp(statement.credit_period_end_date),
        statement_url: statement.statement_pdf,
        balance: statement.closing_statement_balance || 0, // Already in cents
        amount_due: statement.statement_minimum_payment || 0, // Already in cents
        amount_paid: 0, // Calculate from repayments if available
        due_date: toTimestamp(statement.statement_due_date),
        status: statement.status || 'open',
        currency: 'usd',
        created: statement.created || Math.floor(Date.now() / 1000),
      };
    });

    return NextResponse.json({
      success: true,
      data: { statements },
      source: 'stripe_api',
    });
  } catch (error) {
    console.error('Failed to fetch statements:', error);

    // Return empty array on error
    return NextResponse.json({
      success: true,
      data: { statements: [] },
      source: 'error_fallback',
      error_message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
