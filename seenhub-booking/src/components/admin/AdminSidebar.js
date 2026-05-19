import React from 'react';
import { 
  LayoutDashboard, Users, CalendarCheck, BarChart3, BookOpen, Coffee, 
  Database, FileText, HelpCircle, Layers, MessageSquare, Settings, 
  Smartphone, LogOut, ChevronDown, ChevronUp, Clock, Printer, Activity, Shield, Tag, Landmark, ScrollText, ShieldCheck, FileKey, Lock, Languages, Smartphone as MobileIcon, PieChart, FileCode, Mail, Crown
} from 'lucide-react';

const CrownIcon = Crown;

const S = {
  sb: { 
    width: 260, 
    background: '#fff', 
    borderRight: '1px solid #e2e8f0', 
    height: '100vh', 
    position: 'sticky', 
    top: 0, 
    overflowY: 'auto' 
  },
  hdr: { 
    height: 65, 
    background: '#fff', 
    borderBottom: '1px solid #e2e8f0', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: '0 2rem', 
    position: 'sticky', 
    top: 0, 
    zIndex: 10 
  }
};

export default function AdminSidebar({ 
  tab, 
  setTab, 
  menus, 
  toggle, 
  currentAdmin, 
  handleLogout, 
  time 
}) {
  const isSuper = currentAdmin?.role === 'Super Admin';
  const hasPerm = (p) => isSuper || currentAdmin?.permissions?.includes(p);

  const NavItem = ({ n, icon: Icon, sub = false, hidden = false }) => {
    if (hidden) return null;
    return (
      <button 
        onClick={() => setTab(n)} 
        style={{ 
          width: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem', 
          padding: sub ? '0.6rem 1rem 0.6rem 3rem' : '0.85rem 1.5rem', 
          background: tab === n ? '#f8fafc' : 'transparent', 
          color: tab === n ? '#0f172a' : '#64748b', 
          border: 'none', 
          borderLeft: tab === n ? '4px solid #0f172a' : '4px solid transparent', 
          cursor: 'pointer', 
          fontSize: '0.85rem', 
          fontWeight: tab === n ? 700 : 500, 
          transition: 'all 0.2s' 
        }}
      >
        <Icon size={18} /> {n}
      </button>
    );
  };

  const MenuHeader = ({ n, icon: Icon, id }) => (
    <button 
      onClick={() => toggle(id)} 
      style={{ 
        width: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '1rem 1.5rem', 
        background: 'transparent', 
        border: 'none', 
        cursor: 'pointer', 
        color: '#0f172a', 
        fontSize: '0.75rem', 
        fontWeight: 800, 
        textTransform: 'uppercase', 
        letterSpacing: '1px' 
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Icon size={16} /> {n}</div>
      {menus.includes(id) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
    </button>
  );

  return (
    <aside style={S.sb}>
      <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>
          SEEN<span style={{ color: '#94a3b8' }}>Hub</span> <span style={{ fontSize: '0.6rem', background: '#0f172a', color: '#fff', padding: '2px 6px', borderRadius: 4, verticalAlign: 'middle', marginLeft: 4 }}>ADMIN</span>
        </div>
      </div>

      <div style={{ padding: '1.5rem 0' }}>
        <NavItem n="Dashboard" icon={LayoutDashboard} />
        
        {hasPerm('Analytics') && (
          <>
            <MenuHeader n="Analytics" icon={PieChart} id="Analytics" />
            {menus.includes('Analytics') && (
              <>
                <NavItem n="User Analytics" icon={Users} sub />
                <NavItem n="Membership Analytics" icon={CrownIcon} sub />
                <NavItem n="Space Analytics" icon={Layers} sub />
                <NavItem n="Event Analytics" icon={CalendarCheck} sub />
                <NavItem n="Payment Analytics" icon={BarChart3} sub />
                <NavItem n="Email Analytics" icon={Mail} sub />
              </>
            )}
          </>
        )}

        {isSuper && <NavItem n="Admin Users" icon={Shield} />}
        {hasPerm('Accounts') && <NavItem n="Accounts" icon={Users} />}
        {hasPerm('Booking') && <NavItem n="All Bookings" icon={CalendarCheck} />}
        {hasPerm('Landing page') && <NavItem n="Landing page" icon={FileText} />}
        {hasPerm('Promo Popup') && <NavItem n="Promo Popup" icon={Smartphone} />}
        {hasPerm('Events') && <NavItem n="Events" icon={CalendarCheck} />}
        {hasPerm('Blogs') && <NavItem n="Blogs" icon={BookOpen} />}
        {hasPerm('Cafe') && <NavItem n="Cafe" icon={Coffee} />}
        {hasPerm('Categories') && <NavItem n="Categories" icon={Layers} />}

        <MenuHeader n="Catalogs" icon={Database} id="Catalogs" />
        {menus.includes('Catalogs') && (
          <>
            {hasPerm('Workspaces') && <NavItem n="Workspaces" icon={Layers} sub />}
            {hasPerm('Memberships') && <NavItem n="Memberships" icon={CrownIcon} sub />}
            {hasPerm('Events') && <NavItem n="Events" icon={CalendarCheck} sub />}
            {hasPerm('Lockers') && <NavItem n="Lockers" icon={Lock} sub />}
            {hasPerm('Coupons') && <NavItem n="Coupons" icon={Tag} sub />}
          </>
        )}

        <MenuHeader n="Legal & Help" icon={ShieldCheck} id="Legal" />
        {menus.includes('Legal') && (
          <>
            <NavItem n="Frequently Asked Questions" icon={HelpCircle} sub />
            <NavItem n="Terms And Conditions" icon={ScrollText} sub />
            <NavItem n="Privacy Policies" icon={ShieldCheck} sub />
            <NavItem n="Copyrights" icon={FileKey} sub />
          </>
        )}

        {hasPerm('Messages') && <NavItem n="Messages" icon={MessageSquare} />}
        {hasPerm('Invoices') && <NavItem n="Invoices" icon={FileText} />}
        {hasPerm('Printing') && <NavItem n="Printing" icon={Printer} />}
        {hasPerm('SEO') && <NavItem n="SEO" icon={Activity} />}
        {hasPerm('Settings') && <NavItem n="Settings" icon={Settings} />}
      </div>

      <div style={{ marginTop: 'auto', padding: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
        <button 
          onClick={handleLogout}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: 10, background: '#fef2f2', color: '#ef4444', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}
        >
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </aside>
  );
}


