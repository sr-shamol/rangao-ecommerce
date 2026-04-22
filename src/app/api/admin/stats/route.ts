import { NextRequest, NextResponse } from 'next/server';
import { getAdminStats, getSalesData } from '@/lib/admin';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '7');

    const [stats, salesData] = await Promise.all([
      getAdminStats(),
      getSalesData(days),
    ]);

    return NextResponse.json({
      success: true,
      stats,
      salesData,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}