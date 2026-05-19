"use client";
import React, { useState, useEffect } from 'react';
import BookingForm from '@/components/BookingForm';
import BookingSummary from '@/components/BookingSummary';
import './booking.css';

export default function BookingPage() {
  const [booking, setBooking] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkUser = () => {
        const storedUser = localStorage.getItem('seenhub_user');
        if (!storedUser) {
          setUser(null);
          // Trigger Auth modal with return redirect back to booking page
          window.dispatchEvent(new CustomEvent('openAuthModal', {
            detail: { redirectUrl: window.location.pathname + window.location.search }
          }));
        } else {
          setUser(JSON.parse(storedUser));
        }
        setCheckingAuth(false);
      };

      checkUser();

      const pendingRenewal = localStorage.getItem('seenhub_pending_renewal');
      if (pendingRenewal) {
        setBooking(JSON.parse(pendingRenewal));
        localStorage.removeItem('seenhub_pending_renewal');
      }
    }
  }, []);

  if (checkingAuth) {
    return (
      <div className="booking-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: '#94a3b8' }}>
          <p style={{ fontSize: '1.1rem' }}>Checking authorization...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="booking-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: '#64748b', maxWidth: '400px', padding: '2rem', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
          <h2 style={{ color: '#0f172a', marginBottom: '0.75rem', fontSize: '1.5rem', fontWeight: 800 }}>Authentication Required</h2>
          <p style={{ marginBottom: '1.5rem', lineHeight: 1.5, fontSize: '0.95rem' }}>Please log in or register an account to reserve your spot.</p>
          <button 
            onClick={() => {
              window.dispatchEvent(new CustomEvent('openAuthModal', {
                detail: { redirectUrl: window.location.pathname + window.location.search }
              }));
            }}
            style={{ padding: '0.75rem 1.5rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
          >
            Log In / Sign Up
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <section className="section">
        <div className="container">
          <div className="page-header text-center">
            <h1 className="text-gradient">Reserve Your Spot</h1>
            <p className="subtitle">Seamless booking experience at your fingertips.</p>
          </div>

          {!booking ? (
            <BookingForm onComplete={(data) => setBooking(data)} />
          ) : (
            <BookingSummary booking={booking} />
          )}
        </div>
      </section>
    </div>
  );
}


