// File: src/app/materi/[slug]/MateriClient.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import parse, { domToReact } from 'html-react-parser';
import sanitizeHtml from 'sanitize-html';
import { useFontSize } from '@/contexts/FontSizeContext'; 
import styles from './MateriPage.module.css';
import Breadcrumbs from '@/components/Breadcrumbs';
import RightSidebar from '@/components/RightSidebar';
import 'katex/dist/katex.min.css'; 
import { BlockMath, InlineMath } from 'react-katex';
import CommentSection from '@/components/CommentSection';

// IMPORT KOMPONEN IKLAN
import AdBanner from '@/components/AdBanner';

export default function MateriClient({ article }) {
  const { fontSize } = useFontSize();
  const [isListVisible, setIsListVisible] = useState(false);
  const [headings, setHeadings] = useState([]);
  const [relatedArticles, setRelatedArticles] = useState([]);

  useEffect(() => {
    if (article?.content) {
      const regex = /<h([2-3])(.*?)>(.*?)<\/h\1>/g;
      const matches = [];
      let match;
      while ((match = regex.exec(article.content)) !== null) {
        const text = match[3].replace(/<[^>]*>/g, '');
        const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        matches.push({ level: match[1], text: text, id: id });
      }
      setHeadings(matches);
    }
  }, [article]);

  useEffect(() => {
    const fetchRelated = async () => {
        try {
            const res = await fetch('/api/articles');
            const data = await res.json();
            
            if (res.ok && Array.isArray(data)) {
                const filtered = data
                    .filter(item => item.slug !== article.slug)
                    .slice(0, 3); 
                setRelatedArticles(filtered);
            }
        } catch (error) {
            console.error("Gagal memuat artikel terkait:", error);
        }
    };

    if (article?.slug) {
        fetchRelated();
    }
  }, [article]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth > 767) {
        setIsListVisible(true);
      }
    }
    const handleResize = () => {
      setIsListVisible(window.innerWidth > 767);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!article) return null;

  const options = {
    replace: (domNode) => {
      if (domNode.attribs && domNode.attribs.class === 'math-block') {
        const mathExpression = domNode.attribs['data-math'];
        return (
          <div style={{ overflowX: 'auto', margin: '15px 0', textAlign: 'center', padding: '10px', background: 'var(--input-bg)', borderRadius: '8px' }}>
            <BlockMath math={mathExpression} />
          </div>
        );
      }
      if (domNode.attribs && domNode.attribs.class === 'math-inline') {
        const mathExpression = domNode.attribs['data-math'];
        return (
           <span className="math-inline-wrapper" style={{ margin: '0 2px' }}>
              <InlineMath math={mathExpression} />
           </span>
        );
      }
      if (domNode.type === 'tag' && domNode.name === 'img') {
        const { src, alt } = domNode.attribs;
        return (
          <div className={styles.optimizedImageWrapper}>
            <Image 
              src={src}
              alt={alt || 'Ilustrasi Materi'}
              width={0}
              height={0}
              sizes="(max-width: 768px) 100vw, 800px"
              style={{ width: '100%', height: 'auto' }}
              loading="lazy"
              quality={85}
            />
          </div>
        );
      }
      if (domNode.type === 'tag' && ['h2', 'h3'].includes(domNode.name)) {
         const text = domToReact(domNode.children).toString();
         const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
         if (domNode.name === 'h2') return <h2 id={id}>{domToReact(domNode.children)}</h2>;
         if (domNode.name === 'h3') return <h3 id={id}>{domToReact(domNode.children)}</h3>;
      }
    }
  };
  
  const contentWithBreaks = (article.content || '').replace(/\n/g, '');
  
  const cleanContent = sanitizeHtml(contentWithBreaks, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 
        'img', 'div', 'span', 'br', 'hr', 'h2', 'h3', 'blockquote', 'ul', 'ol', 'li', 'b', 'strong', 'i', 'em' 
    ]),
    allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        'img': ['src', 'alt', 'width', 'height', 'title'],
        'h2': ['id'], 'h3': ['id'],
        'div': ['class', 'style', 'data-math'], 
        'span': ['class', 'style', 'data-math']
    }
  });

  const scrollToHeading = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 105; 
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      if (window.innerWidth <= 767) setIsListVisible(false);
    }
  };

  return (
    <div className={styles.holyGrailLayout}>
       <aside className={styles.leftSidebar}>
          <button
            className={styles.mobileToggle}
            onClick={() => setIsListVisible(!isListVisible)}>
            Daftar Isi {isListVisible ? '▴' : '▾'}
          </button>
          <h2 className={styles.leftSidebarTitle}>Daftar Isi</h2>
          
          {isListVisible && (
              <ul className={styles.chapterList}>
                {headings.length > 0 ? (
                  headings.map((head, index) => (
                    <li key={index} style={{ paddingLeft: head.level === '3' ? '0' : '0' }}>
                      <div onClick={() => scrollToHeading(head.id)} className={styles.chapterLink} title={head.text}>
                        <span>{head.text}</span>
                      </div>
                    </li>
                  ))
                ) : (
                  <li style={{ padding: '10px', color: '#888', fontStyle: 'italic' }}>Tidak ada subjudul</li>
                )}
              </ul>
          )}
      </aside>

      <main className={styles.mainContent}>
            <Breadcrumbs 
              items={[{ label: 'Materi', link: '/blog' }, { label: article.title, link: null }]} 
            />
            <div className={styles.chapterHeader}>
              <h1>{article.title}</h1>
              {article.subtitle && <h2>{article.subtitle}</h2>}
              <span style={{ fontSize: '0.9rem', color: '#888' }}>
                {article.date} | {article.author || 'Tim Akademik'}
              </span>
            </div>
            
            <hr className={styles.divider} />
            
            {/* AREA ISI ARTIKEL */}
            <div className={styles.content} style={{ fontSize: `${fontSize}px` }}>
               {parse(cleanContent, options)}
            </div>

            {/* --- IKLAN ADSENSE DITEMPATKAN DI SINI --- */}
            <div style={{ margin: '30px 0', borderTop: '1px dashed var(--input-border)', borderBottom: '1px dashed var(--input-border)', padding: '20px 0' }}>
              <span style={{ fontSize: '0.75rem', color: '#888', display: 'block', textAlign: 'center', marginBottom: '20px' }}>Advertisement</span>
              <AdBanner dataAdSlot="4564146092" />
            </div>

            {/* AREA ARTIKEL TERKAIT */}
            {relatedArticles.length > 0 && (
                <div className={styles.relatedSection}>
                    <h3 className={styles.relatedTitle}>Materi Lainnya</h3>
                    <div className={styles.relatedGrid}>
                        {relatedArticles.map((rel) => (
                            <Link href={`/blog/${rel.slug}`} key={rel._id} className={styles.relatedCard}>
                                <div className={styles.relatedImageWrapper}>
                                    <Image 
                                        src={rel.image || '/social-cover.jpg'} 
                                        alt={rel.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                        style={{ objectFit: 'cover' }}
                                    />
                                </div>
                                <div className={styles.relatedContent}>
                                    <div className={styles.relatedCardTitle}>{rel.title}</div>
                                    <div className={styles.relatedCardDate}>{rel.date}</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ marginTop: '40px', borderTop: '1px solid var(--input-border)'}}>
                <CommentSection 
                    topicSlug="materi" 
                    paketSlug={article.slug} 
                />
            </div>
      </main>
      
      <RightSidebar 
        affiliateData={{
          title: article.affiliate_title,
          link: article.affiliate_link,
          image: article.affiliate_image
        }} 
      />

    </div>
  );
}