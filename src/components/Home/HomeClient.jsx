'use client';

import React, { useState } from 'react';
import CategoryFilter from './CategoryFilter';
import HomeGrid from './HomeGrid';

export default function HomeClient() {
  // PENTING: Default tab diubah menjadi 'terbaru' agar sinkron dengan API
  const [activeTab, setActiveTab] = useState('terbaru');

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
      
      {/* Mengirim status tab yang aktif ke komponen Grid bergaya Magazine */}
      <HomeGrid activeTab={activeTab} />
    </div>
  );
}