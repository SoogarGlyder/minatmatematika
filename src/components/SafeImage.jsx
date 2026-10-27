// File: src/components/SafeImage.jsx
// Pengganti next/image untuk gambar isi konten: jika gagal dimuat, tampilkan placeholder.
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { PLACEHOLDER_SRC, PLACEHOLDER_ALT } from '@/lib/imageFallback';

export default function SafeImage({ src, alt, ...props }) {
  const [failed, setFailed] = useState(false);

  return (
    <Image
      {...props}
      src={failed || !src ? PLACEHOLDER_SRC : src}
      alt={failed || !src ? PLACEHOLDER_ALT : alt}
      onError={() => setFailed(true)}
    />
  );
}
