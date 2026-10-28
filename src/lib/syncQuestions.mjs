// File: src/lib/syncQuestions.mjs
// Menyinkronkan HTML satu paket ke koleksi `questions`. Model Question diberikan dari luar (injeksi)
// supaya fungsi ini bisa diuji tanpa database.
import { parsePacketContent } from './parsePacketContent.mjs';
import { buildQuestionOps, buildReport } from './questionSync.mjs';

// packet: dokumen paket (butuh _id, topic, content). Tidak pernah melempar error:
// kegagalan sinkron dilaporkan di hasil supaya paket tetap tersimpan.
export async function syncPacketQuestions(packet, Question) {
  const html = packet.content || '';
  const parsed = parsePacketContent(html);
  const report = buildReport({ parsed, html });

  try {
    const { ops, numbers } = buildQuestionOps({ paketId: packet._id, topicId: packet.topic, parsed });
    if (ops.length) await Question.bulkWrite(ops, { ordered: false });
    // Soal yang nomornya sudah tidak ada di HTML ikut dibuang
    const removal = await Question.deleteMany({ paket: packet._id, number: { $nin: numbers } });
    return { synced: true, removed: removal?.deletedCount || 0, ...report };
  } catch (error) {
    console.error('Gagal sinkron soal paket:', error);
    return { synced: false, error: error.message, removed: 0, ...report };
  }
}

export async function deletePacketQuestions(packetId, Question) {
  try {
    const res = await Question.deleteMany({ paket: packetId });
    return res?.deletedCount || 0;
  } catch (error) {
    console.error('Gagal menghapus soal paket:', error);
    return 0;
  }
}
