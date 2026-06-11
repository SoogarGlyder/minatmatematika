'use client';

import React, { useState, useEffect } from 'react';

export default function ArticleListAdmin({ onEditArticle, styles, refreshToggle }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, [refreshToggle]); // Refresh saat toggle berubah

  const fetchArticles = async () => {
    try {
      const res = await fetch('/api/articles');
      const data = await res.json();
      
      // Handle jika format respon berbeda (array atau object)
      if (Array.isArray(data)) {
        setArticles(data);
      } else if (data.articles) {
        setArticles(data.articles);
      } else {
        setArticles([]);
      }
    } catch (error) {
      console.error('Gagal mengambil artikel:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Yakin ingin menghapus artikel "${title}"?`)) return;

    try {
      const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Artikel dihapus.');
        fetchArticles(); // Refresh list
      } else {
        alert('Gagal menghapus.');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  if (loading) return <p>Memuat data artikel...</p>;

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.novelTable}>
        <thead>
          <tr>
            <th>Judul & Slug</th>
            <th>Tanggal</th>
            <th style={{ width: '150px' }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {articles.length === 0 ? (
            <tr><td colSpan="3" style={{textAlign:'center'}}>Belum ada artikel.</td></tr>
          ) : (
            articles.map((art) => (
              <tr key={art._id}>
                <td>
                  <strong>{art.title}</strong>
                  <br />
                  <small style={{ color: '#888' }}>/{art.slug}</small>
                  <br />
                  <small style={{ color: '#2196F3' }}>Tags: {Array.isArray(art.tags) ? art.tags.join(', ') : art.tags}</small>
                </td>
                <td>{art.date}</td>
                <td>
                  <button 
                    onClick={() => onEditArticle(art)}
                    style={{ 
                        marginRight: '5px', 
                        padding: '5px 10px', 
                        cursor: 'pointer',
                        backgroundColor: '#FFC107',
                        color: 'black',
                        border: 'none',
                        borderRadius: '4px',
                        fontWeight: 'bold'
                    }}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(art._id, art.title)}
                    style={{ 
                        padding: '5px 10px', 
                        cursor: 'pointer',
                        backgroundColor: '#F44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontWeight: 'bold'
                    }}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}