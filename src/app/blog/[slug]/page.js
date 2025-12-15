import dbConnect from "@/lib/db";
import Post from "@/models/Post";
import Link from "next/link";
import { notFound } from "next/navigation";
import MathContent from "@/components/MathContent";

export default async function SinglePostPage({ params }) {
  // --- PERBAIKAN DI SINI ---
  // Kita harus 'await' params dulu karena di Next.js terbaru ini adalah Promise
  const { slug } = await params; 
  
  // Debugging: Kita intip apa isi slug-nya di terminal
  console.log("Mencari artikel dengan slug:", slug);

  // 2. Konek Database & Cari Artikel
  await dbConnect();
  
  // Cari artikel berdasarkan slug
  const post = await Post.findOne({ slug: slug }).lean();

  // Debugging: Cek apakah ketemu
  if (!post) {
    console.log("Artikel TIDAK ditemukan di database!");
    return notFound();
  } else {
    console.log("Artikel ditemukan:", post.title);
  }

  // ... (sisanya sama seperti kode sebelumnya)
  return (
    <main className="min-h-screen bg-white font-sans text-gray-900">
        {/* ... Paste sisa kode return di sini ... */}
        {/* Tombol Kembali */}
      <div className="max-w-3xl mx-auto pt-8 px-4">
        <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Kembali ke Beranda
        </Link>
      </div>

      {/* Konten Artikel */}
      <article className="max-w-3xl mx-auto px-4 py-8">
        <header className="mb-8 border-b pb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 leading-tight">
            {post.title}
          </h1>
          <div className="text-gray-500 text-sm">
            Diposting pada {new Date(post.publishDate).toLocaleDateString("id-ID", {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}
          </div>
        </header>
        <MathContent content={post.content} />
      </article>
    </main>
  );
}