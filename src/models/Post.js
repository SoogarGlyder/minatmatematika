import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  title: String,
  slug: { type: String, unique: true },
  content: String,
  publishDate: Date,
  categories: [String],
  featuredImage: String,
  wpId: String,
  status: { type: String, default: 'publish' }
}, { 
  timestamps: true,
  // PERBAIKAN: Menegaskan nama collection di database agar tidak salah cari
  collection: 'posts' 
});

export default mongoose.models.Post || mongoose.model('Post', PostSchema);