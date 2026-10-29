// File: src/components/SafeImage.jsx
// Pengganti next/image untuk gambar isi konten. Tidak pernah membuat halaman error:
//  - src tidak valid atau masih berupa penanda (mis. "URL_GAMBAR_ANDA_DISINI") -> placeholder
//  - host yang belum terdaftar di remotePatterns -> dimuat apa adanya
//  - gambar gagal dimuat -> placeholder
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { PLACEHOLDER_SRC, PLACEHOLDER_ALT, resolveImageSource } from '@/lib/imageFallback';

export default function SafeImage({ src, alt, unoptimized, ...props }) {
  const [failed, setFailed] = useState(false);

  const resolved = resolveImageSource(failed ? PLACEHOLDER_SRC : src);
  const isPlaceholder = failed || !resolved.valid || resolved.src === PLACEHOLDER_SRC;

  return (
    <Image
      {...props}
      src={resolved.src}
      alt={isPlaceholder ? PLACEHOLDER_ALT : alt}
      unoptimized={Boolean(unoptimized) || resolved.unoptimized}
      onError={() => setFailed(true)}
    />
  );
}
