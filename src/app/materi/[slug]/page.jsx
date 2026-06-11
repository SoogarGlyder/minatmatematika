// File: src/app/materi/[slug]/page.jsx
import React from 'react';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/dbConnect'; 
import Article from '@/models/Article';   
import MateriClient from './MateriClient';    
import Script from 'next/script';

async function getArticleData(slug) {
  await dbConnect();
  const article = await Article.findOne({ slug }).lean();
  
  if (!article) return null;

  return {
    ...article,
    _id: article._id.toString(),
    createdAt: article.createdAt?.toISOString(),
    updatedAt: article.updatedAt?.toISOString(),
  };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = await getArticleData(slug);

  if (!article) return { title: 'Materi Tidak Ditemukan | Minat Matematika' };

  const ogImage = article.image || '/social-cover.jpg';
  
  return {
    title: `${article.title} | Minat Matematika`, 
    description: article.excerpt,
    alternates: {
      canonical: `/materi/${slug}`,
    },

    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: `/materi/${slug}`,
      siteName: 'Minat Matematika', 
      locale: 'id_ID',
      type: 'article',
      publishedTime: article.createdAt,
      authors: ['Tim Minat Matematika'],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },

    twitter: {
      card: 'summary_large_image',
      title: `${article.title} | Minat Matematika`,
      description: article.excerpt,
      images: [ogImage],
    },
  };
}

export default async function ArticleDetailPage({ params }) {
  const { slug } = await params;
  await dbConnect();
  
  const articleRaw = await Article.findOneAndUpdate(
    { slug },
    { $inc: { views: 1 } },
    { new: true } 
  ).lean();

  if (!articleRaw) return notFound();
  const article = {
    ...articleRaw,
    _id: articleRaw._id.toString(),
    createdAt: articleRaw.createdAt?.toISOString(),
    updatedAt: articleRaw.updatedAt?.toISOString(),
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.excerpt,
    image: article.image ? [article.image] : ['https://www.minatmatematika.com/social-cover.jpg'],
    datePublished: article.createdAt,
    dateModified: article.updatedAt || article.createdAt,
    author: {
      '@type': 'Organization',
      name: 'Tim Minat Matematika',
      url: 'https://www.minatmatematika.com'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Minat Matematika',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.minatmatematika.com/minat-matematika-logo-saja.png'
      }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogClient article={article} />
    </>
  );
}