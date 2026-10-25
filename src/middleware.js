// File: src/middleware.js
import { NextResponse } from 'next/server';

// Cek header Authorization: Basic ... terhadap ADMIN_USER / ADMIN_PASSWORD.
// Di production, tanpa kredensial di env => selalu ditolak (fail closed).
function isAuthorized(request) {
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASSWORD;

  if (!user || !pass) {
    return process.env.NODE_ENV !== 'production'; // dev lokal tetap bisa tanpa login
  }

  const header = request.headers.get('authorization') || '';
  if (!header.startsWith('Basic ')) return false;

  try {
    const decoded = atob(header.slice(6));
    const idx = decoded.indexOf(':');
    if (idx < 0) return false;
    return safeEqual(decoded.slice(0, idx), user) && safeEqual(decoded.slice(idx + 1), pass);
  } catch {
    return false;
  }
}

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

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
  // BAGIAN 2: ADMIN & API PROTECTION (flag + Basic Auth)
  // ============================================================
  const isAdminEnabled = process.env.ADMIN_ENABLED === 'true';

  // Rute yang butuh login admin: halaman /admin dan semua API non-GET
  // (kecuali POST komentar yang memang publik)
  const isPublicComment = method === 'POST' && pathname === '/api/comments';
  const needsAdmin =
    pathname.startsWith('/admin') ||
    (pathname.startsWith('/api') && method !== 'GET' && !isPublicComment);

  if (needsAdmin) {
    if (!isAdminEnabled) {
      return pathname.startsWith('/admin')
        ? NextResponse.redirect(new URL('/', request.url))
        : NextResponse.json(
            { message: 'Forbidden: Admin access currently disabled' },
            { status: 403 }
          );
    }

    if (!isAuthorized(request)) {
      return new NextResponse('Autentikasi diperlukan', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Admin Minat Matematika"' },
      });
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