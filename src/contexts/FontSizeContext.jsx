'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const FontSizeContext = createContext();

const DEFAULT_SIZE = 18; 

export function FontSizeProvider({ children }) {
  const [fontSize, setFontSize] = useState(DEFAULT_SIZE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
<<<<<<< HEAD
    const savedSize = localStorage.getItem('novel-font-size');
=======
    // Mengambil memori ukuran huruf terakhir yang dipakai pengunjung
    const savedSize = localStorage.getItem('mm-font-size');
>>>>>>> a580d16725eebfdfebc9db385bbf2840d80e1b9b
    if (savedSize) {
      setFontSize(parseInt(savedSize));
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
<<<<<<< HEAD
      localStorage.setItem('novel-font-size', fontSize);
      document.documentElement.style.setProperty('--novel-font-size', `${fontSize}px`);
=======
      localStorage.setItem('mm-font-size', fontSize);
      // Menyuntikkan variabel CSS global agar bisa dibaca oleh MathContent
      document.documentElement.style.setProperty('--math-font-size', `${fontSize}px`);
>>>>>>> a580d16725eebfdfebc9db385bbf2840d80e1b9b
    }
  }, [fontSize, mounted]);

  const changeFontSize = (increment) => {
    setFontSize((prev) => {
      const newSize = prev + increment;
<<<<<<< HEAD
=======
      // Batas aman ukuran font agar layout tidak hancur
>>>>>>> a580d16725eebfdfebc9db385bbf2840d80e1b9b
      if (newSize < 12) return 12;
      if (newSize > 30) return 30;
      return newSize;
    });
  };

  const resetFontSize = () => {
    setFontSize(DEFAULT_SIZE);
  };

  return (
    <FontSizeContext.Provider value={{ fontSize, changeFontSize, resetFontSize }}>
      {children}
    </FontSizeContext.Provider>
  );
}

export const useFontSize = () => useContext(FontSizeContext);