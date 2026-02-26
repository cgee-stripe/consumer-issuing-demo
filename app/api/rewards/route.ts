import { NextRequest, NextResponse } from 'next/server';
import { mockRewards, mockRewardsBalance } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 200));

    return NextResponse.json({
      success: true,
      data: {
        rewards: mockRewards,
        balance: mockRewardsBalance,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch rewards',
      },
      { status: 500 }
    );
  }
}
