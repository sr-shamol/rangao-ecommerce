import { NextRequest, NextResponse } from 'next/server';
import { getSettings, updateSettings } from '@/lib/admin';

export async function GET() {
  try {
    const [sms, couriers, checkout, fraud, automation] = await Promise.all([
      getSettings('sms'),
      getSettings('couriers'),
      getSettings('checkout'),
      getSettings('fraud'),
      getSettings('automation'),
    ]);

    return NextResponse.json({
      success: true,
      settings: {
        sms: sms || { gateways: [], default_gateway: '', enabled: false },
        couriers: couriers || { enabled: ['steadfast', 'redx'], auto_assign: true },
        checkout: checkout || { headline: 'Thank You!', urgency_text: '', offers: [] },
        fraud: fraud || { enabled: true, threshold: 60, block_cod: true },
        automation: automation || { abandoned_cart_sms: true, auto_confirm: false, facebook_capi: false },
      },
    });
  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const keys = ['sms', 'couriers', 'checkout', 'fraud', 'automation'];
    
    for (const key of keys) {
      if (body[key]) {
        await updateSettings(key, body[key]);
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update settings' }, { status: 500 });
  }
}