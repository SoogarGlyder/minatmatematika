// File: src/components/admin/CommentListAdmin.jsx
import React, { useState, useEffect } from 'react';

function CommentListAdmin({ styles }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshToggle, setRefreshToggle] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/comments/all');
        
        if (!res.ok) {
           throw new Error(`Gagal mengambil data (Status: ${res.status})`);
        }

        const data = await res.json();
        
        if (Array.isArray(data)) {
            setComments(data);
        } else if (data.data) {
            setComments(data.data);
        } else {
            setComments([]);
        }
      } catch (err) {
        console.error("Error loading comments:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [refreshToggle]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Hapus komentar dari "${name}"? Tindakan ini permanen.`)) return;

    try {
      const res = await fetch(`/api/comments/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Gagal menghapus');
      
      alert('Komentar dihapus.');
      setRefreshToggle(prev => !prev); 
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading && comments.length === 0) return <p>Memuat komentar...</p>;
  if (error) return <p style={{color:'red'}}>Gagal memuat komentar: {error}. <br/>Pastikan file <code>src/app/api/comments/all/route.js</code> sudah dibuat.</p>;

  return (
    <div className={styles.tableWrapper}>
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'15px'}}>
        <h3>Daftar Komentar Terbaru (Max 100)</h3>
        <button onClick={() => setRefreshToggle(p => !p)} style={{cursor:'pointer', padding:'5px 15px'}}>
           Refresh
        </button>
      </div>

      <table className={styles.novelTable}>
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Nama</th>
            <th>Isi Komentar</th>
            <th>Lokasi (Slug)</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {comments.length > 0 ? (
            comments.map((c) => (
              <tr key={c._id}>
                <td style={{ fontSize: '0.85rem', width: '120px' }}>
                  {new Date(c.createdAt).toLocaleDateString('id-ID')} <br/>
                  {new Date(c.createdAt).toLocaleTimeString('id-ID')}
                </td>
                <td style={{ fontWeight: 'bold', width: '150px' }}>{c.name}</td>
                <td>
                    {c.content}
                </td>
                {/* Di sini kita mengubah novelSlug menjadi topicSlug dan chapterSlug menjadi paketSlug */}
                <td style={{ fontSize: '0.8rem', color: '#666', width: '150px' }}>
                    {c.topicSlug} <br/> / {c.paketSlug}
                </td>
                <td style={{ width: '80px', textAlign: 'center' }}>
                  <button 
                    onClick={() => handleDelete(c._id, c.name)}
                    style={{ 
                        backgroundColor: '#ff4d4d', 
                        color: 'white', 
                        border:'none', 
                        padding:'5px 10px', 
                        borderRadius:'4px', 
                        cursor:'pointer' 
                    }}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="5" style={{textAlign:'center', padding:'20px'}}>Belum ada komentar masuk.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default CommentListAdmin;