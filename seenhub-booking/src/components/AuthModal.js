"use client";
import React, { useState, useEffect } from 'react';
import { apiClient } from '../utils/apiClient';
import './AuthModal.css';
import OTPModal from './OTPModal';

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#6b7280' }}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#6b7280' }}>
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </svg>
);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export default function AuthModal({ isOpen, onClose, redirectUrl = '/dashboard' }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login', 'signup', 'forgot-password', 'reset-password'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signupForm, setSignupForm] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    phone_number: '+971',
    dob: '',
    employment_status: '',
    password: '',
    password_confirmation: ''
  });
  const [generalError, setGeneralError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otpMode, setOtpMode] = useState('verify'); // 'verify' or 'forgot-password'
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [resetPasswordData, setResetPasswordData] = useState({
    otp: '',
    password: '',
    password_confirmation: ''
  });

  // Password visibility states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);

  // Clear errors and form data when switching tabs
  useEffect(() => {
    setGeneralError('');
    setFieldErrors({});

    // Clear form data based on tab
    if (activeTab === 'login') {
      setEmail('');
      setPassword('');
    } else if (activeTab === 'signup') {
      setSignupForm({
        first_name: '',
        middle_name: '',
        last_name: '',
        email: '',
        phone_number: '+971',
        dob: '',
        employment_status: '',
        password: '',
        password_confirmation: ''
      });
    } else if (activeTab === 'forgot-password') {
      setForgotPasswordEmail('');
    } else if (activeTab === 'reset-password') {
      setResetPasswordData(prev => ({
        ...prev,
        password: '',
        password_confirmation: ''
      }));
    }
  }, [activeTab]);

  // Clear all data when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setGeneralError('');
      setFieldErrors({});
      setActiveTab('login');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const saveSession = ({ token, user }) => {
    localStorage.setItem('seenhub_token', token);
    localStorage.setItem('seenhub_user', JSON.stringify(user));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!email.trim()) {
      errors.email = ['Email is required'];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = ['Invalid email format'];
    }
    if (!password) {
      errors.password = ['Password is required'];
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setGeneralError('');
      setFieldErrors({});
      setIsSubmitting(true);
      const data = await apiClient.post('/api/auth/login', { email, password });
      saveSession(data);
      window.location.href = redirectUrl;
    } catch (err) {
      setGeneralError(err.message);
      setFieldErrors(err.fieldErrors || {});
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!signupForm.first_name.trim()) errors.first_name = ['First name is required'];
    if (!signupForm.last_name.trim()) errors.last_name = ['Last name is required'];

    if (!signupForm.email.trim()) {
      errors.email = ['Email is required'];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupForm.email)) {
      errors.email = ['Invalid email format'];
    }

    if (!signupForm.phone_number.trim()) {
      errors.phone_number = ['Phone number is required'];
    }

    if (!signupForm.password) {
      errors.password = ['Password is required'];
    } else if (signupForm.password.length < 8) {
      errors.password = ['Password must be at least 8 characters'];
    }

    if (signupForm.password !== signupForm.password_confirmation) {
      errors.password_confirmation = ['Passwords do not match'];
    }

    if (!signupForm.dob) {
      errors.dob = ['Date of birth is required'];
    } else {
      const birthDate = new Date(signupForm.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 12) {
        errors.dob = ['You must be at least 12 years old'];
      }
    }
    if (!signupForm.employment_status) errors.employment_status = ['Employment status is required'];

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setGeneralError('');
      setFieldErrors({});
      setIsSubmitting(true);
      const digits = signupForm.phone_number.replace(/\D/g, '');
      const phoneNumber = signupForm.phone_number.startsWith('+971')
        ? signupForm.phone_number
        : digits.startsWith('971')
          ? `+${digits}`
          : digits.startsWith('0')
            ? `+971${digits.slice(1)}`
            : `+971${digits}`;
      const data = await apiClient.post('/api/users', {
        user: {
          ...signupForm,
          phone_number: phoneNumber
        }
      });

      // Show OTP modal for email verification
      const pendingVerification = data?.data?.pending_verification || data?.pending_verification;
      if (pendingVerification) {
        setOtpEmail(signupForm.email);
        setOtpMode('verify');
        setShowOTPModal(true);
        setSignupForm({
          first_name: '',
          middle_name: '',
          last_name: '',
          email: '',
          phone_number: '+971',
          dob: '',
          employment_status: '',
          password: '',
          password_confirmation: ''
        });
      }
    } catch (err) {
      setGeneralError(err.message);
      setFieldErrors(err.fieldErrors || {});
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOTPSuccess = (otp) => {
    if (otpMode === 'forgot-password') {
      // For forgot password, keep modal open and show reset form
      setResetPasswordData(prev => ({ ...prev, otp }));
      setActiveTab('reset-password');
      setShowOTPModal(false);
    } else {
      // For signup verification, redirect to dashboard
      setShowOTPModal(false);
      setOtpEmail('');
      window.location.href = '/dashboard';
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!forgotPasswordEmail.trim()) {
      errors.email = ['Email is required'];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotPasswordEmail)) {
      errors.email = ['Invalid email format'];
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setGeneralError('');
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      await apiClient.post('/api/auth/forgot-password', { email: forgotPasswordEmail });
      
      setOtpEmail(forgotPasswordEmail);
      setOtpMode('forgot-password');
      setShowOTPModal(true);
      setActiveTab('login'); // Switch back to login tab
    } catch (err) {
      setGeneralError(err.message || 'Failed to send OTP. Please try again.');
      setFieldErrors(err.fieldErrors || {});
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const { otp, password, password_confirmation } = resetPasswordData;

    const errors = {};
    if (!password) {
      errors.password = ['Password is required'];
    } else if (password.length < 8) {
      errors.password = ['Password must be at least 8 characters'];
    }

    if (!password_confirmation) {
      errors.password_confirmation = ['Confirm Password is required'];
    } else if (password !== password_confirmation) {
      errors.password_confirmation = ['Passwords do not match'];
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setGeneralError('');
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      await apiClient.post('/api/auth/reset-password', {
        email: otpEmail,
        otp,
        password,
        password_confirmation
      });

      setGeneralError('');
      setActiveTab('login');
      setForgotPasswordEmail('');
      setResetPasswordData({ otp: '', password: '', password_confirmation: '' });
      setOtpEmail('');
      setShowOTPModal(false);
      alert('Password reset successfully! Please login with your new password.');
    } catch (err) {
      if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
        setFieldErrors(err.fieldErrors);
      } else {
        setGeneralError(err.message || 'Failed to reset password. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal-container">
        <button className="auth-close-btn" onClick={onClose}>×</button>

        <div className="auth-logo">
          SEEN <span>Hub</span>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            Log In
          </button>
          <button
            className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => setActiveTab('signup')}
          >
            Sign Up
          </button>
        </div>

        <div className="auth-content">
          {activeTab === 'login' && (
            <form className="auth-form" onSubmit={handleLogin}>
              <div className={`form-group ${fieldErrors.email ? 'invalid' : ''}`}>
                <label>E-mail <span>*</span></label>
                <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setFieldErrors((curr) => ({ ...curr, email: undefined })); }} placeholder="you@example.com" required />
                {fieldErrors.email && <div className="field-error">{fieldErrors.email.join(', ')}</div>}
              </div>
              <div className={`form-group ${fieldErrors.password ? 'invalid' : ''}`}>
                <label>Password <span>*</span></label>
                <div className="password-input-container">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setFieldErrors((curr) => ({ ...curr, password: undefined })); }}
                    placeholder="••••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    tabIndex="-1"
                  >
                    {showLoginPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {fieldErrors.password && <div className="field-error">{fieldErrors.password.join(', ')}</div>}
              </div>
              {generalError && Object.keys(fieldErrors).length === 0 && (
                <div className="field-error" style={{ textAlign: 'center' }}>{generalError}</div>
              )}
              <div className="auth-options">
                <label className="checkbox-label">
                  <input type="checkbox" /> Remember me
                </label>
                <a href="#" className="forgot-link" onClick={(e) => { e.preventDefault(); setGeneralError(''); setFieldErrors({}); setActiveTab('forgot-password'); }}>Forgot Password?</a>
              </div>
              <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>
              <p className="auth-switch">
                Don&apos;t have an account? <button type="button" onClick={() => { setGeneralError(''); setFieldErrors({}); setActiveTab('signup'); }}>Sign Up</button>
              </p>
            </form>
          )}

          {activeTab === 'signup' && (
            <form className="auth-form" onSubmit={handleSignup}>
              <div className="form-row">
                <div className={`form-group ${fieldErrors.first_name ? 'invalid' : ''}`}>
                  <label>First name <span>*</span></label>
                  <input type="text" name="first_name" value={signupForm.first_name} onChange={handleSignupChange} placeholder="First Name" required />
                  {fieldErrors.first_name && <div className="field-error">{fieldErrors.first_name.join(', ')}</div>}
                </div>
                <div className={`form-group ${fieldErrors.last_name ? 'invalid' : ''}`}>
                  <label>Last name <span>*</span></label>
                  <input type="text" name="last_name" value={signupForm.last_name} onChange={handleSignupChange} placeholder="Last Name" required />
                  {fieldErrors.last_name && <div className="field-error">{fieldErrors.last_name.join(', ')}</div>}
                </div>
              </div>
              <div className={`form-group ${fieldErrors.middle_name ? 'invalid' : ''}`}>
                <label>Middle name</label>
                <input type="text" name="middle_name" value={signupForm.middle_name} onChange={handleSignupChange} placeholder="Middle Name" />
                {fieldErrors.middle_name && <div className="field-error">{fieldErrors.middle_name.join(', ')}</div>}
              </div>
              <div className="form-row">
                <div className={`form-group ${fieldErrors.email ? 'invalid' : ''}`}>
                  <label>E-mail <span>*</span></label>
                  <input type="email" name="email" value={signupForm.email} onChange={handleSignupChange} placeholder="you@example.com" required />
                  {fieldErrors.email && <div className="field-error">{fieldErrors.email.join(', ')}</div>}
                </div>
                <div className={`form-group ${fieldErrors.phone_number ? 'invalid' : ''}`}>
                  <label>Phone <span>*</span></label>
                  <input type="tel" name="phone_number" value={signupForm.phone_number} onChange={handleSignupChange} placeholder="+971501234567" required />
                  {fieldErrors.phone_number && <div className="field-error">{fieldErrors.phone_number.join(', ')}</div>}
                </div>
              </div>
              <div className="form-row">
                <div className={`form-group ${fieldErrors.password ? 'invalid' : ''}`}>
                  <label>Password <span>*</span></label>
                  <div className="password-input-container">
                    <input
                      type={showSignupPassword ? "text" : "password"}
                      name="password"
                      value={signupForm.password}
                      onChange={handleSignupChange}
                      placeholder="••••••••••"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      tabIndex="-1"
                    >
                      {showSignupPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {fieldErrors.password && <div className="field-error">{fieldErrors.password.join(', ')}</div>}
                </div>
                <div className={`form-group ${fieldErrors.password_confirmation ? 'invalid' : ''}`}>
                  <label>Confirm Password <span>*</span></label>
                  <div className="password-input-container">
                    <input
                      type={showSignupConfirmPassword ? "text" : "password"}
                      name="password_confirmation"
                      value={signupForm.password_confirmation}
                      onChange={handleSignupChange}
                      placeholder="Confirm Password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}
                      tabIndex="-1"
                    >
                      {showSignupConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {fieldErrors.password_confirmation && <div className="field-error">{fieldErrors.password_confirmation.join(', ')}</div>}
                </div>
              </div>
              <div className="form-row">
                <div className={`form-group ${fieldErrors.dob ? 'invalid' : ''}`}>
                  <label>Date of birth <span>*</span></label>
                  <input 
                    type="date" 
                    name="dob" 
                    value={signupForm.dob} 
                    onChange={handleSignupChange} 
                    max={new Date().toISOString().split('T')[0]}
                    required 
                  />
                  {fieldErrors.dob && <div className="field-error">{fieldErrors.dob.join(', ')}</div>}
                </div>
                <div className={`form-group ${fieldErrors.employment_status ? 'invalid' : ''}`}>
                  <label>Employment Status <span>*</span></label>
                  <select name="employment_status" value={signupForm.employment_status} onChange={handleSignupChange} required>
                    <option value="">None</option>
                    <option value="employed">Employed</option>
                    <option value="self_employed">Self-Employed</option>
                    <option value="unemployed">Unemployed</option>
                    <option value="student">Student</option>
                    <option value="retired">Retired</option>
                  </select>
                  {fieldErrors.employment_status && <div className="field-error">{fieldErrors.employment_status.join(', ')}</div>}
                </div>
              </div>
              
              {generalError && Object.keys(fieldErrors).length === 0 && (
                <div className="field-error" style={{ textAlign: 'center' }}>{generalError}</div>
              )}

              <div className="auth-options" style={{ justifyContent: 'flex-start', marginTop: '0.5rem' }}>
                <label className="checkbox-label">
                  <input type="checkbox" required /> By clicking you agree to the <a href="#">Terms & Conditions</a>
                </label>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Signing up...' : 'Sign Up'}
              </button>
              <p className="auth-switch">
                Already have an account? <button type="button" onClick={() => { setGeneralError(''); setFieldErrors({}); setActiveTab('login'); }}>Login</button>
              </p>
            </form>
          )}

          {activeTab === 'forgot-password' && (
            <form className="auth-form" onSubmit={handleForgotPassword}>
              <div className={`form-group ${fieldErrors.email ? 'invalid' : ''}`}>
                <label>E-mail <span>*</span></label>
                <input
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => { setForgotPasswordEmail(e.target.value); setFieldErrors((curr) => ({ ...curr, email: undefined })); }}
                  placeholder="you@example.com"
                  required
                />
                {fieldErrors.email && <div className="field-error">{fieldErrors.email.join(', ')}</div>}
              </div>
              {generalError && !fieldErrors.email && <div className="field-error" style={{ textAlign: 'center' }}>{generalError}</div>}
              <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
              </button>
              <p className="auth-switch">
                Remember your password? <button type="button" onClick={() => { setGeneralError(''); setFieldErrors({}); setActiveTab('login'); }}>Back to Login</button>
              </p>
            </form>
          )}

          {activeTab === 'reset-password' && (
            <form className="auth-form" onSubmit={handleResetPassword}>
              <div className={`form-group ${fieldErrors.password ? 'invalid' : ''}`}>
                <label>New Password <span>*</span></label>
                <div className="password-input-container">
                  <input
                    type={showResetPassword ? "text" : "password"}
                    value={resetPasswordData.password}
                    onChange={(e) => { setResetPasswordData(prev => ({ ...prev, password: e.target.value })); setFieldErrors((curr) => ({ ...curr, password: undefined })); }}
                    placeholder="••••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    tabIndex="-1"
                  >
                    {showResetPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {fieldErrors.password && <div className="field-error">{fieldErrors.password.join(', ')}</div>}
              </div>
              <div className={`form-group ${fieldErrors.password_confirmation ? 'invalid' : ''}`}>
                <label>Confirm New Password <span>*</span></label>
                <div className="password-input-container">
                  <input
                    type={showResetConfirmPassword ? "text" : "password"}
                    value={resetPasswordData.password_confirmation}
                    onChange={(e) => { setResetPasswordData(prev => ({ ...prev, password_confirmation: e.target.value })); setFieldErrors((curr) => ({ ...curr, password_confirmation: undefined })); }}
                    placeholder="Confirm Password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
                    tabIndex="-1"
                  >
                    {showResetConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {fieldErrors.password_confirmation && <div className="field-error">{fieldErrors.password_confirmation.join(', ')}</div>}
              </div>
              {generalError && Object.keys(fieldErrors).length === 0 && (
                <div className="field-error" style={{ textAlign: 'center' }}>{generalError}</div>
              )}
              <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Resetting...' : 'Reset Password'}
              </button>
              <p className="auth-switch">
                <button type="button" onClick={() => { setGeneralError(''); setFieldErrors({}); setActiveTab('login'); }}>Back to Login</button>
              </p>
            </form>
          )}
        </div>
      </div>

      <OTPModal
        isOpen={showOTPModal}
        email={otpEmail}
        mode={otpMode}
        onClose={() => setShowOTPModal(false)}
        onSuccess={handleOTPSuccess}
      />
    </div>
  );
}
