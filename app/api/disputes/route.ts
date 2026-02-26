import { NextRequest, NextResponse } from 'next/server';
import { mockDisputes } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 200));

    return NextResponse.json({
      success: true,
      data: mockDisputes,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch disputes',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await new Promise((resolve) => setTimeout(resolve, 400));

    const newDispute = {
      id: `dsp_${Date.now()}`,
      transactionId: body.transactionId,
      amount: body.amount,
      reason: body.reason,
      status: 'pending' as const,
      createdDate: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: newDispute,
      message: 'Dispute created successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create dispute',
      },
      { status: 500 }
    );
  }
}
