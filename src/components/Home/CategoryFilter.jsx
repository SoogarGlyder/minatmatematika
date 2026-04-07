'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './CategoryFilter.module.css';

// Kategori disesuaikan dengan logika API Grid yang baru
const seriesTabs = [
  { id: 'terbaru', name: 'Terbaru' },
  { id: 'PU', name: 'Penalaran Umum (PU)' },
  { id: 'PK', name: 'Pengetahuan Kuantitatif (PK)' },
  { id: 'PM', name: 'Penalaran Matematika (PM)' },
  { id: 'PKS 10', name: 'PKS 10' },
  { id: 'PKS 11', name: 'PKS 11' },
  { id: 'PKS 12', name: 'PKS 12' },
];

export default function CategoryFilter({ activeTab, setActiveTab }) {
  const navRef = useRef(null);
  const [maskStyle, setMaskStyle] = useState({});

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