// File: src/models/Question.js
// Soal terstruktur: satu dokumen = satu nomor soal dalam satu paket.
import mongoose from 'mongoose';

const OptionSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, enum: ['A', 'B', 'C', 'D', 'E'] },
    html: { type: String, default: '' },
  },
  { _id: false }
);

const QuestionSchema = new mongoose.Schema(
  {
    paket: { type: mongoose.Schema.Types.ObjectId, ref: 'PaketSoal', required: true, index: true },
    topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true, index: true },
    number: { type: Number, required: true },

    // 'single'  : pilihan ganda A-E, answer berupa string (mis. "D")
    // 'complex' : tabel pernyataan, answer berupa array (mis. ["BENAR","SALAH"])
    // 'short'   : isian singkat, answer berupa teks kunci (mis. "270 m")
    // 'essay'   : uraian tanpa kunci tunggal; pengguna mengerjakan sendiri lalu membandingkan dengan pembahasan
    type: { type: String, enum: ['single', 'complex', 'short', 'essay'], default: 'single' },

    stemHtml: { type: String, default: '' },
    options: { type: [OptionSchema], default: [] },
    statements: { type: [String], default: [] }, // khusus complex
    answer: { type: mongoose.Schema.Types.Mixed, default: '' },
    // Khusus short: jawaban yang diterima setelah dinormalisasi (mis. ["270"]); kosong = cocokkan manual
    acceptedAnswers: { type: [String], default: [] },
    explanationHtml: { type: String, default: '' },

    // true = data soal bermasalah (kunci hilang/tidak cocok, dll). Tryout sebaiknya melewati soal ini
    // sampai diperbaiki di admin. Diatur ulang oleh script migrasi setiap dijalankan dengan --write.
    needsReview: { type: Boolean, default: false, index: true },

    // Diisi manual / belakangan; tidak ditimpa oleh script migrasi
    difficulty: { type: Number, min: 1, max: 3 },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

QuestionSchema.index({ paket: 1, number: 1 }, { unique: true });

export default mongoose.models.Question || mongoose.model('Question', QuestionSchema);
