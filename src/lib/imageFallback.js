// File: src/lib/imageFallback.js
// Gambar yang gagal dimuat diganti placeholder, tanpa mengubah alamat aslinya di database.
export const PLACEHOLDER_SRC = '/images/placeholder-gambar.svg';
export const PLACEHOLDER_ALT = 'Gambar belum tersedia';

// Untuk HTML mentah (mis. soal di tryout): tambahkan onerror pada setiap <img>.
// Dipasang pada elemen saat HTML di-parse, jadi juga menangkap kegagalan sebelum hidrasi.
export function withImageFallback(html) {
  const handler = `this.onerror=null;this.src='${PLACEHOLDER_SRC}';this.alt='${PLACEHOLDER_ALT}'`;
  return String(html || '').replace(/<img\b(?![^>]*\sonerror=)/gi, `<img onerror="${handler}"`);
}
