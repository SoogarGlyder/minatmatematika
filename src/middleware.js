// File: src/middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl.clone();
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host');
  const method = request.method;

  // ============================================================
  // BAGIAN 1: DOMAIN REDIRECT (FORCE WWW)
  // ============================================================
  // Kita ganti menjadi domain baru kita
  const targetDomain = 'www.minatmatematika.com'; 

  // Jalankan hanya di Production
  if (process.env.NODE_ENV === 'production') {
      
      const isNonWww = hostname === 'minatmatematika.com';
      const isVercelDomain = hostname.includes('vercel.app');

      if (isNonWww || isVercelDomain) {
          url.hostname = targetDomain;
          url.protocol = 'https';
          url.port = ''; 
          return NextResponse.redirect(url, 301);
      }
  }

  // ============================================================
  // BAGIAN 2: ADMIN & API PROTECTION
  // ============================================================
  const isAdminEnabled = process.env.ADMIN_ENABLED === 'true';

  // 1. Proteksi Halaman /admin
  if (pathname.startsWith('/admin')) {
    if (!isAdminEnabled) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // 2. Proteksi Route /api
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
            { message: 'Forbidden: Admin access currently disabled' },
            { status: 403 }
          );
       }
    }
  }

  return NextResponse.next();
}

// ============================================================
// KONFIGURASI MATCHER
// ============================================================
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};