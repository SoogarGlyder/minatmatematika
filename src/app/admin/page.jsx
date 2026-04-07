import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Selamat Datang, Bos!</h1>
      <p style={{ color: '#555', marginBottom: '30px' }}>
        Ini adalah Panel Admin yang hanya bisa diakses di komputermu sendiri (localhost). 
        Silakan pilih menu di bawah untuk mengelola data website Minat Matematika.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        
        {/* KARTU MENU MATERI */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h2 style={{ margin: '0 0 10px 0' }}>📚 Kelola Deskripsi Materi</h2>
          <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '20px' }}>
            Buat/Edit topik seperti "Penalaran Logis", "Aritmatika Sosial", dll agar muncul di Grid Majalah.
          </p>
          <Link href="/admin/materi" style={{ 
            display: 'inline-block', background: '#111', color: 'white', padding: '10px 20px', borderRadius: '5px', textDecoration: 'none', fontWeight: 'bold' 
          }}>
            Masuk ke Materi »
          </Link>
        </div>

        {/* KARTU MENU PAKET SOAL */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h2 style={{ margin: '0 0 10px 0' }}>📝 Kelola Paket Soal</h2>
          <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '20px' }}>
            Buat/Edit "Paket 01 - Penalaran Logis" beserta rumus matematika dan pembahasannya.
          </p>
          <Link href="/admin/posts" style={{ 
            display: 'inline-block', background: '#0070f3', color: 'white', padding: '10px 20px', borderRadius: '5px', textDecoration: 'none', fontWeight: 'bold' 
          }}>
            Masuk ke Paket Soal »
          </Link>
        </div>

      </div>
    </div>
  );
}