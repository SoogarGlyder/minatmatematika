'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const FontSizeContext = createContext();

const DEFAULT_SIZE = 18; 

export function FontSizeProvider({ children }) {
  const [fontSize, setFontSize] = useState(DEFAULT_SIZE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedSize = localStorage.getItem('novel-font-size');
    if (savedSize) {
      setFontSize(parseInt(savedSize));
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('novel-font-size', fontSize);
      document.documentElement.style.setProperty('--novel-font-size', `${fontSize}px`);
    }
  }, [fontSize, mounted]);

  const changeFontSize = (increment) => {
    setFontSize((prev) => {
      const newSize = prev + increment;
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