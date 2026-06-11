import mongoose from 'mongoose';

// Kita membuat cetakan data (Schema) untuk Topik Materi
const TopicSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  }, // Judul topik (Contoh: "Matriks")
  slug: { 
    type: String, 
    required: true, 
    unique: true 
  }, // Link URL ramah (Contoh: "matriks")
  description: { 
    type: String 
  }, // Deskripsi singkat materi
  coverImage: { 
    type: String 
  }, // URL gambar sampul jika diperlukan
  category: { 
    type: String, 
    required: true,
    // Ini membatasi agar kategori hanya bisa diisi oleh pilihan di bawah ini
    enum: [
      'Penalaran Umum', 
      'Penalaran Matematika', 
      'Pengetahuan Kuantitatif', 
      'PKS Kelas 10', 
      'PKS Kelas 11', 
      'PKS Kelas 12'
    ] 
  }
}, { timestamps: true }); // timestamps otomatis membuat "createdAt" dan "updatedAt"

// Mengekspor model agar bisa digunakan di file lain
export default mongoose.models.Topic || mongoose.model('Topic', TopicSchema);