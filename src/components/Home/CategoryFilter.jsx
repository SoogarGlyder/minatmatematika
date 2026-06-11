// File: src/components/Home/CategoryFilter.jsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './CategoryFilter.module.css';

// Di sinilah kita mendefinisikan kategori matematika baru kita
const seriesTabs = [
  { id: 'Penalaran Umum', name: 'Penalaran Umum' },
  { id: 'Penalaran Matematika', name: 'Penalaran Matematika' },
  { id: 'Pengetahuan Kuantitatif', name: 'Pengetahuan Kuantitatif' },
  { id: 'PKS Kelas 10', name: 'PKS Kelas 10' },
  { id: 'PKS Kelas 11', name: 'PKS Kelas 11' },
  { id: 'PKS Kelas 12', name: 'PKS Kelas 12' },
];

export default function CategoryFilter({ activeTab, setActiveTab }) {
  const navRef = useRef(null);
  const [maskStyle, setMaskStyle] = useState({});

  // Fungsi ini membiarkan efek bayangan saat kategori di-scroll di HP
  const updateMask = () => {
    const el = navRef.current;
    if (!el) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const isAtStart = scrollLeft <= 0;
    const isAtEnd = scrollWidth - scrollLeft - clientWidth <= 1;
    let maskImage = '';

    if (window.innerWidth > 1023) {
      maskImage = '';
    } else if (isAtStart) {
      maskImage = 'linear-gradient(to right, black 85%, transparent 100%)';
    } else if (isAtEnd) {
      maskImage = 'linear-gradient(to right, transparent 0%, black 15%)'; 
    } else {
      maskImage = 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)';
    }

    setMaskStyle({
      maskImage: maskImage,
      WebkitMaskImage: maskImage
    });
  };

  useEffect(() => {
    updateMask();
    window.addEventListener('resize', updateMask);
    return () => window.removeEventListener('resize', updateMask);
  }, []);

  return (
    <div className={styles.wrapper}>
      <div 
        className={styles.filterContainer}
        ref={navRef}
        onScroll={updateMask}
        style={maskStyle}
      >
        {seriesTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${styles.filterItem} ${isActive ? styles.active : ''}`}
            >
              {tab.name}
            </div>
          );
        })}
      </div>
    </div>
  );
}