"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://seenhub-new-be.onrender.com';

export default function VerifyEmailPage() {
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Verifying your email, please wait...');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Verification token missing. Please check your email link.');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/verify-email?token=${encodeURIComponent(token)}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setStatus('success');
          setMessage(data.message);
        } else {
          setStatus('error');
          setMessage(data.message || 'Unable to verify email. Please try again.');
        }
      } catch (e) {
        console.error(e);
        setStatus('error');
        setMessage('Unable to verify email at this time. Please try again later.');
      }
    };

    verifyEmail();
  }, []);

  return (
    <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      <div style={{ maxWidth: '520px', width: '100%', borderRadius: '20px', padding: '2rem', background: '#fff', boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>
          {status === 'loading' ? 'Verifying...' : status === 'success' ? 'Verified!' : 'Verification Failed'}
        </h1>
        <p style={{ color: status === 'error' ? '#b91c1c' : '#0f172a', lineHeight: '1.8' }}>{message}</p>
        {status !== 'loading' && (
          <Link href="/" style={{ display: 'inline-block', marginTop: '1.5rem', padding: '0.85rem 1.5rem', borderRadius: '999px', background: '#2563eb', color: '#fff', textDecoration: 'none' }}>
            Continue to Home
          </Link>
        )}
      </div>
    </main>
  );
}
