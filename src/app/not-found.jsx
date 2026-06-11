// File: src/app/not-found.jsx
import Link from 'next/link';

export const metadata = {
  title: '404 | Halaman Tidak Ditemukan - Minat Matematika',
};

export default function NotFound() {
  return (
    <div style={{ alignContent: 'center', textAlign: 'center', height: '70vh', padding: '20px' }}>
      <h1 style={{ fontSize: '4em', color: 'var(--foreground)', margin: 0 }}>404</h1>
      <h3 style={{ marginTop: '10px', color: 'var(--foreground)', marginBottom: '5px' }}>
        Waduh! Halaman Tidak Ditemukan
      </h3>
      <p style={{ marginBottom: '20px', color: 'var(--link)' }}>
        Sepertinya variabel halaman yang kamu cari berada di luar domain fungsi kami (Tidak Terdefinisi).
      </p>
      
      <Link 
        href="/" 
        style={{ 
          display: 'inline-block', 
          marginTop: '10px', 
          padding: '10px 25px', 
          background: 'var(--foreground)', 
          color: 'var(--background)', 
          textDecoration: 'none',
          borderRadius: '8px',
          fontWeight: 'bold',
          transition: '0.2s ease'
        }}
      >
        Kembali ke Titik Awal
      </Link>
    </div>
  );
}