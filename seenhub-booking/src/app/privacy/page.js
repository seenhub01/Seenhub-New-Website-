"use client";
import React, { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';

export default function PrivacyPage() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/legal')
      .then(res => res.json())
      .then(data => {
        setContent(data.privacy);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#0f172a', fontFamily: "'Inter', sans-serif" }}>
      <section style={{ background: '#f8fafc', padding: '6rem 1rem 4rem', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#fff', padding: '0.5rem 1rem', borderRadius: 100, border: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.5rem' }}>
            <ShieldCheck size={16} /> Privacy & Security
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-1px' }}>Privacy Policy</h1>
          <p style={{ fontSize: '1.1rem', color: '#64748b', lineHeight: 1.6 }}>How we collect, use, and protect your personal information.</p>
        </div>
      </section>

      <section style={{ padding: '4rem 1rem', maxWidth: 850, margin: '0 auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>Loading content...</div>
        ) : content ? (
          <div 
            className="legal-content" 
            dangerouslySetInnerHTML={{ __html: content }} 
            style={{ lineHeight: 1.8, color: '#475569', fontSize: '1.05rem' }}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
            Privacy policy is currently being updated.
          </div>
        )}
      </section>

      <style jsx global>{`
        .legal-content h1, .legal-content h2, .legal-content h3 { color: #0f172a; margin-top: 2rem; margin-bottom: 1rem; }
        .legal-content p { margin-bottom: 1.5rem; }
        .legal-content ul, .legal-content ol { margin-bottom: 1.5rem; padding-left: 1.5rem; }
        .legal-content li { margin-bottom: 0.5rem; }
      `}</style>
    </div>
  );
}
