// File: src/app/page.jsx
'use client';

import React, { useState } from 'react';
import CategoryFilter from '@/components/Home/CategoryFilter';
import HomeGrid from '@/components/Home/HomeGrid';

export default function HomePage() {
  // Kita ubah nilai awal tab yang aktif menjadi 'Penalaran Umum'
  const [activeTab, setActiveTab] = useState('Penalaran Umum');

  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      paddingBottom: '20px'
    }}>
      <CategoryFilter 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />
      {/* HomeGrid akan menerima nama kategori dan mengambil data dari API */}
      <HomeGrid activeSerie={activeTab} />
    </div>
  );
}