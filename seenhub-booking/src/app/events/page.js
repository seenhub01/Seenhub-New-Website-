"use client";
import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, ArrowRight, Share2, Tag, X } from 'lucide-react';

export default function EventsPage() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events');
        const data = await res.json();
        setEvents(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchEvents();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [ticketQty, setTicketQty] = useState(1);

  return (
    <div className="events-container">
      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="event-modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="event-modal-content animate-pop-in" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedEvent(null)}><X size={24} /></button>
            <div className="modal-banner">
               <div className="status-badge">{selectedEvent.status.replace('_', ' ')}</div>
            </div>
            <div className="modal-body">
              <div className="modal-meta">
                <span><MapPin size={16} /> Gate {selectedEvent.gateNumber || 'Main'}</span>
                <span><Tag size={16} /> Business</span>
                <span style={{color: '#0f172a', fontWeight: '800'}}>AED {selectedEvent.price || 0}</span>
                <span style={{color: '#64748b'}}>{selectedEvent.totalTickets || 30} Tickets Available</span>
              </div>
              <h2>{selectedEvent.title}</h2>
              <h3 dir="rtl" className="arabic-title-modal">{selectedEvent.arabicTitle}</h3>
              
              <div className="modal-info-grid">
                <div className="info-box">
                  <Calendar size={20} />
                  <div>
                    <label>Date</label>
                    <p>{formatDate(selectedEvent.startDate)} {selectedEvent.endDate ? `- ${formatDate(selectedEvent.endDate)}` : ''}</p>
                  </div>
                </div>
                <div className="info-box">
                  <Clock size={20} />
                  <div>
                    <label>Time</label>
                    <p>{selectedEvent.startTime} - {selectedEvent.endTime}</p>
                  </div>
                </div>
              </div>

              <div className="ticket-selector-box">
                <div className="ticket-label">
                  <Tag size={20} />
                  <div>
                    <label>Select Tickets</label>
                    <p>Price: AED {selectedEvent.price || 0} / ticket</p>
                  </div>
                </div>
                <div className="quantity-controls">
                  <button onClick={() => setTicketQty(Math.max(1, ticketQty - 1))}>-</button>
                  <span>{ticketQty}</span>
                  <button onClick={() => setTicketQty(Math.min(10, ticketQty + 1))}>+</button>
                </div>
              </div>

              <div className="modal-description">
                <h4>About this Event</h4>
                <p>{selectedEvent.description || "Join us for an immersive experience at SeenHub. This event is designed to bring together professionals and industry leaders to share insights, network, and explore new opportunities in the heart of our smart business center."}</p>
              </div>

              <div className="modal-actions">
                <button className="btn-register" onClick={() => window.location.href = `/checkout?service=${encodeURIComponent(selectedEvent.title)}&guests=${ticketQty}`}>
                  Book {ticketQty} Ticket{ticketQty > 1 ? 's' : ''} - AED {(selectedEvent.price || 0) * ticketQty}
                </button>
                <button className="btn-calendar" onClick={() => alert('Event added to your calendar!')}>Add to Calendar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="events-hero">
        <div className="hero-content">
          <span className="subtitle">Discover what&apos;s happening</span>
          <h1>Upcoming <span>Events</span> at SeenHub</h1>
          <p>Join our exclusive community events, networking sessions, and technology conferences designed to empower your business journey.</p>
        </div>
      </section>

      {/* Events Grid */}
      <section className="events-grid-section">
        <div className="section-header">
          <h2>Latest Events</h2>
          <div className="filter-pills">
            <button className="active">All Events</button>
            <button>Conferences</button>
            <button>Networking</button>
            <button>Workshops</button>
          </div>
        </div>

        <div className="events-grid">
          {events.map((event) => (
            <div key={event.id} className="event-card">
              <div className="event-status-tag">
                <span className={event.status}>{event.status.replace('_', ' ')}</span>
              </div>
              <div className="event-card-body">
                <div className="event-meta-top">
                  <span className="event-gate"><MapPin size={14} /> Gate {event.gateNumber || 'Main'}</span>
                  <span className="event-category"><Tag size={14} /> Business</span>
                  <span className="event-price" style={{marginLeft: 'auto', color: '#0f172a', fontWeight: '800'}}>AED {event.price || 0}</span>
                </div>
                
                <h3 className="event-title">{event.title}</h3>
                <h3 className="event-title-arabic" dir="rtl">{event.arabicTitle}</h3>
                
                <div className="event-details-list">
                  <div className="detail-item">
                    <Calendar size={16} />
                    <span>{formatDate(event.startDate)} {event.endDate ? `- ${formatDate(event.endDate)}` : ''}</span>
                  </div>
                  <div className="detail-item">
                    <Clock size={16} />
                    <span>{event.startTime} - {event.endTime}</span>
                  </div>
                </div>

                <div className="event-card-footer">
                  <button className="btn-details" onClick={() => setSelectedEvent(event)}>
                    View Details <ArrowRight size={16} />
                  </button>
                  <button className="btn-share">
                    <Share2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <style jsx>{`
        .events-container {
          min-height: 100vh;
          background: #f8fafc;
          padding-bottom: 5rem;
        }

        .events-hero {
          background: #fff;
          color: #0f172a;
          padding: 8rem 2rem 6rem;
          text-align: center;
          position: relative;
          overflow: hidden;
          border-bottom: 1px solid #f1f5f9;
        }
        .events-hero::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: radial-gradient(circle at 70% 30%, rgba(15, 23, 42, 0.03) 0%, transparent 50%);
        }
        .hero-content { position: relative; z-index: 1; max-width: 800px; margin: 0 auto; }
        .subtitle { color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; font-size: 0.8rem; display: block; margin-bottom: 1rem; }
        .hero-content h1 { font-size: 3.5rem; font-weight: 800; margin-bottom: 1.5rem; line-height: 1.1; color: #0f172a; }
        .hero-content h1 span { color: #475569; }
        .hero-content p { color: #64748b; font-size: 1.1rem; line-height: 1.6; max-width: 600px; margin: 0 auto; }

        .events-grid-section { max-width: 1200px; margin: -4rem auto 0; padding: 0 2rem; position: relative; z-index: 2; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3rem; background: white; padding: 1.5rem 2.5rem; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; }
        .section-header h2 { font-size: 1.5rem; font-weight: 800; color: #0f172a; }
        
        .filter-pills { display: flex; gap: 1rem; }
        .filter-pills button { background: #f8fafc; border: 1px solid #f1f5f9; padding: 0.6rem 1.2rem; border-radius: 50px; font-size: 0.85rem; font-weight: 600; color: #64748b; cursor: pointer; transition: all 0.3s; }
        .filter-pills button:hover { background: #f1f5f9; color: #0f172a; }
        .filter-pills button.active { background: #0f172a; color: white; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2); border-color: #0f172a; }

        .events-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 2rem; }
        
        .event-card {
          background: white;
          border-radius: 24px;
          border: 1px solid #f1f5f9;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }
        .event-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.06);
          border-color: #cbd5e1;
        }

        .event-status-tag { position: absolute; top: 1.5rem; right: 1.5rem; }
        .event-status-tag span { padding: 0.4rem 1rem; border-radius: 50px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
        .scheduled { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
        .fully_booked { background: #fee2e2; color: #991b1b; }
        .ongoing { background: #0f172a; color: white; }

        .event-card-body { padding: 2.5rem 2rem 2rem; }
        .event-meta-top { display: flex; gap: 1.5rem; margin-bottom: 1.5rem; }
        .event-gate, .event-category { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; font-weight: 600; color: #94a3b8; }
        
        .event-title { font-size: 1.4rem; font-weight: 800; color: #0f172a; margin-bottom: 0.5rem; line-height: 1.3; }
        .event-title-arabic { font-size: 1.1rem; color: #64748b; font-weight: 500; margin-bottom: 2rem; }
        
        .event-details-list { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2.5rem; padding-bottom: 2rem; border-bottom: 1px solid #f1f5f9; }
        .detail-item { display: flex; align-items: center; gap: 1rem; color: #475569; font-size: 0.95rem; font-weight: 500; }
        .detail-item :global(svg) { color: #64748b; }

        .event-card-footer { display: flex; justify-content: space-between; align-items: center; }
        .btn-details { background: #f8fafc; border: 1px solid #f1f5f9; padding: 0.8rem 1.5rem; border-radius: 12px; color: #0f172a; font-weight: 700; font-size: 0.9rem; display: flex; align-items: center; gap: 0.75rem; cursor: pointer; transition: all 0.3s; }
        .btn-details:hover { background: #0f172a; color: white; border-color: #0f172a; }
        .btn-share { background: transparent; border: 1px solid #f1f5f9; width: 44px; height: 44px; border-radius: 12px; color: #64748b; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s; }
        .btn-share:hover { background: #f1f5f9; color: #0f172a; border-color: #cbd5e1; }

        @media (max-width: 768px) {
          .hero-content h1 { font-size: 2.5rem; }
          .section-header { flex-direction: column; gap: 1.5rem; text-align: center; }
          .events-grid { grid-template-columns: 1fr; }
        }

        /* Modal Styles */
        .event-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 2rem;
        }

        .event-modal-content {
          background: white;
          width: 100%;
          max-width: 700px;
          border-radius: 32px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 25px 50px rgba(0,0,0,0.2);
        }

        .modal-close {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          background: white;
          border: none;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          transition: all 0.3s;
        }
        .modal-close:hover { transform: rotate(90deg); color: #ef4444; }

        .modal-banner {
          height: 120px;
          background: #f8fafc;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          align-items: center;
          padding: 0 3rem;
        }

        .status-badge {
          background: #0f172a;
          color: white;
          padding: 0.5rem 1.2rem;
          border-radius: 50px;
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .modal-body { padding: 3rem; }
        
        .modal-meta { display: flex; gap: 2rem; margin-bottom: 1.5rem; }
        .modal-meta span { display: flex; align-items: center; gap: 0.5rem; color: #94a3b8; font-size: 0.85rem; font-weight: 600; }

        .modal-body h2 { font-size: 2.2rem; font-weight: 800; color: #0f172a; margin-bottom: 0.5rem; line-height: 1.2; }
        .arabic-title-modal { font-size: 1.4rem; color: #64748b; margin-bottom: 2.5rem; }

        .modal-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 3rem; }
        .info-box { background: #f8fafc; padding: 1.5rem; border-radius: 20px; display: flex; align-items: center; gap: 1rem; border: 1px solid #f1f5f9; }
        .info-box label { display: block; font-size: 0.7rem; color: #94a3b8; font-weight: 800; text-transform: uppercase; margin-bottom: 0.25rem; }
        .info-box p { font-size: 0.95rem; font-weight: 700; color: #0f172a; margin: 0; }
        .info-box :global(svg) { color: #64748b; }

        .modal-description h4 { font-size: 1.1rem; font-weight: 800; color: #0f172a; margin-bottom: 1rem; }
        .modal-description p { color: #64748b; line-height: 1.7; font-size: 1rem; margin-bottom: 3rem; }

        .modal-actions { display: flex; gap: 1.5rem; }
        .btn-register { flex: 2; background: #0f172a; color: white; border: none; padding: 1.2rem; border-radius: 16px; font-weight: 700; cursor: pointer; transition: all 0.3s; }
        .btn-register:hover { background: #1e293b; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(15,23,42,0.2); }
        .btn-calendar { flex: 1; background: white; border: 1px solid #f1f5f9; color: #0f172a; padding: 1.2rem; border-radius: 16px; font-weight: 700; cursor: pointer; transition: all 0.3s; }
        .btn-calendar:hover { background: #f8fafc; border-color: #cbd5e1; }

        .ticket-selector-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 1.5rem 2rem;
          margin-bottom: 2.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .ticket-label { display: flex; align-items: center; gap: 1.2rem; }
        .ticket-label label { display: block; font-size: 0.75rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 0.2rem; }
        .ticket-label p { font-size: 1rem; fontWeight: 700; color: #0f172a; margin: 0; }
        .ticket-label :global(svg) { color: #64748b; }

        .quantity-controls { display: flex; align-items: center; gap: 1.5rem; background: white; padding: 0.5rem; border-radius: 12px; border: 1px solid #e2e8f0; }
        .quantity-controls button { width: 32px; height: 32px; border-radius: 8px; border: none; background: #f1f5f9; color: #0f172a; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .quantity-controls button:hover { background: #0f172a; color: white; }
        .quantity-controls span { font-size: 1.1rem; font-weight: 800; min-width: 20px; text-align: center; }

        .animate-pop-in {
          animation: popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        @media (max-width: 600px) {
          .modal-info-grid { grid-template-columns: 1fr; }
          .modal-actions { flex-direction: column; }
          .modal-body { padding: 2rem; }
          .modal-body h2 { font-size: 1.6rem; }
        }
      `}</style>
    </div>
  );
}
