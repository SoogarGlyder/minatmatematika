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
          '/_next/',
          '/cbt/', // Memblokir folder CBT dengan struktur URL yang baru
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