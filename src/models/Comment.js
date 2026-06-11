<<<<<<< HEAD
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
=======
import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  kategoriSlug: {
    type: String,
    required: [true, 'Kategori wajib diisi'],
  },
  paketSlug: {
    type: String,
    required: [true, 'Slug paket wajib diisi'],
>>>>>>> a580d16725eebfdfebc9db385bbf2840d80e1b9b
  },
  name: {
    type: String,
    required: [true, 'Nama wajib diisi'],
    trim: true,
<<<<<<< HEAD
    maxlength: [50, 'Nama maksimal 50 karakter'],
=======
    maxlength: 50,
>>>>>>> a580d16725eebfdfebc9db385bbf2840d80e1b9b
  },
  content: {
    type: String,
    required: [true, 'Komentar wajib diisi'],
    trim: true,
<<<<<<< HEAD
    maxlength: [1000, 'Komentar maksimal 1000 karakter'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

=======
    maxlength: 1000,
  },
}, {
  timestamps: true, // Otomatis membuat createdAt dan updatedAt
});

// Mencegah OverwriteModelError di Next.js
>>>>>>> a580d16725eebfdfebc9db385bbf2840d80e1b9b
export default mongoose.models.Comment || mongoose.model('Comment', CommentSchema);