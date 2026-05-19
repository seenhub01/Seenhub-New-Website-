"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import '../workspace-detail.css';

export default function WorkspaceDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWS = async () => {
      try {
        const res = await fetch('/api/workspaces', { cache: 'no-store' });
        const workspaces = await res.json();
        const ws = workspaces.find(w => {
          const slug = w.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
          return slug === id;
        });
        setData(ws || null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchWS();
  }, [id]);

  const handleBookClick = (e) => {
    e.preventDefault();
    if (!data) return;
    const user = localStorage.getItem('seenhub_user');
    const finalUrl = `/booking?service=${encodeURIComponent(data.title)}&category=workspaces`;
    if (user) {
      window.location.href = finalUrl;
    } else {
      window.dispatchEvent(new CustomEvent('openAuthModal', {
        detail: { redirectUrl: finalUrl }
      }));
    }
  };

  if (loading) {
    return (
      <div className="detail-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <p style={{ color: '#94a3b8', fontSize: '1rem' }}>Loading workspace...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="detail-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: '#94a3b8' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏢</div>
          <h2 style={{ color: '#0f172a', marginBottom: '0.5rem' }}>Workspace Not Found</h2>
          <p>This workspace may have been removed or renamed.</p>
          <Link href="/#workspaces" style={{ marginTop: '1rem', display: 'inline-block', padding: '0.75rem 1.5rem', background: '#0f172a', color: '#fff', borderRadius: 10, textDecoration: 'none', fontWeight: 700 }}>View All Workspaces</Link>
        </div>
      </div>
    );
  }

  const images = (data.gallery && data.gallery.length > 0) ? data.gallery : (data.featuredImg ? [data.featuredImg] : []);

  return (
    <div className="detail-container">
      <div className="container">
        {/* Breadcrumbs */}
        <div className="breadcrumbs">
          <Link href="/">Home</Link> <span>›</span> <Link href="/#workspaces">Workspaces</Link> <span>›</span> {data.title}
        </div>

        {/* Split Content */}
        <div className="workspace-detail-split">
          {/* Left Side: Slider */}
          <div className="detail-slider-container">
            {images.length > 0 ? (
              <Swiper
                modules={[Pagination, Autoplay]}
                spaceBetween={0}
                slidesPerView={1}
                pagination={{ clickable: true }}
                autoplay={{ delay: 4000 }}
                className="detailSwiper"
              >
                {images.map((img, index) => (
                  <SwiperSlide key={index}>
                    <Image src={img} alt={`${data.title} slide ${index + 1}`} fill unoptimized className="detail-slide-img" style={{ objectFit: 'cover' }} />
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <div style={{ height: 300, background: '#f1f5f9', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>No image</div>
            )}
          </div>

          {/* Right Side: Content Card */}
          <div className="detail-content-card">
            <div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 0.5rem' }}>{data.subtitle}</p>
              <h1 className="detail-title">{data.title}</h1>
              <p className="detail-desc-bold">{data.description}</p>

              {/* Max Guests */}
              {data.maxGuests && (
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0.75rem 0 0', background: '#f8fafc', padding: '0.5rem 0.9rem', borderRadius: 8, display: 'inline-block' }}>
                  👥 Max Capacity: <strong>{data.maxGuests} guests</strong>
                </p>
              )}

              {/* Pricing Preview */}
              {data.pricing && (
                <div style={{ marginTop: '1.25rem' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Starting From</p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {(data.bookingTypes || []).map(type => {
                      const key = type.toLowerCase();
                      const price = data.pricing[key]?.individual;
                      if (!price) return null;
                      return (
                        <span key={type} style={{ background: '#f1f5f9', padding: '0.35rem 0.75rem', borderRadius: 8, fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>
                          {type}: <span style={{ color: '#0ea5e9' }}>AED {price}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div style={{ textAlign: 'left', marginTop: '1.5rem' }}>
              <button
                onClick={handleBookClick}
                className="book-btn-large"
                style={{ border: 'none', cursor: 'pointer', display: 'inline-block' }}
              >
                Book your Space
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
