import Link from 'next/link';

export const metadata = {
  title: '404 | Halaman Tidak Ditemukan',
};

export default function NotFound() {
  return (
    <div style={{ alignContent: 'center', textAlign: 'center', height: '70vh', color: 'var(--foreground)' }}>
      <h1 style={{ fontSize: '4em', color: 'var(--primary)', fontWeight: '900', margin: 0 }}>404</h1>
      <h3 style={{ marginTop: '10px', color: 'var(--accent)', marginBottom: '5px' }}>
        Waduh! Halaman Tidak Ditemukan
      </h3>
      <p style={{ marginBottom: '20px', color: 'var(--foreground)' }}>
        Sepertinya halaman yang kamu cari hasilnya tak terhingga (dibagi dengan nol).
      </p>
      
      <Link 
        href="/" 
        style={{ 
          display: 'inline-block', 
          marginTop: '10px', 
          padding: '10px 24px', 
          background: 'var(--primary)', 
          color: 'var(--background)', 
          textDecoration: 'none',
          borderRadius: '6px',
          fontWeight: 'bold'
        }}
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}