import mongoose from 'mongoose';

const ArticleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  slug: { type: String, required: true, unique: true },
  author: { type: String, default: 'Admin' },
  date: { type: String, required: true },
  image: { type: String },
  tags: { type: [String], default: [] }, 
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
  views: { type: Number, default: 0 },
  affiliate_title: { type: String, default: '' },
  affiliate_link: { type: String, default: '' },
  affiliate_image: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.models.Article || mongoose.model('Article', ArticleSchema);