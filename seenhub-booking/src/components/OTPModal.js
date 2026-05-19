"use client";
import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '../utils/apiClient';
import './OTPModal.css';

export default function OTPModal({ isOpen, email, onClose, onSuccess, mode = 'verify' }) {
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resendTrigger, setResendTrigger] = useState(0);
  const timerRef = useRef(null);

  const OTP_EXPIRY_SECONDS = 120; // 2 minutes

  // Initialize or resume timer
  useEffect(() => {
    if (!isOpen || !email) return;

    const storageKey = `otp_expiry_${email}`;
    const storedExpiry = localStorage.getItem(storageKey);
    const now = Date.now();

    let expiryTime;
    if (storedExpiry && parseInt(storedExpiry) > now) {
      expiryTime = parseInt(storedExpiry);
    } else {
      expiryTime = now + OTP_EXPIRY_SECONDS * 1000;
      localStorage.setItem(storageKey, expiryTime.toString());
    }

    const calculateTimeLeft = () => {
      const remaining = Math.max(0, Math.floor((expiryTime - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        setCanResend(true);
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        setCanResend(false);
      }
    };

    calculateTimeLeft();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(calculateTimeLeft, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, email, resendTrigger]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerifyOTP = async (e) => {
    e?.preventDefault();
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      if (mode === 'forgot-password') {
        await apiClient.post('/api/auth/verify-otp', { email, otp, consume: false });
        // Clear timer on success
        localStorage.removeItem(`otp_expiry_${email}`);
        onSuccess?.(otp);
      } else {
        const data = await apiClient.post('/api/auth/verify-otp', { email, otp });

        if (data.token) {
          localStorage.setItem('seenhub_token', data.token);
          localStorage.setItem('seenhub_user', JSON.stringify(data.user));
          // Clear timer on success
          localStorage.removeItem(`otp_expiry_${email}`);
          onSuccess?.();
        } else {
          setError('Invalid OTP. Please try again.');
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to verify OTP. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-submit when 6 digits are entered
  useEffect(() => {
    if (otp.length === 6 && isOpen && email) {
      handleVerifyOTP();
    }
  }, [otp, isOpen, email]);

  if (!isOpen || !email) return null;

  const handleResendOTP = async () => {
    if (!canResend || isResending) return;

    setError('');
    setIsResending(true);

    try {
      await apiClient.post('/api/auth/resend-otp', { email, mode });

      // Update localStorage and trigger useEffect to restart timer
      const newExpiry = Date.now() + OTP_EXPIRY_SECONDS * 1000;
      localStorage.setItem(`otp_expiry_${email}`, newExpiry.toString());
      
      setResendTrigger(prev => prev + 1);
      setOtp('');
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to resend OTP. Please try again.');
      console.error(err);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="otp-modal-overlay">
      <div className="otp-modal-container">
        <button className="otp-close-btn" onClick={onClose} disabled={isSubmitting}>×</button>

        <div className="otp-header">
          <div className="otp-icon-wrapper">
            <div className="otp-icon">✉️</div>
          </div>
          <h2>{mode === 'forgot-password' ? 'Password Recovery' : 'Verify Your Email'}</h2>
          <p>We&apos;ve sent a 6-digit code to <br /><strong>{email}</strong></p>
        </div>


        <form className="otp-form" onSubmit={handleVerifyOTP}>
          <div className="otp-input-group">
            <input
              type="text"
              value={otp}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                setOtp(val);
              }}
              placeholder="000000"
              maxLength="6"
              className="otp-input"
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          {error && <div className="otp-error" style={{ marginTop: '0.5rem', textAlign: 'center' }}>{error}</div>}

          <div className="otp-timer-section">
            <div className="timer-progress-bg">
              <div 
                className="timer-progress-fill" 
                style={{ width: `${(timeLeft / OTP_EXPIRY_SECONDS) * 100}%` }}
              ></div>
            </div>
            <div className="timer-text">
              {timeLeft > 0 ? (
                <span>OTP expires in <span className="timer-countdown">{formatTime(timeLeft)}</span></span>
              ) : (
                <span className="timer-expired">OTP has expired</span>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="otp-verify-btn"
            disabled={isSubmitting || otp.length !== 6}
          >
            {isSubmitting ? (
              <span className="btn-content">
                <span className="loader-small"></span> Verifying...
              </span>
            ) : 'Verify OTP'}
          </button>

          <div className="otp-resend-section">
            <p className="resend-text">Didn&apos;t receive the code?</p>
            <button
              type="button"
              className="otp-resend-btn"
              onClick={handleResendOTP}
              disabled={!canResend || isResending || isSubmitting}
            >
              {isResending ? 'Resending...' : 'Resend Code'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

