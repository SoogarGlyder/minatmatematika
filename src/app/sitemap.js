// File: src/app/sitemap.js
import dbConnect from '@/lib/dbConnect';
import Topic from '@/models/Topic';
import PaketSoal from '@/models/PaketSoal';
import Article from '@/models/Article';

const BASE_URL = 'https://www.minatmatematika.com';

export default async function sitemap() {
  await dbConnect();

  const [topics, pakets, articles] = await Promise.all([
    Topic.find({})
      .select('slug updatedAt')
      .lean(),
      
    PaketSoal.find({})
      .select('paket_slug updatedAt topic')
      .populate({
        path: 'topic',
        select: 'slug',
      })
      .sort({ updatedAt: -1 })
      .limit(5000)
      .lean(),

    Article.find({})
      .select('slug updatedAt date')
      .sort({ date: -1 })
      .lean()
  ]);

  const routes = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/disclaimer`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];

  const topicRoutes = topics.map((topic) => ({
    url: `${BASE_URL}/${topic.slug}`,
    lastModified: topic.updatedAt || new Date(),
    changeFrequency: 'daily', 
    priority: 0.8,
  }));

  const paketRoutes = pakets.map((paket) => {
    const topicSlug = paket.topic?.slug; 
    
    if (!topicSlug) return null;

    return {
      url: `${BASE_URL}/${topicSlug}/${paket.paket_slug}`,
      lastModified: paket.updatedAt || new Date(),
      changeFrequency: 'monthly', 
      priority: 0.6,
    };
  }).filter(Boolean);

  const articleRoutes = articles.map((article) => ({
    url: `${BASE_URL}/blog/${article.slug}`,
    lastModified: article.updatedAt || article.date || new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...routes, ...topicRoutes, ...paketRoutes, ...articleRoutes];
}