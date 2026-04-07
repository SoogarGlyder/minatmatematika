'use client';

import { useState, useEffect } from 'react';

// Hook khusus untuk memuat daftar paket soal di menu Dropdown Header
export function usePaketList(category) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!category) return; 

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/posts?category=${category}`);
        if (!response.ok) throw new Error('Gagal mengambil data materi');
        const data = await response.json();
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