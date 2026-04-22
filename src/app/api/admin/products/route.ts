import { NextRequest, NextResponse } from 'next/server';
import { getProducts, getCategories, createProduct, updateProduct, createCoupon, getCoupons } from '@/lib/admin';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');

    if (type === 'categories') {
      const categories = await getCategories();
      return NextResponse.json({ success: true, categories });
    }

    if (type === 'coupons') {
      const coupons = await getCoupons();
      return NextResponse.json({ success: true, coupons });
    }

    const filters = {
      category: searchParams.get('category') || undefined,
      search: searchParams.get('search') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
    };

    const result = await getProducts(filters);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');

    const body = await request.json();

    if (type === 'coupon') {
      const coupon = await createCoupon(body);
      return NextResponse.json({ success: true, coupon });
    }

    const product = await createProduct(body);
    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Create error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    
    await updateProduct(id, data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update' },
      { status: 500 }
    );
  }
}