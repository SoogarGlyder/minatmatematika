import mongoose from 'mongoose';

const MateriSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nama materi wajib diisi'],
    trim: true,
  },
  slug: {
    type: String,
    required: [true, 'Slug wajib diisi'],
    unique: true,
    lowercase: true,
  },
  parentMenu: {
    // Diisi dengan: 'PU', 'PK', 'PKS 10', 'PKS 11', atau 'PKS 12'
    type: String,
    required: [true, 'Parent Menu wajib diisi agar tahu materi ini masuk ke tab mana'],
  },
  description: {
    type: String,
    required: [true, 'Deskripsi materi wajib diisi'],
  },
  coverImage: {
    type: String,
    default: 'https://images.unsplash.com/photo-1632516643720-e7f0d7e6a739?q=80&w=250&auto=format&fit=crop',
  },
}, {
  timestamps: true, // Otomatis catat waktu dibuat & diupdate
});

// Mencegah OverwriteModelError di lingkungan Next.js
export default mongoose.models.Materi || mongoose.model('Materi', MateriSchema);