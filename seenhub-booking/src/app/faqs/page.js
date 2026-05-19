"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export default function FAQPage() {
  const [faqs, setFaqs] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/faq')
      .then(res => res.json())
      .then(data => {
        setFaqs(data);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#0f172a', fontFamily: "'Inter', sans-serif" }}>
      {/* Header Section */}
      <section style={{ background: '#f8fafc', padding: '6rem 1rem 4rem', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#fff', padding: '0.5rem 1rem', borderRadius: 100, border: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <HelpCircle size={16} /> Help Center
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-1px' }}>Frequently Asked Questions</h1>
          <p style={{ fontSize: '1.1rem', color: '#64748b', lineHeight: 1.6 }}>Find quick answers to common questions about SeenHub workspaces, memberships, and services.</p>
        </div>
      </section>

      {/* FAQ List */}
      <section style={{ padding: '4rem 1rem', maxWidth: 850, margin: '0 auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>Loading questions...</div>
        ) : faqs.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {faqs.map((f, i) => (
              <div 
                key={i} 
                style={{ 
                  border: '1px solid #f1f5f9', 
                  borderRadius: 16, 
                  overflow: 'hidden', 
                  transition: 'all 0.3s ease',
                  background: openIndex === i ? '#fff' : '#f8fafc',
                  boxShadow: openIndex === i ? '0 10px 25px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                <button 
                  onClick={() => toggle(i)}
                  style={{ 
                    width: '100%', 
                    padding: '1.5rem', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', paddingRight: '2rem' }}>{f.question}</span>
                  {openIndex === i ? <ChevronUp size={20} color="#94a3b8" /> : <ChevronDown size={20} color="#94a3b8" />}
                </button>
                
                <div style={{ 
                  maxHeight: openIndex === i ? '500px' : '0', 
                  overflow: 'hidden', 
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  opacity: openIndex === i ? 1 : 0
                }}>
                  <div style={{ padding: '0 1.5rem 1.5rem', color: '#64748b', fontSize: '0.95rem', lineHeight: 1.7 }}>
                    <div style={{ height: '1px', background: '#f1f5f9', marginBottom: '1.25rem' }}></div>
                    {f.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
            No questions found. Please check back later.
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section style={{ padding: '6rem 1rem', textAlign: 'center' }}>
        <div style={{ background: '#0f172a', color: '#fff', padding: '4rem 2rem', borderRadius: 32, maxWidth: 850, margin: '0 auto', boxShadow: '0 20px 40px rgba(15,23,42,0.15)' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem' }}>Still have questions?</h2>
          <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>We&apos;re here to help you find exactly what you need.</p>
          <Link href="/contact" style={{ display: 'inline-block', padding: '1rem 2.5rem', background: '#fff', color: '#0f172a', textDecoration: 'none', borderRadius: 12, fontWeight: 700, transition: 'transform 0.2s' }}>Contact Support</Link>
        </div>
      </section>
    </div>
  );
}
