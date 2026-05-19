"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  CreditCard, ShieldCheck, MapPin, Calendar, Clock, 
  User, Mail, Phone, Ticket, ChevronRight, Lock
} from 'lucide-react';
import { apiClient } from '../../utils/apiClient';
import { QRCodeSVG } from 'qrcode.react';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const service = searchParams.get('service');
  const guests = parseInt(searchParams.get('guests') || '1');
  const category = searchParams.get('category') || 'events';
  const date = searchParams.get('date');
  const timeFrom = searchParams.get('timeFrom');
  const timeTo = searchParams.get('timeTo');
  const urlSubtotal = parseFloat(searchParams.get('subtotal') || '0');
  const urlTotal = parseFloat(searchParams.get('total') || '0');
  const bookingType = searchParams.get('bookingType');
  const printingBundles = parseInt(searchParams.get('printingBundles') || '0');
  const lockerCode = searchParams.get('lockerCode') || '';
  const printingCredits = parseFloat(searchParams.get('printingCredits') || searchParams.get('printingBundles') || '0');
  
  const [event, setEvent] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({ taxEnabled: false, taxPercentage: 5, printCreditToPageRatio: 5, printAedToCreditRatio: 0.2 });

  useEffect(() => {
    fetch('/api/settings', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(e => console.error(e));
  }, []);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [calculatedPrices, setCalculatedPrices] = useState(null);

  // Bug 24 Fix: Auto-fill form from logged-in user session on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('seenhub_user');
        if (stored && stored !== 'undefined') {
          const u = JSON.parse(stored);
          setFormData(prev => ({
            ...prev,
            name: u.name || prev.name,
            email: u.email || prev.email,
            phone: u.phone || prev.phone,
          }));
        }
      } catch (e) {
        console.warn('Could not prefill checkout form from session:', e);
      }
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (category === 'events') {
          const res = await fetch('/api/events', { cache: 'no-store' });
          const stored = await res.json();
          const dataArray = Array.isArray(stored) ? stored : (stored?.data || []);
          const ev = dataArray.find(e => e.title === service);
          setEvent(ev);
        } else if (category === 'workspaces') {
          const res = await fetch('/api/workspaces', { cache: 'no-store' });
          const stored = await res.json();
          const dataArray = Array.isArray(stored) ? stored : (stored?.data || []);
          const ws = dataArray.find(w => w.title === service);
          setWorkspace(ws);
        } else if (category === 'memberships') {
          setWorkspace({ title: service, price: 0 });
        } else if (category === 'printing') {
          setWorkspace({ title: 'Printing Credits', price: 1 });
        }
      } catch (e) { console.error(e); }
      
      const storedUser = localStorage.getItem('seenhub_user');
      if (storedUser) {
        const u = JSON.parse(storedUser);
        setFormData(prev => ({
          ...prev,
          name: prev.name || u.name || '',
          email: prev.email || u.email || ''
        }));
      }
      setLoading(false);
    };
    fetchData();
  }, [service, category]);

  
  // Price Logic
  const hasUrlPrice = searchParams.has('subtotal');
  let baseSpacePrice = urlSubtotal;
  let fullSubtotal = urlSubtotal;
  let total = urlTotal;
  
  let addonsCost = 0;
  if (lockerCode) addonsCost += 10;
  if (printingBundles > 0) addonsCost += (printingBundles * (1 / (settings.printAedToCreditRatio || 0.2)));

  if (hasUrlPrice) {
    fullSubtotal = baseSpacePrice + addonsCost;
  } else {
    let ticketPrice = 0;
    if (category === 'events' && event) ticketPrice = event.price || 0;
    else if (category === 'workspaces' && workspace) {
      const p = workspace.pricing || {};
      if (bookingType === 'Hourly') ticketPrice = p.hourly?.individual || p.daily?.individual / 8 || 50;
      else if (bookingType === 'Daily') ticketPrice = p.daily?.individual || 600;
      else if (bookingType === 'Weekly') ticketPrice = p.weekly?.individual || 2500;
      else if (bookingType === 'Monthly') ticketPrice = p.monthly?.individual || 8000;
      else ticketPrice = p.daily?.individual || p.hourly?.individual || 100;
    } else if (category === 'memberships') {
      const prices = { 'Day Pass': 100, 'Monthly Membership': 1500, 'Student Membership': 800, 'VIP Daily Pass': 250 };
      ticketPrice = prices[service] || 100;
    }
    if (category === 'workspaces') {
      let hours = 1;
      if (bookingType === 'Hourly' && timeFrom && timeTo) {
        const from = parseInt(timeFrom.split(':')[0]) + (timeFrom.includes(':30') ? 0.5 : 0);
        const to = parseInt(timeTo.split(':')[0]) + (timeTo.includes(':30') ? 0.5 : 0);
        hours = Math.max(1, to - from);
      }
      baseSpacePrice = ticketPrice * hours;
      
      const extraGuests = Math.max(0, guests - 1);
      const extraGuestPrice = workspace?.extraGuestPrice?.individual || 0;
      baseSpacePrice += extraGuests * extraGuestPrice;
    } else {
      baseSpacePrice = ticketPrice * guests;
    }
    
    fullSubtotal = baseSpacePrice + addonsCost;

    const currentTaxRate = settings.taxEnabled ? settings.taxPercentage / 100 : 0;
    const calculatedTax = Math.round((fullSubtotal * currentTaxRate) * 100) / 100;
    total = Math.round((fullSubtotal + calculatedTax) * 100) / 100;
  }
  const tax = total - fullSubtotal;

  // Use backend pricing for final confirmation
  useEffect(() => {
    if (!loading && service) {
      const params = new URLSearchParams({
        category: category,
        space: service,
        bookingType: bookingType || 'Event',
        guests: guests,
        timeFrom: timeFrom || '',
        timeTo: timeTo || '',
        lockerCode: lockerCode || '',
        printingBundles: printingBundles || 0
      });

      apiClient.get(`/api/bookings/calculate_price?${params.toString()}`)
        .then(data => {
          if (data && !data.error) {
            setCalculatedPrices({
              subtotal: data.subtotal,
              tax: data.tax,
              total: data.total
            });
          }
        })
        .catch(e => console.error(e));
    }
  }, [loading, service, category, bookingType, guests, timeFrom, timeTo, lockerCode, printingBundles]);

  if (loading) return <div className="loading">Loading Checkout...</div>;

  const displaySubtotal = calculatedPrices ? calculatedPrices.subtotal : fullSubtotal;
  const displayTax = calculatedPrices ? calculatedPrices.tax : tax;
  const displayTotal = calculatedPrices ? calculatedPrices.total : total;

  const handlePay = async (e) => {
    e.preventDefault();
    const bookingId = 'SH-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    const payload = {
      id: bookingId,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      space: service,
      category: category,
      date: date || (event?.startDate),
      timeFrom: timeFrom || (event?.startTime),
      timeTo: timeTo || (event?.endTime),
      guests: guests,
      bookingType: bookingType || 'Event',
      subtotal: displaySubtotal,
      tax: displayTax,
      total: displayTotal,
      status: 'Confirmed',
      paymentStatus: 'Paid',
      printingCredits: printingCredits,
      lockerCode: lockerCode,
      gateNumber: (event?.gateNumber || workspace?.gateNumber || '92')
    };

    try {
      const result = await apiClient.post('/api/bookings', payload);
      setBookingResult(result.booking || result);
      setIsPaid(true);
    } catch (error) {
      console.error('Error saving booking:', error);
      alert(error.message || 'Failed to process booking. Please try again.');
    }
  };

  if (isPaid) {
    return (
      <div className="success-screen">
        <div className="success-glass-card animate-scale-up">
          <div className="success-header">
            <div className="check-circle">
              <ShieldCheck size={40} />
            </div>
            <h1>{category === 'printing' ? 'Credits Added!' : 'Booking Confirmed!'}</h1>
            <p>{category === 'printing' ? `You have successfully purchased ${printingCredits} credits.` : 'Thank you for choosing SeenHub. Your reservation is now active.'}</p>
          </div>

          <div className="ticket-container">
            <div className="ticket-header">
              <div className="brand">SEEN<span>Hub</span></div>
              <div className="ticket-id">#{category === 'printing' ? 'PRT' : 'SH'}-{bookingResult.id.slice(-6)}</div>
            </div>
            
            <div className="ticket-body">
              <div className="ticket-qr">
                <QRCodeSVG value={bookingResult.qrCode} size={180} level="H" includeMargin={true} />
                <div className="qr-hash">{bookingResult.qrCode}</div>
              </div>
              
              <div className="ticket-info">
                <div className="info-row">
                  <div className="info-block">
                    <label>{category === 'printing' ? 'Service' : 'Workspace / Service'}</label>
                    <div className="val">{service}</div>
                  </div>
                  <div className="info-block">
                    <label>{category === 'printing' ? 'Credits' : 'Access Point'}</label>
                    <div className="val">
                      {category === 'printing' ? `${printingCredits * 2} Pages` : (bookingResult.assignedUnitName || (bookingResult.gateNumber ? `Gate ${bookingResult.gateNumber}` : (event?.location || workspace?.location || 'Seenhub')))}
                      {lockerCode && <span style={{ display: 'block', fontSize: '0.75rem', marginTop: '0.2rem', color: '#64748b' }}>Locker: {lockerCode}</span>}
                    </div>
                  </div>
                </div>
                
                <div className="info-row">
                  <div className="info-block">
                    <label>Date</label>
                    <div className="val">{bookingResult.date}</div>
                  </div>
                  <div className="info-block">
                    <label>Time Slot</label>
                    <div className="val">{bookingResult.timeFrom ? `${bookingResult.timeFrom} - ${bookingResult.timeTo}` : 'Full Day'}</div>
                  </div>
                </div>

                <div className="info-row">
                  <div className="info-block">
                    <label>Customer</label>
                    <div className="val">{bookingResult.name}</div>
                  </div>
                  <div className="info-block">
                    <label>Status</label>
                    <div className="val status-confirmed">Confirmed</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="ticket-footer">
              <p>Please present this QR code at the entrance for seamless access.</p>
            </div>
          </div>

          <div className="success-actions">
            <button className="btn-dashboard" onClick={() => window.location.href = '/dashboard'}>
              Go to Dashboard <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          .success-screen {
            min-height: 100vh;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            font-family: 'Inter', sans-serif;
          }
          .success-glass-card {
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.5);
            border-radius: 32px;
            padding: 3rem;
            width: 100%;
            max-width: 800px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
            text-align: center;
          }
          .success-header h1 { font-size: 2.5rem; font-weight: 800; color: #0f172a; margin: 1.5rem 0 0.5rem; }
          .success-header p { color: #64748b; font-size: 1.1rem; margin-bottom: 2.5rem; }
          .check-circle { 
            width: 80px; height: 80px; background: #10b981; color: white; border-radius: 50%; 
            display: flex; align-items: center; justify-content: center; margin: 0 auto;
            box-shadow: 0 0 0 10px rgba(16, 185, 129, 0.1);
          }

          .ticket-container {
            background: white;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
            margin-bottom: 2.5rem;
            border: 1px solid #f1f5f9;
            text-align: left;
          }
          .ticket-header {
            background: #0f172a;
            padding: 1.5rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .brand { color: white; font-weight: 800; font-size: 1.2rem; letter-spacing: -0.5px; }
          .brand span { color: #94a3b8; }
          .ticket-id { color: #94a3b8; font-family: monospace; font-size: 0.9rem; }

          .ticket-body { display: flex; gap: 3rem; padding: 2.5rem; }
          .ticket-qr { flex-shrink: 0; text-align: center; }
          .qr-hash { margin-top: 1rem; font-family: monospace; font-size: 0.8rem; color: #94a3b8; font-weight: 600; }
          
          .ticket-info { flex: 1; display: grid; gap: 1.5rem; }
          .info-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
          .info-block label { display: block; font-size: 0.7rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 0.4rem; }
          .info-block .val { font-size: 1rem; font-weight: 700; color: #0f172a; }
          .status-confirmed { color: #059669; }

          .ticket-footer { background: #f8fafc; padding: 1.2rem 2rem; border-top: 1px dashed #e2e8f0; text-align: center; }
          .ticket-footer p { font-size: 0.85rem; color: #64748b; font-weight: 500; }

          .btn-dashboard {
            background: #0f172a;
            color: white;
            border: none;
            padding: 1.2rem 3rem;
            border-radius: 16px;
            font-size: 1.1rem;
            font-weight: 700;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 0.8rem;
            transition: all 0.3s;
          }
          .btn-dashboard:hover { background: #1e293b; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.1); }

          @media (max-width: 700px) {
            .ticket-body { flex-direction: column; align-items: center; padding: 1.5rem; }
            .ticket-info { width: 100%; }
            .success-glass-card { padding: 1.5rem; }
          }

          .animate-scale-up { animation: scaleUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
          @keyframes scaleUp {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
        `}} />
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-grid">
        <div className="payment-section">
          <div className="checkout-header">
            <h1 className="checkout-title">Complete Booking</h1>
            <p className="checkout-subtitle">Secure payment for {service}</p>
          </div>

          <form className="payment-form" onSubmit={handlePay}>
            <div className="form-group">
              <label><User size={16} /> Full Name</label>
              <input 
                required 
                type="text" 
                placeholder="John Doe"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div className="input-row">
              <div className="form-group">
                <label><Mail size={16} /> Email Address</label>
                <input 
                  required 
                  type="email" 
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label><Phone size={16} /> Phone Number</label>
                <input 
                  required 
                  type="tel" 
                  placeholder="+971 50 123 4567"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>

            <div className="payment-method">
              <label className="method-label">Payment Method</label>
              <div className="card-input-box">
                <div className="form-group">
                  <label><CreditCard size={16} /> Card Number</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="xxxx xxxx xxxx xxxx" 
                    maxLength="19" 
                    pattern="\d{4}\s?\d{4}\s?\d{4}\s?\d{4}" 
                    title="Enter a valid 16-digit card number"
                    value={formData.cardNumber} 
                    onChange={e => {
                      let val = e.target.value.replace(/\D/g, '');
                      val = val.match(/.{1,4}/g)?.join(' ') || val;
                      setFormData({...formData, cardNumber: val});
                    }} 
                  />
                </div>
                <div className="input-row">
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="MM/YY" 
                      maxLength="5" 
                      pattern="(0[1-9]|1[0-2])\/?([0-9]{2})" 
                      title="Enter a valid expiry date (MM/YY)"
                      value={formData.expiry} 
                      onChange={e => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2, 4);
                        setFormData({...formData, expiry: val});
                      }} 
                    />
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <input 
                      required 
                      type="password" 
                      placeholder="xxx" 
                      maxLength="4" 
                      pattern="\d{3,4}" 
                      title="Enter a 3 or 4 digit CVV"
                      value={formData.cvv} 
                      onChange={e => {
                        let val = e.target.value.replace(/\D/g, '');
                        setFormData({...formData, cvv: val});
                      }} 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <div className="security-badge" style={{ marginBottom: '1rem', border: 'none', background: 'transparent', padding: 0, justifyContent: 'flex-start', color: '#16a34a', fontWeight: 700 }}>
                <ShieldCheck size={18} />
                <span>Secure encrypted payment. Your data is protected.</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0 0.2rem' }}>
                <input 
                  type="checkbox" 
                  id="terms" 
                  required
                  checked={agreedToTerms} 
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  style={{ marginTop: '0.2rem', cursor: 'pointer', width: '18px', height: '18px' }} 
                />
                <label htmlFor="terms" style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, cursor: 'pointer' }}>
                  I have read and agree to the <a href="/terms" target="_blank" style={{ color: '#d88906', fontWeight: 700, textDecoration: 'none' }}>Terms & Conditions</a> and <a href="/privacy" target="_blank" style={{ color: '#d88906', fontWeight: 700, textDecoration: 'none' }}>Privacy Policy</a>.
                </label>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-pay"
            >
              Pay AED {(displayTotal || 0).toFixed(2)} <ChevronRight size={18} />
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <aside className="summary-section">
          <div className="summary-card">
            <h2 className="summary-title">Order Summary</h2>
            
            <div className="event-preview">
              <div className="event-banner" style={{ background: `linear-gradient(135deg, #0f172a 0%, #1e293b 100%)` }}>
                 <Ticket size={32} color="#fff" />
              </div>
                <div className="event-info">
                   <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#d88906', marginBottom: '0.2rem' }}>{category.slice(0, -1)}</div>
                   <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>{service}</h3>
                   {category !== 'printing' && (
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                       <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}><MapPin size={14} /> {(event?.gateNumber || workspace?.gateNumber) ? `Gate ${event?.gateNumber || workspace?.gateNumber}` : (event?.location || workspace?.location || 'Seenhub')}</p>
                       <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}><Calendar size={14} /> {date || event?.startDate || 'Select Date'}</p>
                       
                       {/* Show Booking Type & Time Details */}
                       {bookingType && (
                         <div style={{ marginTop: '0.4rem', padding: '0.5rem 0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                           <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                             <Clock size={12} /> {bookingType} {category === 'workspaces' ? 'Booking' : ''}
                           </p>
                           {bookingType === 'Hourly' && timeFrom && (
                             <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginTop: '0.2rem' }}>
                               {timeFrom} — {timeTo}
                             </p>
                           )}
                         </div>
                       )}

                       {category === 'events' && event?.startTime && <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}><Clock size={14} /> {event.startTime} - {event.endTime}</p>}
                     </div>
                   )}
                   {category === 'printing' && (
                     <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}><ShieldCheck size={14} /> Instant Credit Top-up</p>
                   )}
                </div>
             </div>

             <div className="summary-details">
               <div className="summary-row">
                 <div style={{ display: 'flex', flexDirection: 'column' }}>
                   <span style={{ fontWeight: 700 }}>{service}</span>
                   <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{bookingType || 'Ticket'} x {guests} {guests > 1 ? 'Guests' : 'Guest'}</span>
                 </div>
                 <span style={{ fontWeight: 800 }}>AED {(baseSpacePrice || 0).toFixed(2)}</span>
               </div>
              {printingBundles > 0 && category !== 'printing' && (
                <div className="summary-row">
                  <span>Printing Credits ({printingBundles} Credits = {printingBundles * (settings.printCreditToPageRatio || 5)} Pages)</span>
                  <span>AED {(printingBundles * (1 / (settings.printAedToCreditRatio || 0.2)) || 0).toFixed(2)}</span>
                </div>
              )}
              {lockerCode && (
                 <div className="summary-row">
                   <span>Locker Rental ({lockerCode})</span>
                   <span>AED 10.00</span>
                 </div>
              )}
              {displayTax > 0 && (
                <div className="summary-row">
                  <span>VAT ({settings.taxPercentage || 5}%)</span>
                  <span>AED {(displayTax || 0).toFixed(2)}</span>
                </div>
              )}
              <div className="summary-total">
                <span>Total Amount</span>
                <span>AED {(displayTotal || 0).toFixed(2)}</span>
              </div>
            </div>

            <div className="guarantee">
               <Lock size={14} />
               <span>Official Booking Guarantee</span>
            </div>
          </div>
        </aside>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .checkout-container {
          min-height: 100vh;
          background: #f8fafc;
          padding: 120px 2rem 4rem;
          font-family: 'Inter', sans-serif;
        }
        .checkout-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 3rem;
        }
        .checkout-header { margin-bottom: 2.5rem; }
        .checkout-title { font-size: 2.2rem; font-weight: 800; color: #0f172a; margin-bottom: 0.5rem; }
        .checkout-subtitle { color: #64748b; font-size: 1.1rem; }

        .payment-form { background: white; padding: 2.5rem; border-radius: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .form-group { margin-bottom: 1.5rem; }
        .form-group label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 0.6rem; text-transform: uppercase; }
        .form-group input { width: 100%; padding: 0.9rem 1.2rem; border-radius: 12px; border: 1px solid #e2e8f0; font-size: 1rem; transition: all 0.2s; }
        .form-group input:focus { outline: none; border-color: #0f172a; box-shadow: 0 0 0 4px rgba(15,23,42,0.05); }
        .input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }

        .payment-method { margin-top: 2.5rem; border-top: 1px solid #f1f5f9; pt: 2.5rem; }
        .method-label { display: block; font-size: 1.1rem; font-weight: 700; color: #0f172a; margin-bottom: 1.5rem; }
        .card-input-box { background: #f8fafc; padding: 1.5rem; border-radius: 16px; border: 1px solid #e2e8f0; }

        .btn-pay { width: 100%; margin-top: 2rem; background: #0f172a; color: white; border: none; padding: 1.2rem; border-radius: 16px; font-size: 1.1rem; font-weight: 700; cursor: pointer; display: flex; alignItems: center; justifyContent: center; gap: 0.8rem; transition: all 0.3s; }
        .btn-pay:hover { background: #1e293b; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(15,23,42,0.15); }

        .security-badge { display: flex; align-items: center; gap: 0.6rem; margin-top: 1.5rem; color: #16a34a; font-size: 0.85rem; font-weight: 600; }

        .summary-card { background: white; padding: 2rem; border-radius: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); position: sticky; top: 2rem; }
        .summary-title { font-size: 1.4rem; font-weight: 800; color: #0f172a; margin-bottom: 1.5rem; }
        
        .event-preview { display: flex; gap: 1rem; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid #f1f5f9; }
        .event-banner { width: 64px; height: 64px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .event-info h3 { font-size: 1.1rem; font-weight: 700; color: #0f172a; margin-bottom: 0.4rem; }
        .event-info p { font-size: 0.8rem; color: #64748b; margin-bottom: 0.2rem; display: flex; align-items: center; gap: 0.4rem; }

        .summary-details { margin-bottom: 2rem; }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 1rem; color: #64748b; font-size: 0.95rem; }
        .summary-total { display: flex; justify-content: space-between; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 2px dashed #f1f5f9; font-size: 1.2rem; font-weight: 800; color: #0f172a; }

        .guarantee { display: flex; align-items: center; gap: 0.5rem; justify-content: center; margin-top: 1.5rem; color: #94a3b8; font-size: 0.8rem; font-weight: 600; }

        .success-container { min-height: 80vh; display: flex; align-items: center; justify-content: center; }
        .success-card { background: white; padding: 4rem; border-radius: 32px; text-align: center; max-width: 600px; box-shadow: 0 20px 40px rgba(0,0,0,0.05); }
        .success-icon { width: 80px; height: 80px; background: #16a34a; color: white; font-size: 2.5rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 2rem; }
        .success-card h1 { font-size: 2.2rem; font-weight: 800; color: #0f172a; margin-bottom: 1rem; }
        .success-card p { color: #64748b; font-size: 1.1rem; margin-bottom: 3rem; }

        .booking-details { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 24px; padding: 2rem; margin-bottom: 3rem; display: flex; gap: 2rem; align-items: center; text-align: left; }
        .qr-box { background: white; padding: 1rem; border-radius: 16px; border: 1px solid #e2e8f0; text-align: center; }
        .qr-code-text { margin-top: 0.8rem; font-family: monospace; font-weight: 700; color: #0f172a; font-size: 0.9rem; }
        .info-grid { flex: 1; display: grid; gap: 1.5rem; }
        .info-item label { display: block; font-size: 0.75rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 0.3rem; }
        .info-item span { font-size: 1.1rem; font-weight: 700; color: #0f172a; }

        .btn-primary { background: #0f172a; color: white; border: none; padding: 1.2rem 3rem; border-radius: 16px; font-weight: 700; cursor: pointer; transition: all 0.3s; }
        .btn-primary:hover { background: #1e293b; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(15,23,42,0.15); }

        @media (max-width: 1000px) {
          .checkout-grid { grid-template-columns: 1fr; }
          .summary-section { order: -1; }
        }

        .animate-fade-in { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="loading">Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
