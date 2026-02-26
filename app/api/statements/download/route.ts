import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const CONNECTED_ACCOUNT_ID = process.env.STRIPE_CONNECTED_ACCOUNT_ID;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statementId = searchParams.get('id');

    if (!statementId) {
      return NextResponse.json(
        { error: 'Statement ID is required' },
        { status: 400 }
      );
    }

    if (!CONNECTED_ACCOUNT_ID || !STRIPE_SECRET_KEY) {
      throw new Error('Stripe configuration missing');
    }

    // First, get the statement to retrieve the PDF URL
    const statementResponse = await fetch(
      `https://api.stripe.com/v1/issuing/credit_statements/${statementId}`,
      {
        headers: {
          Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
          'Stripe-Version': '2025-01-27.acacia; issuing_credit_beta=v3',
          'Stripe-Account': CONNECTED_ACCOUNT_ID,
        },
      }
    );

    if (!statementResponse.ok) {
      const error = await statementResponse.json();
      console.error('Failed to fetch statement:', error);
      throw new Error('Failed to fetch statement');
    }

    const statement = await statementResponse.json();

    if (!statement.statement_pdf) {
      return NextResponse.json(
        { error: 'Statement PDF not available yet' },
        { status: 404 }
      );
    }

    // Download the PDF from Stripe's URL
    const pdfResponse = await fetch(statement.statement_pdf);

    if (!pdfResponse.ok) {
      throw new Error('Failed to download PDF from Stripe');
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();

    // Return the PDF with proper headers
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="statement-${statementId}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Statement download error:', error);
    return NextResponse.json(
      { error: 'Failed to download statement' },
      { status: 500 }
    );
  }
}
