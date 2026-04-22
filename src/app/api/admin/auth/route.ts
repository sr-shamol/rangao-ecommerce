import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const ADMIN_EMAIL = 'admin@rangao.com';
const ADMIN_PASSWORD = 'rangao2024secure';

const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 300000;

function checkLoginRateLimit(ip: string): boolean {
  const now = Date.now();
  const attempts = loginAttempts.get(ip);
  if (!attempts || now > attempts.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + LOCKOUT_TIME });
    return true;
  }
  if (attempts.count >= MAX_ATTEMPTS) return false;
  attempts.count++;
  return true;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  
  if (!checkLoginRateLimit(ip)) {
    return NextResponse.json(
      { success: false, error: 'Too many attempts. Try again later.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { email, password, action } = body;

    if (action === 'logout') {
      const cookieStore = await cookies();
      cookieStore.delete('admin_session');
      return NextResponse.json({ success: true });
    }

    const sanitizedEmail = String(email).slice(0, 100).trim().toLowerCase();
    const sanitizedPassword = String(password).slice(0, 50);

    if (sanitizedEmail === ADMIN_EMAIL && sanitizedPassword === ADMIN_PASSWORD) {
      const cookieStore = await cookies();
      
      cookieStore.set('admin_session', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24,
        path: '/',
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { success: false, error: 'Auth failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');

  if (session?.value === 'true') {
    return NextResponse.json({ authenticated: true });
  }

  return NextResponse.json({ authenticated: false });
}