// File: src/lib/imageHosts.mjs
// Host gambar yang diizinkan next/image. HARUS SAMA dengan images.remotePatterns di next.config.mjs
// (scripts/test-audit.mjs memeriksa keduanya sama; jalankan setelah mengubah salah satunya).
export const REMOTE_IMAGE_HOSTS = [
  'i.postimg.cc',
  'i.imgur.com',
  'via.placeholder.com',
  'images.unsplash.com',
  'minatmatematika.com',
];
