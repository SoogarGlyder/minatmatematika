/** @type {import('next').NextConfig} */
const nextConfig = {
<<<<<<< HEAD
  trailingSlash: false,

  serverExternalPackages: ['jsdom', 'isomorphic-dompurify'],

=======
>>>>>>> a580d16725eebfdfebc9db385bbf2840d80e1b9b
  images: {
    remotePatterns: [
      {
        protocol: 'https',
<<<<<<< HEAD
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
=======
        hostname: 'minatmatematika.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'saweria.co',
        pathname: '/**',
      }
>>>>>>> a580d16725eebfdfebc9db385bbf2840d80e1b9b
    ],
  },
};

export default nextConfig;