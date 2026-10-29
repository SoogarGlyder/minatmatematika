// File: src/lib/imageFallback.js
// Penanganan gambar pada HTML mentah (mis. soal di tryout):
//  1. Gambar dari host yang diizinkan dimuat lewat /_next/image (dilayani dari domain situs sendiri,
//     sama seperti halaman baca), sehingga tidak bergantung pada akses langsung pengunjung ke host gambar.
//  2. Jika gagal, dicoba alamat aslinya secara langsung.
//  3. Jika tetap gagal, tampil placeholder. Alamat asli di database tidak pernah diubah.
import { REMOTE_IMAGE_HOSTS } from './imageHosts.mjs';

export const PLACEHOLDER_SRC = '/images/placeholder-gambar.svg';
export const PLACEHOLDER_ALT = 'Gambar belum tersedia';

const PROXY_WIDTH = 1080; // harus termasuk images.deviceSizes bawaan Next.js
const PROXY_QUALITY = 75; // harus termasuk images.qualities (bawaan Next.js 16 hanya 75)

// Menentukan cara memuat gambar untuk next/image. next/image MELEMPAR error saat render jika src bukan
// alamat absolut atau path yang diawali "/" (mis. penanda "URL_GAMBAR_ANDA_DISINI" yang belum diisi),
// dan juga jika host belum terdaftar di remotePatterns. Fungsi ini mencegah keduanya:
//  - src tidak valid / kosong / protokol aneh (mis. javascript:)  -> placeholder
//  - path lokal "/..."                                           -> dioptimalkan seperti biasa
//  - https dari host yang diizinkan                              -> dioptimalkan
//  - host lain, http://, atau data:image/                        -> dimuat apa adanya (unoptimized)
export function resolveImageSource(src) {
  const invalid = { src: PLACEHOLDER_SRC, unoptimized: false, valid: false };
  const value = typeof src === 'string' ? src.trim() : '';
  if (!value) return invalid;
  if (/^data:image\//i.test(value)) return { src: value, unoptimized: true, valid: true };
  if (value.startsWith('/') && !value.startsWith('//')) return { src: value, unoptimized: false, valid: true };

  const candidate = value.startsWith('//') ? `https:${value}` : value;
  try {
    const url = new URL(candidate);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return invalid;
    const allowed = url.protocol === 'https:' && REMOTE_IMAGE_HOSTS.includes(url.hostname.toLowerCase());
    return { src: candidate, unoptimized: !allowed, valid: true };
  } catch {
    return invalid;
  }
}

// Alamat /_next/image untuk host yang diizinkan; null bila tidak berlaku.
export function proxiedSrc(src) {
  try {
    const url = new URL(src);
    if (url.protocol !== 'https:' || !REMOTE_IMAGE_HOSTS.includes(url.hostname.toLowerCase())) return null;
    return `/_next/image?url=${encodeURIComponent(src)}&w=${PROXY_WIDTH}&q=${PROXY_QUALITY}`;
  } catch {
    return null;
  }
}

// Aman dipakai di dalam atribut onerror="..." (nilai atribut didekode dulu oleh browser sebelum dijalankan)
const forAttr = (s) => String(s).replace(/&/g, '&amp;').replace(/'/g, '%27').replace(/</g, '%3C').replace(/"/g, '%22');

export function enhanceImages(html) {
  return String(html || '').replace(/<img\b[^>]*>/gi, (tag) => {
    if (/\sonerror\s*=/i.test(tag)) return tag; // sudah diproses

    const srcMatch = tag.match(/\bsrc\s*=\s*"([^"]*)"/i);
    const original = srcMatch ? srcMatch[1].replace(/&amp;/g, '&') : '';
    const proxied = original ? proxiedSrc(original) : null;

    let out = tag;
    if (proxied) out = out.replace(/\bsrc\s*=\s*"[^"]*"/i, `src="${proxied}"`);

    const toPlaceholder = `this.onerror=null;this.src='${PLACEHOLDER_SRC}';this.alt='${PLACEHOLDER_ALT}'`;
    const handler = proxied
      ? `if(!this.dataset.f){this.dataset.f=1;this.src='${forAttr(original)}';return}${toPlaceholder}`
      : toPlaceholder;

    const extra = [`onerror="${handler}"`];
    if (!/\sstyle\s*=/i.test(tag)) extra.push('style="max-width:100%;height:auto"');
    if (!/\sloading\s*=/i.test(tag)) extra.push('loading="lazy"');
    return out.replace(/^<img\b/i, `<img ${extra.join(' ')}`);
  });
}

// Nama lama dipertahankan agar impor yang ada tetap berfungsi
export const withImageFallback = enhanceImages;
