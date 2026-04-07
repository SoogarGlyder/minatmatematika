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
}