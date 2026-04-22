import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  const adminPaths = ['/admin'];
  const apiAdminPaths = ['/api/admin'];
  
  const isAdminPath = adminPaths.some(path => pathname.startsWith(path));
  const isApiAdminPath = apiAdminPaths.some(path => pathname.startsWith(path));
  
  if (!isAdminPath && !isApiAdminPath) {
    return NextResponse.next();
  }
  
  const adminSession = request.cookies.get('admin_session');
  
  if (pathname === '/admin/login' || pathname === '/api/admin/auth') {
    return NextResponse.next();
  }
  
  if (isAdminPath && adminSession?.value !== 'true') {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  
  if (isApiAdminPath && adminSession?.value !== 'true') {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};