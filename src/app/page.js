import dbConnect from "@/lib/db";
import Post from "@/models/Post";
import Link from "next/link";

export default async function Home() {
  await dbConnect();

  const posts = await Post.find({}).sort({ publishDate: -1 }).lean();

  return (
    <main className="min-h-screen p-8 bg-gray-50 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-blue-900 mb-2">Minat Matematika</h1>
          <p className="text-gray-600">Selamat datang di website baru kami!</p>
        </header>

        <section>
          <h2 className="text-2xl font-semibold mb-6 border-b pb-2">Artikel Terbaru</h2>
          
          <div className="grid gap-6">
            {posts.length === 0 ? (
              <p className="text-center text-gray-500">Belum ada artikel.</p>
            ) : (
              posts.map((post) => (
                <article key={post._id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {post.title}
                  </h3>
                  
                  <div className="text-sm text-gray-500 mb-4">
                    📅 {new Date(post.publishDate).toLocaleDateString("id-ID", {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </div>

                  <div className="text-gray-600 mb-4 line-clamp-3">
                     {post.content.replace(/<[^>]+>/g, '').substring(0, 150)}...
                  </div>

                  <Link 
                    href={`/blog/${post.slug}`} 
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                  >
                    Baca Selengkapnya →
                  </Link>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}