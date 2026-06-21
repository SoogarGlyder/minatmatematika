// File: src/components/FloatingSettings.jsx
'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useFontSize } from '@/contexts/FontSizeContext';
import { FaPlus, FaMinus, FaCog, FaSun, FaMoon, FaRedoAlt } from 'react-icons/fa'; 
import styles from './FloatingSettings.module.css';

export default function FloatingSettings() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const { setTheme, resolvedTheme } = useTheme();
  const { changeFontSize, resetFontSize } = useFontSize();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const toggleMenu = () => setIsOpen(!isOpen);
  
  const toggleTheme = () => {
    if (resolvedTheme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  return (
    <div className={`${styles.container} ${isOpen ? styles.active : ''}`}>
      
      {/* Tombol 1: Pengaturan Utama */}
      <button 
        className={`${styles.mainBtn} ${isOpen ? styles.open : ''}`} 
        onClick={toggleMenu}
        aria-label="Pengaturan"
      >
        <FaCog /> 
      </button>

      {/* Tombol 2: Tema */}
      <button 
        className={styles.actionBtn}
        onClick={toggleTheme}
        title="Ganti Tema"
        aria-label="Ganti Tema"
        style={{ fontSize: 'smaller' }}
      >
        {resolvedTheme === 'dark' ? <FaSun /> : <FaMoon />}
      </button>

      {/* Tombol 3: Kecilkan Huruf */}
      <button 
        className={styles.actionBtn}
        onClick={() => changeFontSize(-1)}
        title="Kecilkan Huruf"
        aria-label="Kecilkan Huruf"
        style={{ fontSize: '0.9rem' }}
      >
        <FaMinus />
      </button>

      {/* Tombol 4: Reset Huruf */}
      <button 
        className={styles.actionBtn}
        onClick={resetFontSize}
        title="Reset Ukuran Huruf"
        aria-label="Reset Ukuran Huruf"
        style={{ fontSize: '0.85rem' }}
      >
        <FaRedoAlt />
      </button>

      {/* Tombol 5: Besarkan Huruf */}
      <button 
        className={styles.actionBtn}
        onClick={() => changeFontSize(1)}
        title="Besarkan Huruf"
        aria-label="Besarkan Huruf"
        style={{ fontSize: '0.9rem' }}
      >
        <FaPlus />
      </button>

      {/* --- PANEL BARU: Kotak Saweria --- */}
      <div className={styles.saweriaPanel}>
        <span className={styles.saweriaTitle}>Dukung Kami Yuk!</span>
        <a href="https://saweria.co/SoogarGlyder" target="_blank" rel="noreferrer">
          <img className={styles.saweriaImg} src="/saweria.png" alt="QR Code Saweria"/>
        </a>
      </div>

    </div>
  );
}