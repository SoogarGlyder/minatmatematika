import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  const isAdminEnabled = process.env.ADMIN_ENABLED === 'true';

  if (pathname.startsWith('/admin')) {
    if (!isAdminEnabled) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  if (pathname.startsWith('/api')) {

    const publicPostRoutes = [
      '/api/comments' 
    ];

    if (method === 'POST' && publicPostRoutes.includes(pathname)) {
      return NextResponse.next();
    }

    if (method !== 'GET') {
       if (!isAdminEnabled) {
          return NextResponse.json(
            { message: 'Forbidden: Admin access only available on localhost' },
            { status: 403 }
          );
       }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*', 
    '/api/:path*',   
  ],
};