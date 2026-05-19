import React from 'react';
import { Smartphone, Search } from 'lucide-react';

export default function SEOManager({ 
  seoData, 
  setSeoData, 
  seoCategory, 
  setSeoCategory, 
  saveSeo, 
  savingSeo, 
  inp, 
  S 
}) {
  const seoCategories = ['Main Pages', 'Workspaces', 'Memberships', 'Events', 'Blogs'];
  const filteredData = seoData.filter(item => item.category === seoCategory);

  return (
    <div className="animate-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>Search Engine Optimization</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Optimize metadata for each category and page to improve Google ranking.</p>
        </div>
        <button 
          onClick={() => saveSeo(seoData)} 
          disabled={savingSeo}
          style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '0.75rem 2rem', borderRadius: 12, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(15,23,42,0.15)', opacity: savingSeo ? 0.7 : 1 }}
        >
          {savingSeo ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', background: '#fff', padding: '0.5rem', borderRadius: 16, border: '1px solid #e2e8f0', overflowX: 'auto' }}>
        {seoCategories.map(cat => (
          <button
            key={cat}
            onClick={() => setSeoCategory(cat)}
            style={{
              flex: 1,
              padding: '0.75rem 1.25rem',
              borderRadius: 12,
              border: 'none',
              background: seoCategory === cat ? '#0f172a' : 'transparent',
              color: seoCategory === cat ? '#fff' : '#64748b',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        {filteredData.map((item) => {
          const globalIdx = seoData.findIndex(s => s.id === item.id);
          
          return (
            <div key={item.id} style={{ ...S.card, border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ background: '#f8fafc', padding: '0.5rem', borderRadius: 10, border: '1px solid #e2e8f0', color: '#0f172a' }}><Smartphone size={18} /></div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{item.page}</h3>
                    <code style={{ fontSize: '0.7rem', color: '#64748b', background: '#f1f5f9', padding: '0.2rem 0.4rem', borderRadius: 4 }}>{item.route}</code>
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, background: '#f8fafc', padding: '0.25rem 0.6rem', borderRadius: 6 }}>{item.category}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.6rem', textTransform: 'uppercase' }}>Meta Title</label>
                  <input 
                    value={item.title} 
                    onChange={e => {
                      const newData = [...seoData];
                      newData[globalIdx].title = e.target.value;
                      setSeoData(newData);
                    }}
                    placeholder="Enter SEO title (max 60 chars)"
                    style={inp} 
                  />
                  <div style={{ marginTop: '0.5rem', fontSize: '0.65rem', color: (item.title || '').length > 60 ? '#ef4444' : '#94a3b8', fontWeight: 600 }}>
                    {(item.title || '').length}/60 recommended
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.6rem', textTransform: 'uppercase' }}>Meta Description</label>
                  <textarea 
                    rows={3}
                    value={item.description} 
                    onChange={e => {
                      const newData = [...seoData];
                      newData[globalIdx].description = e.target.value;
                      setSeoData(newData);
                    }}
                    placeholder="Enter SEO description (max 160 chars)"
                    style={{ ...inp, resize: 'vertical' }} 
                  />
                  <div style={{ marginTop: '0.5rem', fontSize: '0.65rem', color: (item.description || '').length > 160 ? '#ef4444' : '#94a3b8', fontWeight: 600 }}>
                    {(item.description || '').length}/160 recommended
                  </div>
                </div>
              </div>
              
              <div style={{ marginTop: '1.5rem', background: '#f8fafc', padding: '1.5rem', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>Google Search Preview</div>
                <div style={{ fontSize: '1.1rem', color: '#1a0dab', marginBottom: '4px', cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                  {item.title || item.page}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#006621', marginBottom: '4px' }}>
                  https://seenhub.ae{item.route}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#4b5563', lineHeight: '1.5', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {item.description || 'Enter a description to see how it will look in Google search results.'}
                </div>
              </div>
            </div>
          );
        })}
        {filteredData.length === 0 && (
          <div style={{ textAlign: 'center', padding: '5rem', background: '#fff', borderRadius: 16, border: '1px dashed #e2e8f0' }}>
            <Search size={48} style={{ marginBottom: '1rem', color: '#cbd5e1' }} />
            <h3 style={{ margin: 0, color: '#0f172a', fontWeight: 800 }}>No items found</h3>
            <p style={{ color: '#64748b', marginTop: '0.5rem' }}>There is no content in the {seoCategory} category to optimize.</p>
          </div>
        )}
      </div>
    </div>
  );
}
