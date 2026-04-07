import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  kategoriSlug: {
    type: String,
    required: [true, 'Kategori wajib diisi'],
  },
  paketSlug: {
    type: String,
    required: [true, 'Slug paket wajib diisi'],
  },
  name: {
    type: String,
    required: [true, 'Nama wajib diisi'],
    trim: true,
    maxlength: 50,
  },
  content: {
    type: String,
    required: [true, 'Komentar wajib diisi'],
    trim: true,
    maxlength: 1000,
  },
}, {
  timestamps: true, // Otomatis membuat createdAt dan updatedAt
});

// Mencegah OverwriteModelError di Next.js
export default mongoose.models.Comment || mongoose.model('Comment', CommentSchema);