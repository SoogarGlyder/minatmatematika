'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider } from 'next-themes'; 
import { FontSizeProvider } from '@/contexts/FontSizeContext';

const GlobalContext = createContext();

export function Providers({ children }) {
  const [pageCategory, setPageCategory] = useState(null);
  const [dropdownCategory, setDropdownCategory] = useState(null);
  const [isListOpen, setIsListOpen] = useState(false);

  useEffect(() => {
    if (isListOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isListOpen]);

  const activeCategory = isListOpen ? dropdownCategory : pageCategory;

  const value = {
    pageCategory,
    setPageCategory,
    dropdownCategory,
    setDropdownCategory,
    isListOpen,
    setIsListOpen,
    activeCategory
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <FontSizeProvider>
        <GlobalContext.Provider value={value}>
          {children}
        </GlobalContext.Provider>
      </FontSizeProvider>
    </ThemeProvider>
  );
}

export const useGlobalContext = () => useContext(GlobalContext);