// File: src/app/api/topics/slug/[topicSlug]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Topic from '@/models/Topic';
import PaketSoal from '@/models/PaketSoal';

// Ambil detail suatu topik beserta daftar paket soal di dalamnya
export async function GET(request, { params }) {
    try {
        await dbConnect();
        const { topicSlug } = params;

        // Cari topik berdasarkan slug-nya
        const topic = await Topic.findOne({ slug: topicSlug });

        if (!topic) {
            return NextResponse.json({ message: "Topik tidak ditemukan" }, { status: 404 });
        }

        // Cari semua paket soal yang berada di bawah naungan topik ini
        const paketList = await PaketSoal.find({ topic: topic._id })
            .select('title paket_slug paket_number createdAt')
            .sort({ paket_number: 1 }); // Urutkan berdasarkan nomor paket (Paket 1, Paket 2, dst)

        return NextResponse.json({
            topic,
            paketList
        });
    } catch (error) {
        return NextResponse.json({ message: "Gagal mengambil detail topik", error: error.message }, { status: 500 });
    }
}