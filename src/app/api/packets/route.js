// File: src/app/api/packets/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import PaketSoal from '@/models/PaketSoal';

export async function GET() {
    try {
        await dbConnect();
        // Mengambil paket dan menampilkan info materi induknya agar muncul di tabel admin
        const packets = await PaketSoal.find().populate('topic', 'title slug category').sort({ createdAt: -1 });
        return NextResponse.json(packets);
    } catch (error) {
        return NextResponse.json({ message: "Gagal mengambil data paket", error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        
        // Validasi sederhana
        if (!body.topic || !body.title || !body.paket_number) {
            return NextResponse.json({ error: "Materi Induk, Judul, dan Nomor Paket wajib diisi!" }, { status: 400 });
        }

        const newPacket = await PaketSoal.create(body);
        return NextResponse.json({ message: "Paket soal berhasil dibuat", data: newPacket }, { status: 201 });
    } catch (error) {
        console.error("Error API POST Packet:", error);
        // Error code 11000 artinya ada data ganda (duplikat slug/judul) di database
        if (error.code === 11000) {
            return NextResponse.json({ error: "Gagal! Slug URL atau Judul ini sudah ada. Gunakan yang lain." }, { status: 400 });
        }
        return NextResponse.json({ message: "Gagal membuat paket soal", error: error.message }, { status: 500 });
    }
}