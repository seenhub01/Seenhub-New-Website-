"use client";
import './dashboard.css';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  LayoutDashboard, CalendarCheck, Crown, CalendarDays, Lock,
  Receipt, Coffee, LifeBuoy, CheckCircle2, ChevronRight, 
  Download, Filter, QrCode as QrIcon, ShieldCheck, Wifi, Car, BookOpen, Clock, 
  ChevronLeft, Settings, Search, MapPin, X, MoreVertical, LogOut, User, Printer, Upload, FileText, HelpCircle, Info, Phone, History
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../utils/apiClient';
import GlobalLoader from '../../components/GlobalLoader';

export default function CustomerDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [qrModal, setQrModal] = useState(null); // booking object
  const [user, setUser] = useState(null);
  const [hasLocker, setHasLocker] = useState(false);
  const [lockerBooking, setLockerBooking] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [settings, setSettings] = React.useState({ 
    logo: '', 
    contactPhone: '', 
    contactEmail: '', 
    websiteUrl: '',
    printCreditToPageRatio: 2,
    taxEnabled: false,
    taxPercentage: 0
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        // Bug 11 Fix: include taxEnabled + taxPercentage so renewal calc never returns NaN
        setSettings({
          logo: data.logo || '',
          contactPhone: data.contactPhone || '',
          contactEmail: data.contactEmail || '',
          websiteUrl: data.websiteUrl || 'https://seenhub.ae',
          printCreditToPageRatio: data.printCreditToPageRatio || 2,
          taxEnabled: data.taxEnabled || false,
          taxPercentage: data.taxPercentage || 0
        });
      } catch (e) {
        console.error("Settings fetch error:", e);
      }
    };
    fetchSettings();
  }, []);

  const handleDownloadInvoice = (inv) => {
    if (!inv || !user) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice #${inv.id}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&display=swap');
          
          :root {
            --primary: #0f172a;
            --accent: #d88906;
            --text-main: #1e293b;
            --text-muted: #64748b;
            --bg-light: #f8fafc;
            --border: #e2e8f0;
          }

          * { box-sizing: border-box; }

          body { 
            font-family: 'Outfit', sans-serif; 
            color: var(--text-main); 
            margin: 0; 
            padding: 0; 
            line-height: 1.4;
            background: #fff;
            -webkit-print-color-adjust: exact;
          }

          .invoice-wrapper {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
          }

          .header { 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-start; 
            margin-bottom: 30px; 
            border-bottom: 3px solid var(--primary);
            padding-bottom: 20px;
          }

          .logo-area { width: 60%; }
          .logo-area img { height: 50px; margin-bottom: 10px; }
          .company-name { 
            font-size: 18px; 
            font-weight: 800; 
            color: var(--primary); 
            text-transform: uppercase; 
            letter-spacing: 0.5px;
            margin: 0 0 2px 0;
          }
          
          .company-info p { margin: 1px 0; font-size: 11px; color: var(--text-muted); font-weight: 400; }

          .invoice-meta { width: 40%; text-align: right; }
          .invoice-meta h1 { 
            margin: 0; 
            font-size: 38px; 
            font-weight: 800; 
            color: var(--primary); 
            line-height: 1;
            margin-bottom: 8px;
          }
          .invoice-meta .invoice-no { 
            font-size: 12px; 
            font-weight: 700; 
            color: var(--accent); 
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .invoice-meta .date { font-size: 12px; color: var(--text-muted); margin-top: 8px; }

          .billing-grid { 
            display: flex;
            justify-content: space-between;
            gap: 20px; 
            margin-bottom: 30px; 
          }

          .bill-to { width: 50%; }
          .payment-status { width: 50%; text-align: right; }

          .section-title { 
            font-size: 9px; 
            font-weight: 800; 
            text-transform: uppercase; 
            color: var(--text-muted); 
            letter-spacing: 1.2px; 
            margin-bottom: 8px;
            border-bottom: 1px solid var(--border);
            padding-bottom: 4px;
            display: block;
          }

          .bill-to .client-name { font-size: 16px; font-weight: 800; color: var(--primary); margin: 0 0 2px 0; }
          .bill-to p { margin: 1px 0; font-size: 12px; color: var(--text-main); }

          .status-badge { 
            display: inline-block; 
            padding: 4px 15px; 
            border: 2px solid #16a34a; 
            color: #16a34a; 
            font-weight: 900; 
            font-size: 18px; 
            border-radius: 4px; 
            text-transform: uppercase;
            margin-bottom: 10px;
          }

          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; table-layout: fixed; }
          thead th { 
            text-align: left; 
            padding: 12px; 
            background: var(--primary); 
            color: #fff; 
            font-size: 10px; 
            text-transform: uppercase; 
            letter-spacing: 1px; 
          }
          
          tbody td { padding: 15px 12px; border-bottom: 1px solid var(--border); overflow: hidden; }
          
          .item-row:last-child td { border-bottom: none; }
          
          .price { font-weight: 800; color: var(--primary); font-size: 14px; text-align: right; }

          .summary-container { 
            display: flex; 
            justify-content: flex-end; 
            margin-top: 10px;
          }
          
          .summary-table { width: 220px; }
          .summary-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 12px; }
          .summary-row.total { 
            border-top: 2px solid var(--primary); 
            margin-top: 6px; 
            padding-top: 12px; 
            font-size: 18px; 
            font-weight: 800; 
            color: var(--primary); 
          }
          .currency { font-size: 10px; font-weight: 400; color: var(--text-muted); margin-right: 3px; }

          .footer { 
            margin-top: 30px; 
            padding-top: 20px; 
            border-top: 1px solid var(--border); 
            text-align: center; 
          }
          .footer p { margin: 2px 0; font-size: 11px; color: var(--text-muted); }
          .footer .thank-you { font-weight: 700; color: var(--primary); font-size: 14px; margin-bottom: 8px; }

          @media print {
            body { padding: 0; margin: 0; }
            .invoice-wrapper { padding: 40px; width: 100%; max-width: 100%; }
            @page { size: A4; margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-wrapper">
          <div class="header">
            <div class="logo-area">
              ${settings.logo ? `<img src="${settings.logo}" alt="SeenHub Logo" onerror="this.style.display='none'" style="height:50px;margin-bottom:10px;" />` : `<span style="font-size:22px;font-weight:900;color:#0f172a;letter-spacing:-1px;">SEEN<span style='color:#d88906'>Hub</span></span>`}
              <div class="company-info">
                <p class="company-name">Seen Business Services</p>
                <p>Al Ain, United Arab Emirates</p>
                <p>${settings.contactPhone}</p>
                <p>${settings.contactEmail}</p>
              </div>
            </div>
            <div class="invoice-meta">
              <h1>INVOICE</h1>
              <p class="invoice-no">#INV-${inv.id}</p>
              <p class="date">Date: ${new Date(inv.createdAt || Date.now()).toLocaleDateString('en-AE', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          <div class="billing-grid">
            <div class="bill-to">
              <span class="section-title">Invoice To</span>
              <p class="client-name">${user.name}</p>
              <p>${user.email}</p>
              <p>${user.phone || ''}</p>
            </div>
            <div class="payment-status">
              <span class="section-title">Status</span>
              <div class="status-badge">PAID</div>
              <p style="font-size: 13px; color: var(--text-muted);">Payment Method: Online Card</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 70%;">Service Description</th>
                <th style="text-align: right;">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr class="item-row">
                <td>
                  <div class="item-name">${inv.item}</div>
                  <div class="item-details">
                    Service Category: ${inv.category} | Reference: SEEN-${inv.id.toUpperCase()}
                  </div>
                </td>
                <td class="price"><span class="currency">AED</span>${parseFloat(inv.amount).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div class="summary-container">
            <div class="summary-table">
              <div class="summary-row">
                <span>Subtotal</span>
                <span>AED ${parseFloat(inv.subtotal || inv.amount).toFixed(2)}</span>
              </div>
              <div class="summary-row">
                <span>Tax${inv.taxRate ? ` (${inv.taxRate}%)` : ''}</span>
                <span>AED ${parseFloat(inv.tax || 0).toFixed(2)}</span>
              </div>
              <div class="summary-row total">
                <span>TOTAL</span>
                <span>AED ${parseFloat(inv.amount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div class="footer">
            <p class="thank-you">Thank you for your business!</p>
            <p>${settings.websiteUrl}</p>
            <p style="font-size: 11px; margin-top: 20px; opacity: 0.6;">Generated on ${new Date().toLocaleString()}</p>
          </div>
        </div>

        <script>
          window.onload = () => {
            setTimeout(() => {
              window.print();
            }, 500);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('seenhub_user');
    if (!storedUser || storedUser === 'undefined') {
      router.push('/?login=true');
    } else {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      } catch (e) {
        router.push('/?login=true');
      }
    }
    setAuthChecked(true);
  }, [router]);

  // Dynamic Locker Check
  React.useEffect(() => {
    if (!user?.email) return;

    const checkLocker = async () => {
      try {
        const res = await fetch(`/api/bookings?email=${user.email}`);
        const data = await res.json();
        const myBookings = Array.isArray(data) ? data.filter(b => b.email && b.email.toLowerCase() === user.email.toLowerCase()) : [];
        
        // Get local YYYY-MM-DD
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        const localISODate = new Date(now - offset).toISOString().split('T')[0];
        
        const activeLocker = myBookings.find(b => b.lockerCode && b.date === localISODate && b.status !== 'Cancelled');
        if (activeLocker) {
          setHasLocker(true);
          setLockerBooking(activeLocker);
        } else {
          setHasLocker(false);
          setLockerBooking(null);
        }
      } catch (e) {
        console.error("Locker check error:", e);
      }
    };

    checkLocker();
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') checkLocker();
    }, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [user?.email]);

  if (!authChecked || !user) return <GlobalLoader />;

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Profile', icon: User },
    { name: 'Booking', icon: CalendarCheck },
    ...(hasLocker ? [{ name: 'Locker', icon: Lock }] : []),
    { name: 'Events', icon: CalendarDays },
    { name: 'Printing', icon: Printer },
    { name: 'Invoices', icon: Receipt },
    { name: 'Cafe Menu', icon: Coffee },
    { name: 'Help and Support', icon: LifeBuoy },
  ];

  const renderTabContent = () => {
    switch(activeTab) {
      case 'Dashboard': return <DashboardOverview setQrModal={setQrModal} user={user} setActiveTab={setActiveTab} activeTab={activeTab} handleDownloadInvoice={handleDownloadInvoice} settings={settings} />;
      case 'Profile': return <ProfileView />;
      case 'Booking': return <BookingView setQrModal={setQrModal} user={user} />;
      case 'Locker': return <LockerView user={user} booking={lockerBooking} />;
      case 'Membership': return <MembershipView user={user} />;
      case 'Events': return <EventsView user={user} />;
      case 'Printing': return <PrintingView user={user} settings={settings} />;
      case 'Invoices': return <InvoicesView user={user} handleDownloadInvoice={handleDownloadInvoice} />;
      case 'Cafe Menu': return <CafeMenuView />;
      case 'Help and Support': return <HelpSupportView />;
      default: return <PlaceholderView title={activeTab} />;
    }
  };

  return (
    <div className="dashboard-page-bg">
      <div className="dashboard-layout-container">
        
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <button 
                key={item.name}
                className={`nav-btn ${activeTab === item.name ? 'active' : ''}`}
                onClick={() => setActiveTab(item.name)}
              >
                <item.icon size={18} className="nav-icon" />
                <span>{item.name}</span>
              </button>
            ))}
            
            <button 
              className="nav-btn signout-btn" 
              style={{ marginTop: 'auto', color: '#ef4444' }}
              onClick={() => {
                localStorage.removeItem('seenhub_user');
                localStorage.removeItem('seenhub_token');
                router.push('/?login=true');
              }}
            >
              <LogOut size={18} className="nav-icon" />
              <span>Sign Out</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="dashboard-main-area animate-fade">
          {/* QR MODAL */}
          {qrModal && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
              <div style={{ background: '#fff', padding: '3rem', borderRadius: '32px', textAlign: 'center', position: 'relative', maxWidth: '400px', width: '100%' }}>
                <button onClick={() => setQrModal(null)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={20} color="#0f172a" />
                </button>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Your Access QR</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2.5rem' }}>Scan this at the gate for entry to <strong>{qrModal.space}</strong></p>
                
                <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '24px', display: 'inline-block', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
                  <QRCodeSVG value={qrModal.qrCode || qrModal.id} size={200} />
                </div>
                
                <div style={{ marginTop: '2.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem' }}>Access Point</p>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{qrModal.assignedUnitName || `Gate ${qrModal.gateNumber || '92'}`}</div>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem' }}>Access Code</p>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{qrModal.qrCode?.split('-')[0] || '920002'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {renderTabContent()}
        </main>

      </div>


    </div>
  );
}

// --- TAB COMPONENTS ---

function DashboardOverview({ setQrModal, user, setActiveTab, activeTab, handleDownloadInvoice, settings }) {
  const [loading, setLoading] = React.useState(false);
  const [activeMembership, setActiveMembership] = React.useState(null);
  const [activeWorkspaces, setActiveWorkspaces] = React.useState([]);
  const [history, setHistory] = React.useState([]);
  const [invoices, setInvoices] = React.useState([]);
  const [globalEvents, setGlobalEvents] = React.useState([]);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/bookings?email=${user.email}`);
        const myBookings = await res.json();
        
        // Find most recent active membership
        const activeMem = [...myBookings]
          .filter(b => b.category === 'memberships' && b.status !== 'Cancelled')
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
        setActiveMembership(activeMem);

        // Find all active/scheduled workspace bookings
        const activeWorks = myBookings
          .filter(b => b.category === 'workspaces' && (b.status === 'Confirmed' || b.status === 'Booked'))
          .filter(b => getDynamicStatus(b) !== 'Expired')
          .sort((a, b) => {
            const statusA = getDynamicStatus(a);
            const statusB = getDynamicStatus(b);
            if (statusA === 'Active' && statusB !== 'Active') return -1;
            if (statusB === 'Active' && statusA !== 'Active') return 1;
            return new Date(a.date) - new Date(b.date);
          });
        setActiveWorkspaces(activeWorks);

        // Generate Invoice list from history (Bug 13 Fix: include real subtotal/tax/taxRate)
        const bookingInvoices = myBookings.map(b => {
          const amount = parseFloat(b.total || b.totalAmount || b.subtotal || 0);
          const subtotal = parseFloat(b.subtotal || b.spaceSubtotal || amount);
          const tax = parseFloat(b.tax || 0);
          const taxRate = subtotal > 0 && tax > 0 ? Math.round((tax / subtotal) * 100) : 0;
          return {
            id: b.id ? b.id.slice(-6) : 'N/A',
            date: b.date,
            createdAt: b.createdAt,
            item: b.space || b.service || 'Service',
            category: b.category === 'workspaces' ? 'Workspace' : (b.category === 'memberships' ? 'Membership' : b.category),
            amount,
            subtotal,
            tax,
            taxRate,
            status: 'Paid'
          };
        });
        const sortedInvoices = bookingInvoices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setInvoices(sortedInvoices.slice(0, 5));
        setHistory([...myBookings].reverse());

        // Fetch Global Events srif dashboard tab par
        if (activeTab === 'Dashboard') {
          const eventsRes = await fetch('/api/events');
          const eventsData = await eventsRes.json();
          setGlobalEvents(Array.isArray(eventsData) ? eventsData : []);
        }
      } catch (e) {
        console.error("Failed to sync dashboard:", e);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // Increase polling interval to 30 seconds to reduce server load
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') loadData();
    }, 30000);
    return () => clearInterval(interval);
  }, [user?.email, activeTab]);

  const formatTime = (b) => {
    if (!b) return 'N/A';
    
    const to12h = (t) => {
      if (!t) return '';
      const [h, m] = t.split(':').map(Number);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return `${h12}:${m < 10 ? '0' + m : m} ${ampm}`;
    };

    if (b.bookingType === 'Hourly' && b.timeFrom && b.timeTo) {
      return `${b.date} • ${to12h(b.timeFrom)} - ${to12h(b.timeTo)}`;
    }
    if (b.calculatedEndDate && b.calculatedEndDate !== b.date) {
      return `${b.date} to ${b.calculatedEndDate}`;
    }
    return `${b.date} (Full Day / Pass)`;
  };

  const getDynamicStatus = (b) => {
    if (b.status === 'Cancelled' || b.status === 'Canceled') return 'Cancelled';
    if (b.paymentStatus === 'Pending') return 'In Process';
    
    const now = new Date();
    if (!b.date) return b.status || 'Active';

    // Parse date parts safely to avoid timezone issues (YYYY-MM-DD)
    const [year, month, day] = b.date.split('-').map(Number);
    
    // Parse End Time
    const endDate = new Date(year, month - 1, day);
    if (b.bookingType === 'Hourly' && b.timeTo) {
      const [h, m] = b.timeTo.split(':').map(Number);
      endDate.setHours(h, m, 0);
    } else {
      endDate.setHours(23, 59, 59);
    }

    if (now > endDate) return 'Expired';

    // Parse Start Time
    const startDate = new Date(year, month - 1, day);
    if (b.bookingType === 'Hourly' && b.timeFrom) {
      const [h, m] = b.timeFrom.split(':').map(Number);
      startDate.setHours(h, m, 0);
    } else {
      startDate.setHours(0, 0, 0);
    }

    if (now < startDate) return 'Scheduled';

    return 'Active';
  };

  const handleRenew = async () => {
    if (!activeMembership) {
      window.location.href = '/booking?category=memberships';
      return;
    }

    // Bug 12 Fix: fetch live membership prices from backend instead of hardcoded values
    let subtotal = 100;
    try {
      const memRes = await fetch('/api/memberships');
      const memData = await memRes.json();
      const matched = Array.isArray(memData)
        ? memData.find(m => m.title === activeMembership.space || m.slug === activeMembership.space)
        : null;
      if (matched && matched.price) subtotal = parseFloat(matched.price);
    } catch (e) {
      console.warn('Could not fetch live membership price, using booking record subtotal');
      subtotal = parseFloat(activeMembership.subtotal || activeMembership.total || 100);
    }

    // Bug 11 Fix: use settings.taxEnabled + settings.taxPercentage (now properly synced)
    const currentTaxRate = settings.taxEnabled ? (settings.taxPercentage / 100) : 0;
    const tax = Math.round(subtotal * currentTaxRate * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;

    // Use local today as start date (Bug 19 Fix: consistent offset handling)
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const today = new Date(now - offset).toISOString().split('T')[0];

    const params = new URLSearchParams({
      category: 'memberships',
      service: activeMembership.space,
      subtotal: subtotal.toString(),
      total: total.toString(),
      bookingType: activeMembership.bookingType || 'Monthly',
      guests: '1',
      date: today
    });

    window.location.href = `/checkout?${params.toString()}`;
  };

  const handleUpgrade = () => {
    window.location.href = '/booking?category=memberships';
  };

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <h2 className="page-subtitle">Welcome back, {user?.name || user?.firstName || user?.email?.split('@')[0] || 'User'}!</h2>

      {/* Quick Actions Removed */}

      <div className="overview-grid">
        {/* Membership Card */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h3 className="dash-card-title" style={{fontSize: '1.3rem', fontWeight: '300'}}>Membership</h3>
            {activeMembership && getDynamicStatus(activeMembership) === 'Active' ? (
              <span className="badge badge-active">Active</span>
            ) : (
              <span className="badge badge-expired">Expired</span>
            )}
          </div>
          
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
            <div>
              <p style={{fontWeight: '600', color: '#444'}}>
                {activeMembership ? activeMembership.space : 'No Active Membership'}
              </p>
              <p style={{fontSize: '0.8rem', color: '#888'}}>
                {activeMembership ? formatTime(activeMembership) : 'N/A'}
              </p>
              {activeMembership && activeMembership.calculatedEndDate && (() => {
                const expiryDate = new Date(activeMembership.calculatedEndDate);
                const now = new Date();
                const diffTime = expiryDate - now;
                const diffDays = Math.ceil(diffTime / (24 * 60 * 60 * 1000));
                const isExpiringSoon = diffTime > 0 && diffTime < 3 * 24 * 60 * 60 * 1000;
                
                return (
                  <p style={{
                    fontSize: '0.8rem', 
                    color: isExpiringSoon ? '#ef4444' : '#888', 
                    fontWeight: isExpiringSoon ? 'bold' : 'normal'
                  }}>
                    {isExpiringSoon
                      ? `Expires in ${diffDays} days` 
                      : `Auto-renews on ${activeMembership.calculatedEndDate}`}
                  </p>
                );
              })()}
            </div>
            {activeMembership ? <QrIcon size={40} color="#2d2d2d" cursor="pointer" onClick={() => setQrModal(activeMembership)} /> : <QrIcon size={40} color="#ddd" />}
          </div>

          <p style={{fontSize: '0.85rem', color: '#888', marginBottom: '0.5rem'}}>Benefits Available</p>
          <div className="perks-grid">
            <div className="perk-item"><CheckCircle2 size={14} color={activeMembership ? "#10b981" : "#888"}/> High-Speed Wi-Fi</div>
            <div className="perk-item"><CheckCircle2 size={14} color={activeMembership ? "#10b981" : "#888"}/> Flexible Seating Options</div>
            <div className="perk-item"><CheckCircle2 size={14} color={activeMembership ? "#10b981" : "#888"}/> Free Car Parking</div>
            <div className="perk-item"><CheckCircle2 size={14} color={activeMembership ? "#10b981" : "#888"}/> Restrooms & Prayer Rooms</div>
            <div className="perk-item"><CheckCircle2 size={14} color={activeMembership ? "#10b981" : "#888"}/> 24/7 Security</div>
            <div className="perk-item"><CheckCircle2 size={14} color={activeMembership ? "#10b981" : "#888"}/> Library with Diverse Books</div>
          </div>

          <div style={{display: 'flex', gap: '1rem', marginTop: '2rem'}}>
            <button className="btn-outline" style={{flex: 1}} onClick={handleUpgrade}>Upgrade</button>
            <button className="btn-filled" style={{flex: 1}} onClick={handleRenew}>Renew</button>
          </div>
        </div>

        {/* Workspace Booked */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h3 className="dash-card-title">Workspace You Have Booked</h3>
          </div>
          
          {activeWorkspaces && activeWorkspaces.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.25rem' }}>
              {activeWorkspaces.map((booking, idx) => {
                const status = getDynamicStatus(booking);
                
                // Countdown Logic for Hourly
                let showCountdown = false;
                let minutesLeft = 0;
                if (status === 'Active' && booking.bookingType === 'Hourly' && booking.timeTo) {
                  const [y, mm, d] = booking.date.split('-').map(Number);
                  const [h, m] = booking.timeTo.split(':').map(Number);
                  const endTime = new Date(y, mm - 1, d, h, m, 0);
                  const now = new Date();
                  const diffMs = endTime - now;
                  const diffMins = Math.floor(diffMs / 60000);
                  if (diffMins >= 0 && diffMins <= 10) {
                    showCountdown = true;
                    minutesLeft = diffMins;
                  }
                }

                return (
                  <div key={idx} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '1rem', 
                    border: '1px solid #f1f5f9', 
                    borderRadius: '16px', 
                    background: '#fff', 
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    {/* Status Strip */}
                    <div style={{ 
                      position: 'absolute', 
                      left: 0, 
                      top: 0, 
                      bottom: 0, 
                      width: '4px', 
                      background: status === 'Active' ? '#16a34a' : '#3b82f6' 
                    }}></div>

                    <div style={{ paddingLeft: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <p style={{ fontWeight: '800', color: '#0f172a', fontSize: '1rem' }}>{booking.space}</p>
                        <span style={{ 
                          fontSize: '0.6rem', 
                          fontWeight: '800', 
                          padding: '0.1rem 0.4rem', 
                          borderRadius: '4px', 
                          background: status === 'Active' ? '#f0fdf4' : '#eff6ff',
                          color: status === 'Active' ? '#16a34a' : '#3b82f6',
                          textTransform: 'uppercase'
                        }}>
                          {status}
                        </span>
                      </div>
                      {booking.assignedUnitName && (
                        <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#d88906', marginTop: '-0.1rem', marginBottom: '0.25rem' }}>
                          {booking.assignedUnitName}
                        </div>
                      )}
                      <p style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={12} /> {formatTime(booking)}
                      </p>
                      
                      <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem' }}>
                         {showCountdown && (
                            <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#ef4444', background: '#fef2f2', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                              ENDS IN {minutesLeft}M
                            </span>
                         )}
                         <span style={{ fontSize: '0.6rem', fontWeight: '700', color: '#94a3b8', background: '#f8fafc', padding: '0.1rem 0.3rem', borderRadius: '4px', border: '1px solid #f1f5f9' }}>
                           {booking.bookingType}
                         </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div onClick={() => setQrModal(booking)} style={{ cursor: 'pointer', background: '#f8fafc', padding: '0.6rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        <QrIcon size={20} color="#0f172a" />
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {activeWorkspaces.some(b => getDynamicStatus(b) === 'Active') && (
                <button 
                  className="btn-filled" 
                  style={{ marginTop: '0.5rem', width: '100%', padding: '0.75rem', fontSize: '0.85rem' }}
                  onClick={() => window.location.href = '/booking'}
                >
                  Quick Renew / Extend
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '160px', color: '#94a3b8', gap: '1rem' }}>
              <CalendarCheck size={40} style={{ opacity: 0.2 }} />
              <p style={{ fontSize: '0.9rem' }}>No current or upcoming bookings.</p>
              <button className="btn-outline" onClick={() => window.location.href = '/booking'} style={{ fontSize: '0.8rem' }}>Book Now</button>
            </div>
          )}
        </div>

        {/* Calendar Sidebar */}
        <div className="dash-card row-span-2 calendar-container-mobile" style={{padding: '1.5rem 1rem'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
            <h4 style={{fontWeight: '700', fontSize: '0.9rem', color: '#333'}}>
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} ▾
            </h4>
            <div style={{display: 'flex', gap: '0.5rem'}}>
              <ChevronLeft size={16} color="#888" cursor="pointer"/>
              <ChevronRight size={16} color="#888" cursor="pointer"/>
            </div>
          </div>
          {/* Live Calendar Grid */}
          <div className="calendar-grid-mobile" style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px', textAlign: 'center', fontSize: '0.8rem', color: '#888', marginBottom: '1rem'}}>
            {['S','M','T','W','T','F','S'].map((d, i) => <span key={i} style={{fontWeight: 700}}>{d}</span>)}
            {(() => {
              const now = new Date();
              const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
              const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
              const cells = [];
              for(let i=0; i<firstDay; i++) cells.push(<span key={`empty-${i}`}></span>);
              for(let d=1; d<=daysInMonth; d++) {
                const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                const hasBooking = history.some(b => b.date === dateStr && (b.status === 'Confirmed' || b.status === 'Booked'));
                const isToday = d === now.getDate();
                cells.push(
                  <span key={d} className="calendar-day-mobile" style={{
                    background: hasBooking ? '#fef3c7' : (isToday ? '#f1f5f9' : 'transparent'),
                    color: hasBooking ? '#d97706' : '#64748b',
                    borderRadius: '50%',
                    fontWeight: (hasBooking || isToday) ? 800 : 400,
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: 'auto',
                    border: isToday ? '1px solid #cbd5e1' : 'none'
                  }}>
                    {d}
                  </span>
                );
              }
              return cells;
            })()}
          </div>
          
          <div style={{display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.75rem', color: '#888'}}>
            <span style={{display: 'flex', alignItems: 'center', gap: '0.3rem'}}><span style={{display: 'inline-block', width: '10px', height: '10px', background: '#fef3c7', borderRadius: '50%'}}></span> Your Bookings</span>
            <span style={{display: 'flex', alignItems: 'center', gap: '0.3rem'}}><span style={{display: 'inline-block', width: '10px', height: '10px', border: '1px solid #cbd5e1', borderRadius: '50%'}}></span> Today</span>
          </div>

          <div style={{display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem'}}>
            {history.slice(0, 3).map((b, i) => (
              <div key={i} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #eee', padding: '0.8rem', borderRadius: '8px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <CheckCircle2 size={14} color="#10b981" />
                  <span style={{fontSize: '0.8rem', color: '#888'}}>{formatTime(b)}</span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <span style={{fontSize: '0.85rem', fontWeight: '500', color: '#444'}}>{b.space} {b.assignedUnit || ''}</span>
                  <CalendarDays size={14} color="#d88906" cursor="pointer" title="Add to Calendar" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment History */}
        <div className="dash-card">
          <h3 className="dash-card-title">Payment History</h3>
          <div className="history-list">
            {invoices.length > 0 ? invoices.map((inv, i) => (
              <div key={i} className="history-row">
                <span className="history-date">{inv.date}</span>
                <span className="history-desc" style={{flex: 1, textAlign: 'center'}}>{inv.item}</span>
                <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: 'auto'}}>
                  <span className="history-status text-green">AED {parseFloat(inv.amount).toFixed(2)} Paid</span>
                  <Download size={16} color="#888" cursor="pointer" onClick={() => handleDownloadInvoice(inv)} />
                </div>
              </div>
            )) : (
              <div style={{textAlign: 'center', color: '#888', padding: '1rem'}}>No payments yet.</div>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="dash-card" style={{display: 'flex', flexDirection: 'column'}}>
          <h3 className="dash-card-title">Upcoming Events</h3>
          <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem'}}>
            {globalEvents.filter(ev => new Date(ev.startDate) >= new Date().setHours(0,0,0,0)).length > 0 ? (
              globalEvents.filter(ev => new Date(ev.startDate) >= new Date().setHours(0,0,0,0)).slice(0, 2).map((ev, i) => (
                <div key={i} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 800, color: '#0f172a' }}>{ev.title}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>{ev.startDate} @ {ev.startTime}</div>
                </div>
              ))
            ) : (
              <div style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#aaa'}}>
                <Image src="https://cdni.iconscout.com/illustration/premium/thumb/empty-state-2130362-1800926.png" alt="Empty" width={120} height={120} unoptimized style={{width: '120px', opacity: 0.5}} />
                <p style={{fontSize: '0.9rem', marginBottom: '1rem'}}>No upcoming events yet</p>
                <button className="btn-outline" onClick={() => setActiveTab('Events')}>Browse Events</button>
              </div>
            )}
          </div>
        </div>

        {/* Printing Credits Summary */}
        <div className="dash-card" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)', color: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 className="dash-card-title" style={{ color: '#fff', margin: 0 }}>Printing Credits</h3>
            <Printer size={24} color="#d88906" />
          </div>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.5rem' }}>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: '#fff' }}>{(user.printingCredits || 0)}</div>
              <span style={{ color: '#94a3b8', fontWeight: 600 }}>Credits</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#d88906', fontWeight: 600 }}>1 Credit = {settings.printCreditToPageRatio || 2} Pages ({(1 / (settings.printCreditToPageRatio || 2)).toFixed(2)} per page)</div>
          </div>
          <button 
            className="btn-filled" 
            style={{ width: '100%', background: '#d88906', border: 'none' }}
            onClick={() => setActiveTab('Printing')}
          >
            Top Up Credits
          </button>
        </div>
      </div>
    </div>
  );
}

function BookingView({ setQrModal, user }) {
  const [history, setHistory] = React.useState([]);
  const [statusFilter, setStatusFilter] = React.useState([]);
  const [spaceFilter, setSpaceFilter] = React.useState([]);
  const [scheduleFilter, setScheduleFilter] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('All booking');
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 7;

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch(`/api/bookings?email=${user.email}`);
        const data = await res.json();
        // Filter by user email
        const myData = Array.isArray(data) ? data.filter(b => b.email && b.email.toLowerCase() === user.email.toLowerCase()) : [];
        setHistory([...myData].reverse());
      } catch (e) {
        console.error("Failed to sync booking history:", e);
      }
    };
    loadData();
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') loadData();
    }, 10000);
    return () => clearInterval(interval);
  }, [user.email]);

  const formatTime = (b) => {
    const to12h = (t) => {
      if (!t) return '';
      const [h, m] = t.split(':').map(Number);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return `${h12}:${m < 10 ? '0' + m : m} ${ampm}`;
    };

    if (b.bookingType === 'Hourly' && b.timeFrom && b.timeTo) {
      return `${to12h(b.timeFrom)} - ${to12h(b.timeTo)}`;
    }
    if (b.bookingType === 'Daily') {
      return 'Full Day (1 Day)';
    }
    if (b.calculatedEndDate && b.calculatedEndDate !== b.date) {
      return `${b.date} to ${b.calculatedEndDate}`;
    }
    return 'Full Day / Pass';
  };

  const getDynamicStatus = (b) => {
    if (b.status === 'Cancelled' || b.status === 'Canceled') return 'Cancelled';
    if (b.paymentStatus === 'Pending') return 'In Process';
    
    const now = new Date();
    if (!b.date) return b.status || 'Active';

    // Parse date parts safely to avoid timezone issues (YYYY-MM-DD)
    const [year, month, day] = b.date.split('-').map(Number);
    
    // Parse End Time
    const endDate = new Date(year, month - 1, day);
    if (b.bookingType === 'Hourly' && b.timeTo) {
      const [h, m] = b.timeTo.split(':').map(Number);
      endDate.setHours(h, m, 0);
    } else {
      endDate.setHours(23, 59, 59);
    }

    if (now > endDate) return 'Expired';

    // Parse Start Time
    const startDate = new Date(year, month - 1, day);
    if (b.bookingType === 'Hourly' && b.timeFrom) {
      const [h, m] = b.timeFrom.split(':').map(Number);
      startDate.setHours(h, m, 0);
    } else {
      startDate.setHours(0, 0, 0);
    }

    if (now < startDate) return 'Scheduled';

    return 'Active';
  };

  const handleStatusToggle = (status) => {
    setStatusFilter(prev => prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]);
  };

  const handleSpaceToggle = (space) => {
    setSpaceFilter(prev => prev.includes(space) ? prev.filter(s => s !== space) : [...prev, space]);
  };

  // Filter logic
  const filteredHistory = history.filter(b => {
    // 0. Category Filter
    if (categoryFilter !== 'All booking') {
      const catMap = {
        'Workspace': 'workspaces',
        'Membership': 'memberships',
        'Event': 'events'
      };
      if (b.category !== catMap[categoryFilter]) return false;
    }

    // 1. Status Filter
    if (statusFilter.length > 0 && !statusFilter.includes(getDynamicStatus(b))) return false;

    // 2. Space Filter
    if (spaceFilter.length > 0 && !spaceFilter.includes(b.space)) return false;

    // 3. Schedule Filter
    if (scheduleFilter && b.date) {
      const now = new Date();
      const offset = now.getTimezoneOffset() * 60000;
      const today = new Date(now - offset).toISOString().split('T')[0];
      if (scheduleFilter === 'Today' && b.date !== today) return false;
      // Week, Month, Year logic can be added here
    }

    return true;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, statusFilter, spaceFilter, scheduleFilter, history.length]);

  return (
    <div>
      <div className="mobile-header-stack" style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem'}}>
        <h1 className="page-title" style={{marginBottom: 0}}>Booking and Reservation</h1>
        <button className="btn-filled" onClick={() => window.location.href = '/booking'} style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
          New Booking <span style={{fontSize: '1.2rem', lineHeight: 0}}>+</span>
        </button>
      </div>

      <div className="grid-stack-mobile" style={{display: 'grid', gridTemplateColumns: '1fr 280px', gap: '2rem'}}>
        {/* Table Area */}
        <div className="dash-card" style={{ padding: 0 }}>
          {/* Category Tabs */}
          <div style={{ display: 'flex', overflowX: 'auto', whiteSpace: 'nowrap', borderBottom: '1px solid #f1f5f9', background: '#fff', borderRadius: '24px 24px 0 0' }}>
            {['All booking', 'Workspace', 'Membership', 'Event'].map(cat => (
              <button 
                key={cat} 
                onClick={() => setCategoryFilter(cat)}
                style={{
                  flex: 1,
                  padding: '1.25rem',
                  border: 'none',
                  background: 'transparent',
                  fontSize: '0.9rem',
                  fontWeight: categoryFilter === cat ? 800 : 600,
                  color: categoryFilter === cat ? '#0f172a' : '#94a3b8',
                  borderBottom: categoryFilter === cat ? '3px solid #d88906' : '3px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <div style={{ padding: '1rem' }}>
            <table className="responsive-hide" style={{width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', color: '#555'}}>
            <thead>
              <tr style={{borderBottom: '1px solid #eee'}}>
                <th style={{padding: '1rem', textAlign: 'left'}}></th>
                <th style={{padding: '1rem', textAlign: 'left'}}>Date</th>
                <th style={{padding: '1rem', textAlign: 'left'}}>My Bookings</th>
                <th style={{padding: '1rem', textAlign: 'center'}}>No. of Guests</th>
                <th style={{padding: '1rem', textAlign: 'center'}}>Status</th>
                <th style={{padding: '1rem', textAlign: 'center'}}></th>
              </tr>
            </thead>
            <tbody>
              {paginatedHistory.length > 0 ? paginatedHistory.map((b, i) => (
                <tr key={i} style={{borderBottom: '1px solid #f9f9f9'}}>
                  <td style={{padding: '1rem'}}><input type="checkbox" /></td>
                  <td style={{padding: '1rem', color: '#888'}}>{b.date || 'Today'}</td>
                  <td style={{padding: '1rem'}}>
                    <div style={{fontWeight: '700', color: '#0f172a'}}>{b.space}</div>
                    {b.assignedUnitName && (
                      <div style={{fontSize: '0.75rem', fontWeight: '800', color: '#d88906', marginTop: '0.1rem'}}>{b.assignedUnitName}</div>
                    )}
                    <div style={{fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem'}}>
                      <span style={{fontSize: '0.65rem', fontWeight: '800', color: '#94a3b8', background: '#f1f5f9', padding: '0.1rem 0.4rem', borderRadius: '4px'}}>
                        {b.category === 'memberships' 
                          ? (b.space.toLowerCase().includes('day') ? 'DAILY' : 'MONTHLY')
                          : (b.bookingType?.toUpperCase() || 'PASS')}
                      </span>
                      {formatTime(b)}
                    </div>
                    {b.lockerCode && (
                      <div style={{ fontSize: '0.7rem', color: '#d88906', fontWeight: 700, marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Lock size={10} /> Locker: {b.lockerCode}
                      </div>
                    )}
                  </td>
                  <td style={{padding: '1rem', textAlign: 'center'}}>{b.guests || '-'}</td>
                  <td style={{padding: '1rem', textAlign: 'center'}}>
                    <span style={{
                      padding: '0.3rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      background: getDynamicStatus(b) === 'Active' ? '#f0fdf4' : getDynamicStatus(b) === 'Scheduled' ? '#eff6ff' : getDynamicStatus(b) === 'Cancelled' ? '#fef2f2' : '#f1f5f9',
                      color: getDynamicStatus(b) === 'Active' ? '#16a34a' : getDynamicStatus(b) === 'Scheduled' ? '#3b82f6' : getDynamicStatus(b) === 'Cancelled' ? '#dc2626' : '#64748b'
                    }}>
                      {getDynamicStatus(b)}
                    </span>
                  </td>
                  <td style={{padding: '1rem', textAlign: 'center'}}>
                    {['Active', 'Scheduled'].includes(getDynamicStatus(b)) && ['workspaces', 'memberships', 'events'].includes(b.category) ? (
                      <QrIcon size={18} color="#aaa" cursor="pointer" onClick={() => setQrModal(b)} />
                    ) : (
                      <span style={{ color: '#ccc' }}>-</span>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" style={{padding: '2rem', textAlign: 'center', color: '#888'}}>
                    No bookings found. Try a different filter or make a new booking.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Mobile Card View for Bookings */}
          <div className="mobile-only mobile-card-view">
            {paginatedHistory.map((b, i) => {
              const canViewQr = getDynamicStatus(b) === 'Active' && ['workspaces', 'memberships', 'events'].includes(b.category);
              return (
                <div key={i} className="mobile-data-card" onClick={() => canViewQr && setQrModal(b)} style={{ cursor: canViewQr ? 'pointer' : 'default' }}>
                  <div className="mobile-card-header">
                    <div>
                      <div style={{fontWeight: 800, fontSize: '1rem'}}>{b.space}</div>
                      {b.assignedUnitName && (
                        <div style={{fontSize: '0.75rem', fontWeight: '800', color: '#d88906', marginTop: '0.1rem'}}>{b.assignedUnitName}</div>
                      )}
                      <div style={{fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.1rem'}}>{b.date}</div>
                    </div>
                    <span style={{
                      padding: '0.3rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      fontWeight: '800',
                      background: getDynamicStatus(b) === 'Active' ? '#f0fdf4' : getDynamicStatus(b) === 'Scheduled' ? '#eff6ff' : getDynamicStatus(b) === 'Cancelled' ? '#fef2f2' : '#f1f5f9',
                      color: getDynamicStatus(b) === 'Active' ? '#16a34a' : getDynamicStatus(b) === 'Scheduled' ? '#3b82f6' : getDynamicStatus(b) === 'Cancelled' ? '#dc2626' : '#64748b'
                    }}>
                      {getDynamicStatus(b)}
                    </span>
                  </div>
                  <div className="mobile-card-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                    <span className="mobile-card-label" style={{ color: '#94a3b8', fontWeight: 600 }}>Time</span>
                    <span className="mobile-card-value" style={{ color: '#1e293b', fontWeight: 700 }}>{formatTime(b)}</span>
                  </div>
                  <div className="mobile-card-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                    <span className="mobile-card-label" style={{ color: '#94a3b8', fontWeight: 600 }}>Guests</span>
                    <span className="mobile-card-value" style={{ color: '#1e293b', fontWeight: 700 }}>{b.guests || '1'}</span>
                  </div>
                  {b.lockerCode && (
                    <div className="mobile-card-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                      <span className="mobile-card-label" style={{ color: '#94a3b8', fontWeight: 600 }}>Locker</span>
                      <span className="mobile-card-value" style={{ color: '#d88906', fontWeight: 800 }}>{b.lockerCode}</span>
                    </div>
                  )}
                  {canViewQr && (
                    <div style={{marginTop: '0.75rem', textAlign: 'right', color: '#d88906', fontSize: '0.8rem', fontWeight: 700}}>
                       View Access QR →
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: '0.5rem', 
              padding: '1.5rem', 
              borderTop: '1px solid #f1f5f9' 
            }}>
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '0.5rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: currentPage === 1 ? '#f8fafc' : '#fff',
                  color: currentPage === 1 ? '#cbd5e1' : '#64748b',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <ChevronLeft size={16} />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: currentPage === page ? '#0f172a' : '#e2e8f0',
                    background: currentPage === page ? '#0f172a' : '#fff',
                    color: currentPage === page ? '#fff' : '#64748b',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {page}
                </button>
              ))}

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '0.5rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: currentPage === totalPages ? '#f8fafc' : '#fff',
                  color: currentPage === totalPages ? '#cbd5e1' : '#64748b',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
          </div>
        </div>

        {/* Sidebar Filters */}
        <div className="dash-card">
          <h4 style={{fontSize: '0.9rem', fontWeight: '700', color: '#444', marginBottom: '1rem'}}>Status</h4>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '2rem'}}>
            {['Active', 'Cancelled', 'Expired', 'In Process'].map(s => (
              <label key={s} style={{fontSize: '0.85rem', color: '#666', display: 'flex', gap: '0.5rem'}}>
                <input type="checkbox" checked={statusFilter.includes(s)} onChange={() => handleStatusToggle(s)} /> {s}
              </label>
            ))}
          </div>

          <h4 style={{fontSize: '0.9rem', fontWeight: '700', color: '#444', marginBottom: '1rem'}}>Space</h4>
          <div style={{display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '2rem', maxHeight: '200px', overflowY: 'auto'}}>
            {['ClassRoom', 'Work Booth (Single)', 'Work Booth (Double)', 'Manager Room', 'Meeting Room', 'VIP Business Lounge', 'Day Pass', 'Monthly Membership', 'Student Membership', 'VIP Daily Pass'].map(s => (
              <label key={s} style={{fontSize: '0.85rem', color: '#666', display: 'flex', gap: '0.5rem'}}>
                <input type="checkbox" checked={spaceFilter.includes(s)} onChange={() => handleSpaceToggle(s)} /> {s}
              </label>
            ))}
          </div>

          <h4 style={{fontSize: '0.9rem', fontWeight: '700', color: '#444', marginBottom: '1rem'}}>By Schedule</h4>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem'}}>
            {['Today', 'Week', 'Month', 'Year'].map(s => (
               <label key={s} style={{fontSize: '0.85rem', color: '#666', display: 'flex', gap: '0.5rem'}}>
                 <input type="radio" name="sch" checked={scheduleFilter === s} onChange={() => setScheduleFilter(s)} /> {s}
               </label>
            ))}
            {scheduleFilter && (
              <button onClick={() => setScheduleFilter('')} style={{marginTop: '0.5rem', gridColumn: 'span 2', background: 'transparent', border: 'none', color: '#ef4444', fontSize: '0.8rem', cursor: 'pointer', textAlign: 'left'}}>Clear Schedule Filter</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MembershipView({ user }) {
  const [history, setHistory] = React.useState([]);
  const [activeMem, setActiveMem] = React.useState(null);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch(`/api/bookings?email=${user.email}`);
        const data = await res.json();
        const myData = Array.isArray(data) ? data.filter(b => b.email && b.email.toLowerCase() === user.email.toLowerCase() && b.category === 'memberships') : [];
        setHistory([...myData].reverse());
        
        const active = [...myData]
          .filter(b => b.status !== 'Cancelled')
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
        setActiveMem(active);
      } catch (e) {
        console.error(e);
      }
    };
    loadData();
  }, [user]);

  const renewalMessage = activeMem ? `Your membership for ${activeMem.space} is currently ${activeMem.status === 'Confirmed' ? 'Active' : 'Pending'}.` : "No active membership found. Why not join our community today?";

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
        <h1 className="page-title" style={{marginBottom: 0}}>My Membership</h1>
        <div style={{display: 'flex', gap: '1rem'}}>
          <button className="btn-filled" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>Upgrade Membership <span>+</span></button>
          <button className="btn-filled" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>Guest Pass <span>+</span></button>
        </div>
      </div>

      <div className="dash-card stack-mobile" style={{display: 'flex', gap: '3rem', marginBottom: '2rem'}}>
        {/* Active Membership Info */}
        <div style={{flex: '1', borderRight: '1px solid #eee', paddingRight: '3rem'}}>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <div>
              <h3 style={{fontSize: '1.1rem', fontWeight: '400', color: '#444'}}>{activeMem ? activeMem.space : 'No Membership'}</h3>
              <p style={{fontSize: '0.8rem', color: '#888'}}>{activeMem ? `${activeMem.date} - ${activeMem.calculatedEndDate || 'N/A'}` : 'N/A'}</p>
            </div>
            <span style={{color: activeMem?.status === 'Confirmed' ? '#16a34a' : '#ef4444', fontWeight: '600', fontSize: '0.9rem'}}>{activeMem ? activeMem.status : 'None'}</span>
          </div>
          
          <div style={{textAlign: 'center', padding: '2rem 0'}}>
            <p style={{fontStyle: 'italic', fontSize: '1.2rem', color: '#666'}}>{renewalMessage}</p>
          </div>

          <div style={{display: 'flex', gap: '1rem', justifyContent: 'center'}}>
            <button className="btn-filled" style={{padding: '0.6rem 2rem'}}>Upgrade Pass</button>
            <button className="btn-outline" style={{padding: '0.6rem 2rem'}}>Renew Pass</button>
          </div>
        </div>

        {/* Access Perks */}
        <div style={{flex: '1.5'}}>
          <h4 style={{fontSize: '1rem', fontWeight: '600', color: '#444', marginBottom: '1.5rem'}}>You&apos;ve got access!</h4>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: '1rem'}}>
            {[
              {icon: Wifi, label: 'High-Speed Wi-Fi'},
              {icon: CheckCircle2, label: 'Flexible Seating Options'},
              {icon: Car, label: 'Free Car Parking'},
              {icon: CheckCircle2, label: 'Restrooms & Prayer Rooms'},
              {icon: ShieldCheck, label: '24/7 Security'},
              {icon: BookOpen, label: 'Library with Diverse Books'}
            ].map((p, i) => (
              <div key={i} style={{border: '1px solid #ddd', padding: '0.8rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#555'}}>
                <p.icon size={16} color="#888" /> {p.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-stack-mobile" style={{display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '2rem'}}>
        <div className="dash-card">
          <h4 style={{fontSize: '1rem', fontWeight: '600', color: '#444', marginBottom: '1.5rem'}}>Upgrade for perks!</h4>
          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            {['Monthly Membership', 'Student Membership', 'VIP Daily Pass', 'Day Pass-Coworking Space'].map(m => (
              <div key={m} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f9f9f9', paddingBottom: '0.8rem'}}>
                <span style={{fontSize: '0.85rem', color: '#555'}}>{m}</span>
                <span style={{fontSize: '0.8rem', color: '#d88906', fontWeight: '600', cursor: 'pointer'}}>Upgrade</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dash-card">
          <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem'}}>
            <thead>
              <tr style={{borderBottom: '1px solid #eee', color: '#888'}}>
                <th style={{padding: '1rem', textAlign: 'left'}}>Date</th>
                <th style={{padding: '1rem', textAlign: 'left'}}>My Plans</th>
                <th style={{padding: '1rem', textAlign: 'center'}}>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {history.map((b, i) => (
                <tr key={i} style={{borderBottom: '1px solid #f9f9f9'}}>
                  <td style={{padding: '1rem', color: '#888'}}><input type="checkbox" style={{marginRight: '1rem'}}/> {b.date}</td>
                  <td style={{padding: '1rem'}}>
                    <div style={{fontWeight: '600', color: '#444'}}>{b.space}</div>
                    <div style={{fontSize: '0.8rem', color: '#888'}}>{b.date} - {b.calculatedEndDate || 'N/A'}</div>
                  </td>
                  <td style={{padding: '1rem', textAlign: 'center', color: b.status === 'Cancelled' ? '#ef4444' : '#16a34a', fontWeight: '600'}}>{b.status}</td>
                  <td style={{padding: '1rem', textAlign: 'right'}}><MoreVertical size={16} color="#aaa" cursor="pointer"/></td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan="4" style={{padding: '3rem', textAlign: 'center', color: '#94a3b8'}}>No membership history found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const generateCafeInvoiceId = () => 'INV-CF-' + Date.now().toString().slice(-6);

function CafeMenuView() {
  const [products, setProducts] = React.useState([]);
  const [categories, setCategories] = React.useState([]);
  const [activeCat, setActiveCat] = React.useState('All');

  React.useEffect(() => {
    fetch('/api/data?type=cafe_products').then(res => res.json()).then(data => setProducts(Array.isArray(data) ? data : []));
    fetch('/api/data?type=cafe_categories').then(res => res.json()).then(data => setCategories(Array.isArray(data) ? data : []));
  }, []);

  const handleOrder = async (product) => {
    const user = JSON.parse(localStorage.getItem('seenhub_user'));
    if (!user) return alert('Please login to place an order.');

    const newInvoice = {
      invoiceId: generateCafeInvoiceId(),
      customerName: user.name || user.email,
      customerEmail: user.email,
      productName: product.name,
      total: product.price,
      date: new Date().toLocaleDateString(),
      status: 'Paid'
    };

    try {
      const res = await fetch('/api/cafe_invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInvoice)
      });
      if (res.ok) {
        alert(`Order placed successfully for ${product.name}! Your invoice #${newInvoice.invoiceId} has been generated.`);
      } else {
        alert('Failed to place order.');
      }
    } catch (e) { console.error(e); alert('Error placing order.'); }
  };

  const safeProducts = Array.isArray(products) ? products : [];
  const filtered = activeCat === 'All' ? safeProducts : safeProducts.filter(p => p.category === activeCat);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>Cafe Menu</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Delicious food and beverages available at SeenHub Cafe.</p>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {['All', ...(Array.isArray(categories) ? categories : []).map(c => c.name)].map(cat => (
          <button 
            key={cat} 
            onClick={() => setActiveCat(cat)}
            style={{ 
              padding: '0.6rem 1.25rem', 
              borderRadius: '50px', 
              border: activeCat === cat ? 'none' : '1px solid #e2e8f0', 
              background: activeCat === cat ? '#0f172a' : '#fff', 
              color: activeCat === cat ? '#fff' : '#64748b',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
        {filtered.map((p, i) => (
          <div key={i} className="dash-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: '160px', background: '#f1f5f9', position: 'relative' }}>
              {p.image ? (
                <Image src={p.image} alt={p.name} fill unoptimized style={{ objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                  <Coffee size={48} />
                </div>
              )}
              <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'rgba(15,23,42,0.8)', color: '#fff', padding: '0.3rem 0.75rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 800, backdropFilter: 'blur(4px)' }}>
                AED {p.price}
              </div>
            </div>
            <div style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#d88906', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>{p.category}</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>{p.name}</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 1rem', lineHeight: 1.5 }}>{p.description || 'Delicious freshly prepared item.'}</p>
              <button 
                onClick={() => handleOrder(p)}
                style={{ 
                  width: '100%', 
                  padding: '0.6rem', 
                  background: '#0f172a', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: '10px', 
                  fontSize: '0.85rem', 
                  fontWeight: 700, 
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Buy Now
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
            <Coffee size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
            <p>No products found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PrintingView({ user }) {
  const [totalPages, setTotalPages] = useState(0);
  const [history, setHistory] = useState([]);
  const [isBuying, setIsBuying] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [pageCount, setPageCount] = useState(1);
  const [customCredits, setCustomCredits] = useState('');
  const [settings, setSettings] = useState({ 
    taxEnabled: false, 
    taxPercentage: 5,
    printCreditToPageRatio: 2,
    printMinTopUp: 2,
    printAedToCreditRatio: 1
  });

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(e => console.error(e));
  }, []);

  const loadPrintingHistory = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/bookings?email=${user.email}`);
      const allBookings = await res.json();
      const myBookings = Array.isArray(allBookings) ? allBookings.filter(b => b.email && b.email.toLowerCase() === user.email.toLowerCase()) : [];
      
      const printHistory = myBookings
        .filter(b => b.category === 'printing' || Number(b.printingCredits) !== 0 || Number(b.printingBundles) > 0)
        .map(b => {
          const credits = Number(b.printingCredits) || (Number(b.printingBundles || 0) * 5);
          const isDebit = credits < 0;
          return {
            id: b.id,
            date: b.date || b.createdAt?.split('T')[0],
            description: isDebit ? (b.space || 'Print Job') : (b.category === 'printing' ? 'Credit Top-up' : `Bundle from ${b.space} booking`),
            amount: Math.abs(credits) * (settings.printCreditToPageRatio || 2), // Convert to pages
            type: isDebit ? 'Debit' : 'Credit',
            status: isDebit ? 'Printed' : 'Added'
          };
        });

      const manualPurchases = JSON.parse(localStorage.getItem(`print_purchases_${user.email}`) || '[]').map(p => ({...p, amount: p.amount * (settings.printCreditToPageRatio || 2)})); // Convert old credit history if needed
      const printJobs = JSON.parse(localStorage.getItem(`print_jobs_${user.email}`) || '[]');
      
      const combined = [...printHistory, ...manualPurchases, ...printJobs]
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      setHistory(combined);

      // Total balance in PAGES
      const totalPagesBalance = combined.reduce((acc, curr) => {
        const amt = Number(curr.amount) || 0;
        if (curr.type === 'Debit') return acc - amt;
        return acc + amt;
      }, 0);
      setTotalPages(totalPagesBalance);
      
      const updatedCredits = totalPagesBalance / (settings.printCreditToPageRatio || 2);
      const displayCredits = updatedCredits % 1 === 0 ? updatedCredits : updatedCredits.toFixed(1);
      const updatedUser = { ...user, printingCredits: displayCredits };
      localStorage.setItem('seenhub_user', JSON.stringify(updatedUser));
    } catch (e) {
      console.error("Failed to load printing history:", e);
    }
  }, [user, settings.printCreditToPageRatio]);

  React.useEffect(() => {
    setTimeout(() => loadPrintingHistory(), 0);
  }, [loadPrintingHistory]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Read the PDF to count actual pages
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = new Uint8Array(event.target.result);
          const str = Array.from(text).map(b => String.fromCharCode(b)).join('');
          // Count /Page occurrences (each PDF page has /Type /Page)
          const pageMatches = str.match(/\/Type\s*\/Page[^s]/g);
          const count = pageMatches ? pageMatches.length : 1;
          setPageCount(Math.max(1, count));
        } catch {
          setPageCount(1);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handlePrint = async () => {
    if (!selectedFile) return;
    
    if (totalPages < pageCount) {
      alert(`Insufficient balance. You need ${pageCount} pages but have ${totalPages}.`);
      return;
    }
    setIsPrinting(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('fileName', selectedFile.name);
      formData.append('pages', pageCount);
      formData.append('userId', user.id); // Add userId just in case if it's missing from cookie

      const res = await fetch('/api/printing/print', {
        method: 'POST',
        body: formData
      });
      
      const result = await res.json();
      
      if (result.success) {
        setSelectedFile(null);
        loadPrintingHistory();
        alert(`Success! ${pageCount} page(s) sent to the printer.`);
      } else {
        alert("Failed to send to printer: " + result.message);
      }
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setIsPrinting(false);
    }
  };

  const handleBuyBundle = (credits) => {
    const amount = parseFloat(credits);
    if (isNaN(amount) || amount < (settings.printMinTopUp || 2)) {
      alert(`Minimum top-up is ${settings.printMinTopUp || 2} AED.`);
      return;
    }
    const ratio = settings.printAedToCreditRatio || 1;
    const creditAmount = amount * ratio;
    const taxRate = settings.taxEnabled ? settings.taxPercentage / 100 : 0;
    const params = new URLSearchParams({
      category: 'printing',
      service: `${creditAmount.toFixed(1)} Printing Credits`,
      subtotal: amount.toString(),
      total: (amount * (1 + taxRate)).toString(),
      printingCredits: creditAmount.toString()
    });
    window.location.href = `/checkout?${params.toString()}`;
  };

  return (
    <div className="animate-fade">
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Printing Services</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Manage your printing credits and bundles.</p>
      </div>

      <div className="grid-stack-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
        {/* Left: Printing Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="dash-card" style={{ background: 'linear-gradient(135deg, #d88906 0%, #f59e0b 100%)', color: '#fff' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Available Credits</h3>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <div style={{ fontSize: '3.5rem', fontWeight: 900 }}>
                {(() => {
                  const val = totalPages / (settings.printCreditToPageRatio || 2);
                  return isNaN(val) ? '0' : val.toFixed(1).replace('.0', '');
                })()}
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 600, opacity: 0.9 }}>Credits</span>
            </div>
            <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>1 Credit = {settings.printCreditToPageRatio} Pages ({(1/settings.printCreditToPageRatio).toFixed(2)} per page)</p>
          </div>

          {/* New Print Document Section */}
          <div className="dash-card" style={{ border: '2px dashed #e2e8f0', background: '#f8fafc' }}>
            <h3 className="dash-card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Upload size={18} /> Print New Document
            </h3>
            
            {!selectedFile ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <label style={{ cursor: 'pointer', display: 'block' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <FileText size={24} color="#d88906" />
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>Click to upload PDF or DOC</span>
                  <input type="file" onChange={handleFileChange} style={{ display: 'none' }} accept=".pdf,.doc,.docx" />
                </label>
              </div>
            ) : (
              <div style={{ background: '#fff', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <FileText size={20} color="#d88906" />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{selectedFile.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Detected: <strong>{pageCount} Page(s)</strong></div>
                  </div>
                  <X size={16} color="#94a3b8" style={{ cursor: 'pointer' }} onClick={() => setSelectedFile(null)} />
                </div>
                
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem', padding: '0.5rem', background: '#fef3c7', borderRadius: '8px', color: '#92400e', fontWeight: 600 }}>
                   ⚠️ This will use <strong>{pageCount} page(s)</strong> from your balance.
                </div>

                <button 
                  className="btn-filled" 
                  style={{ width: '100%', background: '#0f172a' }}
                  onClick={handlePrint}
                  disabled={isPrinting || totalPages < pageCount}
                >
                  {isPrinting ? 'Sending to Printer...' : `Confirm & Print Now`}
                </button>
              </div>
            )}
          </div>

          <div className="dash-card">
            <h3 className="dash-card-title">Buy More Credits</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>Top up your balance instantly.</p>
            <p style={{ fontSize: '0.75rem', color: '#ef4444', marginBottom: '1.5rem', fontWeight: 600 }}>* Credits added are non-refundable.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '1.5rem', border: '2px solid #0f172a', borderRadius: '16px', background: '#fff', marginTop: '0.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', color: '#0f172a' }}>Top Up Credit</div>
                <div className="stack-mobile" style={{ display: 'flex', gap: '0.8rem' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#64748b' }}>AED</span>
                    <input 
                      type="number" 
                      min={settings.printMinTopUp}
                      placeholder={`Min ${settings.printMinTopUp}.00`}
                      value={customCredits}
                      onChange={(e) => setCustomCredits(e.target.value)}
                      style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1.1rem', fontWeight: 600 }}
                    />
                  </div>
                  <button 
                    className="btn-filled" 
                    style={{ padding: '0.8rem 2rem', background: '#0f172a', borderRadius: '12px', fontWeight: 700 }}
                    onClick={() => handleBuyBundle(customCredits)}
                  >
                    Buy Now
                  </button>
                </div>
                {customCredits && parseFloat(customCredits) >= (settings.printMinTopUp || 2) && (
                  <div style={{ marginTop: '0.8rem', padding: '0.5rem 1rem', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', color: '#166534', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    ✅ You will receive: <span style={{ fontSize: '1.1rem' }}>{parseFloat(customCredits) * (settings.printAedToCreditRatio || 1) * (settings.printCreditToPageRatio || 2)} Pages</span>
                  </div>
                )}
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '1rem' }}>
                  Note: 1 AED = {settings.printAedToCreditRatio} Credit = {settings.printAedToCreditRatio * settings.printCreditToPageRatio} Pages.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: History */}
        <div className="dash-card">
          <h3 className="dash-card-title">Printing History</h3>
          <div className="history-list" style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {history.length > 0 ? history.map((item, i) => (
              <div key={i} className="history-row" style={{ padding: '1.2rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>{item.description}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{item.date} • ID: {item.id}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: item.type === 'Debit' ? '#ef4444' : '#16a34a' }}>
                    {item.type === 'Debit' ? '-' : '+'}{item.amount} Pages
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8' }}>{item.status}</span>
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                <Printer size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                <p>No printing history found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EventsView() {
  const [events, setEvents] = React.useState([]);

  React.useEffect(() => {
    fetch('/api/events').then(res => res.json()).then(data => setEvents(Array.isArray(data) ? data : []));
  }, []);

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
        <h1 className="page-title" style={{marginBottom: 0}}>Upcoming Events</h1>
        <button className="btn-filled" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}} onClick={() => window.location.href = '/events'}>
          View Public Page <ChevronRight size={16}/>
        </button>
      </div>

      <div className="dash-card">
        <h3 className="dash-card-title" style={{fontWeight: '700'}}>Scheduled at SeenHub</h3>
        <p style={{fontSize: '0.85rem', color: '#888', marginBottom: '2rem'}}>Discover and book upcoming sessions, workshops and conferences.</p>

        <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
          {events.length > 0 ? events.map((ev, i) => (
            <div key={i} className="event-card-mobile" style={{display: 'grid', gridTemplateColumns: '120px 1fr 120px', gap: '1.5rem', padding: '1.5rem', border: '1px solid #f1f5f9', borderRadius: '16px', background: '#f8fafc', alignItems: 'center'}}>
              <div className="event-date-mobile" style={{textAlign: 'center', borderRight: '1px solid #e2e8f0', paddingRight: '1rem'}}>
                <div style={{fontSize: '1.2rem', fontWeight: 800, color: '#0f172a'}}>{new Date(ev.startDate).getDate()}</div>
                <div style={{fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase'}}>{new Date(ev.startDate).toLocaleDateString('en-US', { month: 'short' })}</div>
              </div>
              <div>
                <h4 style={{fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  {ev.title}
                </h4>
                <div style={{display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#64748b'}}>
                  <span style={{display: 'flex', alignItems: 'center', gap: '0.3rem'}}><MapPin size={14}/> Gate {ev.gateNumber || '92'}</span>
                  <span style={{display: 'flex', alignItems: 'center', gap: '0.3rem'}}><Clock size={14}/> {ev.startTime} - {ev.endTime}</span>
                </div>
              </div>
              <div className="event-action-mobile" style={{textAlign: 'right'}}>
                <button 
                  className="btn-filled" 
                  style={{padding: '0.5rem 1rem', fontSize: '0.8rem'}}
                  onClick={() => window.location.href = `/checkout?service=${encodeURIComponent(ev.title)}&guests=1`}
                >
                  Book Ticket
                </button>
              </div>
            </div>
          )) : (
            <div style={{textAlign: 'center', padding: '3rem', color: '#94a3b8'}}>
              <CalendarDays size={48} style={{opacity: 0.2, marginBottom: '1rem'}} />
              <p>No upcoming events found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HelpSupportView() {
  const helpItems = [
    { name: 'Submit Issues or Feedback', icon: Info, link: '/contact' },
    { name: 'FAQs (Frequently Asked Questions)', icon: HelpCircle, link: '/faqs' },
    { name: 'Contact Support Team', icon: Phone, link: '/contact' },
    { name: 'Terms & Conditions', icon: FileText, link: '/terms' },
  ];

  return (
    <div>
      <h1 className="page-title">Help & Support</h1>
      <h2 className="page-subtitle">Find answers and get in touch with our team</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
        {helpItems.map((item, i) => (
          <a 
            key={i} 
            href={item.link}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              padding: '1.5rem 2rem', 
              background: '#fff', 
              borderRadius: '16px', 
              textDecoration: 'none',
              border: '1px solid #f1f5f9',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
              transition: 'all 0.2s'
            }}
            onMouseOver={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.05)';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.02)';
              e.currentTarget.style.borderColor = '#f1f5f9';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ color: '#0f172a' }}>
                <item.icon size={22} strokeWidth={1.5} />
              </div>
              <span style={{ fontSize: '1.05rem', fontWeight: 600, color: '#0f172a' }}>{item.name}</span>
            </div>
            <ChevronRight size={20} color="#cbd5e1" />
          </a>
        ))}
      </div>

      <div style={{ marginTop: '3rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
        <p>SEEN Business Hub — Al Ain, UAE</p>
      </div>
    </div>
  );
}

function InvoicesView({ user, handleDownloadInvoice }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        // 1. Fetch Bookings (Workspaces, Memberships, Events, Printing Top-ups)
        const res = await fetch(`/api/bookings?email=${user.email}`);
        const allBookings = await res.json();
        const myBookings = Array.isArray(allBookings) ? allBookings.filter(b => b.email && b.email.toLowerCase() === user.email.toLowerCase()) : [];

        const bookingInvoices = myBookings.map(b => ({
          id: b.id,
          date: b.createdAt ? new Date(b.createdAt).toLocaleDateString() : b.date,
          item: b.space || b.service || 'Service',
          category: b.category,
          amount: b.total || b.totalAmount || b.subtotal || 0,
          status: b.paymentStatus || 'Paid',
          type: 'Booking'
        }));

        // 2. Fetch Cafe Invoices from LocalStorage (or API if available)
        const cafeInvoicesStr = localStorage.getItem('seenhub_cafe_invoices');
        const cafeInvoices = cafeInvoicesStr ? JSON.parse(cafeInvoicesStr).filter(inv => inv.customerEmail && inv.customerEmail.toLowerCase() === user.email.toLowerCase()).map(inv => ({
          id: inv.id,
          date: inv.date,
          item: inv.productName,
          category: 'Cafe',
          amount: inv.total,
          status: inv.status,
          type: 'Cafe'
        })) : [];

        // Combine and sort by date (newest first)
        const combined = [...bookingInvoices, ...cafeInvoices].sort((a, b) => new Date(b.date) - new Date(a.date));
        setInvoices(combined);
      } catch (e) {
        console.error("Failed to fetch invoices:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [user.email]);

  const getCategoryBadge = (cat) => {
    const colors = {
      workspaces: { bg: '#eff6ff', text: '#2563eb', label: 'Workspace' },
      memberships: { bg: '#f0fdf4', text: '#16a34a', label: 'Membership' },
      events: { bg: '#faf5ff', text: '#7c3aed', label: 'Event' },
      printing: { bg: '#fffbeb', text: '#d97706', label: 'Printing' },
      Cafe: { bg: '#fff1f2', text: '#e11d48', label: 'Cafe' }
    };
    const style = colors[cat] || { bg: '#f8fafc', text: '#64748b', label: cat };
    return (
      <span style={{ padding: '0.3rem 0.6rem', borderRadius: '50px', fontSize: '0.7rem', fontWeight: 800, background: style.bg, color: style.text, textTransform: 'uppercase' }}>
        {style.label}
      </span>
    );
  };

  return (
    <div className="animate-fade">
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>Billing & Invoices</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Review your payment history and download invoices.</p>
      </div>

      <div className="dash-card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>Loading invoices...</div>
        ) : (
          <>
            <table className="responsive-hide" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                  <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>Invoice ID</th>
                  <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>Date</th>
                  <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>Category</th>
                  <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>Item / Description</th>
                  <th style={{ padding: '1.25rem 1.5rem', textAlign: 'right', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>Amount</th>
                  <th style={{ padding: '1.25rem 1.5rem', textAlign: 'center', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>Status</th>
                  <th style={{ padding: '1.25rem 1.5rem', textAlign: 'center', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#fcfcfd'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: '#0f172a' }}>#{inv.id}</td>
                    <td style={{ padding: '1.25rem 1.5rem', color: '#64748b' }}>{inv.date}</td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>{getCategoryBadge(inv.category)}</td>
                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: '#0f172a' }}>{inv.item}</td>
                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>AED {parseFloat(inv.amount).toFixed(2)}</td>
                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                      <span style={{ 
                        padding: '0.3rem 0.6rem', 
                        borderRadius: '6px', 
                        fontSize: '0.75rem', 
                        fontWeight: 800, 
                        background: inv.status === 'Paid' ? '#f0fdf4' : '#fff7ed', 
                        color: inv.status === 'Paid' ? '#16a34a' : '#c2410c' 
                      }}>
                        {inv.status}
                      </span>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                      <button 
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', transition: 'all 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                        title="Download Invoice"
                        onClick={() => handleDownloadInvoice(inv)}
                      >
                        <Download size={18} color="#64748b" />
                      </button>
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
                      <Receipt size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                      <p>No invoices found in your history.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Mobile View */}
            <div className="mobile-card-view" style={{ padding: '1rem' }}>
              {invoices.map((inv, i) => (
                <div key={i} style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: '16px', padding: '1.25rem', marginBottom: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>#{inv.id}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{inv.date}</div>
                    </div>
                    {getCategoryBadge(inv.category)}
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>{inv.item}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f8fafc' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>AED {parseFloat(inv.amount).toFixed(2)}</div>
                    <button style={{ background: '#f8fafc', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', color: '#64748b', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Download size={16} /> Invoice
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PlaceholderView({ title }) {
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#aaa'}}>
      <LifeBuoy size={48} style={{marginBottom: '1rem', opacity: 0.5}} />
      <h2 style={{fontSize: '1.5rem', fontWeight: '300', color: '#555'}}>{title}</h2>
      <p style={{fontSize: '0.9rem'}}>This section is currently under construction.</p>
    </div>
  );
}

function ProfileView() {
  const [profile, setProfile] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  
  const [isEditing, setIsEditing] = React.useState(false);
  const [editForm, setEditForm] = React.useState({});
  const [fieldErrors, setFieldErrors] = React.useState({});
  const [isSaving, setIsSaving] = React.useState(false);
  const [selectedImageFile, setSelectedImageFile] = React.useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = React.useState(null);

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get('/api/users/profile');
        if (response.success && response.data?.user) {
          setProfile(response.data.user);
          setEditForm(response.data.user);
        } else {
          setError('Failed to load profile data.');
        }
      } catch (err) {
        setError('Failed to load profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleEditToggle = () => {
    if (isEditing) {
      setEditForm(profile);
      setFieldErrors({});
      setError('');
      setSelectedImageFile(null);
      setImagePreviewUrl(null);
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setFieldErrors({});
    try {
      let body;
      if (selectedImageFile) {
        body = new FormData();
        body.append('user[first_name]', editForm.first_name || '');
        body.append('user[last_name]', editForm.last_name || '');
        body.append('user[phone_number]', editForm.phone_number || '');
        body.append('user[dob]', editForm.dob || '');
        body.append('user[employment_status]', editForm.employment_status || '');
        body.append('user[profile_picture]', selectedImageFile);
      } else {
        body = {
          user: {
            first_name: editForm.first_name,
            last_name: editForm.last_name,
            phone_number: editForm.phone_number,
            dob: editForm.dob,
            employment_status: editForm.employment_status
          }
        };
      }

      const response = await apiClient.put('/api/users/profile', body);
      if (response.success && response.data?.user) {
        setProfile(response.data.user);
        setIsEditing(false);
        // Sync local storage so header/nav stays updated
        localStorage.setItem('seenhub_user', JSON.stringify(response.data.user));
        alert('Profile updated successfully!');
      }
    } catch (err) {
      if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
        setFieldErrors(err.fieldErrors);
      } else {
        setError(err.message || 'Failed to update profile. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem', color: '#64748b' }}>Loading profile...</div>;
  if (error && !profile) return <div style={{ padding: '2rem', color: '#ef4444' }}>{error}</div>;
  if (!profile) return null;

  const inputStyle = (hasError) => ({ width: '100%', padding: '0.6rem 0.8rem', marginTop: '0.3rem', border: hasError ? '1px solid #ef4444' : '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', color: '#0f172a', outline: 'none', transition: 'border-color 0.2s', background: '#fff' });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>My Profile</h1>
          <h2 className="page-subtitle" style={{ margin: '0.2rem 0 0' }}>Manage your personal information</h2>
        </div>
        <button 
          onClick={handleEditToggle}
          style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: isEditing ? '#f8fafc' : '#0f172a', color: isEditing ? '#0f172a' : '#fff', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
        >
          {isEditing ? 'Cancel Edit' : 'Edit Profile'}
        </button>
      </div>

      {error && isEditing && <div style={{ padding: '1rem', background: '#fef2f2', color: '#ef4444', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>{error}</div>}

      <div className="dash-card" style={{ maxWidth: '800px' }}>
        <div className="profile-header-mobile" style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '3rem' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', overflow: 'hidden', border: '2px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              {(imagePreviewUrl || profile.profile_picture_url) ? (
                <Image src={imagePreviewUrl || profile.profile_picture_url} alt="Profile" fill unoptimized style={{ objectFit: 'cover' }} />
              ) : (
                <User size={48} strokeWidth={1.5} />
              )}
            </div>
            {isEditing && (
              <label style={{ position: 'absolute', bottom: 0, right: '-5px', background: '#d88906', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', transition: 'background 0.2s' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
              </label>
            )}
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{profile.first_name} {profile.last_name}</h3>
            <p style={{ color: '#64748b', margin: '0.2rem 0 0' }}>{profile.email}</p>
            <span style={{ display: 'inline-block', marginTop: '0.5rem', padding: '0.3rem 0.8rem', background: profile.email_verified ? '#dcfce7' : '#fef3c7', color: profile.email_verified ? '#16a34a' : '#d97706', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700 }}>
              {profile.email_verified ? 'Verified Account' : 'Pending Verification'}
            </span>
          </div>
        </div>

        <div className="grid-stack-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>First Name</label>
            {isEditing ? (
              <div>
                <input type="text" name="first_name" value={editForm.first_name || ''} onChange={handleInputChange} style={inputStyle(fieldErrors.first_name)} />
                {fieldErrors.first_name && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.2rem' }}>{fieldErrors.first_name.join(', ')}</div>}
              </div>
            ) : (
              <p style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', margin: '0.3rem 0 0' }}>{profile.first_name}</p>
            )}
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Last Name</label>
            {isEditing ? (
              <div>
                <input type="text" name="last_name" value={editForm.last_name || ''} onChange={handleInputChange} style={inputStyle(fieldErrors.last_name)} />
                {fieldErrors.last_name && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.2rem' }}>{fieldErrors.last_name.join(', ')}</div>}
              </div>
            ) : (
              <p style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', margin: '0.3rem 0 0' }}>{profile.last_name}</p>
            )}
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</label>
            {isEditing ? (
              <div>
                <input type="email" value={profile.email} disabled style={{ ...inputStyle(false), background: '#f8fafc', color: '#94a3b8', cursor: 'not-allowed' }} title="Email cannot be changed" />
                <div style={{ color: '#94a3b8', fontSize: '0.7rem', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '4px' }}>🔒 Email is locked</div>
              </div>
            ) : (
              <p style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', margin: '0.3rem 0 0' }}>{profile.email}</p>
            )}
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone Number</label>
            {isEditing ? (
              <div>
                <input type="tel" name="phone_number" value={editForm.phone_number || ''} onChange={handleInputChange} style={inputStyle(fieldErrors.phone_number)} />
                {fieldErrors.phone_number && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.2rem' }}>{fieldErrors.phone_number.join(', ')}</div>}
              </div>
            ) : (
              <p style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', margin: '0.3rem 0 0' }}>{profile.phone_number}</p>
            )}
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date of Birth</label>
            {isEditing ? (
              <div>
                <input type="date" name="dob" value={editForm.dob || ''} onChange={handleInputChange} style={inputStyle(fieldErrors.dob)} />
                {fieldErrors.dob && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.2rem' }}>{fieldErrors.dob.join(', ')}</div>}
              </div>
            ) : (
              <p style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', margin: '0.3rem 0 0' }}>{profile.dob || 'Not provided'}</p>
            )}
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Employment Status</label>
            {isEditing ? (
              <div>
                <select name="employment_status" value={editForm.employment_status || ''} onChange={handleInputChange} style={inputStyle(fieldErrors.employment_status)}>
                  <option value="">Select Status</option>
                  <option value="employed">Employed</option>
                  <option value="self_employed">Self Employed</option>
                  <option value="freelancer">Freelancer</option>
                  <option value="student">Student</option>
                  <option value="unemployed">Unemployed</option>
                </select>
                {fieldErrors.employment_status && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.2rem' }}>{fieldErrors.employment_status.join(', ')}</div>}
              </div>
            ) : (
              <p style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', margin: '0.3rem 0 0', textTransform: 'capitalize' }}>{profile.employment_status?.replace(/_/g, ' ') || 'Not provided'}</p>
            )}
          </div>
        </div>

        {isEditing && (
          <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button 
              onClick={handleEditToggle}
              style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none', background: 'transparent', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              style={{ padding: '0.6rem 2rem', borderRadius: '8px', border: 'none', background: '#d88906', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s', opacity: isSaving ? 0.7 : 1 }}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function LockerView({ user, booking }) {
  if (!booking) {
    return (
      <div className="dash-card" style={{ padding: '4rem', textAlign: 'center' }}>
        <Lock size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>No Active Locker</h3>
        <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '300px', margin: '0 auto' }}>
          You haven't booked a locker for today. Add a locker to your next workspace booking!
        </p>
        <button className="btn-filled" style={{ marginTop: '1.5rem' }} onClick={() => window.location.href = '/booking'}>Book Now</button>
      </div>
    );
  }

  return (
    <div className="animate-fade">
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>My Locker</h2>
        <p style={{ color: '#64748b', margin: '0.3rem 0 0' }}>Details of your currently booked locker.</p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div className="dash-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#fef3c7', padding: '0.75rem', borderRadius: '12px' }}>
              <Lock size={24} color="#d97706" />
            </div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Locker #{booking.lockerCode || '92'}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Status: <span style={{ color: '#16a34a', fontWeight: 700 }}>Active</span></div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Booking Ref:</span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>{booking.id?.slice(-8) || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Valid For:</span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>{booking.date}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
              <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>ACCESS CODE:</span>
              <span style={{ fontWeight: 900, color: '#d97706', fontSize: '1.5rem', letterSpacing: '2px' }}>{booking.lockerCode || '92001'}</span>
            </div>
          </div>
        </div>

        <div className="dash-card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.5rem', color: '#0f172a' }}>Access QR Code</h3>
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
            <QRCodeSVG value={`LOCKER|${booking.lockerCode}|${booking.email}|${booking.id}`} size={180} />
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '1.5rem', maxWidth: '200px' }}>
            Scan this QR code at the locker terminal to open your locker.
          </p>
        </div>
      </div>

      <div className="dash-card" style={{ marginTop: '2rem', borderLeft: '4px solid #3b82f6' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Locker Usage Policy</h4>
        <ul style={{ fontSize: '0.85rem', color: '#64748b', paddingLeft: '1.25rem', lineHeight: 1.6 }}>
          <li>Locker access is valid only for the duration of your workspace booking.</li>
          <li>Please do not store perishable items or hazardous materials.</li>
          <li>SeenHub is not responsible for any items lost from the locker.</li>
          <li>Ensure the locker is empty before your booking period expires.</li>
        </ul>
      </div>
    </div>
  );
}

