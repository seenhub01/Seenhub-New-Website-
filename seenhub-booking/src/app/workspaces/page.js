"use client";
import React, { useState, useEffect } from 'react';
import { ArrowRight, Users, Clock, ShieldCheck, MapPin, Sparkles, Zap, Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    const fetchWs = async () => {
      try {
        const res = await fetch('/api/workspaces', { cache: 'no-store' });
        const data = await res.json();
        if (data && data.length > 0) {
          setWorkspaces(data);
        }
      } catch (e) {
        console.error("Failed to fetch workspaces:", e);
      }
    };
    fetchWs();
  }, []);

  const S = {
    container: {
      minHeight: '100vh',
      background: '#f8fafc',
      color: '#0f172a',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      position: 'relative',
      overflowX: 'hidden',
      paddingTop: '80px'
    },
    hero: {
      textAlign: 'center',
      padding: '5rem 1.5rem',
      position: 'relative',
      zIndex: 10,
      background: 'white',
      borderBottom: '1px solid #e2e8f0'
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 20px',
      background: '#f1f5f9',
      borderRadius: '100px',
      marginBottom: '2rem',
      fontSize: '0.75rem',
      fontWeight: 800,
      textTransform: 'uppercase',
      letterSpacing: '1px',
      color: '#475569',
      border: '1px solid #e2e8f0'
    },
    title: {
      fontSize: 'clamp(2.5rem, 7vw, 4rem)',
      fontWeight: 900,
      marginBottom: '1.5rem',
      letterSpacing: '-2px',
      lineHeight: 1.1,
      color: '#0f172a'
    },
    subtitle: {
      fontSize: '1.15rem',
      color: '#64748b',
      maxWidth: '700px',
      margin: '0 auto',
      lineHeight: 1.6,
      fontWeight: 500
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '3rem',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '5rem 1.5rem 8rem',
      position: 'relative',
      zIndex: 10
    },
    card: (isHovered) => ({
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '2.5rem',
      overflow: 'hidden',
      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: isHovered ? 'translateY(-12px)' : 'translateY(0)',
      boxShadow: isHovered ? '0 30px 60px -12px rgba(15, 23, 42, 0.15)' : '0 10px 30px -15px rgba(15, 23, 42, 0.08)'
    }),
    imgContainer: {
      height: '260px',
      overflow: 'hidden',
      position: 'relative'
    },
    img: (isHovered) => ({
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transition: 'transform 0.8s ease',
      transform: isHovered ? 'scale(1.08)' : 'scale(1)'
    }),
    cardContent: {
      padding: '2.5rem'
    },
    cardTitle: {
      fontSize: '1.65rem',
      fontWeight: 800,
      marginBottom: '0.85rem',
      color: '#0f172a'
    },
    cardSubtitle: {
      fontSize: '0.95rem',
      color: '#64748b',
      lineHeight: 1.6,
      marginBottom: '2rem',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    },
    iconGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: '1.5rem',
      padding: '1.5rem 0',
      borderTop: '1px solid #f1f5f9',
      borderBottom: '1px solid #f1f5f9',
      marginBottom: '2rem'
    },
    iconItem: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px'
    },
    iconLabel: {
      fontSize: '0.65rem',
      fontWeight: 700,
      color: '#94a3b8',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    btn: (isHovered) => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      width: '100%',
      height: '60px',
      background: isHovered ? '#0f172a' : '#f8fafc',
      border: isHovered ? '1px solid #0f172a' : '1px solid #e2e8f0',
      borderRadius: '20px',
      color: isHovered ? '#ffffff' : '#0f172a',
      fontWeight: 800,
      fontSize: '0.9rem',
      textTransform: 'uppercase',
      letterSpacing: '1.5px',
      textDecoration: 'none',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    })
  };

  return (
    <div style={S.container}>
      {/* Hero Section */}
      <section style={S.hero}>
        <div style={S.badge}>
          <Sparkles size={16} />
          SeenHub Elite Spaces
        </div>
        <h1 style={S.title}>
          Curated <span style={{color: '#64748b'}}>Business</span> Environments
        </h1>
        <p style={S.subtitle}>
          Professional spaces designed for productivity and growth. 
          Experience Al Ain&apos;s first AI-integrated business center.
        </p>
      </section>

      {/* Grid Section */}
      <div style={S.grid}>
        {workspaces.map((ws) => {
          const isHovered = hoveredId === ws.id;
          // Generate the correct dynamic link
          const categoryLink = `/workspaces/${ws.title.toLowerCase().replace(/ \(/g, '-').replace(/\)/g, '').replace(/ /g, '-')}`;

          return (
            <div 
              key={ws.id} 
              style={S.card(isHovered)}
              onMouseEnter={() => setHoveredId(ws.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div style={S.imgContainer}>
                <Image src={ws.featuredImg || ws.img} alt={ws.title} fill unoptimized style={{ objectFit: 'cover', transition: 'transform 0.8s ease', transform: isHovered ? 'scale(1.08)' : 'scale(1)' }} />
                <div style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.95)', padding: '8px 16px', borderRadius: '100px', fontSize: '10px', fontWeight: 900, color: '#0f172a', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  {ws.bookingTypes?.[0]?.toUpperCase() || 'FLEXIBLE'}
                </div>
              </div>

              <div style={S.cardContent}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', marginBottom: 12 }}>
                  <MapPin size={12} /> SeenHub Business Center
                </div>
                <h3 style={S.cardTitle}>{ws.title}</h3>
                <p style={S.cardSubtitle}>{ws.subtitle || ws.desc}</p>

                <div style={S.iconGrid}>
                  <div style={S.iconItem}>
                    <div style={{ color: '#94a3b8' }}><Users size={20} /></div>
                    <span style={S.iconLabel}>{ws.maxGuests || 1} Guests</span>
                  </div>
                  <div style={S.iconItem}>
                    <div style={{ color: '#94a3b8' }}><Zap size={20} /></div>
                    <span style={S.iconLabel}>Smart Hub</span>
                  </div>
                  <div style={S.iconItem}>
                    <div style={{ color: '#94a3b8' }}><ShieldCheck size={20} /></div>
                    <span style={S.iconLabel}>Premium</span>
                  </div>
                </div>

                <Link 
                  href={categoryLink}
                  style={S.btn(isHovered)}
                >
                  More Details <ArrowRight size={20} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800;900&display=swap');
        body { background: #f8fafc; margin: 0; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
