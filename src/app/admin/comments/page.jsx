'use client';

import React, { useState, useEffect } from 'react';

export default function AdminComments() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/comments');
      const result = await res.json();
      if (result.success) setComments(result.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus komentar ini? Aksi ini tidak bisa dibatalkan.')) return;
    try {
      const res = await fetch(`/api/admin/comments?id=${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        fetchComments(); // Refresh data
      } else {
        alert('Gagal menghapus: ' + result.error);
      }
    } catch (err) {
      alert('Terjadi kesalahan sistem.');
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '10px' }}>Kurasi Komentar</h1>
      <p style={{ color: '#555', marginBottom: '20px' }}>Pantau dan hapus komentar yang tidak pantas dari pengunjung.</p>

      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
        {loading ? (
          <p>Memuat komentar...</p>
        ) : comments.length === 0 ? (
          <p style={{ color: '#888' }}>Belum ada komentar sama sekali.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee', background: '#fafafa' }}>
                <th style={{ padding: '12px' }}>Tanggal</th>
                <th style={{ padding: '12px' }}>Nama</th>
                <th style={{ padding: '12px' }}>Isi Komentar</th>
                <th style={{ padding: '12px' }}>Lokasi (Paket)</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {comments.map(c => (
                <tr key={c._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px', fontSize: '0.85rem', color: '#666' }}>
                    {new Date(c.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{c.name}</td>
                  <td style={{ padding: '12px', maxWidth: '300px' }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.4' }}>{c.content}</p>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ background: '#e0f2fe', color: '#0284c7', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      {c.paketSlug}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button 
                      onClick={() => handleDelete(c._id)} 
                      style={{ background: '#ff4d4f', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}