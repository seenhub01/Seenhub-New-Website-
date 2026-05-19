
"use client";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import Navbar from "@/components/Navbar";
import FloatingSupport from "@/components/FloatingSupport";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  const [logo, setLogo] = useState(null);
  const [settings, setSettings] = useState({
    openingHours: [],
    socialLinks: [],
    currency: 'AED'
  });
  const lastPath = React.useRef(null);

  useEffect(() => {
    // Initial fetch for settings
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        if (data.logo) setLogo(data.logo);
      })
      .catch(e => console.error(e));
  }, []);

  useEffect(() => {
    // Analytics Tracker (Robust & Anti-Duplicate)
    if (!isAdmin && lastPath.current !== pathname) {
      lastPath.current = pathname;
      let sessionId = sessionStorage.getItem('seenhub_session');
      if (!sessionId) {
        sessionId = 'sess_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('seenhub_session', sessionId);
      }

      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: pathname,
          sessionId,
          referrer: document.referrer || 'Direct'
        })
      }).catch(() => {});
    }
  }, [pathname, isAdmin]);

  return (
    <ErrorBoundary>
      {!isAdmin && <Navbar />}
      
      <main>{children}</main>

      {!isAdmin && (
        <footer className="footer">
          <div className="container">
            <div className="footer-grid">
              <div className="footer-brand">
                <div className="logo" style={{marginBottom: '1rem', display: 'flex', alignItems: 'center'}}>
                  {logo ? (
                    <img src={logo} alt="SEEN Hub" style={{ height: '60px', width: 'auto', objectFit: 'contain' }} />
                  ) : (
                    <div style={{fontWeight: 800, fontSize: '24px'}}>SEEN <span style={{color: '#d88906'}}>Hub</span></div>
                  )}
                </div>
                <p>Al Ain&apos;s first AI-powered business hub. A vibrant space where creativity sparks and ideas take flight.</p>
              </div>
              <div className="footer-links">
                <h4>Company</h4>
                <ul>
                  <li><Link href="/about">About Us</Link></li>
                  <li><Link href="/faqs">FAQs</Link></li>
                  <li><a href="https://share.google/jclPTdXW2VcF9YmIg" target="_blank" rel="noopener noreferrer">Location</a></li>
                  <li><Link href="/booking">Book a space</Link></li>
                </ul>
              </div>
              <div className="footer-links">
                <h4>Support</h4>
                <ul>
                  <li><Link href="/contact">Contact Us</Link></li>
                  <li><Link href="/dashboard">Member Login</Link></li>
                  <li><Link href="/privacy">Privacy Policy</Link></li>
                  <li><Link href="/terms">Terms & Conditions</Link></li>
                </ul>
              </div>
              <div className="footer-links">
                <h4>Connect</h4>
                <p style={{fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem'}}>
                  {(settings.openingHours || []).map((h, i) => (
                    <span key={i} style={{display: 'block'}}>{h.days}: {h.time}</span>
                  ))}
                </p>
                <div className="social-links">
                  {(settings.socialLinks || []).map((s, i) => (
                    <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" style={{ marginRight: '10px' }}>
                      {s.platform}
                    </a>
                  ))}
                </div>
              </div>
            </div>
            <div className="footer-bottom">
              <p>All rights reserved to SeenHub 2026</p>
            </div>
          </div>
        </footer>
      )}
      <FloatingSupport />
    </ErrorBoundary>
  );
}
