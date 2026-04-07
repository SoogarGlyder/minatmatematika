import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Materi from '@/models/Materi';

// Mencegah API diakses di production (keamanan lapis ganda)
const isLocal = process.env.NODE_ENV === 'development';

export async function GET() {
  if (!isLocal) return NextResponse.json({ error: 'Akses Ditolak' }, { status: 403 });
  
  try {
    await dbConnect();
    // Mengambil semua materi, diurutkan berdasarkan Parent Menu
    const materis = await Materi.find({}).sort({ parentMenu: 1, name: 1 }).lean();
    return NextResponse.json({ success: true, data: materis });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  if (!isLocal) return NextResponse.json({ error: 'Akses Ditolak' }, { status: 403 });

  try {
    await dbConnect();
    const body = await request.json();
    
    // Otomatis membuat slug dari nama jika slug kosong
    if (!body.slug) {
      body.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    const newMateri = await Materi.create(body);
    return NextResponse.json({ success: true, data: newMateri });
  } catch (error) {
    // Menangani error duplikat slug
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: 'Slug sudah digunakan. Gunakan slug lain.' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  if (!isLocal) return NextResponse.json({ error: 'Akses Ditolak' }, { status: 403 });
  try {
    await dbConnect();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) return NextResponse.json({ success: false, error: 'ID tidak ditemukan' }, { status: 400 });

    const updatedMateri = await Materi.findByIdAndUpdate(id, updateData, { new: true });
    return NextResponse.json({ success: true, data: updatedMateri });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  if (!isLocal) return NextResponse.json({ error: 'Akses Ditolak' }, { status: 403 });

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, error: 'ID tidak ditemukan' }, { status: 400 });

    await Materi.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Materi berhasil dihapus' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}