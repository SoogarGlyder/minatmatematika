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
        source: '/:topicSlug/:packetSlug/cbt',
        destination: '/cbt/:topicSlug/:packetSlug',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;