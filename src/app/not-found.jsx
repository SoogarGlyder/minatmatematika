<<<<<<< HEAD
// File: src/app/not-found.jsx
import Link from 'next/link';

export const metadata = {
  title: '404 | Halaman Tidak Ditemukan - Minat Matematika',
=======
import Link from 'next/link';

export const metadata = {
  title: '404 | Halaman Tidak Ditemukan',
>>>>>>> a580d16725eebfdfebc9db385bbf2840d80e1b9b
};

export default function NotFound() {
  return (
<<<<<<< HEAD
    <div style={{ alignContent: 'center', textAlign: 'center', height: '70vh', padding: '20px' }}>
      <h1 style={{ fontSize: '4em', color: 'var(--foreground)', margin: 0 }}>404</h1>
      <h3 style={{ marginTop: '10px', color: 'var(--foreground)', marginBottom: '5px' }}>
        Waduh! Halaman Tidak Ditemukan
      </h3>
      <p style={{ marginBottom: '20px', color: 'var(--link)' }}>
        Sepertinya variabel halaman yang kamu cari berada di luar domain fungsi kami (Tidak Terdefinisi).
=======
    <div style={{ alignContent: 'center', textAlign: 'center', height: '70vh', color: 'var(--foreground)' }}>
      <h1 style={{ fontSize: '4em', color: 'var(--primary)', fontWeight: '900', margin: 0 }}>404</h1>
      <h3 style={{ marginTop: '10px', color: 'var(--accent)', marginBottom: '5px' }}>
        Waduh! Halaman Tidak Ditemukan
      </h3>
      <p style={{ marginBottom: '20px', color: 'var(--foreground)' }}>
        Sepertinya halaman yang kamu cari hasilnya tak terhingga (dibagi dengan nol).
>>>>>>> a580d16725eebfdfebc9db385bbf2840d80e1b9b
      </p>
      
      <Link 
        href="/" 
        style={{ 
          display: 'inline-block', 
          marginTop: '10px', 
<<<<<<< HEAD
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
=======
          padding: '10px 24px', 
          background: 'var(--primary)', 
          color: 'var(--background)', 
          textDecoration: 'none',
          borderRadius: '6px',
          fontWeight: 'bold'
        }}
      >
        Kembali ke Beranda
>>>>>>> a580d16725eebfdfebc9db385bbf2840d80e1b9b
      </Link>
    </div>
  );
}