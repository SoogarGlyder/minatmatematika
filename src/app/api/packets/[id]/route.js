// File: src/app/api/packets/[id]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import PaketSoal from '@/models/PaketSoal';
import Question from '@/models/Question';
import { syncPacketQuestions, deletePacketQuestions } from '@/lib/syncQuestions.mjs';
import { revalidatePacketPaths } from '@/lib/revalidatePacket';

// Fungsi PUT untuk Mengedit Paket Soal
export async function PUT(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();
        
        // Versi sebelum diedit: dibutuhkan untuk menyegarkan alamat lama jika slug/topik berubah
        const before = await PaketSoal.findById(id).select('topic paket_slug').lean();

        const updatedPacket = await PaketSoal.findByIdAndUpdate(id, body, { new: true });
        if (!updatedPacket) {
            return NextResponse.json({ message: "Paket soal tidak ditemukan" }, { status: 404 });
        }

        // Sinkronkan soal terstruktur dari HTML yang baru, lalu segarkan halaman terkait
        const report = await syncPacketQuestions(updatedPacket, Question);
        await revalidatePacketPaths(before, updatedPacket);

        return NextResponse.json({ message: "Paket soal berhasil diupdate", data: updatedPacket, report });
    } catch (error) {
        return NextResponse.json({ message: "Gagal update paket soal", error: error.message }, { status: 500 });
    }
}

// Fungsi DELETE untuk Menghapus Paket Soal
export async function DELETE(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        
        const deletedPacket = await PaketSoal.findByIdAndDelete(id);
        if (!deletedPacket) {
            return NextResponse.json({ message: "Paket soal tidak ditemukan" }, { status: 404 });
        }

        // Bersihkan soal terstruktur milik paket ini dan segarkan halaman terkait
        await deletePacketQuestions(deletedPacket._id, Question);
        await revalidatePacketPaths(deletedPacket);

        return NextResponse.json({ message: "Paket soal berhasil dihapus" });
    } catch (error) {
        return NextResponse.json({ message: "Gagal menghapus paket soal", error: error.message }, { status: 500 });
    }
}