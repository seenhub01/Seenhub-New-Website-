"use client";
import "./home.css";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import WorkspaceSlider from "@/components/WorkspaceSlider";
import PromoPopup from "@/components/PromoPopup";
import GlobalLoader from "@/components/GlobalLoader";

const DEFAULT_LANDING = {
  heroTitle: 'SEEN Business Hub',
  heroSubtitle: 'Al Ain first AI-powered business hub',
  heroImage: '',
  aboutQuote: '"Seen Hub is more than just a workspace, it’s a vibrant hub where creativity sparks and ideas take flight. That’s why we’ve built Al Ain first AI-powered business hub a place where technology quietly makes things easier, so people can focus on what really matters: creating, collaborating, and growing together."',
  aboutImage: ''
};

export default function Home() {
  const [landing, setLanding] = React.useState(DEFAULT_LANDING);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const fetchLanding = async () => {
      try {
        const res = await fetch('/api/landing');
        const data = await res.json();
        if (data && Object.keys(data).length > 1) {
          setLanding(prev => ({ ...prev, ...data }));
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchLanding();
  }, []);

  if (!mounted) return <div style={{ minHeight: '100vh', background: '#fff' }} />;

  // Split title if it contains "Business Hub"
  const renderTitle = () => {
    if (landing.heroTitle.toLowerCase().includes('business hub')) {
      const parts = landing.heroTitle.split(/Business Hub/i);
      return (
        <h1 className="hero-title">
          {parts[0]} <span>Business Hub</span> {parts[1]}
        </h1>
      );
    }
    return <h1 className="hero-title">{landing.heroTitle}</h1>;
  };

  return (
    <div className="home-container">
      <PromoPopup />
      {/* Hero Section */}
      <section className="hero section">
        <div className="container">
          <div className="hero-banner" style={{ backgroundImage: landing.heroImage ? `url(${landing.heroImage})` : 'none', backgroundColor: '#f8fafc' }}>
            <div className="hero-content">
              {renderTitle()}
              <p style={{ fontSize: '1.25rem', color: '#64748b', marginBottom: '2.5rem', lineHeight: 1.6, maxWidth: '500px' }}>
                {landing.heroSubtitle}
              </p>
              <div className="hero-btns">
                <a href="/booking" className="btn-primary">Book Your Spot</a>
                <a href="#workspaces" className="btn-secondary">View Workspaces</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="section" style={{ paddingTop: '2rem', paddingBottom: 0 }}>
        <div className="container">
          <div className="intro-split">
            <div className="intro-content">
              <div className="intro-box">
                <p className="intro-text">
                  {landing.aboutQuote}
                </p>
              </div>
            </div>
            <div className="intro-image">
              {landing.aboutImage && (
                <Image src={landing.aboutImage} alt="SeenHub Welcome" width={600} height={400} unoptimized className="split-img" style={{ width: '100%', height: 'auto', borderRadius: '24px', objectFit: 'cover' }} />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Workspaces Section */}
      <section id="workspaces" className="section">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">Your Workspace</h2>
            <p className="section-subtitle">Diverse spaces tailored to your work style and team needs.</p>
          </div>
          
          <WorkspaceSlider />
        </div>
      </section>

      {/* Memberships Section */}
      <section id="memberships" className="section bg-light" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">Memberships & Passes</h2>
            <p className="section-subtitle">Flexible packages — daily, monthly, or multi-month.</p>
          </div>

          <div className="memberships-grid">
            <div className="card membership-card">
              <div className="membership-icon">🏢</div>
              <h3>Day Pass-Coworking Space</h3>
              <p>Work from the open area all day, with calm and productive vibes.</p>
              <Link href="/memberships/day-pass" className="btn-secondary">Learn More</Link>
            </div>
            <div className="card membership-card">
              <div className="membership-icon">📅</div>
              <h3>Monthly Membership</h3>
              <p>Your everyday space, with 2 private space uses per month.</p>
              <Link href="/memberships/monthly-membership" className="btn-secondary">Learn More</Link>
            </div>
            <div className="card membership-card">
              <div className="membership-icon">🎓</div>
              <h3>Student Membership</h3>
              <p>Study, create, and grow at a student-friendly rate.</p>
              <Link href="/memberships/student-membership" className="btn-secondary">Learn More</Link>
            </div>
            <div className="card membership-card">
              <div className="membership-icon">⭐</div>
              <h3>VIP Daily Pass</h3>
              <p>Your day, elevated with private access and premium comfort.</p>
              <Link href="/memberships/vip-daily-pass" className="btn-secondary">Learn More</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Team CTA */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="team-cta animate-fade">
            <div className="cta-content">
              <h2>Looking for a dedicated space for your team?</h2>
              <p>Private offices, meeting rooms & team suites — tailored for you.</p>
            </div>
            <Link href="/contact" className="btn-primary" style={{ background: 'white', color: 'black', textDecoration: 'none', display: 'inline-block' }}>Enquire Now</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
