// File: src/lib/adSlots.js
// Daftar terpusat ID slot iklan AdSense. Semua komponen mengambil ID dari sini.
//
// CARA MENGGANTI: buat unit iklan baru di AdSense (Ads > By ad unit > Display ads), beri nama sesuai
// kunci di bawah, lalu tempel ID barunya di sini. Cukup ubah di file ini.
//
// Tanda di komentar:
//   [GANTI]   ID ini masih DIPAKAI BERSAMA di beberapa lokasi, jadi laporan AdSense tidak bisa
//             membedakan performanya. Buat unit iklan baru agar tiap lokasi punya laporan sendiri.
//   [UNIK]    ID ini hanya dipakai di satu lokasi, tidak perlu diganti.
//   [NONAKTIF] Slot tersedia tetapi sedang tidak ditampilkan di lokasinya (lihat catatan).

export const AD_SLOTS = {
  // ===== MODE CBT / TRY OUT (/cbt/...) — Offerwall Google juga aktif di sini =====

  // Sidebar kanan, atas (300x250, hanya desktop).
  // [GANTI] sekarang sama dengan BACA_SIDEBAR_ATAS. Dipakai di: components/RightSidebar.jsx (saat isCbtMode).
  CBT_SIDEBAR_ATAS: '4896743654',

  // Sidebar kanan, bawah (300x250, hanya desktop).
  // [NONAKTIF] sengaja tidak ditampilkan di CBT supaya iklan tidak berlebihan bersama Offerwall.
  // Untuk menampilkannya lagi: ubah SHOW_CBT_SIDEBAR_BAWAH di bawah menjadi true.
  // [GANTI] ID sama dengan BACA_SIDEBAR_BAWAH.
  CBT_SIDEBAR_BAWAH: '8398202563',

  // Di bawah kotak soal (responsif). Berlaku untuk tryout baru DAN CBT lama (cadangan).
  // [GANTI] sekarang sama dengan BACA_BAWAH_ISI. Dipakai di: components/Tryout/TryoutClient.jsx
  //         dan app/[topicSlug]/[packetSlug]/PacketClient.jsx (bagian CBT).
  CBT_BAWAH_SOAL: '4564146092',

  // ===== HALAMAN BACA =====

  // Sidebar kanan atas dan bawah (300x250). Dipakai di: components/RightSidebar.jsx (mode baca).
  // [UNIK untuk mode baca; ID yang sama dipakai CBT sampai Anda membuat unit CBT sendiri]
  BACA_SIDEBAR_ATAS: '4896743654',
  BACA_SIDEBAR_BAWAH: '8398202563',

  // Di bawah isi paket soal (responsif). Dipakai di: app/[topicSlug]/[packetSlug]/PacketClient.jsx.
  // [GANTI] ID sama dengan CBT_BAWAH_SOAL.
  BACA_BAWAH_ISI: '4564146092',

  // ===== HALAMAN LAIN =====

  // Beranda: iklan di antara kartu materi (format In-feed/fluid). Dipakai di: components/Home/HomeGrid.jsx
  // [UNIK] pastikan tipenya "In-feed" di AdSense.
  BERANDA_INFEED: '9507873240',

  // Daftar materi (sidebar/daftar): iklan In-feed. Dipakai di: components/TopicList.jsx
  // [UNIK] pastikan tipenya "In-feed" di AdSense.
  DAFTAR_MATERI_INFEED: '8411690525',

  // Halaman topik, di bawah isi. Dipakai di: app/[topicSlug]/TopicClient.jsx
  // [UNIK]
  TOPIK_BAWAH: '6974185423',

  // Halaman artikel materi, di bawah isi. Dipakai di: app/materi/[slug]/MateriClient.jsx
  // [UNIK]
  MATERI_BAWAH: '8983567716',

  // Catatan: iklan yang disisipkan di tengah isi lewat penanda "ad-placeholder" di HTML artikel/topik
  // membaca ID slot-nya dari atribut data-ad-slot di HTML itu sendiri, bukan dari file ini.
};

// Tampilkan iklan sidebar bawah saat mode CBT? (false = hanya satu iklan sidebar di CBT)
export const SHOW_CBT_SIDEBAR_BAWAH = false;
