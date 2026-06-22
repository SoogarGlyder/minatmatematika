// File: src/app/robots.js
export default function robots() {
  const baseUrl = 'https://www.minatmatematika.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/api/',
        '/_next/',
        '/*/*/cbt',
        '/*/*/cbt/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}