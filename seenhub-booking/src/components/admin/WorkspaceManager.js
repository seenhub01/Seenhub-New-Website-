import React from 'react';
import { Plus, Edit, Trash2, Layers, Search, Eye } from 'lucide-react';

export default function WorkspaceManager({ 
  workspaces, 
  openModal, 
  deleteWorkspace, 
  S 
}) {
  const [search, setSearch] = React.useState('');
  
  const filtered = workspaces.filter(w => 
    w.title.toLowerCase().includes(search.toLowerCase()) || 
    w.subtitle?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>Workspaces</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Manage your physical office spaces and units.</p>
        </div>
        <button 
          onClick={() => openModal(null)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#0f172a', color: '#fff', border: 'none', padding: '0.75rem 1.25rem', borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}
        >
          <Plus size={18} /> Add Workspace
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Search workspaces..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.75rem', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
            />
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Total: {filtered.length} Workspaces</div>
        </div>

        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>Workspace</th>
              <th style={S.th}>Type / Units</th>
              <th style={S.th}>Pricing (Hourly)</th>
              <th style={S.th}>QR Prefix</th>
              <th style={{ ...S.th, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((w, i) => (
              <tr key={i}>
                <td style={S.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: '#f8fafc', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                      <img src={w.featuredImg || '/placeholder.png'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{w.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{w.subtitle || 'No subtitle'}</div>
                    </div>
                  </div>
                </td>
                <td style={S.td}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                    <span style={S.badgeBlue}>{w.units} Units</span>
                    {(w.bookingTypes || []).map((t, idx) => (
                      <span key={idx} style={{ ...S.badge, background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }}>{t}</span>
                    ))}
                  </div>
                </td>
                <td style={S.td}>
                  <div style={{ fontWeight: 700 }}>AED {w.pricing?.hourly?.individual || 0} /hr</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Corporate: AED {w.pricing?.hourly?.corporate || 0}</div>
                </td>
                <td style={S.td}><code style={{ background: '#f1f5f9', padding: '0.2rem 0.4rem', borderRadius: 4, fontWeight: 700 }}>{w.qrPrefix || '01'}</code></td>
                <td style={{ ...S.td, textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button 
                      onClick={() => window.open(`/workspaces/${w.id}`, '_blank')}
                      style={{ border: 'none', background: '#f8fafc', color: '#64748b', padding: '0.5rem', borderRadius: 8, cursor: 'pointer' }}
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      onClick={() => openModal(w)}
                      style={{ border: 'none', background: '#eff6ff', color: '#2563eb', padding: '0.5rem', borderRadius: 8, cursor: 'pointer' }}
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => deleteWorkspace(w.id)}
                      style={{ border: 'none', background: '#fef2f2', color: '#ef4444', padding: '0.5rem', borderRadius: 8, cursor: 'pointer' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
