"use client";
import React, { useState } from 'react';
import { Phone, MessageCircle, Calendar, X, MessageSquare } from 'lucide-react';

export default function FloatingSupport() {
  const [isOpen, setIsOpen] = useState(false);
  const [contacts, setContacts] = useState({ whatsapp: "+971509119699", phone: "+971509119699" });

  React.useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.contactWhatsApp || data.contactPhone) {
          setContacts({
            whatsapp: data.contactWhatsApp || "+971509119699",
            phone: data.contactPhone || "+971509119699"
          });
        }
      })
      .catch(e => console.error(e));
  }, []);

  const whatsappUrl = `https://wa.me/${contacts.whatsapp.replace(/[^0-9]/g, '')}`;

  return (
    <div className="support-wrapper">
      {/* Support Panel */}
      <div className={`support-panel ${isOpen ? 'open' : ''}`}>
        <div className="support-header">
          <h3>How can we help?</h3>
          <button onClick={() => setIsOpen(false)} className="close-btn"><X size={20} /></button>
        </div>
        
        <div className="support-options">
          <a href={`tel:${contacts.phone}`} className="support-option">
            <div className="option-icon call"><Phone size={20} /></div>
            <div className="option-text">
              <span className="title">Call Support</span>
              <span className="desc">Speak directly with our team</span>
            </div>
          </a>

          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="support-option">
            <div className="option-icon whatsapp"><MessageCircle size={20} /></div>
            <div className="option-text">
              <span className="title">WhatsApp Chat</span>
              <span className="desc">Chat with us on WhatsApp</span>
            </div>
          </a>

          <a href="/booking" className="support-option">
            <div className="option-icon booking"><Calendar size={20} /></div>
            <div className="option-text">
              <span className="title">Booking Inquiry</span>
              <span className="desc">Check availability & book a space</span>
            </div>
          </a>
        </div>
      </div>

      {/* Floating Button */}
      <button 
        className={`floating-trigger ${isOpen ? 'hidden' : ''}`} 
        onClick={() => setIsOpen(true)}
        aria-label="Support Menu"
      >
        <div className="trigger-pulse"></div>
        <MessageSquare size={24} />
        <span className="live-badge">LIVE</span>
      </button>

    </div>
  );
}
