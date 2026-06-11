// File: src/app/api/packets/slug/[packetSlug]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import PaketSoal from '@/models/PaketSoal';
import Topic from '@/models/Topic';

export async function GET(request, { params }) {
    try {
        await dbConnect();
        const { packetSlug } = params;

        // Cari paket soal berdasarkan slug-nya
        const packet = await PaketSoal.findOne({ paket_slug: packetSlug }).populate('topic');

        if (!packet) {
            return NextResponse.json({ message: "Paket soal tidak ditemukan" }, { status: 404 });
        }

        // Cari paket sebelum dan sesudahnya untuk navigasi tombol "Soal Sebelumnya" & "Soal Berikutnya"
        const prevPacket = await PaketSoal.findOne({
            topic: packet.topic._id,
            packet_number: packet.paket_number - 1
        }).select('paket_slug title');

        const nextPacket = await PaketSoal.findOne({
            topic: packet.topic._id,
            packet_number: packet.paket_number + 1
        }).select('paket_slug title');

        return NextResponse.json({
            packet,
            navigation: {
                prev: prevPacket ? prevPacket.paket_slug : null,
                next: nextPacket ? nextPacket.paket_slug : null
            }
        });
    } catch (error) {
        return NextResponse.json({ message: "Gagal mengambil data paket soal", error: error.message }, { status: 500 });
    }
}