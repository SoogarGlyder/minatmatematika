// File: src/components/admin/PaketListAdmin.jsx
import React, { useState, useEffect, useMemo } from 'react';

function PaketListAdmin({ onEditPaket, refreshToggle, styles }) {
  const [packets, setPackets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'topic_title', direction: 'ascending' });

  useEffect(() => {
    const fetchAllPackets = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/packets'); 
            const data = await res.json();
            
            if (Array.isArray(data)) {
                setPackets(data);
            } else if (data.data && Array.isArray(data.data)) {
                setPackets(data.data);
            } else {
                setPackets([]);
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    fetchAllPackets();
  }, [refreshToggle]); 

  const handleDelete = async (paketId, title) => {
    if (!window.confirm(`Hapus paket soal "${title}"?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/packets/${paketId}`, { method: 'DELETE' });
      if(!res.ok) throw new Error("Gagal menghapus paket");
      
      setPackets(prev => prev.filter(p => p._id !== paketId));
      alert(`Paket soal dihapus.`);
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

  const processedPackets = useMemo(() => {
    let items = [...packets];

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      items = items.filter(item => 
        (item.title || '').toLowerCase().includes(lowerSearch) ||
        (item.topic?.title || '').toLowerCase().includes(lowerSearch) ||
        String(item.paket_number).includes(lowerSearch)
      );
    }

    if (sortConfig.key) {
      items.sort((a, b) => {
        let valA, valB;

        if (sortConfig.key === 'topic_title') {
            valA = a.topic?.title || '';
            valB = b.topic?.title || '';
        } else {
            valA = a[sortConfig.key];
            valB = b[sortConfig.key];
        }

        if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [packets, searchTerm, sortConfig]);

  const getSortIcon = (name) => {
    if (sortConfig.key !== name) return '↕';
    return sortConfig.direction === 'ascending' ? '↑' : '↓';
  };

  if (loading && packets.length === 0) return <p>Memuat data Paket Soal...</p>;
  if (error) return <p className={styles.error}>Error: {error}</p>;

  return (
    <div className={styles.tableWrapper}>
        <div style={{ alignItems: 'center', marginBottom: '15px' }}>
             <input 
                type="text" 
                placeholder="Cari Judul Paket / Materi..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                    padding: '8px', 
                    width: '300px', 
                    border: '1px solid #ccc', 
                    borderRadius: '4px' 
                }}
            />
        </div>
        
        <table className={styles.novelTable}>
        <thead>
            <tr>
                <th onClick={() => requestSort('paket_number')} style={{cursor:'pointer', width:'80px'}}>
                    No Urut {getSortIcon('paket_number')}
                </th>
                <th onClick={() => requestSort('title')} style={{cursor:'pointer'}}>
                    Judul Paket {getSortIcon('title')}
                </th>
                <th onClick={() => requestSort('topic_title')} style={{cursor:'pointer'}}>
                    Materi Induk {getSortIcon('topic_title')}
                </th>
                <th>Slug</th>
                <th>Aksi</th>
            </tr>
        </thead>
        <tbody>
            {processedPackets.length > 0 ? (
                processedPackets.map((packet) => (
                    <tr key={packet._id}>
                        <td>{packet.paket_number}</td> 
                        <td>{packet.title}</td>
                        <td>{packet.topic?.title || <span style={{color:'red'}}>N/A</span>}</td> 
                        <td>{packet.paket_slug}</td>
                        <td>
                            <button 
                                onClick={() => onEditPaket(packet)} 
                                style={{ marginRight: '5px', backgroundColor: '#ffd700', color: '#333', border:'none', padding:'5px 10px', borderRadius:'4px', cursor:'pointer' }}
                            >
                                Edit
                            </button>
                            <button 
                                onClick={() => handleDelete(packet._id, packet.title)}
                                style={{ backgroundColor: '#ff6347', color: 'white', border:'none', padding:'5px 10px', borderRadius:'4px', cursor:'pointer' }}
                            >
                                Hapus
                            </button>
                        </td>
                    </tr>
                ))
            ) : (
                <tr><td colSpan="5" style={{textAlign:'center'}}>Tidak ada data paket yang cocok.</td></tr>
            )}
        </tbody>
        </table>
    </div>
  );
}

export default PaketListAdmin;