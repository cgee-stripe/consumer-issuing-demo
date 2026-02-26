import { NextRequest, NextResponse } from 'next/server';
import { mockAccountStatus } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 200));

    return NextResponse.json({
      success: true,
      data: mockAccountStatus,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch account status',
      },
      { status: 500 }
    );
  }
}
