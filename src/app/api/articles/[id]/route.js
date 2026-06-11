import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Article from '@/models/Article';
import { pingIndexNow } from '@/lib/indexnow'; // 🔥 Import fungsi IndexNow

// GET: Ambil 1 artikel (untuk mengisi form Edit)
export async function GET(request, { params }) {
  const { id } = await params;
  await dbConnect();
  try {
    const article = await Article.findById(id);
    if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(article);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Update Artikel
export async function PUT(request, { params }) {
  const { id } = await params;
  await dbConnect();
  try {
    const body = await request.json();
    
    // Update data berdasarkan ID
    const updatedArticle = await Article.findByIdAndUpdate(id, body, {
      new: true, // Kembalikan data yang sudah diupdate
      runValidators: true,
    });

    if (!updatedArticle) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // 🚀 PING INDEXNOW: Beritahu Bing bahwa konten artikel ini baru saja di-update!
    if (updatedArticle.slug) {
      pingIndexNow(`/blog/${updatedArticle.slug}`);
    }

    return NextResponse.json({ success: true, article: updatedArticle });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Hapus Artikel
export async function DELETE(request, { params }) {
  const { id } = await params;
  await dbConnect();
  try {
    const deletedArticle = await Article.findByIdAndDelete(id);
    if (!deletedArticle) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // 🚀 PING INDEXNOW: Beritahu Bing untuk segera menghapus URL ini dari hasil pencarian (mencegah 404)
    if (deletedArticle.slug) {
      pingIndexNow(`/blog/${deletedArticle.slug}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}