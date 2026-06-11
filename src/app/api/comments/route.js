<<<<<<< HEAD
// File: src/app/api/comments/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Comment from '@/models/Comment';

// Fungsi GET untuk mengambil komentar di halaman soal
export async function GET(request) {
    try {
        await dbConnect();
        
        // Menangkap parameter dari URL (misal: ?topicSlug=matriks&paketSlug=uk-1)
        const { searchParams } = new URL(request.url);
        const topicSlug = searchParams.get('topicSlug');
        const paketSlug = searchParams.get('paketSlug');

        // Jika ada pencarian spesifik untuk topik dan paket soal tertentu
        let query = {};
        if (topicSlug && paketSlug) {
            query = { topicSlug, paketSlug };
        }

        // Ambil komentar dan urutkan dari yang paling baru
        const comments = await Comment.find(query).sort({ createdAt: -1 });
        
        return NextResponse.json(comments);
    } catch (error) {
        return NextResponse.json({ message: "Gagal mengambil komentar", error: error.message }, { status: 500 });
    }
}

// Fungsi POST untuk menambahkan komentar baru
export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        
        // Menyimpan komentar (body harus berisi: name, content, topicSlug, paketSlug)
        const newComment = await Comment.create(body);
        return NextResponse.json({ message: "Komentar berhasil ditambahkan", data: newComment }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: "Gagal menambahkan komentar", error: error.message }, { status: 500 });
    }
=======
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db'; // Sesuaikan dengan nama file db kamu (db.js atau dbConnect.js)
import Comment from '@/models/Comment';

export async function GET(request) {
  try {
    await dbConnect();

    // Mengambil paketSlug dari URL (?paketSlug=...)
    const { searchParams } = new URL(request.url);
    const paketSlug = searchParams.get('paketSlug');

    if (!paketSlug) {
      return NextResponse.json({ success: false, error: 'Slug paket tidak ditemukan' }, { status: 400 });
    }

    // Mencari komentar berdasarkan paket soal, urutkan dari yang paling baru (-1)
    const comments = await Comment.find({ paketSlug }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, data: comments });
  } catch (error) {
    console.error("GET Comments Error:", error);
    return NextResponse.json({ success: false, error: 'Gagal memuat komentar' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { kategoriSlug, paketSlug, name, content } = body;

    // Validasi input
    if (!kategoriSlug || !paketSlug || !name || !content) {
      return NextResponse.json({ success: false, error: 'Semua kolom wajib diisi!' }, { status: 400 });
    }

    // Simpan ke database
    const newComment = await Comment.create({
      kategoriSlug,
      paketSlug,
      name,
      content,
    });

    return NextResponse.json({ success: true, data: newComment }, { status: 201 });
  } catch (error) {
    console.error("POST Comment Error:", error);
    return NextResponse.json({ success: false, error: 'Gagal mengirim komentar' }, { status: 500 });
  }
>>>>>>> a580d16725eebfdfebc9db385bbf2840d80e1b9b
}