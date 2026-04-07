import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Post from '@/models/Post';

const isLocal = process.env.NODE_ENV === 'development';

export async function GET() {
  if (!isLocal) return NextResponse.json({ error: 'Akses Ditolak' }, { status: 403 });
  try {
    await dbConnect();
    const posts = await Post.find({}).sort({ publishDate: -1 }).lean();
    return NextResponse.json({ success: true, data: posts });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  if (!isLocal) return NextResponse.json({ error: 'Akses Ditolak' }, { status: 403 });
  try {
    await dbConnect();
    const body = await request.json();
    
    // Auto-slug jika kosong
    if (!body.slug) {
      body.slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    const newPost = await Post.create(body);
    return NextResponse.json({ success: true, data: newPost });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  if (!isLocal) return NextResponse.json({ error: 'Akses Ditolak' }, { status: 403 });
  try {
    await dbConnect();
    const body = await request.json();
    const { id, ...updateData } = body;

    const updatedPost = await Post.findByIdAndUpdate(id, updateData, { new: true });
    return NextResponse.json({ success: true, data: updatedPost });
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
    await Post.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}