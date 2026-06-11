import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Comment from '@/models/Comment';

const isLocal = process.env.NODE_ENV === 'development';

export async function GET() {
  if (!isLocal) return NextResponse.json({ error: 'Akses Ditolak' }, { status: 403 });
  try {
    await dbConnect();
    // Mengambil komentar terbaru
    const comments = await Comment.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: comments });
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
    
    if (!id) return NextResponse.json({ success: false, error: 'ID tidak valid' }, { status: 400 });

    await Comment.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Komentar dihapus' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}