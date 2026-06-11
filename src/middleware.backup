import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const method = request.method; // GET, POST, PUT, DELETE

  // Cek Saklar (Hanya true jika di Laptop/.env.local)
  const isAdminEnabled = process.env.ADMIN_ENABLED === 'true';

  // -----------------------------------------------------------
  // ZONA 1: Proteksi Halaman UI Admin (/admin)
  // -----------------------------------------------------------
  if (pathname.startsWith('/admin')) {
    if (!isAdminEnabled) {
      // Tendang ke Home jika bukan di Localhost/Admin mati
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // -----------------------------------------------------------
  // ZONA 2: Proteksi API Database (/api/...)
  // Kita izinkan GET (untuk pembaca), tapi BLOKIR POST/PUT/DELETE
  // -----------------------------------------------------------
  if (pathname.startsWith('/api')) {
    // Jika user mencoba MENGUBAH data (POST/PUT/DELETE)
    if (method !== 'GET') {
       // Dan saklar Admin mati...
       if (!isAdminEnabled) {
          // Tolak mentah-mentah dengan pesan JSON
          return NextResponse.json(
            { message: 'Forbidden: Admin access only available on localhost' },
            { status: 403 }
          );
       }
    }
  }

  return NextResponse.next();
}

// Konfigurasi Matcher: Cek rute admin DAN rute api
export const config = {
  matcher: [
    '/admin/:path*', // Cek semua halaman admin
    '/api/:path*',   // Cek semua request API
  ],
};