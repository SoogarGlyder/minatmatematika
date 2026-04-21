import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    // --- OPTIMASI KHUSUS VERCEL (SERVERLESS) ---
    const opts = {
      bufferCommands: false,
      
      // 1. Batasi koneksi per fungsi Vercel agar tidak membengkak
      maxPoolSize: 10, 
      
      // 2. Jika DB gagal merespons dalam 5 detik, langsung error (jangan digantung)
      serverSelectionTimeoutMS: 5000, 
      
      // 3. Tutup koneksi otomatis jika 45 detik tidak ada aktivitas
      socketTimeoutMS: 45000, 
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;