'use client';

import React, { useState, useEffect } from 'react';

export default function AdminMateri() {
  const [materis, setMateris] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // State baru untuk melacak apakah sedang mode edit
  const [editingId, setEditingId] = useState(null); 
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    parentMenu: 'PU', 
    description: '',
    coverImage: ''
  });

  const fetchMateris = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/materi');
      const result = await res.json();
      if (result.success) setMateris(result.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMateris();
  }, []);

  // --- FUNGSI MASUK MODE EDIT ---
  const handleEditMode = (m) => {
    setEditingId(m._id);
    setFormData({
      name: m.name,
      slug: m.slug,
      parentMenu: m.parentMenu,
      description: m.description,
      coverImage: m.coverImage || ''
    });
    // Gulir layar ke atas agar form terlihat
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  // --- FUNGSI BATAL EDIT ---
  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: '', slug: '', parentMenu: 'PU', description: '', coverImage: '' });
  };

  // Fungsi simpan data (Create / Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Tentukan metode: PUT jika edit, POST jika baru
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { ...formData, id: editingId } : formData;

      const res = await fetch('/api/admin/materi', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const result = await res.json();
      
      if (result.success) {
        alert(editingId ? 'Materi berhasil diupdate!' : 'Materi berhasil ditambahkan!');
        handleCancel(); // Bersihkan form dan kembali ke mode normal
        fetchMateris(); // Refresh tabel
      } else {
        alert('Gagal: ' + result.error);
      }
    } catch (err) {
      alert('Terjadi kesalahan sistem.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus materi ini? Semua paket soal yang terhubung mungkin akan kehilangan induknya.')) return;
    
    try {
      const res = await fetch(`/api/admin/materi?id=${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        fetchMateris();
      } else {
        alert('Gagal menghapus: ' + result.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '20px' }}>
        {editingId ? '📝 Edit Data Materi' : 'Kelola Data Materi'}
      </h1>
      
      <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        
        {/* FORM INPUT MATERI */}
        <div style={{ flex: '1 1 350px', background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>
            {editingId ? 'Update Materi' : 'Tambah Materi Baru'}
          </h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>Nama Materi / Topik</label>
              <input type="text" required placeholder="Contoh: Penalaran Logis" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>Slug (URL) - Boleh dikosongkan</label>
              <input type="text" placeholder="otomatis-dibuat-jika-kosong" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>Masuk di Tab Menu Mana?</label>
              <select value={formData.parentMenu} onChange={e => setFormData({...formData, parentMenu: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
                <option value="PU">Penalaran Umum (PU)</option>
                <option value="PK">Pengetahuan Kuantitatif (PK)</option>
                <option value="PM">Penalaran Matematika (PM)</option>
                <option value="PKS 10">PKS 10</option>
                <option value="PKS 11">PKS 11</option>
                <option value="PKS 12">PKS 12</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>Link Gambar Cover</label>
              <input type="url" placeholder="https://..." value={formData.coverImage} onChange={e => setFormData({...formData, coverImage: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>Deskripsi Materi (Bisa pakai tag HTML dasar)</label>
              <textarea required rows="4" placeholder="Deskripsi singkat materi ini..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', resize: 'vertical' }}></textarea>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" disabled={submitting} style={{ background: editingId ? '#28a745' : '#111', color: 'white', padding: '12px', border: 'none', borderRadius: '4px', cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: 'bold', flex: 1 }}>
                {submitting ? 'Menyimpan...' : editingId ? 'Update Materi' : '+ Simpan Materi'}
              </button>
              
              {/* Tombol Batal hanya muncul saat mode edit */}
              {editingId && (
                <button type="button" onClick={handleCancel} style={{ background: '#888', color: 'white', padding: '12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Batal
                </button>
              )}
            </div>
          </form>
        </div>

        {/* TABEL DATA MATERI */}
        <div style={{ flex: '2 1 500px', background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>Daftar Materi Aktif</h2>
          
          {loading ? <p>Memuat data...</p> : materis.length === 0 ? <p style={{ color: '#888' }}>Belum ada materi. Silakan buat di sebelah kiri.</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eee' }}>
                  <th style={{ padding: '10px' }}>Tab</th>
                  <th style={{ padding: '10px' }}>Nama Materi</th>
                  <th style={{ padding: '10px' }}>Slug</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {materis.map(m => (
                  <tr key={m._id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px' }}><span style={{ background: '#f0f0f0', padding: '3px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>{m.parentMenu}</span></td>
                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{m.name}</td>
                    <td style={{ padding: '10px', color: '#666', fontSize: '0.9rem' }}>{m.slug}</td>
                    <td style={{ padding: '10px', textAlign: 'center', display: 'flex', gap: '5px', justifyContent: 'center' }}>
                      <button onClick={() => handleEditMode(m)} style={{ background: '#0070f3', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Edit</button>
                      <button onClick={() => handleDelete(m._id)} style={{ background: '#ff4d4f', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}