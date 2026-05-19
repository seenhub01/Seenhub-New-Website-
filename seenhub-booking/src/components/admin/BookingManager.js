import React from 'react';
import { Search, Filter, Plus, Clock, MapPin, User, ShieldCheck, QrCode } from 'lucide-react';

export default function BookingManager({ 
  bookings, 
  openManualBooking, 
  openQrModal, 
  deleteBooking, 
  S 
}) {
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState('All');
  
  const filtered = bookings.filter(b => {
    const name = b.name || '';
    const email = b.email || '';
    const bookingId = b.bookingId || b.id || '';
    const category = b.category || '';

    const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) || 
                          email.toLowerCase().includes(search.toLowerCase()) ||
                          bookingId.toString().toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || category.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'Confirmed': return { bg: '#f0fdf4', color: '#16a34a' };
      case 'Paid': return { bg: '#f0fdf4', color: '#16a34a' };
      case 'Pending': return { bg: '#fffbeb', color: '#d97706' };
      case 'Cancelled': return { bg: '#fef2f2', color: '#ef4444' };
      default: return { bg: '#f8fafc', color: '#64748b' };
    }
  };

  return (
    <div className="animate-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>Reservations</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Review and manage all workspace and event bookings.</p>
        </div>
        <button 
          onClick={openManualBooking}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#0f172a', color: '#fff', border: 'none', padding: '0.75rem 1.25rem', borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}
        >
          <Plus size={18} /> Manual Booking
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Search by name, email or ID..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.75rem', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
            />
          </div>
          <select 
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{ padding: '0.6rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.85rem', background: '#fff', fontWeight: 600 }}
          >
            <option>All</option>
            <option>Workspaces</option>
            <option>Memberships</option>
            <option>Events</option>
            <option>Lockers</option>
          </select>
        </div>

        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>Booking ID / Date</th>
              <th style={S.th}>Customer</th>
              <th style={S.th}>Space / Service</th>
              <th style={S.th}>Total</th>
              <th style={S.th}>Status</th>
              <th style={{ ...S.th, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b, i) => {
              const statusStyle = getStatusColor(b.status);
              return (
                <tr key={i}>
                  <td style={S.td}>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.75rem', fontFamily: 'monospace' }}>#{b.bookingId || (b.id ? b.id.slice(-8).toUpperCase() : 'N/A')}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>{b.date}</div>
                  </td>
                  <td style={S.td}>
                    <div style={{ fontWeight: 700 }}>{b.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{b.email}</div>
                  </td>
                  <td style={S.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                      <span style={{ ...S.badge, background: '#f1f5f9', color: '#64748b', fontSize: '0.6rem' }}>{b.category}</span>
                      {b.space}
                    </div>
                    {b.timeFrom && <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.2rem' }}>{b.timeFrom} - {b.timeTo}</div>}
                  </td>
                  <td style={S.td}><div style={{ fontWeight: 800 }}>AED {parseFloat(b.total || 0).toFixed(2)}</div></td>
                  <td style={S.td}>
                    <span style={{ ...S.badge, background: statusStyle.bg, color: statusStyle.color }}>{b.status}</span>
                  </td>
                  <td style={{ ...S.td, textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => openQrModal(b)}
                        style={{ border: 'none', background: '#f8fafc', color: '#64748b', padding: '0.5rem', borderRadius: 8, cursor: 'pointer' }}
                        title="View QR"
                      >
                        <QrCode size={16} />
                      </button>
                      <button 
                        onClick={() => deleteBooking(b.id)}
                        style={{ border: 'none', background: '#fef2f2', color: '#ef4444', padding: '0.5rem', borderRadius: 8, cursor: 'pointer' }}
                        title="Cancel"
                      >
                        <TrashIcon size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TrashIcon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}
