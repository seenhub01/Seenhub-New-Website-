"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Navbar from '../../components/Navbar';
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react';

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch('/api/blogs');
        const serverBlogs = await res.json();
        setBlogs([...serverBlogs].reverse());
      } catch (e) {
        console.error("Failed to load blogs:", e);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <main style={{ flex: 1, padding: '120px 2rem 4rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#f1f5f9', padding: '0.5rem 1rem', borderRadius: 50, color: '#0f172a', fontWeight: 700, fontSize: '0.85rem', marginBottom: '1rem' }}>
              <BookOpen size={16} /> SeenHub Resources
            </div>
            <h1 style={{ fontSize: '3rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1rem' }}>Latest Articles & Insights</h1>
            <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: 600, margin: '0 auto' }}>Stay updated with the latest news, tips, and insights from the SeenHub team to help your business grow.</p>
          </div>

          {blogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', background: '#fff', borderRadius: 24, border: '1px solid #e2e8f0' }}>
              <BookOpen size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
              <h3 style={{ margin: 0, color: '#475569', fontSize: '1.2rem' }}>No articles published yet.</h3>
              <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Check back later for new insights and updates!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
              {blogs.map((blog) => (
                <div 
                  key={blog.id} 
                  onClick={() => window.location.href = `/blogs/${blog.id}`}
                  style={{ background: '#fff', borderRadius: 24, overflow: 'hidden', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
                  onMouseOver={e => e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'}
                  onMouseOut={e => e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)'}
                >
                  
                  {blog.image && (
                    <div style={{ height: 220, overflow: 'hidden', position: 'relative' }}>
                      <Image src={blog.image} alt={blog.title} fill unoptimized style={{ objectFit: 'cover', transition: 'transform 0.5s ease' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} />
                    </div>
                  )}
                  
                  <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={14} /> {blog.date}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><User size={14} /> {blog.author}</span>
                    </div>
                    
                    <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.3 }}>{blog.title}</h2>
                    {blog.subtitle && <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 600, color: '#3b82f6' }}>{blog.subtitle}</h3>}
                    
                    {/* Render a snippet of the rich text content */}
                    <div 
                      dangerouslySetInnerHTML={{ __html: blog.content }} 
                      style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}
                    />
                    
                    <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                      <button style={{ background: 'transparent', border: 'none', color: '#0f172a', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', padding: 0 }}>
                        Read Article <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </main>

    </div>
  );
}
