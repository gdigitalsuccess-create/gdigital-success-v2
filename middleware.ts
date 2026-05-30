import { NextRequest, NextResponse } from 'next/server';

const ADMIN_COOKIE = 'gdigital_admin';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/admin/login')) {
    const cookie = req.cookies.get(ADMIN_COOKIE);
    if (cookie?.value === 'authenticated') {
      const adminUrl = req.nextUrl.clone();
      adminUrl.pathname = '/admin';
      return NextResponse.redirect(adminUrl);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/admin')) {
    const cookie = req.cookies.get(ADMIN_COOKIE);
    if (cookie?.value !== 'authenticated') {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = '/admin/login';
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
