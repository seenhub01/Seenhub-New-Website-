"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

export default function PromoPopup() {
  const [data, setData] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchPopup = async () => {
      if (sessionStorage.getItem('seenhub_promo_seen')) return;
      try {
        const res = await fetch('/api/popup');
        const json = await res.json();
        if (json && json.enabled) {
          setData(json);
          console.log("PromoPopup data loaded, showing in 2s...");
          const timer = setTimeout(() => {
            setIsVisible(true);
          }, 2000);
          return () => clearTimeout(timer);
        }
      } catch (e) {
        console.error("Failed to fetch popup data:", e);
      }
    };
    fetchPopup();
  }, []);

  const closePopup = () => {
    setIsVisible(false);
    sessionStorage.setItem('seenhub_promo_seen', 'true');
  };

  if (!isVisible || !data) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '1.5rem',
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
      
      <div style={{
        background: '#fff',
        borderRadius: '48px',
        width: '100%',
        maxWidth: '460px',
        position: 'relative',
        boxShadow: '0 30px 100px rgba(0,0,0,0.2)',
        overflow: 'hidden',
        animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        {/* Close Button */}
        <button 
          onClick={closePopup}
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            background: '#f1f5f9',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748b',
            zIndex: 10,
          }}
        >
          <X size={20} />
        </button>

        <div style={{ padding: '3.5rem 2.5rem 3rem' }}>
          {/* Image Container - Horizontal Rectangle Pattern */}
          {data.image && (
            <div style={{
              width: '100%',
              height: '210px',
              margin: '0 auto 2.5rem',
              borderRadius: '32px',
              overflow: 'hidden',
              boxShadow: '0 15px 40px rgba(0,0,0,0.12)',
              background: '#fff',
              border: '1px solid #f1f5f9',
              position: 'relative'
            }}>
              <Image src={data.image} alt="Promo" fill unoptimized style={{ objectFit: 'cover' }} />
            </div>
          )}

          {/* Text Content */}
          <div style={{ textAlign: 'center' }}>
            <h2 style={{
              margin: '0 0 1rem',
              fontSize: '2rem',
              fontWeight: 900,
              color: '#0f172a',
              letterSpacing: '-1px',
              lineHeight: 1.2
            }}>
              {data.title}
            </h2>
            <p style={{
              margin: '0 0 3rem',
              color: '#64748b',
              fontSize: '1rem',
              lineHeight: 1.7,
              fontWeight: 500
            }}>
              {data.content}
            </p>

            {/* Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <a 
                href={data.btn1Link}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '1.1rem',
                  background: '#0f172a',
                  color: '#fff',
                  borderRadius: '20px',
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  textDecoration: 'none',
                  boxShadow: '0 10px 25px rgba(15,23,42,0.25)',
                  transition: 'all 0.2s'
                }}
              >
                {data.btn1Text}
              </a>
              
              <a 
                href={data.btn2Link}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '1rem',
                  background: 'transparent',
                  color: '#64748b',
                  borderRadius: '16px',
                  fontWeight: 700,
                  fontSize: '1rem',
                  textDecoration: 'none',
                }}
              >
                {data.btn2Text}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
