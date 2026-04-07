import { redirect } from 'next/navigation';
import Link from 'next/link';

export const metadata = {
  title: 'Admin Panel Lokal - Minat Matematika',
};

export default function AdminLayout({ children }) {
  // JURUS KUNCI: Hanya izinkan akses jika dijalankan di localhost (mode development)
  if (process.env.NODE_ENV !== 'development') {
    // Jika diakses di web publik (production), langsung tendang ke Beranda!
    redirect('/'); 
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', color: '#111' }}>
      <nav style={{ 
        backgroundColor: '#111', 
        color: 'white', 
        padding: '15px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>⚙️ Admin Panel Lokal</h2>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link href="/admin" style={{ color: '#fff', textDecoration: 'none' }}>Dashboard</Link>
          <Link href="/admin/materi" style={{ color: '#fff', textDecoration: 'none' }}>Data Materi</Link>
          <Link href="/admin/posts" style={{ color: '#fff', textDecoration: 'none' }}>Data Soal</Link>
          <Link href="/admin/comments" style={{ color: '#fff', textDecoration: 'none' }}>Komentar</Link>
          <Link href="/" target="_blank" style={{ color: '#0070f3', textDecoration: 'none', fontWeight: 'bold' }}>Lihat Web ↗</Link>
        </div>
      </nav>

      <main style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
        {children}
      </main>
    </div>
  );
}