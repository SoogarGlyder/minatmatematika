// File: src/components/admin/TopicForm.jsx
import React, { useState, useEffect } from 'react';

// Pilihan kategori matematika kita
const categoryOptions = [
  { id: 'Penalaran Umum', name: 'Penalaran Umum' },
  { id: 'Penalaran Matematika', name: 'Penalaran Matematika' },
  { id: 'Pengetahuan Kuantitatif', name: 'Pengetahuan Kuantitatif' },
  { id: 'PKS Kelas 10', name: 'PKS Kelas 10' },
  { id: 'PKS Kelas 11', name: 'PKS Kelas 11' },
  { id: 'PKS Kelas 12', name: 'PKS Kelas 12' },
];

const initialFormState = {
  title: '',
  category: 'Penalaran Umum', 
  description: '',
  coverImage: '',
  slug: ''
};

function TopicForm({ topicToEdit, onSaveSuccess, styles }) {
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const isEditing = !!topicToEdit;

  useEffect(() => {
    if (topicToEdit) {
      setFormData({
        title: topicToEdit.title || '',
        category: topicToEdit.category || 'Penalaran Umum',
        description: topicToEdit.description || '',
        coverImage: topicToEdit.coverImage || '',
        slug: topicToEdit.slug || '',
        _id: topicToEdit._id
      });
    } else {
      setFormData(initialFormState);
    }
  }, [topicToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const method = isEditing ? 'PUT' : 'POST';
    // Arahkan ke API topics yang sudah kita buat
    const url = isEditing 
        ? `/api/topics/${formData._id}`
        : '/api/topics';

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Gagal menyimpan materi');
      }

      setSuccess(`Materi berhasil di${isEditing ? 'perbarui' : 'buat'}!`);
      
      if (!isEditing) {
        setFormData(initialFormState);
      }
      
      if (onSaveSuccess) {
        onSaveSuccess();
      }
      
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.novelForm}>
      {error && <p className={styles.error} style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
      {success && <p className={styles.success} style={{ color: 'green', marginBottom: '10px' }}>{success}</p>}

      <label htmlFor="title">Judul Materi</label>
      <input
        id="title"
        name="title"
        type="text"
        value={formData.title}
        onChange={handleChange}
        required
        placeholder="Contoh: Matriks dan Ruang Vektor"
      />

      <label htmlFor="category">Kategori</label>
      <select
        id="category"
        name="category"
        value={formData.category}
        onChange={handleChange}
        required
      >
        {categoryOptions.map(option => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
      
      <label htmlFor="slug">Slug URL (Unik)</label>
      <input
        id="slug"
        name="slug"
        type="text"
        value={formData.slug}
        onChange={handleChange}
        required
        placeholder="contoh: matriks-dan-vektor (tanpa spasi)"
        style={{ marginBottom: '5px' }}
      />
      <small style={{ display:'block', marginBottom:'15px', color:'#666' }}>
        Gunakan huruf kecil dan tanda strip (-). Jangan pakai spasi. URL ini akan menjadi link materi kamu.
      </small>

      <label htmlFor="coverImage">URL Gambar Sampul (Opsional)</label>
      <input
        id="coverImage"
        name="coverImage"
        type="text"
        value={formData.coverImage}
        onChange={handleChange}
        placeholder="https://..."
      />

      <label htmlFor="description">Deskripsi Singkat</label>
      <textarea
        id="description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        rows={6}
        placeholder="Tulis deskripsi singkat tentang materi ini..."
      />

      <button type="submit" disabled={loading} style={{ marginTop: '20px' }}>
        {loading ? 'Memproses...' : (isEditing ? 'Update Materi' : 'Simpan Materi')}
      </button>
    </form>
  );
}

export default TopicForm;