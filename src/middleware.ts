import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const adminPaths = ['/admin'];
  const apiAdminPaths = ['/api/admin'];
  
  const pathname = request.nextUrl.pathname;
  
  // Check if it's an admin path
  const isAdminPath = adminPaths.some(path => pathname.startsWith(path));
  const isApiAdminPath = apiAdminPaths.some(path => pathname.startsWith(path));
  
  if (!isAdminPath && !isApiAdminPath) {
    return NextResponse.next();
  }
  
  // Check for admin session cookie
  const adminSession = request.cookies.get('admin_session');
  
  // Allow /admin and /api/admin/auth without session for login
  if (pathname === '/admin/login' || pathname === '/api/admin/auth') {
    return NextResponse.next();
  }
  
  // Redirect to login if no session for admin pages
  if (isAdminPath && adminSession?.value !== 'true') {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  
  // Return 401 for API without session
  if (isApiAdminPath && adminSession?.value !== 'true') {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};