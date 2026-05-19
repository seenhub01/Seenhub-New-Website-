"use client";
import React from 'react';
import Link from 'next/link';
import './contact.css';

export default function ContactPage() {
  const [info, setInfo] = React.useState({
    contactEmail: 'hello@seenhub.ae',
    contactPhone: '+971 50 000 0000',
    contactAddress: 'Al Ain, UAE'
  });

  const [form, setForm] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    queryType: '',
    message: ''
  });

  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  const queryOptions = [
    { value: 'Issue', label: 'Technical Issue' },
    { value: 'Enquiry', label: 'General Enquiry' },
    { value: 'Feedback', label: 'Feedback & Suggestions' },
    { value: 'Other', label: 'Other' }
  ];

  React.useEffect(() => {
    const fetchLanding = async () => {
      try {
        const res = await fetch('/api/landing');
        const landing = await res.json();
        if (landing) {
          setInfo({
            contactEmail: landing.contactEmail || info.contactEmail,
            contactPhone: landing.contactPhone || info.contactPhone,
            contactAddress: landing.contactAddress || info.contactAddress
          });
        }
      } catch (e) { console.error(e); }
    };
    fetchLanding();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.queryType) {
      alert('Please select a query type');
      return;
    }
    setSubmitting(true);
    
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: form.firstName,
          last_name: form.lastName,
          email: form.email,
          query_type: form.queryType,
          message: form.message,
          status: 'New'
        })
      });
      
      if (res.ok) {
        setSubmitting(false);
        setSubmitted(true);
        setForm({ firstName: '', lastName: '', email: '', queryType: '', message: '' });
      } else {
        throw new Error('Failed to save message');
      }
    } catch (e) {
      console.error("Submission failed:", e);
      alert('Failed to send message. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <div className="container">
          <div className="breadcrumbs">
            <Link href="/">Home</Link> <span>›</span> Contact Us
          </div>
        </div>
      </div>

      <div className="container" style={{ display: 'flex', justifyContent: 'center', paddingBottom: '5rem' }}>
        <div className="contact-card" style={{ margin: 0, width: '100%', maxWidth: '800px' }}>
          <div className="contact-header">
            <h1>We Are Here To Help</h1>
            <p>Fill The Form Below, And We Will Get Back To You As Soon As Possible</p>
          </div>

          {submitted ? (
            <div style={{ padding: '3rem', textAlign: 'center', background: '#f0fdf4', borderRadius: '20px', border: '1px solid #bbf7d0' }}>
               <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
               <h2 style={{ color: '#166534', marginBottom: '0.5rem' }}>Message Sent!</h2>
               <p style={{ color: '#16a34a' }}>Thank you for reaching out. Our team will get back to you shortly.</p>
               <button onClick={() => setSubmitted(false)} style={{ marginTop: '2rem', padding: '0.8rem 2rem', background: '#166534', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>Send Another Message</button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name <span>*</span></label>
                  <input type="text" placeholder="Your Name" required value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Last Name <span>*</span></label>
                  <input type="text" placeholder="Last Name" required value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>E-mail <span>*</span></label>
                  <input type="email" placeholder="example@domain.com" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Type Of Query <span>*</span></label>
                  <div className={`custom-select-wrapper ${isDropdownOpen ? 'open' : ''}`}>
                    <div 
                      className="custom-select-trigger" 
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <span>{form.queryType ? queryOptions.find(o => o.value === form.queryType).label : 'Select Query Type'}</span>
                      <div className="arrow"></div>
                    </div>
                    <div className="custom-options">
                      {queryOptions.map(opt => (
                        <div 
                          key={opt.value}
                          className={`custom-option ${form.queryType === opt.value ? 'selected' : ''}`}
                          onClick={() => {
                            setForm({ ...form, queryType: opt.value });
                            setIsDropdownOpen(false);
                          }}
                        >
                          {opt.label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Message <span>*</span></label>
                <textarea placeholder="Message" rows="5" required value={form.message} onChange={e => setForm({...form, message: e.target.value})}></textarea>
              </div>

              <div className="form-actions">
                <button type="submit" className="contact-submit-btn" disabled={submitting}>
                  {submitting ? 'Sending...' : 'Submit'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
