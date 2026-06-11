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
}