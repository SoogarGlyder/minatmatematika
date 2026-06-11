'use client';

import { useState, useEffect } from 'react';

// ==========================================
// JURUS CACHING SISI KLIEN (IN-MEMORY)
// Menyimpan data dropdown agar tidak fetch berkali-kali
// ==========================================
const globalDropdownCache = {};

export function usePaketList(category) {
  // Jika data sudah ada di cache, langsung gunakan sebagai state awal
  const [posts, setPosts] = useState(globalDropdownCache[category] || []);
  // Jika sudah ada di cache, tidak perlu loading lagi
  const [loading, setLoading] = useState(!globalDropdownCache[category]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!category) return; 

      // Cek brankas: Kalau data sudah ada, langsung berhenti, jangan fetch API!
      if (globalDropdownCache[category]) {
        setPosts(globalDropdownCache[category]);
        setLoading(false);
        return; 
      }

      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/posts?category=${category}`);
        if (!response.ok) throw new Error('Gagal mengambil data materi');
        
        const data = await response.json();
        
        // Simpan data ke brankas cache agar selanjutnya instan
        globalDropdownCache[category] = data;
        setPosts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, [category]);

  return { posts, loading, error };
}