import { NextRequest, NextResponse } from 'next/server';
import { getLeads, getLeadsFromDb, createLead, updateLead } from '@/lib/admin';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    
    if (type === 'db') {
      const result = await getLeadsFromDb({
        status: searchParams.get('status') || undefined,
        search: searchParams.get('search') || undefined,
        page: parseInt(searchParams.get('page') || '1'),
      });
      return NextResponse.json({ success: true, ...result });
    }
    
    const leads = await getLeads();
    return NextResponse.json({ success: true, leads });
  } catch (error) {
    console.error('Leads fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch leads' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, source, notes } = body;
    
    const lead = await createLead({ phone, name, source, notes });
    return NextResponse.json({ success: true, lead: lead.data });
  } catch (error) {
    console.error('Create lead error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create lead' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, notes } = body;
    
    await updateLead(id, { status, notes });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update lead error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update lead' }, { status: 500 });
  }
}