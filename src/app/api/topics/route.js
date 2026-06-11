// File: src/app/api/topics/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Topic from '@/models/Topic';

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');

        let query = {};
        if (category) {
            query.category = category;
        }

        const topics = await Topic.find(query).sort({ createdAt: -1 });
        return NextResponse.json(topics);
    } catch (error) {
        return NextResponse.json({ message: "Gagal mengambil data topik", error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        
        if (!body.title || !body.category || !body.slug) {
            return NextResponse.json({ error: "Judul, Kategori, dan Slug wajib diisi!" }, { status: 400 });
        }

        const newTopic = await Topic.create(body);
        return NextResponse.json({ message: "Topik berhasil dibuat", data: newTopic }, { status: 201 });
    } catch (error) {
        console.error("Error API POST Topic:", error);
        if (error.code === 11000) {
            return NextResponse.json({ error: "Gagal! Slug URL ini sudah dipakai materi lain." }, { status: 400 });
        }
        return NextResponse.json({ message: "Gagal membuat topik", error: error.message }, { status: 500 });
    }
}