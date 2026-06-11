// File: src/app/layout.jsx
import './globals.css';
import Script from 'next/script'; 
import { GoogleAnalytics } from '@next/third-parties/google'; 
import { SpeedInsights } from "@vercel/speed-insights/next"; 
import { Analytics } from "@vercel/analytics/next";
import { Providers } from './providers'; 
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingSettings from '@/components/FloatingSettings';

export const viewport = {
  themeColor: '#ECECEC', // Disesuaikan dengan tema monochrome terang
  width: 'device-width',
  initialScale: 1,
};

export const metadata = {
  metadataBase: new URL('https://www.minatmatematika.com'),
  alternates: {
    canonical: '/',
  },
  title: 'Minat Matematika | Platform Belajar & Tryout Mandiri', 
  description: 'Belajar matematika lebih mudah dengan ringkasan materi, latihan soal, dan pembahasan terstruktur untuk persiapan ujian dan UTBK SNBT.',
  applicationName: 'Minat Matematika',
  keywords: ["belajar matematika", "soal matematika", "pembahasan soal", "tryout utbk", "penalaran umum", "penalaran matematika", "pengetahuan kuantitatif"],
  manifest: '/manifest.json',
  
  icons: {
    icon: [
      { url: '/minat-matematika-logo-saja.png', sizes: '32x32' },
      { url: '/minat-matematika-logo-saja.png', sizes: '512x512' },
    ],
    apple: [
      { url: '/minat-matematika-logo-saja.png' },
    ],
    shortcut: ['/minat-matematika-logo-saja.png'],
  },

  openGraph: {
    title: 'Minat Matematika',
    description: 'Tingkatkan pemahaman matematikamu dengan ribuan latihan soal dan pembahasan lengkap.',
    url: 'https://www.minatmatematika.com',
    siteName: 'Minat Matematika',
    locale: 'id_ID',
    type: 'website',
    images: [
      {
        url: '/social-cover.jpg', // Pastikan kamu ganti gambar ini di folder public nanti
        width: 1200,
        height: 630,
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
  },
  other: {
    "google-adsense-account": "ca-pub-4365395677457990" // Biarkan jika masih pakai AdSense yang sama
  }, 
  verification: {
    google: 'evACUKravhwfZaodVDz4gMcDa3CiVHWpkKcDuh-3FC0', // Biarkan jika masih pakai Search Console yang sama
  },
}; 

export default function RootLayout({ children }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Minat Matematika',
    alternateName: ['MinatMatematika', 'Belajar Matematika', 'Matematika UTBK'], 
    url: 'https://www.minatmatematika.com',
    potentialAction: {
      "@type": "SearchAction",
      "target": "https://www.minatmatematika.com/?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4365395677457990"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body suppressHydrationWarning>
        <Providers>
          <Header /> 
          <main style={{ 
            marginTop: '0', 
            minHeight: 'calc(100vh - var(--total-header-height))',
            backgroundColor: 'var(--background)',
            color: 'var(--foreground)',
            transition: 'background-color 0.3s ease, color 0.3s ease'
          }}>
            {children}
          </main>
          <Footer />
          <FloatingSettings />
        </Providers>
        
        <SpeedInsights />
        <Analytics /> 
        <GoogleAnalytics gaId="G-3Y3LMERW26" />
      </body>
    </html>
  );
}