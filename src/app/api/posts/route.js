import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db'; 
import Post from '@/models/Post';

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // Filter status publish secara default
    let query = { status: { $ne: 'draft' } };
    
    if (category && category.toLowerCase() !== 'semua') {
      query.categories = category;
    }

    const posts = await Post.find(query)
      .select('title slug categories featuredImage publishDate')
      .sort({ publishDate: 1 }) 
      .lean();

    // --- JURUS CACHING VERCEL ---
    return NextResponse.json(posts, {
      headers: {
        'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
      },
    });

  } catch (error) {
    console.error("API Posts Error:", error);
    return NextResponse.json(
      { error: 'Gagal mengambil data paket soal.' }, 
      { status: 500 }
    );
  }
}