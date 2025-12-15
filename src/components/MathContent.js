"use client"; // Wajib karena pakai useEffect

import { useEffect, useRef } from "react";
import "katex/dist/katex.min.css"; // Import gaya rumus (font matematika)
import renderMathInElement from "katex/dist/contrib/auto-render";

export default function MathContent({ content }) {
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      renderMathInElement(contentRef.current, {
        delimiters: [
          // Ini konfigurasi agar dia mengenali format WordPress kamu
          { left: "$latex", right: "$", display: false }, 
          { left: "$", right: "$", display: false }, // Jaga-jaga kalau ada format $ biasa
        ],
        throwOnError: false, // Kalau error, jangan bikin web crash, tampilkan saja kodenya
      });
    }
  }, [content]);

  return (
    <div 
      ref={contentRef}
      className="prose prose-lg max-w-none text-gray-800 leading-relaxed"
      // Kita masukkan HTML artikel di sini
      dangerouslySetInnerHTML={{ __html: content }} 
    />
  );
}