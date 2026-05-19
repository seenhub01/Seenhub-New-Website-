"use client";
import React, { useState, useEffect } from 'react';
import '../home.css';

export default function MembershipsPage() {
  const [memberships, setMemberships] = useState([]);

  useEffect(() => {
    fetch('/api/memberships')
      .then(res => res.json())
      .then(data => setMemberships(data))
      .catch(e => console.error(e));
  }, []);

  return (
    <div className="home-container">
      <section className="section bg-light" style={{ minHeight: '80vh', paddingTop: '100px' }}>
        <div className="container">
          <div className="section-header text-center" style={{ marginBottom: '4rem' }}>
            <h1 className="section-title" style={{ fontSize: '3rem' }}>Memberships & Passes</h1>
            <p className="section-subtitle">Flexible packages — daily, monthly, or multi-month.</p>
          </div>

          <div className="memberships-grid">
            {memberships.map((m) => (
              <div key={m.id} className="card membership-card animate-fade">
                <div className="membership-icon" style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>{m.icon}</div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem' }}>{m.title}</h3>
                <p style={{ color: '#64748b', lineHeight: 1.6, marginBottom: '2rem', flexGrow: 1 }}>{m.desc || m.subtitle}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>{m.price} AED</span>
                  <a href={`/memberships/${m.slug || m.title.toLowerCase().replace(/ /g, '-')}`} className="btn-secondary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>Learn More</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
