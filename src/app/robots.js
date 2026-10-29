// File: src/app/robots.js
export default function robots() {
  const baseUrl = 'https://www.minatmatematika.com';

  return {
    rules: [
      {
        // Aturan untuk SEMUA mesin pencari (Googlebot biasa, Bing, dll)
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          // /_next/ SENGAJA tidak diblokir: Google perlu mengambil CSS/JS (/_next/static/) dan gambar
          // teroptimasi (/_next/image) untuk merender halaman dan mengindeks gambar.
          '/cbt/', // Mode CBT: tidak untuk diindeks
          '/tryout/', // Alamat beta lama yang hanya mengalihkan ke /cbt/
        ],
      },
      {
        // Aturan VIP KHUSUS untuk Robot Google AdSense
        userAgent: 'Mediapartners-Google',
        allow: '/', // Mengizinkan AdSense merayapi seluruh situs agar iklan & offerwall tetap jalan
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}