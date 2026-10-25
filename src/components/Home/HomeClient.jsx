// File: src/components/Home/HomeClient.jsx
'use client';

import React, { useState } from 'react';
import CategoryFilter from '@/components/Home/CategoryFilter';
import HomeGrid from '@/components/Home/HomeGrid';

export default function HomeClient({ topics }) {
  const [activeTab, setActiveTab] = useState('Penalaran Umum');

  return (
    <>
      <CategoryFilter activeTab={activeTab} setActiveTab={setActiveTab} />
      <HomeGrid topics={topics.filter((t) => t.category === activeTab)} />
    </>
  );
}
