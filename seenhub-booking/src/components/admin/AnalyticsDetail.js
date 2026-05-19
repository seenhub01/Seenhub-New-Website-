import React from 'react';
import { RefreshCw, Activity, PieChart, Users, CalendarCheck, BarChart3, Mail, Smartphone } from 'lucide-react';

export default function AnalyticsDetail({ 
  tab, 
  siteStats, 
  loadingStats, 
  fetchAnalytics, 
  S 
}) {
  const getIcon = (t) => {
    switch(t) {
      case 'User Analytics': return Users;
      case 'Membership Analytics': return Activity;
      case 'Space Analytics': return PieChart;
      case 'Event Analytics': return CalendarCheck;
      case 'Payment Analytics': return BarChart3;
      case 'Email Analytics': return Mail;
      default: return Activity;
    }
  };

  const Icon = getIcon(tab);

  return (
    <div className="animate-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>{tab}</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Detailed performance metrics and historical data.</p>
        </div>
        <button 
          onClick={fetchAnalytics} 
          disabled={loadingStats}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.6rem 1rem', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}
        >
          <RefreshCw size={16} className={loadingStats ? 'spin' : ''} /> Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div style={{ ...S.card, background: '#0f172a', color: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.8, textTransform: 'uppercase' }}>Live Visitors</span>
            <div style={{ width: 10, height: 10, background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 10px #22c55e' }}></div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{siteStats.liveUsers || 0}</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Active in last 5 minutes</div>
        </div>
        <div style={S.card}>
          <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '1rem' }}>Total Visits</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>{siteStats.totalVisits || 0}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Since analytics started</div>
        </div>
        <div style={S.card}>
          <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '1rem' }}>Unique Areas</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>{Object.keys(siteStats.locations || {}).length}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Geographic distribution</div>
        </div>
        <div style={S.card}>
          <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '1rem' }}>Avg. Engagement</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>Medium</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Based on session duration</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={S.card}>
          <h3 style={{ margin: '0 0 1.5rem', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Popular Pages</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.entries(siteStats.pageViews || {}).sort((a,b) => b[1] - a[1]).slice(0, 5).map(([path, count]) => {
              const percentage = Math.round((count / (siteStats.totalVisits || 1)) * 100);
              return (
                <div key={path}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                    <span style={{ fontWeight: 600, color: '#475569' }}>{path}</span>
                    <span style={{ color: '#0f172a', fontWeight: 700 }}>{count} views</span>
                  </div>
                  <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${percentage}%`, height: '100%', background: '#0f172a' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={S.card}>
          <h3 style={{ margin: '0 0 1.5rem', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Visitor Areas</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.entries(siteStats.locations || {}).sort((a,b) => b[1] - a[1]).slice(0, 5).map(([loc, count]) => (
              <div key={loc} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: 10 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>{loc}</span>
                <span style={{ background: '#0f172a', color: '#fff', fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: 20, fontWeight: 700 }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ ...S.card, marginTop: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1.5rem', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Recent Traffic Activity</h3>
        <table style={S.table}>
          <thead>
            <tr>
              {['Time', 'Page Path', 'Location', 'Referrer'].map(h => <th key={h} style={S.th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {(siteStats.recentLogs || []).slice(0, 10).map((log) => (
              <tr key={log.id}>
                <td style={S.td}>{new Date(log.timestamp).toLocaleTimeString()}</td>
                <td style={{ ...S.td, fontWeight: 600 }}>{log.path}</td>
                <td style={S.td}><span style={{ ...S.badge, background: '#f0fdf4', color: '#166534' }}>{log.location}</span></td>
                <td style={{ ...S.td, fontSize: '0.75rem', color: '#94a3b8' }}>{log.referrer || 'Direct'}</td>
              </tr>
            ))}
            {(!siteStats.recentLogs || !siteStats.recentLogs.length) && (
              <tr><td colSpan={4} style={{ ...S.td, textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Waiting for visitor data...</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

