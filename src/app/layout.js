import './globals.css';
import Script from 'next/script'; 
// import { GoogleAnalytics } from '@next/third-parties/google'; // Aktifkan nanti kalau butuh Google Analytics
import { Providers } from './providers'; 
import Header from '@/components/Header';
// import Footer from '@/components/Footer'; // TODO: Nanti kita buat Footer
import FloatingSettings from '@/components/FloatingSettings';

export const viewport = {
  themeColor: '#1a365d', // Warna biru khas edukasi
  width: 'device-width',
  initialScale: 1,
};

export const metadata = {
  metadataBase: new URL('https://minatmatematika.com'),
  alternates: {
    canonical: '/',
  },
  title: 'Minat Matematika | Pusat Latihan Soal UTBK & SNBT', 
  description: 'Latihan soal UTBK - SNBT lengkap beserta pembahasannya. Tersedia Penalaran Umum, Pengetahuan Kuantitatif, dan Penalaran Matematika.',
  applicationName: 'Minat Matematika',
  keywords: ["utbk", "snbt", "penalaran umum", "pengetahuan kuantitatif", "penalaran matematika", "soal utbk", "pembahasan soal"],
  
  openGraph: {
    title: 'Minat Matematika | Latihan Soal UTBK',
    description: 'Kuasai konsep, taklukkan ujian UTBK - SNBT bersama Minat Matematika.',
    url: 'https://minatmatematika.com',
    siteName: 'Minat Matematika',
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
  other: {
    "google-adsense-account": "ca-pub-4365395677457990"
  }
}; 

export default function RootLayout({ children }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Minat Matematika',
    alternateName: ['MinatMatematika', 'Soal UTBK', 'Latihan SNBT'], 
    url: 'https://minatmatematika.com',
    potentialAction: {
      "@type": "SearchAction",
      "target": "https://minatmatematika.com/?search={search_term_string}",
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
            minHeight: 'calc(100vh - var(--total-header-height, 100px))',
            backgroundColor: 'var(--background)',
            color: 'var(--foreground)',
            transition: 'background-color 0.3s ease, color 0.3s ease'
          }}>
            {children}
          </main>
          {/* <Footer /> */}
          <FloatingSettings />
        </Providers>
        
        {/* Script Saweria */}
        <Script id="saweria-widget" strategy="lazyOnload">
          {`
            (function() {
              var script = document.createElement("script");
              script.src = "https://cdn.saweria.co/widget.js";
              script.onload = function() {
                new Saweria.Widget({
                  url: "https://saweria.co/MinatMatematika",
                  theme: "dark",
                  position: "right",
                });
              };
              document.body.appendChild(script);
            })();
          `}
        </Script>
      </body>
    </html>
  );
}