// File: src/app/api/topics/[id]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Topic from '@/models/Topic';

// Fungsi PUT untuk Mengedit Materi
export async function PUT(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();
        
        const updatedTopic = await Topic.findByIdAndUpdate(id, body, { new: true });
        if (!updatedTopic) {
            return NextResponse.json({ message: "Materi tidak ditemukan" }, { status: 404 });
        }
        
        return NextResponse.json({ message: "Materi berhasil diupdate", data: updatedTopic });
    } catch (error) {
        return NextResponse.json({ message: "Gagal update materi", error: error.message }, { status: 500 });
    }
}

// Fungsi DELETE untuk Menghapus Materi
export async function DELETE(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        
        const deletedTopic = await Topic.findByIdAndDelete(id);
        if (!deletedTopic) {
            return NextResponse.json({ message: "Materi tidak ditemukan" }, { status: 404 });
        }
        
        return NextResponse.json({ message: "Materi berhasil dihapus" });
    } catch (error) {
        return NextResponse.json({ message: "Gagal menghapus materi", error: error.message }, { status: 500 });
    }
}