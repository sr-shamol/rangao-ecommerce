import { NextRequest, NextResponse } from 'next/server';
import { getCustomers, getCustomers as getCust } from '@/lib/admin';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filters = {
      search: searchParams.get('search') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
    };

    const result = await getCust(filters);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Customers fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}