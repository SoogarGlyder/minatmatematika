// Uji sinkron soal dan laporan:  node scripts/test-sync.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildQuestionOps, buildReport } from '../src/lib/questionSync.mjs';
import { parsePacketContent } from '../src/lib/parsePacketContent.mjs';
import { syncPacketQuestions, deletePacketQuestions } from '../src/lib/syncQuestions.mjs';

// model palsu yang merekam pemanggilan
const fakeModel = (opts = {}) => {
  const calls = { bulk: [], del: [] };
  return {
    calls,
    bulkWrite: async (ops) => { if (opts.failBulk) throw new Error('db mati'); calls.bulk.push(ops); },
    deleteMany: async (q) => { calls.del.push(q); return { deletedCount: opts.deleted ?? 0 }; },
  };
};

const html = readFileSync(new URL('../helper.html', import.meta.url), 'utf8');
const packet = { _id: 'P1', topic: 'T1', content: html };

// 1. paket bersih: 20 soal tersinkron, laporan ok (teks penutup tidak dianggap masalah)
{
  const m = fakeModel({ deleted: 2 });
  const res = await syncPacketQuestions(packet, m);
  assert.equal(res.synced, true);
  assert.equal(res.questions.total, 20);
  assert.equal(res.questions.needsReview, 0);
  assert.equal(res.removed, 2);
  assert.equal(res.ok, true);
  assert.equal(m.calls.bulk[0].length, 20);
  const op = m.calls.bulk[0][0].updateOne;
  assert.deepEqual(op.filter, { paket: 'P1', number: 1 });
  assert.equal(op.update.$set.answer, 'D');
  assert.equal(op.update.$set.topic, 'T1');
  assert.deepEqual(op.update.$setOnInsert, { tags: [] }); // difficulty/tags tidak ditimpa
  assert.equal('difficulty' in op.update.$set, false);
  // soal lama yang nomornya tidak ada lagi dibuang
  assert.equal(m.calls.del[0].paket, 'P1');
  assert.equal(m.calls.del[0].number.$nin.length, 20);
}

// 2. paket bermasalah: kunci hilang, entitas ganda, gambar http, <p> tidak seimbang
{
  const bad = `<h3>Nomor 1</h3><p>Jarak &amp;dots; m <img src="http://x.com/a.png"></p><p>A. 1<br />B. 2</p>
  <details><summary>Lihat Pembahasan</summary><div><p>Tidak ada kunci.</p></div></details>
  <h3>Nomor 2</h3><p>ok<br />\n<p>A. 1<br />B. 2</p>
  <details><summary>Lihat Pembahasan</summary><div><p><strong>Jadi jawabannya adalah B. 2</strong></p></div></details>`;
  const m = fakeModel();
  const res = await syncPacketQuestions({ _id: 'P2', topic: 'T1', content: bad }, m);
  assert.equal(res.synced, true);
  assert.equal(res.questions.total, 2);
  assert.equal(res.questions.needsReview, 1);
  assert.equal(res.ok, false);
  assert.ok(res.notes.some((n) => /Nomor 1: .*kunci/.test(n)));
  assert.ok('&amp;dots;' in res.content.entities);
  assert.ok(res.content.images.some((i) => /http/.test(i.problem)));
  assert.ok(res.content.pWhere.some((w) => w.number === 2));
  assert.equal(m.calls.bulk[0].find((o) => o.updateOne.filter.number === 1).updateOne.update.$set.needsReview, true);
}

// 3. HTML tanpa soal (mis. paket hanya teks): semua soal lama dibersihkan, tanpa tulis baru
{
  const m = fakeModel({ deleted: 5 });
  const res = await syncPacketQuestions({ _id: 'P3', topic: 'T1', content: '<p>Tidak ada nomor</p>' }, m);
  assert.equal(res.questions.total, 0);
  assert.equal(m.calls.bulk.length, 0);
  assert.deepEqual(m.calls.del[0].number.$nin, []);
  assert.equal(res.removed, 5);
}

// 4. database gagal: tidak melempar error, melaporkan synced=false
{
  const res = await syncPacketQuestions(packet, fakeModel({ failBulk: true }));
  assert.equal(res.synced, false);
  assert.match(res.error, /db mati/);
  assert.equal(res.questions.total, 20);
}

// 5. hapus paket membersihkan semua soalnya
{
  const m = fakeModel({ deleted: 7 });
  assert.equal(await deletePacketQuestions('P1', m), 7);
  assert.deepEqual(m.calls.del[0], { paket: 'P1' });
}

// 6. buildQuestionOps memakai supportHtml bersama
{
  const parsed = parsePacketContent(`<p>Teks pendukung: kota</p><h3>Nomor 1</h3><p>A. 1<br />B. 2</p><details><summary>x</summary><div><p><strong>Jawaban: A</strong></p></div></details>`);
  const { ops } = buildQuestionOps({ paketId: 'P', topicId: 'T', parsed });
  assert.match(ops[0].updateOne.update.$set.supportHtml, /Teks pendukung/);
}

// 7. daftar host gambar sama dengan next.config.mjs
{
  const { default: nextConfig } = await import('../next.config.mjs');
  const { REMOTE_IMAGE_HOSTS } = await import('../src/lib/imageHosts.mjs');
  const fromConfig = (nextConfig.images?.remotePatterns || []).map((p) => p.hostname).sort();
  assert.deepEqual([...REMOTE_IMAGE_HOSTS].sort(), fromConfig, 'imageHosts.mjs harus sama dengan remotePatterns di next.config.mjs');
}

console.log('Semua pengujian sinkron lulus.');
