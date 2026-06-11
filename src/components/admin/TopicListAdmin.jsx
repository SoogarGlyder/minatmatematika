// File: src/components/admin/TopicListAdmin.jsx
import React, { useState, useEffect, useMemo } from 'react';

function TopicListAdmin({ onEditTopic, styles }) {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshToggle, setRefreshToggle] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'title', direction: 'ascending' });

  useEffect(() => {
    const fetchAllTopics = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/topics'); 
            if (!response.ok) throw new Error('Gagal mengambil data materi.');
            
            const data = await response.json();
            const list = Array.isArray(data) ? data : (data.data || []);
            setTopics(list);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    fetchAllTopics();
  }, [refreshToggle]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Yakin hapus materi "${title}"? SEMUA PAKET SOAL DI DALAMNYA JUGA AKAN ERROR! Hapus paket soalnya terlebih dahulu.`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/topics/${id}`, { method: 'DELETE' });
      
      if(!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal hapus");
      }
      
      setRefreshToggle(prev => !prev); 
      alert(`Materi "${title}" berhasil dihapus.`);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const processedTopics = useMemo(() => {
    let items = [...topics];

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      items = items.filter(item => 
        (item.title || '').toLowerCase().includes(lowerSearch) ||
        (item.category || '').toLowerCase().includes(lowerSearch) ||
        (item.slug || '').toLowerCase().includes(lowerSearch)
      );
    }

    if (sortConfig.key) {
      items.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        
        if (sortConfig.key === 'last_updated' || sortConfig.key === 'createdAt') {
            valA = new Date(valA).getTime();
            valB = new Date(valB).getTime();
        }

        if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [topics, searchTerm, sortConfig]);

  const getSortIcon = (name) => {
    if (sortConfig.key !== name) return '↕';
    return sortConfig.direction === 'ascending' ? '↑' : '↓';
  };

  if (loading && topics.length === 0) return <p>Memuat data materi...</p>;

  return (
    <div className={styles.tableWrapper}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
        <input 
          type="text" 
          placeholder="Cari Judul / Kategori..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '8px', width: '300px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <button 
          onClick={() => setRefreshToggle(prev => !prev)}
          disabled={loading}
          style={{ cursor:'pointer', padding: '8px 15px' }}
        >
          Refresh Data
        </button>
      </div>

      <table className={styles.novelTable}>
        <thead>
          <tr>
            <th onClick={() => requestSort('title')} style={{cursor:'pointer'}}>
              Judul Materi {getSortIcon('title')}
            </th>
            <th onClick={() => requestSort('category')} style={{cursor:'pointer'}}>
              Kategori {getSortIcon('category')}
            </th>
            <th onClick={() => requestSort('slug')} style={{cursor:'pointer'}}>
              Slug URL {getSortIcon('slug')}
            </th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {processedTopics.length > 0 ? (
            processedTopics.map((topic) => (
              <tr key={topic._id}>
                <td>{topic.title}</td>
                <td>{topic.category}</td>
                <td>{topic.slug}</td>
                <td>
                  <button 
                    onClick={() => onEditTopic(topic)}
                    style={{ marginRight: '5px', backgroundColor: '#ffd700', color: '#333', border:'none', padding:'5px 10px', borderRadius:'4px', cursor:'pointer' }}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(topic._id, topic.title)}
                    style={{ backgroundColor: '#ff6347', color: 'white', border:'none', padding:'5px 10px', borderRadius:'4px', cursor:'pointer' }}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="4" style={{textAlign:'center'}}>Tidak ada data ditemukan.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TopicListAdmin;