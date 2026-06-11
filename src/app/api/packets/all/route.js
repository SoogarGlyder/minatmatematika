// File: src/app/api/packets/all/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import PaketSoal from '@/models/PaketSoal';
import Topic from '@/models/Topic'; // Mengganti Novel menjadi Topic

export async function GET() {
  try {
    await dbConnect();
    
    // Mengambil semua paket soal dan menggabungkannya dengan data Topik
    const packets = await PaketSoal.find({})
      .populate({
        path: 'topic',
        select: 'slug title category' // Menarik data dari model Topic
      })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(packets);
  } catch (error) {
    console.error('Error fetching all packets:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}