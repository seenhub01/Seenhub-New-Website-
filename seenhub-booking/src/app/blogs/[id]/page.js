"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Navbar from '../../../components/Navbar';
import { Calendar, User, ArrowLeft, Clock } from 'lucide-react';

export default function BlogDetailPage() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await fetch('/api/blogs');
        const blogs = await res.json();
        const found = blogs.find(b => String(b.id) === String(id));
        setBlog(found || null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff' }}>
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
          <div className="loader">Loading...</div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '120px 2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Article Not Found</h1>
          <p style={{ color: '#64748b', marginTop: '1rem' }}>The article you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/blogs" style={{ marginTop: '2rem', display: 'inline-block', color: '#0f172a', fontWeight: 700, textDecoration: 'none' }}>
            <ArrowLeft size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Back to Blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#fff', minHeight: '100vh' }}>
      <Navbar />
      
      <main style={{ padding: '140px 2rem 6rem' }}>
        <article style={{ maxWidth: 850, margin: '0 auto' }}>
          
          {/* Breadcrumbs / Back */}
          <Link href="/blogs" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, marginBottom: '2.5rem', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#0f172a'} onMouseOut={e => e.currentTarget.style.color = '#64748b'}>
            <ArrowLeft size={16} /> Back to Articles
          </Link>

          {/* Header */}
          <header style={{ marginBottom: '3rem' }}>
            {blog.subtitle && (
              <span style={{ color: '#3b82f6', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '1rem' }}>
                {blog.subtitle}
              </span>
            )}
            <h1 style={{ fontSize: '3.5rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.1, margin: '0 0 2rem', letterSpacing: '-1px' }}>
              {blog.title}
            </h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', padding: '1.5rem 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 44, height: 44, background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f172a', fontWeight: 800 }}>
                  {blog.author?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>{blog.author}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Author</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Calendar size={16} /> {blog.date}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Clock size={16} /> 5 min read</span>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {blog.image && (
            <div style={{ marginBottom: '4rem', borderRadius: 32, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
              <Image src={blog.image} alt={blog.title} width={850} height={480} unoptimized style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
          )}

          {/* Content */}
          <div 
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: blog.content }}
            style={{ 
              fontSize: '1.25rem', 
              lineHeight: 1.8, 
              color: '#334155',
              fontWeight: 400,
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}
          />

        </article>
      </main>

      <style jsx global>{`
        .blog-content p {
          margin-bottom: 2rem;
        }
        .blog-content h2 {
          font-size: 2rem;
          font-weight: 800;
          color: #0f172a;
          margin: 3rem 0 1.5rem;
          line-height: 1.2;
        }
        .blog-content h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0f172a;
          margin: 2.5rem 0 1.25rem;
        }
        .blog-content ul, .blog-content ol {
          margin-bottom: 2rem;
          padding-left: 1.5rem;
        }
        .blog-content li {
          margin-bottom: 0.75rem;
        }
        .blog-content blockquote {
          border-left: 4px solid #0f172a;
          padding-left: 2rem;
          margin: 3rem 0;
          font-style: italic;
          font-size: 1.5rem;
          color: #1e293b;
        }
        .blog-content img {
          max-width: 100%;
          height: auto;
          border-radius: 20px;
          margin: 3rem 0;
        }
      `}</style>
    </div>
  );
}
