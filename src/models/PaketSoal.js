// File: src/models/PaketSoal.js
import mongoose from 'mongoose';

const PaketSoalSchema = new mongoose.Schema({
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
  },
  paket_number: {
    type: Number,
    required: true,
  },
  paket_slug: {
    type: String,
  },
  content: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

PaketSoalSchema.index({ topic: 1, paket_slug: 1 }, { unique: true });

function createSlug(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

PaketSoalSchema.pre('save', async function() { 
  if (!this.paket_slug) {
    this.paket_slug = createSlug(this.title);
  } 
  else if (this.isModified('paket_slug')) {
    this.paket_slug = createSlug(this.paket_slug);
  }
});

const PaketSoal = mongoose.models.PaketSoal || mongoose.model('PaketSoal', PaketSoalSchema);

export default PaketSoal;