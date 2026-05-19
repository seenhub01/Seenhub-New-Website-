"use client";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import "./about.css";

export default function AboutPage() {
  const [data, setData] = useState({
    aboutTitle: 'Who We Are',
    aboutDescription: 'Seen Hub is a next-generation destination where workspace solutions and architectural consultancy come together under one roof. Recognized as Al Ain’s first AI-powered business center, we empower modern businesses, startups, and professionals to thrive.',
    aboutPillars: [
      { t: 'Smart Spaces', d: 'Flexible, high-end workspaces crafted to enhance productivity and inspire innovation.' },
      { t: 'AI-Driven Environment', d: 'Advanced intelligent systems designed to optimize operations and elevate business performance.' },
      { t: 'Engineering & Architecture', d: 'Expert consultancy delivering precision, creativity, and future-ready solutions.' }
    ],
    aboutQuoteTitle: 'Inspired by the vision of the late His Highness Sheikh Zayed bin Sultan Al Nahyan',
    aboutQuoteText: '"The best investment on our land is human investment. It is the fundamental pillar of development. We must embrace modern science, gain broad knowledge, and explore every field of work to achieve a great civilizational transformation."',
    aboutQuoteAuthor: 'Sheikh Zayed bin Sultan Al Nahyan',
    aboutVision: 'Empowering visionaries with innovative workspaces and dynamic collaboration areas designed to inspire creativity, growth, and forward-thinking ideas.',
    aboutMission: 'To provide a state-of-the-art business hub integrating AI-driven innovation, premium environments, and collaborative ecosystems that enable entrepreneurs and leaders to thrive.',
    aboutOfferImage: '/seenhub_modern_workspace_1777453051246.png',
    aboutOfferList: ['Easy & Flexible Booking', 'Comfortable Lounge Areas', 'Semi-Private Booths', 'Fully Equipped Private Meeting Rooms', 'Smart Isolated Work Booths', 'Vibrant Café Deck', 'Library & Reading Book', 'Event Stage with Seating', 'Additional Amenities'],
    aboutFinalNote: 'Seen Business Hub is more than just a workspace it’s a dynamic environment where innovation, collaboration, and productivity thrive. Join us and experience a hub designed for growth, creativity, and success.'
  });

  useEffect(() => {
    const fetchLanding = async () => {
      try {
        const res = await fetch('/api/landing');
        const data = await res.json();
        if (data && Object.keys(data).length > 1) {
          setData(prev => ({ ...prev, ...data }));
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchLanding();
  }, []);

  return (
    <div className="about-container">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <h1>{data.aboutTitle}</h1>
          <p>{data.aboutDescription}</p>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="pillars-grid">
            {data.aboutPillars.map((p, i) => (
              <div key={i} className="pillar-card">
                <h3>{p.t}</h3>
                <p>{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="quote-section">
        <div className="container">
          <div className="quote-card">
            <p className="quote-title">{data.aboutQuoteTitle}</p>
            <p className="quote-text">{data.aboutQuoteText}</p>
            <p className="quote-author">{data.aboutQuoteAuthor}</p>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="section">
        <div className="container">
          <div className="vision-mission-grid">
            <div className="vm-card">
              <h2>Our Vision</h2>
              <p>{data.aboutVision}</p>
            </div>
            <div className="vm-card">
              <h2>Our Mission</h2>
              <p>{data.aboutMission}</p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="section bg-light">
        <div className="container">
          <div className="offer-split">
            <div className="offer-image">
              <Image src={data.aboutOfferImage || "/seenhub_modern_workspace_1777453051246.png"} alt="Seen Hub Offerings" width={600} height={400} unoptimized className="offer-img" style={{ width: '100%', height: 'auto' }} />
            </div>
            <div className="offer-content">
              <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '2rem' }}>What We Offer at Seen Hub?</h2>
              <ul className="offer-list">
                {data.aboutOfferList.map((item, i) => (
                  <li key={i} className="offer-item"><span>✓</span> {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final Note Section */}
      <section className="section">
        <div className="container text-center">
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <p className="intro-text" style={{ fontSize: '1.8rem', color: 'var(--foreground)', lineHeight: 1.5 }}>
              {data.aboutFinalNote}
            </p>
            <div style={{ marginTop: '3rem' }}>
              <Link href="/booking" className="btn-primary">Get Started Today</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
