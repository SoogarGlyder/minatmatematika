import dbConnect from "@/lib/db";
import Post from "@/models/Post";
import HomeClient from "@/components/Home/HomeClient";

export default async function HomePage() {
  // Ambil semua data dari database di sisi Server (Super Cepat & SEO Friendly)
  await dbConnect();
  const posts = await Post.find({}).sort({ publishDate: -1 }).lean();

  // Serialisasi data agar aman dikirim ke Client Component
  const serializedPosts = posts.map(post => ({
    ...post,
    _id: post._id.toString(),
    publishDate: post.publishDate ? post.publishDate.toISOString() : null,
  }));

  return (
    <main>
      <HomeClient initialPosts={serializedPosts} />
    </main>
  );
}