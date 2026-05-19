"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import AuthModal from './AuthModal';
import { User, Menu, X as CloseIcon, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authRedirect, setAuthRedirect] = useState('/dashboard');
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [logo, setLogo] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMobileSub, setActiveMobileSub] = useState(null);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveMobileSub(null);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    const handleOpenAuth = (e) => {
      if (e.detail && e.detail.redirectUrl) {
        setAuthRedirect(e.detail.redirectUrl);
      }
      setIsAuthOpen(true);
    };

    // Fetch logo from global settings API
    fetch('/api/settings', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data.logo) {
          setLogo(data.logo);
        }
      })
      .catch(e => console.error(e));

    // Fetch Workspaces
    fetch('/api/workspaces', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) setWorkspaces(data);
      })
      .catch(e => console.error(e));

    // Fetch Memberships
    fetch('/api/memberships', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) setMemberships(data);
      })
      .catch(e => console.error(e));

    // Check for login=true in URL
    const params = new URLSearchParams(window.location.search);
    if (params.get('login') === 'true') {
      setIsAuthOpen(true);
    }

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('openAuthModal', handleOpenAuth);

    const loadUser = () => {
      const storedUser = localStorage.getItem('seenhub_user');
      setUser(storedUser ? JSON.parse(storedUser) : null);
    };

    loadUser();
    window.addEventListener('storage', loadUser);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('openAuthModal', handleOpenAuth);
      window.removeEventListener('storage', loadUser);
    };
  }, []);

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container nav-content">
          <Link href="/" className="logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            {logo ? (
              <Image src={logo} alt="SEEN Hub" width={140} height={45} unoptimized style={{ height: '45px', width: 'auto', objectFit: 'contain' }} />
            ) : (
              <>SEEN <span>Hub</span></>
            )}
          </Link>
          
          <ul className="nav-links">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/about">About Us</Link></li>
            <li className="has-dropdown">
              <Link href="/workspaces">Workspaces ▾</Link>
              <ul className="dropdown">
                {workspaces.map(ws => (
                  <li key={ws.id}>
                    <Link href={`/workspaces/${ws.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')}`}>
                      {ws.title}
                    </Link>
                  </li>
                ))}
                {workspaces.length === 0 && (
                  <>
                    <li><Link href="/workspaces/classroom">ClassRoom</Link></li>
                    <li><Link href="/workspaces/work-booth-single">Work booth (Single)</Link></li>
                    <li><Link href="/workspaces/work-booth-double">Work booth (Double)</Link></li>
                    <li><Link href="/workspaces/manager-room">Manager Room</Link></li>
                    <li><Link href="/workspaces/meeting-room">Meeting Room</Link></li>
                    <li><Link href="/workspaces/vip-business-lounge">VIP Business Lounge</Link></li>
                  </>
                )}
              </ul>
            </li>
            <li className="has-dropdown">
              <Link href="/memberships">Passes & Memberships ▾</Link>
              <ul className="dropdown">
                {memberships.map(m => (
                  <li key={m.id}>
                    <Link href={`/memberships/${m.slug || m.title.toLowerCase().replace(/ /g, '-')}`}>
                      {m.title}
                    </Link>
                  </li>
                ))}
                {memberships.length === 0 && (
                  <>
                    <li><Link href="/memberships/day-pass">Day Pass-Coworking Space</Link></li>
                    <li><Link href="/memberships/monthly-membership">Monthly Membership</Link></li>
                    <li><Link href="/memberships/student-membership">Student Membership</Link></li>
                    <li><Link href="/memberships/vip-daily-pass">VIP Daily Pass</Link></li>
                  </>
                )}
              </ul>
            </li>
            <li><Link href="#">Our Sustainable Partner</Link></li>
            <li><Link href="/events">Events</Link></li>
            <li><Link href="/blogs">Blog</Link></li>
            <li><Link href="/contact">Contact Us</Link></li>
          </ul>

          <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const user = localStorage.getItem('seenhub_user');
                if (user) {
                  window.location.href = '/booking';
                } else {
                  setAuthRedirect('/booking');
                  setIsAuthOpen(true);
                }
              }}
              className="btn-primary desktop-only"
              style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem', cursor: 'pointer', border: 'none' }}
            >
              Book Now
            </div>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="profile-icon" title="User Dashboard" onClick={() => window.location.href = '/dashboard'}>
                  <User size={20} color="#2d2d2d" style={{ pointerEvents: 'none' }} />
                </div>
              </div>
            ) : (
              <div
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const user = localStorage.getItem('seenhub_user');
                  if (user) {
                    window.location.href = '/dashboard';
                  } else {
                    setAuthRedirect('/dashboard');
                    setIsAuthOpen(true);
                  }
                }}
                className="profile-icon"
                title="User Dashboard"
                style={{ cursor: 'pointer' }}
              >
                <User size={20} color="#2d2d2d" style={{ pointerEvents: 'none' }} />
              </div>
            )}
            
            {/* Mobile Menu Toggle */}
            <button 
              className="mobile-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px', display: 'none' }}
            >
              {isMobileMenuOpen ? <CloseIcon size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        <div className={`mobile-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-sidebar-header">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="logo">
              {logo ? <Image src={logo} alt="Logo" width={120} height={40} unoptimized style={{ objectFit: 'contain' }} /> : <>SEEN <span>Hub</span></>}
            </Link>
            <button onClick={() => setIsMobileMenuOpen(false)} style={{ background: 'none', border: 'none' }}><CloseIcon size={24} /></button>
          </div>
          
          <ul className="mobile-nav-links">
            <li><Link href="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link></li>
            <li><Link href="/about" onClick={() => setIsMobileMenuOpen(false)}>About Us</Link></li>
            
            <li>
              <div className="mobile-sub-toggle" onClick={() => setActiveMobileSub(activeMobileSub === 'workspaces' ? null : 'workspaces')}>
                Workspaces <ChevronDown size={16} style={{ transform: activeMobileSub === 'workspaces' ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
              </div>
              {activeMobileSub === 'workspaces' && (
                <ul className="mobile-sub-menu">
                   {workspaces.map(ws => (
                    <li key={ws.id}>
                      <Link href={`/workspaces/${ws.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')}`} onClick={() => setIsMobileMenuOpen(false)}>
                        {ws.title}
                      </Link>
                    </li>
                  ))}
                  {workspaces.length === 0 && (
                    <li><Link href="/workspaces" onClick={() => setIsMobileMenuOpen(false)}>All Workspaces</Link></li>
                  )}
                </ul>
              )}
            </li>

            <li>
              <div className="mobile-sub-toggle" onClick={() => setActiveMobileSub(activeMobileSub === 'memberships' ? null : 'memberships')}>
                Memberships <ChevronDown size={16} style={{ transform: activeMobileSub === 'memberships' ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
              </div>
              {activeMobileSub === 'memberships' && (
                <ul className="mobile-sub-menu">
                   {memberships.map(m => (
                    <li key={m.id}>
                      <Link href={`/memberships/${m.slug || m.title.toLowerCase().replace(/ /g, '-')}`} onClick={() => setIsMobileMenuOpen(false)}>
                        {m.title}
                      </Link>
                    </li>
                  ))}
                   {memberships.length === 0 && (
                    <li><Link href="/memberships" onClick={() => setIsMobileMenuOpen(false)}>All Memberships</Link></li>
                  )}
                </ul>
              )}
            </li>

            <li><Link href="/events" onClick={() => setIsMobileMenuOpen(false)}>Events</Link></li>
            <li><Link href="/blogs" onClick={() => setIsMobileMenuOpen(false)}>Blog</Link></li>
            <li><Link href="/contact" onClick={() => setIsMobileMenuOpen(false)}>Contact Us</Link></li>
          </ul>

          <div className="mobile-sidebar-footer">
            <button 
              onClick={() => { setIsMobileMenuOpen(false); window.location.href='/booking'; }}
              className="btn-primary" 
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Book Now
            </button>
          </div>
        </div>
      </nav>

      <style jsx>{`
        .profile-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          transition: all 0.3s;
        }
        .profile-icon:hover {
          background: #f1f5f9;
          transform: translateY(-2px);
        }

        @media (max-width: 1024px) {
          .desktop-only { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
      `}</style>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} redirectUrl={authRedirect} />
    </>
  );
}
