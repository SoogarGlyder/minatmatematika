import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Article from '@/models/Article';
import { pingIndexNow } from '@/lib/indexnow'; // 🔥 Import fungsi IndexNow

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();

    if (!body.title || !body.slug || !body.content) {
      return NextResponse.json({ error: 'Judul, Slug, dan Konten wajib diisi' }, { status: 400 });
    }

    const newArticle = await Article.create(body);

    // 🚀 PING INDEXNOW: Memberitahu Bing bahwa ada Artikel Blog baru
    if (newArticle.slug) {
      pingIndexNow(`/blog/${newArticle.slug}`);
    }

    return NextResponse.json({ success: true, article: newArticle }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
    await dbConnect();
    const articles = await Article.find({}).sort({ createdAt: -1 });
    return NextResponse.json(articles);
}