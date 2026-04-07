'use client';

import React, { useState, useEffect, useRef } from 'react';
import MathContent from '@/components/MathContent'; // <-- IMPORT MATHCONTENT UNTUK PREVIEW

export default function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // State untuk melacak mode edit
  const [editingId, setEditingId] = useState(null);
  
  // Ref untuk mendeteksi posisi kursor di textarea
  const textareaRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    categories: '', 
    featuredImage: '',
    content: '',
    publishDate: new Date().toISOString().split('T')[0],
    status: 'publish' // <-- Default status
  });

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/posts');
      const result = await res.json();
      if (result.success) setPosts(result.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPosts(); }, []);

  // --- FUNGSI MASUK MODE EDIT ---
  const handleEditMode = (p) => {
    setEditingId(p._id);
    setFormData({
      title: p.title,
      slug: p.slug,
      categories: p.categories?.join(', ') || '',
      featuredImage: p.featuredImage || '',
      content: p.content,
      // Format tanggal agar sesuai input date (YYYY-MM-DD)
      publishDate: p.publishDate ? p.publishDate.split('T')[0] : new Date().toISOString().split('T')[0],
      status: p.status || 'publish' // <-- Ambil status lama
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- FUNGSI BATAL EDIT ---
  const handleCancel = () => {
    setEditingId(null);
    setFormData({ 
      title: '', slug: '', categories: '', featuredImage: '', content: '', 
      publishDate: new Date().toISOString().split('T')[0], status: 'publish' 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const categoriesArr = formData.categories.split(',').map(c => c.trim());
      
      const bodyToSend = editingId 
        ? { ...formData, categories: categoriesArr, id: editingId } 
        : { ...formData, categories: categoriesArr };

      const res = await fetch('/api/admin/posts', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyToSend)
      });
      const result = await res.json();
      
      if (result.success) {
        alert(editingId ? 'Paket Soal diupdate!' : 'Paket Soal berhasil terbit!');
        handleCancel();
        fetchPosts();
      } else {
        alert('Error: ' + result.error);
      }
    } catch (err) { alert('Sistem Error'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus paket soal ini?')) return;
    await fetch(`/api/admin/posts?id=${id}`, { method: 'DELETE' });
    fetchPosts();
  };

  // ==========================================
  // JURUS AJAIB: INSERT TEMPLATE DI KURSOR
  // ==========================================
  const insertTemplate = (templateText) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentContent = formData.content;

    // Menyisipkan teks tepat di mana kursor berada
    const newContent = currentContent.substring(0, start) + templateText + currentContent.substring(end);
    
    setFormData({ ...formData, content: newContent });

    // Mengembalikan fokus dan menaruh kursor setelah teks yang baru disisipkan
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + templateText.length;
    }, 0);
  };

  const templates = {
    soal: `\n## Soal No. X\n\nTeks soal di sini...\n\nA. Opsi 1  \nB. Opsi 2  \nC. Opsi 3  \nD. Opsi 4  \nE. Opsi 5  \n\n<details>\n<summary><b>Pembahasan No. X</b></summary>\n\nPembahasan di sini...\n\n**Jadi jawabannya adalah ( )**\n</details>\n`,
    rumus: `\n$$\n\\begin{aligned}\n\\text{Teks} &= x \\\\\n&= y\n\\end{aligned}\n$$\n`,
    tabel: `\n| P | Q |\n|---|---|\n| $x$ | $y$ |\n`,
    iklan: `\n<ins style="display:block" data-ad-client="ca-pub-XXXXXXXXX" data-ad-slot="XXXXXXX" data-ad-format="auto" data-full-width-responsive="true"></ins>\n`,
    tebal: `**Teks Tebal**`,
    miring: `*Teks Miring*`
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '20px' }}>
        {editingId ? '📝 Edit Paket Soal' : 'Kelola Paket Soal'}
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* FORM INPUT UTAMA */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>
            {editingId ? 'Update Paket' : 'Buat Paket Baru'}
          </h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            {/* GRID 2 KOLOM UNTUK INPUT DASAR AGAR HEMAT TEMPAT */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <input type="text" placeholder="Judul (Contoh: Paket 01 - Penalaran Logis)" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={inputStyle} />
              </div>
              
              <div>
                <input type="text" placeholder="Kategori Materi (Harus sama dengan Nama Materi)" required value={formData.categories} onChange={e => setFormData({...formData, categories: e.target.value})} style={inputStyle} />
                <small style={{ color: '#888', display: 'block', marginTop: '5px' }}>*Gunakan koma jika lebih dari satu</small>
              </div>

              <div>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={inputStyle}>
                  <option value="publish">Publikasi (Publish)</option>
                  <option value="draft">Sembunyikan (Draft)</option>
                </select>
              </div>

              <div>
                <input type="text" placeholder="URL Gambar Cover (Featured Image)" value={formData.featuredImage} onChange={e => setFormData({...formData, featuredImage: e.target.value})} style={inputStyle} />
              </div>
            </div>
            
            {/* AREA SPLIT SCREEN: KIRI (EDITOR) - KANAN (PREVIEW) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '10px' }}>
              
              {/* SISI KIRI: TOOLBAR & TEXTAREA */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ border: '1px solid #ddd', borderBottom: 'none', padding: '10px', borderRadius: '6px 6px 0 0', background: '#f8f9fa', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold', width: '100%', marginBottom: '5px', color: '#555' }}>Cepat Sisipkan (Toolbar):</span>
                  <button type="button" onClick={() => insertTemplate(templates.soal)} style={toolbarBtnStyle}>📝 +Soal</button>
                  <button type="button" onClick={() => insertTemplate(templates.tabel)} style={toolbarBtnStyle}>📊 +Tabel PK</button>
                  <button type="button" onClick={() => insertTemplate(templates.rumus)} style={toolbarBtnStyle}>🧮 +Rumus (=)</button>
                  <button type="button" onClick={() => insertTemplate(templates.iklan)} style={toolbarBtnStyle}>💰 +Slot Iklan</button>
                </div>
                <textarea 
                  ref={textareaRef}
                  rows="25" 
                  placeholder="Tulis soal & pembahasan di sini. Gunakan Markdown dan $...$ untuk rumus." 
                  required 
                  value={formData.content} 
                  onChange={e => setFormData({...formData, content: e.target.value})} 
                  style={{...inputStyle, fontFamily: 'monospace', borderRadius: '0 0 6px 6px', resize: 'vertical'}}
                ></textarea>
              </div>

              {/* SISI KANAN: LIVE PREVIEW */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ border: '1px solid #ddd', borderBottom: 'none', padding: '10px', borderRadius: '6px 6px 0 0', background: '#e3f2fd', color: '#0d47a1', display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>👁️ Live Preview (Hasil Akhir)</span>
                </div>
                {/* Class "global-content" ditambahkan agar gaya CSS paragraf/tabel teraplikasi */}
                <div className="global-content" style={{ border: '1px solid #ddd', borderRadius: '0 0 6px 6px', padding: '20px', height: '100%', minHeight: '400px', maxHeight: '550px', overflowY: 'auto', background: '#fff' }}>
                  {formData.content ? (
                    <MathContent content={formData.content} />
                  ) : (
                    <div style={{ color: '#aaa', textAlign: 'center', marginTop: '100px', fontStyle: 'italic' }}>
                      Ketik sesuatu di kotak sebelah kiri, maka hasilnya akan langsung muncul di sini...
                    </div>
                  )}
                </div>
              </div>

            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
              <div style={{ flex: '1' }}>
                <label style={{ fontSize: '0.85rem', color: '#555', display: 'block', marginBottom: '5px' }}>Tanggal Publish</label>
                <input type="date" value={formData.publishDate} onChange={e => setFormData({...formData, publishDate: e.target.value})} style={inputStyle} />
              </div>
              <div style={{ flex: '2', display: 'flex', gap: '10px', marginTop: '22px' }}>
                <button type="submit" disabled={submitting} style={{...btnStyle, background: editingId ? '#28a745' : '#0070f3'}}>
                  {submitting ? 'Memproses...' : editingId ? 'Update Paket' : '🚀 Simpan Paket Soal'}
                </button>
                {editingId && (
                  <button type="button" onClick={handleCancel} style={{ ...btnStyle, background: '#888', flex: 'none', padding: '15px 20px' }}>Batal</button>
                )}
              </div>
            </div>

          </form>
        </div>

        {/* LIST POSTS (PINDAH KE BAWAH AGAR AREA KETIK LEBIH LUAS) */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Daftar Paket Terbit / Draft</h2>
          {loading ? <p>Loading...</p> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
              {posts.map(p => (
                <div key={p._id} style={{ padding: '15px', border: '1px solid #eee', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '10px', background: '#fafafa' }}>
                  <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {p.title}
                    {p.status === 'draft' && (
                      <span style={{ fontSize: '0.7rem', background: '#ffc107', color: '#000', padding: '2px 6px', borderRadius: '4px' }}>Draft</span>
                    )}
                  </h4>
                  <small style={{ color: '#0070f3' }}>{p.categories?.join(', ')}</small>
                  <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                    <button onClick={() => handleEditMode(p)} style={{ color: '#0070f3', border: '1px solid #0070f3', padding: '5px', borderRadius: '4px', background: 'none', cursor: 'pointer', flex: 1, fontWeight: 'bold' }}>Edit</button>
                    <button onClick={() => handleDelete(p._id)} style={{ color: 'red', border: '1px solid red', padding: '5px', borderRadius: '4px', background: 'none', cursor: 'pointer', flex: 1 }}>Hapus</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem', boxSizing: 'border-box' };
const btnStyle = { color: 'white', padding: '15px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', flex: 1 };
const toolbarBtnStyle = { background: '#fff', border: '1px solid #ccc', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' };