// File: next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,

  serverExternalPackages: ['jsdom', 'isomorphic-dompurify'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.postimg.cc',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
      },
      {
        // Menambahkan izin untuk gambar placeholder
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        // Menambahkan izin untuk gambar dari Unsplash
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        // Menambahkan izin untuk gambar bawaan website
        protocol: 'https',
        hostname: 'minatmatematika.com',
        pathname: '/**',
      },
    ],
  },

  async redirects() {
    return [
      {
        // Menangkap format URL CBT lama
        source: '/:topicSlug/:packetSlug/cbt',
        // Mengalihkan secara otomatis ke format URL CBT baru
        destination: '/cbt/:topicSlug/:packetSlug',
        permanent: true,
      },
    ]
  },

  // BARU: Menambahkan HTTP Headers pelarangan indeks untuk folder CBT
  async headers() {
    return [
      {
        // Targetkan semua rute yang dimulai dengan /cbt/
        source: '/cbt/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow, nocache', // Instruksi tegas ke mesin pencari
          },
        ],
      },
    ]
  },
};

export default nextConfig;