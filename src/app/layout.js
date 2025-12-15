import { Rubik } from "next/font/google";
import "./globals.css";
import { GoogleTagManager } from '@next/third-parties/google';
import Script from "next/script";

const rubik = Rubik({ 
  subsets: ["latin"],
  variable: '--font-rubik',
  display: 'swap',
});

export const metadata = {
  title: {
    default: "Minat Matematika | Latihan Soal UTBK & SNBT",
    template: "%s | Minat Matematika"
  },
  description: "Berisi latihan soal UTBK - SNBT dan pembahasannya mulai dari Penalaran Umum, Pengetahuan Kuantitatif, hingga Penalaran Matematika.",
  
  metadataBase: new URL('https://minatmatematika.com'),
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },

  verification: {
    google: "HPNrPSuwx1xFIx9U5VDoQY_0thMbF9XoBP-9eeIVy00",
    other: {
      "msvalidate.01": "aaec6b0e1efd47b09d5613d284794984",
      "purpleads-verification": "ff5fcbda691cda3c777ba8c7",
    },
  },

  openGraph: {
    title: "Minat Matematika",
    description: "Tempat bagi yang ber-Minat Matematika",
    url: "https://minatmatematika.com",
    siteName: "Minat Matematika",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: 'https://minatmatematika.com/wp-content/uploads/2022/12/minat-matematika-logo-saja.png', // Pastikan gambar ini sudah ada di folder public/wp-content/uploads kamu!
        width: 1500,
        height: 1500,
        alt: 'Logo Minat Matematika',
      },
    ],
  },

  // --- Tampilan di Twitter/X ---
  twitter: {
    card: 'summary_large_image',
    site: '@MinatMatematika',
    title: "Minat Matematika",
    description: "Berisi latihan soal UTBK - SNBT dan pembahasannya.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <Script
          id="google-funding-choices"
          strategy="beforeInteractive"
          src="https://fundingchoicesmessages.google.com/i/pub-4365395677457990?ers=1"
        />
        <Script id="google-fc-logic" strategy="afterInteractive">
          {`
            (function() {
              function signalGooglefcPresent() {
                if (!window.frames['googlefcPresent']) {
                  if (document.body) {
                    const iframe = document.createElement('iframe'); 
                    iframe.style = 'width: 0; height: 0; border: none; z-index: -1000; left: -1000px; top: -1000px;'; 
                    iframe.style.display = 'none'; 
                    iframe.name = 'googlefcPresent'; 
                    document.body.appendChild(iframe);
                  } else {
                    setTimeout(signalGooglefcPresent, 0);
                  }
                }
              }
              signalGooglefcPresent();
            })();
          `}
        </Script>
      </head>
      
      <body className={rubik.className}>
        {children}

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

        <Script
          id="adsbygoogle-init"
          strategy="afterInteractive"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4365395677457990"
          crossOrigin="anonymous"
        />

      </body>
      <GoogleTagManager gtmId="GTM-W6V8HJR" />
    </html>
  );
}