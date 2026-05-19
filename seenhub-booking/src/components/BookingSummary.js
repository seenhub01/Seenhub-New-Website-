"use client";
import { useState } from 'react';
import { CreditCard, Check, ShieldCheck, Activity, Printer } from 'lucide-react';
import { useEffect } from 'react';
import Image from 'next/image';

export default function BookingSummary({ booking }) {
  const [paymentMethod, setPaymentMethod] = useState('credit');
  const [agreed, setAgreed] = useState(false);
  const [printSettings, setPrintSettings] = useState({ printCreditToPageRatio: 5, printAedToCreditRatio: 0.2 });

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setPrintSettings({
            printCreditToPageRatio: data.printCreditToPageRatio || 5,
            printAedToCreditRatio: data.printAedToCreditRatio || 0.2
          });
        }
      })
      .catch(e => console.error(e));
  }, []);

  const formatWindow = () => {
    if (booking.calculatedEndDate && booking.calculatedEndDate !== booking.date) {
       return `${booking.date} - ${booking.calculatedEndDate}`;
    }
    return booking.date;
  };

  const hasLocker = booking.addons && booking.addons.includes('Locker');

  const getBookingTypeDisplay = () => {
    if (booking.category === 'memberships') {
      if (booking.space?.includes('Day') || booking.space?.includes('Daily')) return 'Daily';
      if (booking.space?.includes('Month') || booking.space?.includes('Student')) return 'Monthly';
      return 'Membership';
    }
    return booking.bookingType || 'Workspace';
  };

  return (
    <div className="checkout-container animate-fade-in">
      <h1 className="checkout-title">Checkout</h1>
      
      <div className="checkout-grid">
        {/* Left Column: Details */}
        <div className="details-col">
          <div className="checkout-card details-card">
            <h2 className="space-title">{booking.space}</h2>
            <p className="space-subtitle">Please review your booking details before payment.</p>
            
            <div className="info-grid">
              <div className="info-box">
                <label>Booking Type</label>
                <p>{getBookingTypeDisplay()}</p>
              </div>
              <div className="info-box">
                <label>Booking Window</label>
                <p>{formatWindow()}</p>
              </div>
              <div className="info-box">
                <label>Rate Breakdown</label>
                <p>{booking.durationLabel}</p>
              </div>
              <div className="info-box">
                <label>Guests</label>
                <p>{booking.guests}</p>
              </div>
              <div className="info-box">
                <label>Booking ID</label>
                <p>{booking.id}</p>
              </div>
              <div className="info-box">
                <label>Locker</label>
                <p>{hasLocker ? 'Yes' : 'No'}</p>
              </div>
            </div>

            {booking.calculatedEndDate && (
              <div className="subscription-footer">
                <div>
                  <label>Subscription expires on:</label>
                  <p>{booking.calculatedEndDate} 11:59 PM</p>
                </div>
              </div>
            )}
          </div>

          {(hasLocker || booking.printingBundles > 0) && (
            <div className="additional-features">
              <h3>Additional features</h3>
              <div className="feature-item">
                <div className="feature-left">
                  <Activity size={18} color="#888"/>
                  <span>Space Booking ({booking.durationLabel})</span>
                </div>
                <div className="feature-right">
                  AED {booking.spaceSubtotal?.toFixed(2) || '0.00'}
                </div>
              </div>
              {hasLocker && (
                <div className="feature-item">
                  <div className="feature-left">
                    <ShieldCheck size={18} color="#888"/>
                    <span>Locker Add-on</span>
                  </div>
                  <div className="feature-right">
                    AED 10.00
                  </div>
                </div>
              )}
              {booking.printingBundles > 0 && (
                <div className="feature-item">
                  <div className="feature-left">
                    <Printer size={18} color="#888"/>
                    <span>Printing Credits (x{booking.printingBundles} = {booking.printingBundles * (printSettings.printCreditToPageRatio || 5)} Pages)</span>
                  </div>
                  <div className="feature-right">
                    AED {(booking.printingBundles * (1 / (printSettings.printAedToCreditRatio || 0.2))).toFixed(2)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Payment */}
        <div className="payment-col">
          <div className="checkout-card payment-card">
            <h3 className="payment-title">Payment Details</h3>
            
            <div className="payment-options">
              <label className={`radio-label ${paymentMethod === 'saved' ? 'active' : ''}`}>
                <input type="radio" name="payment" checked={paymentMethod === 'saved'} onChange={() => setPaymentMethod('saved')} />
                <span className="radio-custom"></span>
                Saved Card
              </label>
              
              <label className={`radio-label ${paymentMethod === 'credit' ? 'active' : ''}`}>
                <input type="radio" name="payment" checked={paymentMethod === 'credit'} onChange={() => setPaymentMethod('credit')} />
                <span className="radio-custom"></span>
                Debit Or Credit Card
              </label>
            </div>

            <div className="card-icons">
              <Image src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa" width={40} height={15} unoptimized />
              <Image src="https://upload.wikimedia.org/wikipedia/commons/b/b7/MasterCard_Logo.svg" alt="Mastercard" width={40} height={15} unoptimized />
            </div>

            <div className="payment-form">
              <div className="form-group">
                <label>Card Holder Name *</label>
                <input type="text" placeholder="Card Holder Name" />
              </div>
              
              <div className="form-group">
                <label>Card Number *</label>
                <div className="input-with-button">
                  <CreditCard size={18} color="#aaa" className="input-icon" />
                  <input type="text" placeholder="1234 1234 1234 1234" style={{paddingLeft: '2.5rem'}} />
                  <button type="button" className="autofill-btn">Autofill <span>link</span></button>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>CVV code *</label>
                  <input type="text" placeholder="CVV code" />
                </div>
                <div className="form-group">
                  <label>Expiry Date *</label>
                  <input type="text" placeholder="MM / YY" />
                </div>
              </div>
            </div>

            <div className="payment-summary">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>AED {booking.subtotal?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="summary-row">
                <span className="discount-text">Discount</span>
                <span className="discount-value">-AED 0.00</span>
              </div>
              <div className="summary-row">
                <span>Tax</span>
                <span>AED {booking.tax?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="summary-row total-row">
                <span>Total</span>
                <span>AED {booking.totalAmount?.toFixed(2) || '0.00'}</span>
              </div>
            </div>

            <label className="terms-checkbox">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
              <div className="checkbox-custom"><Check size={12} color="white" /></div>
              <span>I have read and agree to the website <br/> <a>Terms & Conditions</a></span>
            </label>

            <button className="btn-checkout" disabled={!agreed} onClick={() => {
              if (typeof window !== 'undefined') {
                // Save active slots
                if (booking.category === 'memberships') {
                  localStorage.setItem('seenhub_active_membership', JSON.stringify(booking));
                } else {
                  localStorage.setItem('seenhub_active_workspace', JSON.stringify(booking));
                }
                
                // Add to history array
                const historyStr = localStorage.getItem('seenhub_booking_history');
                const history = historyStr ? JSON.parse(historyStr) : [];
                const newBooking = { ...booking, status: 'Booked', timestamp: Date.now() };
                history.unshift(newBooking); // Add to beginning
                localStorage.setItem('seenhub_booking_history', JSON.stringify(history));
              }
              alert('Payment Successful! You can view your booking in the Dashboard.');
              window.location.href = '/dashboard';
            }}>
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

