import React from 'react';
import { LayoutDashboard, Users, CreditCard, Layers, Activity } from 'lucide-react';

function Card({ title, val, sub, icon: Icon, color }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.05, transform: 'rotate(-10deg)' }}>
        <Icon size={100} />
      </div>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Icon size={14} color={color} /> {title}
      </div>
      <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>{val}</div>
      <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>{sub}</div>
    </div>
  );
}

export default function AnalyticsOverview({ stats }) {
  return (
    <div className="animate-fade">
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>Dashboard Overview</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Real-time business performance and resource utilization.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <Card 
          title="Total Revenue" 
          val={`AED ${stats.rev?.toLocaleString()}`} 
          sub="Life-time confirmed revenue" 
          icon={CreditCard} 
          color="#d88906" 
        />
        <Card 
          title="Total Users" 
          val={stats.users} 
          sub={`${stats.active} active members`} 
          icon={Users} 
          color="#3b82f6" 
        />
        <Card 
          title="Space Bookings" 
          val={stats.spaces} 
          sub="Bookings confirmed today" 
          icon={Layers} 
          color="#10b981" 
        />
        <Card 
          title="Occupancy Rate" 
          val={`${stats.occ}%`} 
          sub="Live resource utilization" 
          icon={Activity} 
          color="#6366f1" 
        />
      </div>
    </div>
  );
}
