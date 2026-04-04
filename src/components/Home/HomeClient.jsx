'use client';

import React, { useState } from 'react';
import CategoryFilter from './CategoryFilter';
import HomeGrid from './HomeGrid';

export default function HomeClient({ initialPosts }) {
  // Default tab adalah 'semua'
  const [activeTab, setActiveTab] = useState('semua');

  // Logika filter instan (tanpa loading spinner)
  const filteredPosts = activeTab === 'semua' 
    ? initialPosts 
    : initialPosts.filter(post => post.categories && post.categories.includes(activeTab));

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
      <HomeGrid posts={filteredPosts} />
    </div>
  );
}