import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  title: String,
  slug: { type: String, unique: true },
  content: String,
  publishDate: Date,
  categories: [String],
  featuredImage: String,
  wpId: String
}, { timestamps: true });

export default mongoose.models.Post || mongoose.model('Post', PostSchema);