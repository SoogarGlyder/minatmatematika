// File: src/models/Comment.js
import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  topicSlug: {
    type: String,
    required: true,
    index: true, // Menggantikan novelSlug
  },
  paketSlug: {
    type: String,
    required: true,
    index: true, // Menggantikan chapterSlug
  },
  name: {
    type: String,
    required: [true, 'Nama wajib diisi'],
    trim: true,
    maxlength: [50, 'Nama maksimal 50 karakter'],
  },
  content: {
    type: String,
    required: [true, 'Komentar wajib diisi'],
    trim: true,
    maxlength: [1000, 'Komentar maksimal 1000 karakter'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Comment || mongoose.model('Comment', CommentSchema);