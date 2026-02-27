import { NextRequest, NextResponse } from 'next/server';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const CONNECTED_ACCOUNT_ID = process.env.STRIPE_CONNECTED_ACCOUNT_ID;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fileUrl = searchParams.get('url');

    if (!fileUrl) {
      return NextResponse.json(
        { error: 'Missing file URL parameter' },
        { status: 400 }
      );
    }

    if (!STRIPE_SECRET_KEY || !CONNECTED_ACCOUNT_ID) {
      return NextResponse.json(
        { error: 'Stripe configuration missing' },
        { status: 500 }
      );
    }

    // Fetch the PDF from Stripe with proper authentication
    const response = await fetch(fileUrl, {
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Stripe-Account': CONNECTED_ACCOUNT_ID,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Failed to fetch PDF from Stripe:', errorData);
      return NextResponse.json(
        { error: 'Failed to fetch PDF from Stripe' },
        { status: response.status }
      );
    }

    // Get the PDF content
    const pdfBuffer = await response.arrayBuffer();

    // Return the PDF with proper headers
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="statement.pdf"',
      },
    });
  } catch (error: any) {
    console.error('Error downloading statement PDF:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to download PDF' },
      { status: 500 }
    );
  }
}
