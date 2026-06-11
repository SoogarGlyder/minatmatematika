// File: src/hooks/useTopicData.js
'use client';

import { useState, useEffect } from 'react';

// Fungsi 1: Mengambil daftar materi berdasarkan kategori (misal: "Penalaran Umum")
export function useTopicList(category) {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopics = async () => {
      if (!category) return; 

      setLoading(true);
      setError(null);
      try {
        // Mengakses API /api/topics yang kita buat sebelumnya
        const response = await fetch(`/api/topics?category=${category}`);
        if (!response.ok) throw new Error('Gagal mengambil data materi');
        const data = await response.json();
        setTopics(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, [category]);

  return { topics, loading, error };
}

// Fungsi 2: Mengambil detail satu materi beserta daftar paket soalnya
export const useTopicDetail = (topicSlug) => {
    const [data, setData] = useState({ topic: null, paketList: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!topicSlug) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/topics/slug/${topicSlug}`);
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(errorText || 'Gagal memuat detail materi.');
                }
                
                const result = await response.json();
                
                if (!result.topic || !result.paketList) {
                     throw new Error('Struktur data API detail materi tidak lengkap.');
                }

                setData(result); 

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [topicSlug]);

    return { topic: data.topic, paketList: data.paketList, loading, error };
};

// Fungsi 3: Mengambil detail isi satu paket soal dan pembahasannya
export function usePacketData(topicSlug, packetSlug, setPageCategory) {
  const [packet, setPacket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prevPacketSlug, setPrevPacketSlug] = useState(null);
  const [nextPacketSlug, setNextPacketSlug] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!topicSlug || !packetSlug) return;
      
      try {
        setLoading(true);
        setError(null);
        setPrevPacketSlug(null);
        setNextPacketSlug(null);

        // Mengambil dari API /api/packets
        const response = await fetch(`/api/packets/slug/${packetSlug}`);
        
        if (!response.ok) {
          const errorText = await response.text(); 
          throw new Error(errorText || 'Paket soal tidak ditemukan.');
        }

        const data = await response.json(); 
        const packetData = data.packet;
        const navData = data.navigation; 

        if (!packetData || !packetData.topic) {
            throw new Error('Struktur data API tidak lengkap atau Topik tidak terisi.');
        }

        setPacket(packetData);
        
        // Mengatur info kategori (berguna untuk mewarnai tema/header nantinya)
        if (setPageCategory && typeof setPageCategory === 'function') {
            setPageCategory(packetData.topic.category);
        }

        // Tombol navigasi soal sebelumnya dan selanjutnya
        setPrevPacketSlug(navData.prev);
        setNextPacketSlug(navData.next);

      } catch (err) {
        setError(err.message);
        setPacket(null); 
      } finally {
        setLoading(false);
      }
    };
    fetchData();

  }, [packetSlug, setPageCategory, topicSlug]); 

  return { packet, loading, error, prevPacketSlug, nextPacketSlug };
}