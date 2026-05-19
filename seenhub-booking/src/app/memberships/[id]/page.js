"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import '../../workspaces/workspace-detail.css';

const FALLBACK = {
  "day-pass": { title: "Day Pass-Coworking Space", descBold: "Full-Day Coworking Access – Starting From 89 AED", features: ["High-Speed Wi-Fi", "Flexible Seating Options", "Free Car Parking", "Restrooms & Prayer Rooms", "24/7 Security", "Library with Diverse Books"], descThin: "Enjoy a full day of access to our open coworking area. No reservation required — simply walk in, find your spot, and get to work.", images: ["/seenhub_modern_workspace_1777453051246.png", "/seenhub_meeting_room_1777453153762.png"], bookingUrl: "/booking?service=Day Pass" },
  "monthly-membership": { title: "Monthly Membership", descBold: "Monthly Membership - Starting From 1620 AED", features: ["High-Speed Wi-Fi", "Flexible Seating Options", "Free Car Parking", "Restrooms & Prayer Rooms", "24/7 Security", "Library with Diverse Books"], descThin: "Enjoy unlimited access to our open coworking space. Work in a professional environment designed for productivity and collaboration.", images: ["/seenhub_modern_workspace_1777453051246.png", "/seenhub_vip_lounge_1777453307436.png"], bookingUrl: "/booking?service=Monthly Membership" },
  "student-membership": { title: "Student Membership", descBold: "Student Membership – Starting From 1200 AED", features: ["High-Speed Wi-Fi", "Flexible Seating Options", "Free Car Parking", "Restrooms & Prayer Rooms", "24/7 Security", "Library with Diverse Books"], descThin: "Designed for students who need a focused and productive environment. Ideal for studying, collaborating, and working on academic projects.", images: ["/seenhub_modern_workspace_1777453051246.png", "/seenhub_meeting_room_1777453153762.png"], bookingUrl: "/booking?service=Student Membership" },
  "vip-daily-pass": { title: "VIP Daily Pass", descBold: "VIP Daily Pass – 120 AED", features: ["Private Entrance", "High End Comfort Seats", "Meeting Table & Executive Desk", "Pantry With Refreshment & Private Bathroom", "Dedicated Parking"], descThin: "Experience a premium workspace for a full day. Enjoy private, comfortable access in a professional environment designed for focus and productivity.", images: ["/seenhub_vip_lounge_1777453307436.png", "/seenhub_manager_room_1777454051312.png"], bookingUrl: "/booking?service=VIP Daily Pass" }
};

export default function MembershipDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/memberships')
      .then(res => res.json())
      .then(memberships => {
        const found = memberships.find(m => m.slug === id);
        if (found) {
          setData(found);
        } else {
          // Use fallback static data if slug not found in API
          setData(FALLBACK[id] || FALLBACK['day-pass']);
        }
        setLoading(false);
      })
      .catch(() => {
        setData(FALLBACK[id] || FALLBACK['day-pass']);
        setLoading(false);
      });
  }, [id]);

  const handleBookClick = (e) => {
    e.preventDefault();
    if (!data) return;
    const url = data.bookingUrl || `/booking?service=${encodeURIComponent(data.title)}`;
    const finalUrl = `${url}&category=memberships`;
    const user = localStorage.getItem('seenhub_user');
    if (user) {
      window.location.href = finalUrl;
    } else {
      window.dispatchEvent(new CustomEvent('openAuthModal', { detail: { redirectUrl: finalUrl } }));
    }
  };

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#94a3b8' }}>Loading...</p>
    </div>
  );

  if (!data) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p>Membership not found.</p>
    </div>
  );

  const images = data.images && data.images.length > 0
    ? data.images
    : ['/seenhub_modern_workspace_1777453051246.png'];

  return (
    <div className="detail-container">
      <div className="container">
        <div className="breadcrumbs">
          <Link href="/">Home</Link> <span>›</span> <Link href="/memberships">Memberships</Link> <span>›</span> {data.title}
        </div>

        <div className="workspace-detail-split">
          {/* Left Side: Slider */}
          <div className="detail-slider-container">
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
                  <Image src={img} alt={`${data.title} slide ${index}`} fill unoptimized className="detail-slide-img" style={{ objectFit: 'cover' }} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Right Side: Content Card */}
          <div className="detail-content-card">
            <div>
              <h1 className="detail-title">{data.title}</h1>

              {data.descBold && (
                <p className="detail-desc-bold" style={{ fontWeight: 800, marginBottom: '1rem', color: '#000', fontSize: '1.2rem' }}>
                  {data.descBold}
                </p>
              )}

              {data.features && data.features.length > 0 && (
                <ul style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '1.5rem', padding: 0 }}>
                  {data.features.map((feat, i) => (
                    <li key={i} style={{ fontSize: '0.9rem', color: '#555', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ color: '#d9aa6f', fontSize: '1rem' }}>✓</span> {feat}
                    </li>
                  ))}
                </ul>
              )}

              {(data.descThin || data.desc) && (
                <p className="detail-desc-bold" style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6' }}>
                  {data.descThin || data.desc}
                </p>
              )}
            </div>

            <div style={{ textAlign: 'left', marginTop: '2rem' }}>
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
