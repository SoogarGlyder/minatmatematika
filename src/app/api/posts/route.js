import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db'; // <-- Sudah disesuaikan ke db.js
import Post from '@/models/Post';

export async function GET(request) {
  try {
    // 1. Konek ke Database
    await dbConnect();

    // 2. Ambil parameter 'category' dari URL (contoh: /api/posts?category=Penalaran Umum)
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // 3. Siapkan query pencarian
    let query = {};
    
    // Jika ada kategori yang dikirim dan bukan 'semua', filter berdasarkan kategori
    if (category && category.toLowerCase() !== 'semua') {
      query = { categories: category };
    }

    // 4. Cari di database
    // Kita hanya men-select field yang dibutuhkan agar loadingnya super cepat!
    const posts = await Post.find(query)
      .select('title slug categories featuredImage publishDate')
      .sort({ publishDate: 1 }) // Diurutkan dari Paket 01, 02, dst (ascending)
      .lean();

    // 5. Kembalikan data dalam format JSON
    return NextResponse.json(posts);

  } catch (error) {
    console.error("API Posts Error:", error);
    return NextResponse.json(
      { error: 'Gagal mengambil data paket soal.' }, 
      { status: 500 }
    );
  }
}