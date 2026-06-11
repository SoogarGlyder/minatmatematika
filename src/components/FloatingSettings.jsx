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
      <button 
        className={`${styles.mainBtn} ${isOpen ? styles.open : ''}`} 
        onClick={toggleMenu}
        aria-label="Pengaturan"
      >
        <FaCog /> 
      </button>

      <button 
        className={styles.actionBtn}
        onClick={toggleTheme}
        title="Ganti Tema"
        aria-label="Ganti Tema"
        style={{ fontSize: 'smaller' }}
      >
        {resolvedTheme === 'dark' ? <FaSun /> : <FaMoon />}
      </button>

      <button 
        className={styles.actionBtn}
        onClick={() => changeFontSize(-1)}
        title="Kecilkan Huruf"
        aria-label="Kecilkan Huruf"
        style={{ fontSize: '0.9rem' }}
      >
        <FaMinus />
      </button>

      <button 
        className={styles.actionBtn}
        onClick={resetFontSize}
        title="Reset Ukuran Huruf"
        aria-label="Reset Ukuran Huruf"
        style={{ fontSize: '0.85rem' }}
      >
        <FaRedoAlt />
      </button>

      <button 
        className={styles.actionBtn}
        onClick={() => changeFontSize(1)}
        title="Besarkan Huruf"
        aria-label="Besarkan Huruf"
        style={{ fontSize: '0.9rem' }}
      >
        <FaPlus />
      </button>

    </div>
  );
}