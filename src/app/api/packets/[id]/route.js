// File: src/app/api/packets/[id]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import PaketSoal from '@/models/PaketSoal';

// Fungsi PUT untuk Mengedit Paket Soal
export async function PUT(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();
        
        const updatedPacket = await PaketSoal.findByIdAndUpdate(id, body, { new: true });
        if (!updatedPacket) {
            return NextResponse.json({ message: "Paket soal tidak ditemukan" }, { status: 404 });
        }
        
        return NextResponse.json({ message: "Paket soal berhasil diupdate", data: updatedPacket });
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
        
        return NextResponse.json({ message: "Paket soal berhasil dihapus" });
    } catch (error) {
        return NextResponse.json({ message: "Gagal menghapus paket soal", error: error.message }, { status: 500 });
    }
}