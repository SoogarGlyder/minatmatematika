// File: src/app/sitemap.js
// Sitemap: hanya halaman yang boleh diindeks. lastModified memakai tanggal perubahan SEBENARNYA
// (bukan "sekarang"), karena Google mengabaikan lastmod yang tidak konsisten dengan perubahan isi.
import dbConnect from '@/lib/dbConnect';
import Topic from '@/models/Topic';
import PaketSoal from '@/models/PaketSoal';
import Article from '@/models/Article';

const BASE_URL = 'https://www.minatmatematika.com';

const latest = (dates) => {
  const valid = dates.filter(Boolean).map((d) => new Date(d)).filter((d) => !Number.isNaN(d.getTime()));
  return valid.length ? new Date(Math.max(...valid.map((d) => d.getTime()))) : undefined;
};

export default async function sitemap() {
  await dbConnect();

  const [topics, pakets, articles] = await Promise.all([
    Topic.find({}).select('slug updatedAt createdAt').lean(),
    PaketSoal.find({})
      .select('paket_slug updatedAt createdAt topic')
      .populate({ path: 'topic', select: 'slug' })
      .sort({ updatedAt: -1 })
      .limit(5000)
      .lean(),
    Article.find({}).select('slug updatedAt date createdAt').sort({ date: -1 }).lean(),
  ]);

  const paketRoutes = pakets
    .map((paket) => {
      const topicSlug = paket.topic?.slug;
      if (!topicSlug) return null;
      return {
        url: `${BASE_URL}/${topicSlug}/${paket.paket_slug}`,
        lastModified: paket.updatedAt || paket.createdAt,
      };
    })
    .filter(Boolean);

  const topicRoutes = topics.map((topic) => ({
    url: `${BASE_URL}/${topic.slug}`,
    lastModified: topic.updatedAt || topic.createdAt,
  }));

  const articleRoutes = articles.map((article) => ({
    url: `${BASE_URL}/materi/${article.slug}`,
    lastModified: article.updatedAt || article.date || article.createdAt,
  }));

  const siteLastModified = latest([
    ...topics.map((t) => t.updatedAt),
    ...paketRoutes.map((p) => p.lastModified),
    ...articleRoutes.map((a) => a.lastModified),
  ]);

  // Halaman statis tanpa lastModified (tidak ada tanggal perubahan yang andal), beranda dan daftar
  // materi memakai tanggal konten terbaru.
  const staticRoutes = [
    { url: BASE_URL, lastModified: siteLastModified },
    { url: `${BASE_URL}/materi`, lastModified: latest(articleRoutes.map((a) => a.lastModified)) },
    { url: `${BASE_URL}/about` },
    { url: `${BASE_URL}/contact` },
    { url: `${BASE_URL}/privacy` },
    { url: `${BASE_URL}/disclaimer` },
  ];

  return [...staticRoutes, ...topicRoutes, ...paketRoutes, ...articleRoutes];
}
