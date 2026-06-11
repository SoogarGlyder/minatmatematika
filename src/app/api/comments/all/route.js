import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Comment from '@/models/Comment';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    await dbConnect();

    const comments = await Comment.find({})
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json(comments, { status: 200 });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}