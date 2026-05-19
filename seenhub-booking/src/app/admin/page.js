"use client";
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { LayoutDashboard, Users, CalendarCheck, BarChart3, BookOpen, Coffee, Database, FileText, HelpCircle, Layers, MessageSquare, Settings, Smartphone, LogOut, ChevronDown, ChevronUp, User, Clock, RefreshCw, Activity, Plus, X, Trash2, Mail, CreditCard, PieChart, Languages, Landmark, ScrollText, ShieldCheck, FileKey, Lock, Upload, Edit, Shield, Tag, Printer, Eye, EyeOff } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
// import realBookingsData from '../../../data/bookings.json'; // Removed static import
import RichTextEditor from '../../components/RichTextEditor';
import GlobalLoader from '../../components/GlobalLoader';
import { apiClient } from '../../utils/apiClient';

// New Components
import AdminSidebar from '../../components/admin/AdminSidebar';
import AnalyticsOverview from '../../components/admin/AnalyticsOverview';
import WorkspaceManager from '../../components/admin/WorkspaceManager';
import BookingManager from '../../components/admin/BookingManager';
import AnalyticsDetail from '../../components/admin/AnalyticsDetail';
import SEOManager from '../../components/admin/SEOManager';

function Card({ title, val, sub }) { return (<div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}><div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>{title}</div><div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>{val}</div><div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{sub}</div></div>); }

const S = { sb: { width: 260, background: '#fff', borderRight: '1px solid #e2e8f0', height: '100vh', position: 'sticky', top: 0, overflowY: 'auto' }, hdr: { height: 65, background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', position: 'sticky', top: 0, zIndex: 10 }, content: { padding: '2rem', flex: 1, overflowY: 'auto' }, table: { width: '100%', borderCollapse: 'collapse' }, th: { textAlign: 'left', padding: '0.75rem', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', borderBottom: '2px solid #f1f5f9' }, td: { padding: '0.9rem 0.75rem', fontSize: '0.85rem', color: '#334155', borderBottom: '1px solid #f8fafc' }, card: { background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '1.5rem' }, badge: { background: '#f0fdf4', color: '#166534', padding: '0.25rem 0.6rem', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700 }, badgeBlue: { background: '#eff6ff', color: '#1d4ed8', padding: '0.25rem 0.6rem', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700 } };

const ALL_MODULES = ['Admin Users', 'Accounts', 'Events', 'Analytics', 'Blogs', 'Booking', 'Cafe', 'Catalogs', 'Categories', 'Invoices', 'Landing page', 'Messages', 'Settings', 'Tax Rates', 'Translations', 'Frequently Asked Questions', 'Terms And Conditions', 'Copyrights', 'Privacy Policies', 'SEO'];

export default function AdminPanel() {
  return (
    <Suspense fallback={<GlobalLoader />}>
      <AdminPanelContent />
    </Suspense>
  );
}

function AdminPanelContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('tab') || 'Dashboard');

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t && t !== tab) setTab(t);
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (tab !== params.get('tab')) {
      router.push(`?tab=${tab}`, { scroll: false });
    }
  }, [tab, router]);

  const [menus, setMenus] = useState(['Analytics']);
  const [time, setTime] = useState(new Date());

  const formatTimeStr = (t) => {
    if (!t) return '—';
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m < 10 ? '0' + m : m} ${ampm}`;
  };

  const [modal, setModal] = useState(false);
  const [qrModal, setQrModal] = useState(null);
  const [form, setForm] = useState({ id: null, title: '', location: '', startDate: '', endDate: '', startTime: '', endTime: '', gateNumber: '', eventType: 'Conference', description: '', totalTickets: 30, price: 0 });

  const [blogModal, setBlogModal] = useState(false);
  const [blogForm, setBlogForm] = useState({ id: null, title: '', subtitle: '', author: '', image: '', content: '', date: '' });
  const fileInputRef = useRef(null);

  const [adminModal, setAdminModal] = useState(false);
  const [adminForm, setAdminForm] = useState({ id: null, name: '', email: '', password: '', password_confirmation: '', role: 'Sub-Admin', permissions: [] });
  const [showPass, setShowPass] = useState(false);
  const [showConfPass, setShowConfPass] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);

  const [wsModal, setWsModal] = useState(false);
  const [wsTab, setWsTab] = useState('basic');
  const wsFileInputRef = useRef(null);
  const wsGalleryInputRef = useRef(null);

  const defaultWsForm = () => ({
    id: null,
    title: '',
    subtitle: '',
    description: '',
    featuredImg: '',
    gallery: [],
    link: '/workspaces/new',
    maxGuests: 10,
    units: 1,
    unitNames: [],
    qrPrefix: '01',
    unitQrPrefixes: [],
    bookingTypes: ['Hourly', 'Daily', 'Weekly', 'Monthly'],
    pricing: {
      hourly: { individual: 0, corporate: 0 },
      daily: { individual: 0, corporate: 0 },
      weekly: { individual: 0, corporate: 0 },
      monthly: { individual: 0, corporate: 0 },
    },
    extraGuestPrice: { individual: 0, corporate: 0 },
    workingHours: {
      Monday: { enabled: true, from: '08:00', to: '22:00' },
      Tuesday: { enabled: true, from: '08:00', to: '22:00' },
      Wednesday: { enabled: true, from: '08:00', to: '22:00' },
      Thursday: { enabled: true, from: '08:00', to: '22:00' },
      Friday: { enabled: true, from: '08:00', to: '17:00' },
      Saturday: { enabled: false, from: '', to: '' },
      Sunday: { enabled: false, from: '', to: '' },
    }
  });

  const [wsForm, setWsForm] = useState(defaultWsForm());

  const [cafeSubTab, setCafeSubTab] = useState('Products');
  const [cafeModal, setCafeModal] = useState(false);
  const [cafeForm, setCafeForm] = useState({ id: null, type: 'Product', name: '', category: '', price: 0, image: '', description: '' });
  const cafeFileRef = useRef(null);

  const [d, setD] = useState({
    bookings: [],
    payments: [],
    users: [],
    events: [],
    blogs: [],
    systemAdmins: [],
    workspaces: [],
    coupons: [],
    cafeProducts: [],
    cafeCategories: [],
    cafeInvoices: [],
    messages: [],
    lockers: [],
    memberships: [],
    s: { rev: 0, mem: 0, users: 0, active: 0, inactive: 0, spaces: 0, occ: 0 }
  });

  const [landingForm, setLandingForm] = useState({
    heroTitle: 'SEEN Business Hub',
    heroSubtitle: 'Al Ain first AI-powered business hub',
    heroImage: '',
    homeQuote: '\"Seen Hub is more than just a workspace, it’s a vibrant hub where creativity sparks and ideas take flight. That’s why we’ve built Al Ain first AI-powered business hub a place where technology quietly makes things easier, so people can focus on what really matters: creating, collaborating, and growing together.\"',
    homeIntroImage: '',

    // About Us
    aboutTitle: 'Who We Are',
    aboutDescription: 'Seen Hub is a next-generation destination where workspace solutions and architectural consultancy come together under one roof. Recognized as Al Ain’s first AI-powered business center, we empower modern businesses, startups, and professionals to thrive.',
    aboutPillars: [
      { t: 'Smart Spaces', d: 'Flexible, high-end workspaces crafted to enhance productivity and inspire innovation.' },
      { t: 'AI-Driven Environment', d: 'Advanced intelligent systems designed to optimize operations and elevate business performance.' },
      { t: 'Engineering & Architecture', d: 'Expert consultancy delivering precision, creativity, and future-ready solutions.' }
    ],
    aboutQuoteTitle: 'Inspired by the vision of the late His Highness Sheikh Zayed bin Sultan Al Nahyan',
    aboutQuoteText: '\"The best investment on our land is human investment. It is the fundamental pillar of development. We must embrace modern science, gain broad knowledge, and explore every field of work to achieve a great civilizational transformation.\"',
    aboutQuoteAuthor: 'Sheikh Zayed bin Sultan Al Nahyan',
    aboutVision: 'Empowering visionaries with innovative workspaces and dynamic collaboration areas designed to inspire creativity, growth, and forward-thinking ideas.',
    aboutMission: 'To provide a state-of-the-art business hub integrating AI-driven innovation, premium environments, and collaborative ecosystems that enable entrepreneurs and leaders to thrive.',
    aboutOfferImage: '',
    aboutOfferList: ['Easy & Flexible Booking', 'Comfortable Lounge Areas', 'Semi-Private Booths', 'Fully Equipped Private Meeting Rooms', 'Smart Isolated Work Booths', 'Vibrant Café Deck', 'Library & Reading Book', 'Event Stage with Seating', 'Additional Amenities'],
    aboutFinalNote: 'Seen Business Hub is more than just a workspace it’s a dynamic environment where innovation, collaboration, and productivity thrive. Join us and experience a hub designed for growth, creativity, and success.',
    faqs: [],
    legal: { terms: '', privacy: '', copyrights: '' }
  });
  const [landingSubTab, setLandingSubTab] = useState('Home');
  const landingFileRef = useRef(null);

  const [qrSettings, setQrSettings] = useState({ 
    qrPrefix: '92', 
    workspacePrefixes: {}, // Map of wsTitle -> prefix (fallback for whole workspace)
    unitPrefixes: {}, // Nested map: wsTitle -> unitName -> prefix
    membershipPrefix: '91',
    eventPrefix: '93',
    qrTotalLength: 10, 
    taxEnabled: false, 
    taxPercentage: 5, 
    printCreditToPageRatio: 2, 
    printMinTopUp: 2, 
    printAedToCreditRatio: 1,
    logo: '/logo.png',
    favicon: '/icon.png',
    contactWhatsApp: '+971 50 000 0000',
    contactPhone: '+971 50 000 0000',
    contactEmail: 'support@seenhub.ae',
    websiteUrl: 'https://www.seenhub.ae',
    openingHours: [
      { days: 'Monday To Friday', time: '8 AM To 10 PM' },
      { days: 'Saturday To Sunday', time: '10 AM To 6 PM' }
    ],
    socialLinks: [
      { platform: 'Facebook', url: '#', icon: 'Fb' },
      { platform: 'Instagram', url: '#', icon: 'Ig' },
      { platform: 'X', url: '#', icon: '𝕏' },
      { platform: 'LinkedIn', url: '#', icon: 'In' },
      { platform: 'YouTube', url: '#', icon: 'Yt' },
      { platform: 'TikTok', url: '#', icon: 'Tk' },
      { platform: 'Pinterest', url: '#', icon: 'Pt' },
      { platform: 'Snapchat', url: '#', icon: 'Sc' },
      { platform: 'Threads', url: '#', icon: 'Th' }
    ]
  });
  const [savingQr, setSavingQr] = useState(false);
  const [faqModal, setFaqModal] = useState(false);
  const [faqForm, setFaqForm] = useState({ id: null, question: '', answer: '' });
  const [popupForm, setPopupForm] = useState({ enabled: false, image: '', title: '', content: '', btn1Text: '', btn1Link: '', btn2Text: '', btn2Link: '' });
  const [savingPopup, setSavingPopup] = useState(false);
  const popupFileRef = useRef(null);
  const membershipImgRef = useRef(null);

  const [lockerModal, setLockerModal] = useState(false);
  const [lockerForm, setLockerForm] = useState({ id: null, code: '', name: '', status: 'AVAILABLE', price: 10 });
  const [savingLocker, setSavingLocker] = useState(false);

  const [manualBookingModal, setManualBookingModal] = useState(false);
  const [manualBookingForm, setManualBookingForm] = useState({
    name: '',
    email: '',
    category: 'workspaces',
    space: '',
    date: new Date().toISOString().split('T')[0],
    timeFrom: '09:00',
    timeTo: '10:00',
    bookingType: 'Hourly',
    guests: 1,
    totalUnits: 1,
    total: 0
  });
  const [membershipModal, setMembershipModal] = useState(false);
  const [membershipForm, setMembershipForm] = useState({ id: null, title: '', subtitle: '', desc: '', price: 0, icon: '🏢', slug: '', images: [], descBold: '', features: [], descThin: '', bookingUrl: '' });
  const [savingMembership, setSavingMembership] = useState(false);

  const [seoData, setSeoData] = useState([]);
  const [savingSeo, setSavingSeo] = useState(false);
  const [seoCategory, setSeoCategory] = useState('Main Pages');
  const [siteStats, setSiteStats] = useState({ liveUsers: 0, totalVisits: 0, pageViews: {}, locations: {}, recentLogs: [] });
  const [loadingStats, setLoadingStats] = useState(false);

  const saveFaq = async (e) => {
    e.preventDefault();
    let newFaqs = [...(landingForm.faqs || [])];
    if (faqForm.id) {
      newFaqs = newFaqs.map(f => f.id === faqForm.id ? faqForm : f);
    } else {
      newFaqs.push({ ...faqForm, id: Date.now() });
    }
    const newForm = { ...landingForm, faqs: newFaqs };
    setLandingForm(newForm);
    try {
      await fetch('/api/landing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newForm)
      });
      setFaqModal(false);
      setFaqForm({ id: null, question: '', answer: '' });
    } catch (e) { console.error(e); }
  };

  const deleteFaq = async (id) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    const newFaqs = (landingForm.faqs || []).filter(f => f.id !== id);
    const newForm = { ...landingForm, faqs: newFaqs };
    setLandingForm(newForm);
    try {
      await fetch('/api/landing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newForm)
      });
    } catch (e) { console.error(e); }
  };

  const fetchPopup = async () => {
    try {
      const res = await fetch('/api/popup');
      if (res.ok) setPopupForm(await res.json());
    } catch (e) { console.error(e); }
  };

  const savePopup = async (e) => {
    e.preventDefault();
    setSavingPopup(true);
    try {
      const res = await fetch('/api/popup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(popupForm)
      });
      if (res.ok) {
        alert('Popup settings updated!');
      }
    } catch (e) { console.error(e); }
    setSavingPopup(false);
  };

  const handlePopupImage = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const compressed = await compressImage(file, 800);
      setPopupForm({ ...popupForm, image: compressed });
    }
  };

  const saveLegal = async (type, content) => {
    setSavingLegal(true);
    const newLegal = { ...(landingForm.legal || { terms: '', privacy: '', copyrights: '' }), [type]: content };
    const newForm = { ...landingForm, legal: newLegal };
    setLandingForm(newForm);
    try {
      const res = await fetch('/api/landing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newForm)
      });
      if (res.ok) {
        alert('Saved successfully!');
      }
    } catch (e) { console.error('Save error:', e); }
    setSavingLegal(false);
  };

  const fetchSeo = async () => {
    try {
      const res = await fetch('/api/seo');
      if (res.ok) setSeoData(await res.json());
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (tab === 'Site Analytics') fetchAnalytics();
  }, [tab]);

  const saveSeo = async (data) => {
    setSavingSeo(true);
    try {
      const res = await fetch('/api/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        alert('SEO settings saved successfully!');
        fetchSeo();
      }
    } catch (e) { console.error(e); }
    setSavingSeo(false);
  };

  const fetchAnalytics = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch('/api/analytics');
      if (res.ok) setSiteStats(await res.json());
    } catch (e) { console.error(e); }
    setLoadingStats(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetch('/api/settings')
        .then(res => res.json())
        .then(data => setQrSettings(prev => ({ ...prev, ...data })))
        .catch(e => console.error("Failed to fetch settings:", e));
    }
  }, [isAuthenticated]);

  // Auto-calculate Manual Booking Price via API
  useEffect(() => {
    if (manualBookingModal && manualBookingForm.space) {
      const params = new URLSearchParams({
        category: manualBookingForm.category,
        space: manualBookingForm.space,
        bookingType: manualBookingForm.bookingType,
        guests: manualBookingForm.guests,
        totalUnits: manualBookingForm.totalUnits,
        timeFrom: manualBookingForm.timeFrom || '',
        timeTo: manualBookingForm.timeTo || ''
      });
      
      fetch(`/api/bookings/calculate_price?${params.toString()}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            setManualBookingForm(prev => ({ ...prev, total: data.total }));
          }
        })
        .catch(e => console.error(e));
    }
  }, [manualBookingForm.space, manualBookingForm.bookingType, manualBookingForm.timeFrom, manualBookingForm.timeTo, manualBookingForm.totalUnits, manualBookingModal]);

  useEffect(() => {
    if (isAuthenticated && tab === 'Frequently Asked Questions') {
      setTimeout(() => fetchFaqs(), 0);
    }
    if (isAuthenticated && ['Terms And Conditions', 'Privacy Policies', 'Copyrights'].includes(tab)) {
      setTimeout(() => fetchLegal(), 0);
    }
    if (isAuthenticated && tab === 'Promo Popup') {
      setTimeout(() => fetchPopup(), 0);
    }
    if (isAuthenticated && tab === 'SEO') {
      setTimeout(() => fetchSeo(), 0);
    }
  }, [tab, isAuthenticated]);

  // Guard against unauthorized URL tab access
  useEffect(() => {
    if (!isAuthenticated || !currentAdmin || currentAdmin.role === 'Super Admin') return;

    const permMap = {
      'Analytics': ['Analytics', 'User Analytics', 'Membership Analytics', 'Space Analytics', 'Event Analytics', 'Payment Analytics', 'Email Analytics'],
      'Admin Users': ['Admin Users'],
      'Accounts': ['Accounts'],
      'Events': ['Events', 'Event Booking'],
      'Booking': ['Booking', 'All Bookings', 'Workspace Booking', 'Membership Booking', 'Event Booking', 'Locker Booking'],
      'Cafe': ['Cafe'],
      'Categories': ['Categories'],
      'Catalogs': ['Catalogs', 'Workspaces', 'Memberships', 'Events', 'Lockers', 'Coupons'],
      'Blogs': ['Blogs'],
      'Landing page': ['Landing page'],
      'Promo Popup': ['Promo Popup'],
      'Messages': ['Messages'],
      'Invoices': ['Invoices'],
      'Tax Rates': ['Tax Rates'],
      'Settings': ['Settings'],
      'Translations': ['Translations'],
      'QR Settings': ['QR Settings'],
      'Printing': ['Printing'],
      'Emails': ['Emails'],
      'SEO': ['SEO'],
      'Site Analytics': ['Site Analytics']
    };

    let isAllowed = false;
    const globalTabs = ['Dashboard', 'Frequently Asked Questions', 'Terms And Conditions', 'Privacy Policies', 'Copyrights', 'My Profile'];
    
    if (globalTabs.includes(tab)) {
      isAllowed = true;
    } else {
      for (const [perm, tabs] of Object.entries(permMap)) {
        if (currentAdmin.permissions.includes(perm) && tabs.includes(tab)) {
          isAllowed = true;
          break;
        }
      }
    }

    if (!isAllowed) {
      setTab('Dashboard');
      router.push('?tab=Dashboard', { scroll: false });
    }
  }, [tab, isAuthenticated, currentAdmin, router]);

  useEffect(() => {
    if (tab === 'My Profile' && currentAdmin) {
      setAdminForm({ ...currentAdmin, password: '********', password_confirmation: '********' });
      setAvatarFile(null);
    }
  }, [tab, currentAdmin]);

  useEffect(() => {
    // Fetch settings on mount for login screen logo
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setQrSettings(prev => ({ ...prev, ...data })))
      .catch(e => console.error("Initial settings fetch error:", e));

    const admins = JSON.parse(localStorage.getItem('seenhub_system_admins') || '[]');
    const adminToken = localStorage.getItem('seenhub_admin_token');
    const adminUser = JSON.parse(localStorage.getItem('seenhub_admin_user') || 'null');

    if (adminToken && adminUser) {
      // Use stored data initially
      setCurrentAdmin(adminUser);
      setIsAuthenticated(true);

      // Verify token and get fresh data from server
      apiClient.get('/api/admin/auth/me')
        .then(res => {
          if (res.success) {
            setCurrentAdmin(res.admin);
            localStorage.setItem('seenhub_admin_user', JSON.stringify(res.admin));
          } else {
            handleLogout();
          }
        })
        .catch(() => {
          // If server is down or token expired, logout
          handleLogout();
        });
    }

    setTimeout(() => setAuthChecked(true), 0);
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    
    try {
      const res = await apiClient.post('/api/admin/login', { email, password });
      if (res.success) {
        localStorage.setItem('seenhub_admin_token', res.token);
        localStorage.setItem('seenhub_admin_user', JSON.stringify(res.admin));
        
        setCurrentAdmin(res.admin);
        setIsAuthenticated(true);
        setTab('Dashboard');
      }
    } catch (err) {
      console.error("Login failed:", err);
      // Fallback for legacy local login during transition
      const admins = JSON.parse(localStorage.getItem('seenhub_system_admins') || '[]');
      const admin = admins.find(a => a.email === email && a.password === password);

      if (admin) {
        const expiry = Date.now() + (12 * 60 * 60 * 1000);
        sessionStorage.setItem('seenhub_admin_id', admin.id);
        sessionStorage.setItem('seenhub_admin_expiry', expiry.toString());
        setCurrentAdmin(admin);
        setIsAuthenticated(true);
        setTab('Dashboard');
      } else {
        setLoginError(err.message || 'Invalid credentials. Please try again.');
      }
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.removeItem('seenhub_admin_token');
    localStorage.removeItem('seenhub_admin_user');
    
    // Security Fix: Prevent back-button cache leaks
    window.location.replace('/admin'); 
    setIsAuthenticated(false);
    setCurrentAdmin(null);
    setEmail('');
    setPassword('');
  };

  const load = async () => {
    if (typeof window === 'undefined') return;
    setLoading(true);

    const adminToken = localStorage.getItem('seenhub_admin_token');
    const authHeaders = adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {};

    const fetchApi = async (url, extraHeaders = {}) => {
      try {
        const res = await fetch(url, { headers: { ...authHeaders, ...extraHeaders }, cache: 'no-store' });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : (data && data.data && Array.isArray(data.data)) ? data.data : [];
      } catch (e) { return []; }
    };

    // Determine what to fetch based on tab
    const requests = {};
    
    if (tab === 'Dashboard' || tab === 'Analytics') {
      requests.bk = fetchApi('/api/bookings');
      requests.us = fetchApi('/api/data?type=users');
    } else if (tab === 'Booking' || tab === 'All Bookings') {
      requests.bk = fetchApi('/api/bookings');
      requests.ws = apiClient.get('/api/admin/workspace_categories').then(r => r.data || []);
    } else if (tab === 'Workspaces' || tab === 'Catalogs') {
      requests.ws = apiClient.get('/api/admin/workspace_categories').then(r => r.data || []);
      requests.lk = fetchApi('/api/lockers');
      requests.mb = fetchApi('/api/memberships');
      requests.cp = fetchApi('/api/coupons');
    } else if (tab === 'Events') {
      requests.ev = fetchApi('/api/events');
    } else if (tab === 'Blogs') {
      requests.bl = fetchApi('/api/blogs');
    } else if (tab === 'Cafe') {
      requests.cfP = fetchApi('/api/cafe_products');
      requests.cfC = fetchApi('/api/cafe_categories');
      requests.cfI = fetchApi('/api/data?type=cafe_invoices');
    } else if (tab === 'Messages') {
      requests.msg = fetchApi('/api/messages');
    } else if (tab === 'Admin Users') {
      requests.ad = apiClient.get('/api/admin/admin_users').then(r => r.data || []);
    } else if (tab === 'Landing page') {
      fetch('/api/landing').then(r => r.json()).then(data => setLandingForm(prev => ({...prev, ...data})));
    }

    const results = {};
    const keys = Object.keys(requests);
    const vals = await Promise.all(Object.values(requests));
    keys.forEach((k, i) => results[k] = vals[i]);

    const bk = results.bk || d.bookings;
    const us = results.us || d.users;
    const ev = results.ev || d.events;
    const bl = results.bl || d.blogs;
    const ws = results.ws || d.workspaces;
    const ad = results.ad || d.systemAdmins;
    const lk = results.lk || d.lockers;
    const mb = results.mb || d.memberships;
    const cp = results.cp || d.coupons;
    const cfP = results.cfP || d.cafeProducts;
    const cfC = results.cfC || d.cafeCategories;
    const cfI = results.cfI || d.cafeInvoices;
    const msg = results.msg || d.messages;

    const today = new Date().toISOString().split('T')[0];
    const confirmedBk = Array.isArray(bk) ? bk.filter(b => (b.status === 'Confirmed' || b.status === 'Paid')) : [];
    const rev = confirmedBk.reduce((s, p) => s + parseFloat(p.total || 0), 0);
    const sp = confirmedBk.filter(b => b.category === 'workspaces' && b.date === today);
    const ac = Array.isArray(us) ? us.filter(u => u.status === 'Active').length : 0;

    setD(prev => ({
      ...prev,
      bookings: Array.isArray(results.bk) ? [...results.bk].reverse() : prev.bookings,
      users: Array.isArray(results.us) ? [...results.us].reverse() : prev.users,
      events: Array.isArray(results.ev) ? [...results.ev].reverse() : prev.events,
      blogs: Array.isArray(results.bl) ? [...results.bl].reverse() : prev.blogs,
      workspaces: Array.isArray(results.ws) ? results.ws : prev.workspaces,
      systemAdmins: Array.isArray(results.ad) ? results.ad : prev.systemAdmins,
      lockers: Array.isArray(results.lk) ? results.lk : prev.lockers,
      memberships: Array.isArray(results.mb) ? results.mb : prev.memberships,
      coupons: Array.isArray(results.cp) ? results.cp : prev.coupons,
      cafeProducts: Array.isArray(results.cfP) ? results.cfP : prev.cafeProducts,
      cafeCategories: Array.isArray(results.cfC) ? results.cfC : prev.cafeCategories,
      cafeInvoices: Array.isArray(results.cfI) ? results.cfI : prev.cafeInvoices,
      messages: Array.isArray(results.msg) ? results.msg : prev.messages,
      s: { 
        rev, 
        mem: (results.bk || bk).filter(b => b.category === 'memberships').length, 
        users: us.length, 
        active: ac, 
        inactive: us.length - ac, 
        spaces: sp.length, 
        occ: Math.min(100, Math.round(sp.length / 12 * 100)) 
      }
    }));
    setLoading(false);
  };

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      setTimeout(() => load(), 0);
    }
  }, [tab, isAuthenticated]);

  const toggle = n => setMenus(p => p.includes(n) ? p.filter(m => m !== n) : [...p, n]);

  const togglePermission = (perm) => {
    setAdminForm(prev => {
      const has = prev.permissions.includes(perm);
      return { ...prev, permissions: has ? prev.permissions.filter(p => p !== perm) : [...prev.permissions, perm] };
    });
  };

  const saveAdminUser = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: adminForm.name,
        email: adminForm.email,
        role: adminForm.role,
        permissions: adminForm.permissions
      };
      if (adminForm.password && adminForm.password !== '********') {
        if (adminForm.password !== adminForm.password_confirmation) {
          return alert("Passwords do not match!");
        }
        payload.password = adminForm.password;
        payload.password_confirmation = adminForm.password_confirmation;
      }

      if (adminForm.id && !adminForm.id.toString().startsWith('admin_')) {
        await apiClient.put(`/api/admin/admin_users/${adminForm.id}`, { admin_user: payload });
      } else {
        await apiClient.post('/api/admin/admin_users', { admin_user: payload });
      }
      setAdminModal(false);
      load();
    } catch (err) {
      alert(err.message || 'Error saving admin user');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (adminForm.password && adminForm.password !== '********' && adminForm.password !== adminForm.password_confirmation) {
      return alert("Passwords do not match!");
    }

    const formData = new FormData();
    formData.append('admin_user[name]', adminForm.name);
    if (adminForm.password && adminForm.password !== '********') {
      formData.append('admin_user[password]', adminForm.password);
      formData.append('admin_user[password_confirmation]', adminForm.password_confirmation);
    }
    
    if (avatarFile) {
      formData.append('admin_user[avatar]', avatarFile);
    }

    try {
      const res = await apiClient.put(`/api/admin/admin_users/${currentAdmin.id}`, formData);
      if (res.success && res.data) {
        setCurrentAdmin(res.data);
        localStorage.setItem('seenhub_admin_user', JSON.stringify(res.data));
        alert('Profile updated successfully!');
      }
    } catch(err) {
      alert(err.message || 'Error updating profile');
    }
  };

  const delAdminUser = async (id) => {
    if (confirm("Are you sure you want to remove this admin?")) {
      try {
        await apiClient.delete(`/api/admin/admin_users/${id}`);
        load();
      } catch (err) {
        alert(err.message || 'Error deleting admin user');
      }
    }
  };

  const openEditAdmin = (admin) => {
    setAdminForm({ ...admin, password: '********', password_confirmation: '********' });
    setShowPass(false);
    setShowConfPass(false);
    setAdminModal(true);
  };

  const saveManualBooking = async e => {
    e.preventDefault();
    try {
      if(!manualBookingForm.space) {
         return alert("Please select a space/item first.");
      }
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...manualBookingForm,
          addons: []
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Booking created and assigned successfully!');
        setManualBookingModal(false);
        setManualBookingForm({ name: '', email: '', category: 'workspaces', space: '', date: new Date().toISOString().split('T')[0], timeFrom: '09:00', timeTo: '10:00', bookingType: 'Hourly', guests: 1, totalUnits: 1, total: 0 });
        load();
      } else {
        alert('Error: ' + (data.message || data.error || 'Failed to book'));
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const saveEvent = async e => {
    e.preventDefault();
    try {
      const payload = { ...form, status: form.status || 'Scheduled' };
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setModal(false);
        setForm({ id: null, title: '', location: '', startDate: '', endDate: '', startTime: '', endTime: '', gateNumber: '', eventType: 'Conference', description: '', totalTickets: 30, price: 0 });
        load();
      } else {
        alert('Failed to save event.');
      }
    } catch (e) { console.error(e); alert('Error saving event.'); }
  };
  const delEv = async id => {
    try {
      const res = await fetch(`/api/events?id=${id}`, { method: 'DELETE' });
      if (res.ok) load();
      else alert('Failed to delete event.');
    } catch (e) { console.error(e); }
  };


  const saveCafeItem = async (e) => {
    e.preventDefault();
    try {
      const adminToken = localStorage.getItem('seenhub_admin_token');
      const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` };

      if (cafeForm.type === 'Category') {
        await fetch('/api/cafe_categories', {
          method: 'POST',
          headers,
          body: JSON.stringify({ id: cafeForm.id || null, name: cafeForm.name })
        });
      } else {
        // Save to cafe_products Rails API
        const url = cafeForm.id ? `/api/cafe_products/${cafeForm.id}` : '/api/cafe_products';
        const method = cafeForm.id ? 'PUT' : 'POST';
        await fetch(url, {
          method,
          headers,
          body: JSON.stringify({
            name: cafeForm.name,
            category: cafeForm.category,
            price: cafeForm.price,
            image: cafeForm.image,
            description: cafeForm.description,
            status: cafeForm.status || 'Available'
          })
        });
      }
      setCafeModal(false);
      setCafeForm({ id: null, type: 'Product', name: '', category: '', price: 0, image: '', description: '' });
      load();
    } catch (e) { console.error(e); alert('Error saving item.'); }
  };

  const delCafeItem = async (id, type) => {
    try {
      const adminToken = localStorage.getItem('seenhub_admin_token');
      const headers = { 'Authorization': `Bearer ${adminToken}` };
      if (type === 'Category') {
        await fetch(`/api/cafe_categories/${id}`, { method: 'DELETE', headers });
      } else {
        await fetch(`/api/cafe_products/${id}`, { method: 'DELETE', headers });
      }
      load();
    } catch (e) { console.error(e); }
  };

  const saveLandingPage = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/landing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(landingForm)
      });
      if (res.ok) {
        alert('Landing page content saved permanently to server!');
      } else {
        alert('Failed to save to server. Check your connection.');
      }
    } catch (e) {
      console.error(e);
      alert('Error saving data.');
    }
  };

  const compressImage = (file, maxWidth = 1200) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (maxWidth / width) * height;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Use original file type to preserve transparency (e.g. for PNG logos)
          const dataUrl = canvas.toDataURL(file.type || 'image/jpeg', 0.8);
          resolve(dataUrl);
        };
      };
    });
  };

  const handleLandingImage = async (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const compressed = await compressImage(file, 800);
      setLandingForm({ ...landingForm, [field]: compressed });
    }
  };

  const saveLocker = async (e) => {
    e.preventDefault();
    setSavingLocker(true);
    try {
      const res = await fetch('/api/lockers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lockerForm)
      });
      if (res.ok) {
        setLockerModal(false);
        setLockerForm({ id: null, code: '', name: '', status: 'AVAILABLE', price: 10 });
        load();
      }
    } catch (e) { console.error(e); }
    setSavingLocker(false);
  };

  const deleteLocker = async (id) => {
    if (!confirm('Are you sure you want to delete this locker?')) return;
    try {
      const res = await fetch(`/api/lockers?id=${id}`, { method: 'DELETE' });
      if (res.ok) load();
    } catch (e) { console.error(e); }
  };

  const saveMembership = async (e) => {
    e.preventDefault();
    setSavingMembership(true);
    try {
      let updated;
      if (membershipForm.id) {
        updated = d.memberships.map(m => m.id === membershipForm.id ? { ...membershipForm } : m);
      } else {
        updated = [...d.memberships, { ...membershipForm, id: Date.now() }];
      }
      const res = await fetch('/api/memberships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        setMembershipModal(false);
        setMembershipForm({ id: null, title: '', subtitle: '', desc: '', price: 0, icon: '🏢', slug: '', images: [], descBold: '', features: [], descThin: '', bookingUrl: '' });
        load();
      } else { alert('Failed to save membership.'); }
    } catch (e) { console.error(e); alert('Error saving.'); }
    setSavingMembership(false);
  };

  const deleteMembership = async (id) => {
    if (!confirm('Delete this membership plan?')) return;
    try {
      const updated = d.memberships.filter(m => m.id !== id);
      const res = await fetch('/api/memberships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (res.ok) load();
      else alert('Failed to delete membership.');
    } catch (e) { console.error(e); }
  };
  const openEditEvent = (ev) => {
    setForm({ ...ev });
    setModal(true);
  };

  const saveBlog = async e => {
    e.preventDefault();
    try {
      const isNew = !blogForm.id;
      const payload = { 
        ...blogForm, 
        id: blogForm.id || Date.now(),
        date: blogForm.date || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      };
      
      const res = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setBlogModal(false);
        setBlogForm({ id: null, title: '', subtitle: '', author: '', image: '', content: '', date: '' });
        load();
      }
    } catch (e) {
      console.error(e);
      alert('Failed to save blog.');
    }
  };

  const openEditBlog = (blog) => {
    setBlogForm({ ...blog });
    setBlogModal(true);
  };
  const delBlog = async id => {
    if (confirm('Delete this blog post?')) {
      try {
        const res = await fetch(`/api/blogs?id=${id}`, { method: 'DELETE' });
        if (res.ok) load();
      } catch (e) {
        console.error(e);
        alert('Failed to delete blog.');
      }
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const compressed = await compressImage(file, 1200);
      setBlogForm(prev => ({ ...prev, image: compressed }));
    }
  };

  const handleWsImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const compressed = await compressImage(file, 1600);
      setWsForm(prev => ({ ...prev, featuredImg: compressed }));
    }
  };

  const handleWsGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      const compressed = await compressImage(file, 1200);
      setWsForm(prev => ({ ...prev, gallery: [...(prev.gallery || []), compressed] }));
    }
  };

  const handleCafeImage = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const compressed = await compressImage(file, 1000);
      setCafeForm(prev => ({ ...prev, image: compressed }));
    }
  };

  const handleMembershipImage = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      const compressed = await compressImage(file, 1200);
      setMembershipForm(prev => ({ ...prev, images: [...(prev.images || []), compressed] }));
    }
  };

  const [isSavingWs, setIsSavingWs] = useState(false);
  const saveWorkspace = async (e) => {
    e.preventDefault();
    if (isSavingWs) return;
    setIsSavingWs(true);
    try {
      const payload = { workspace_category: wsForm };
      if (wsForm.id) {
        await apiClient.put(`/api/admin/workspace_categories/${wsForm.id}`, payload);
      } else {
        await apiClient.post('/api/admin/workspace_categories', payload);
      }
      setWsModal(false);
      setWsForm(defaultWsForm());
      load();
    } catch (e) {
      console.error(e);
      alert('An error occurred while saving: ' + (e.message || 'Unknown error'));
    } finally {
      setIsSavingWs(false);
    }
  };

  const [couponForm, setCouponForm] = useState({ code: '', discount: 10, category: 'All' });
  const [couponModal, setCouponModal] = useState(false);
  const [marketingEmail, setMarketingEmail] = useState({ subject: '', content: '' });
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailPreviewModal, setEmailPreviewModal] = useState(false);

  const saveCoupon = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...couponForm, code: couponForm.code.toUpperCase() };
      const res = await apiClient.post('/api/coupons', payload);
      setCouponModal(false);
      setCouponForm({ code: '', discount: 10, category: 'All' });
      load();
    } catch (e) { console.error(e); alert('Failed to save coupon: ' + e.message); }
  };

  const delCoupon = async (id) => {
    try {
      await apiClient.delete(`/api/coupons?id=${id}`);
      load();
    } catch (e) { console.error(e); alert('Failed to delete coupon: ' + e.message); }
  };

  const toggleUserStatus = async (email) => {
    try {
      const user = d.users.find(u => u.email === email);
      if (!user) return;
      const newStatus = user.status === 'Disabled' ? 'Active' : 'Disabled';
      await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('seenhub_admin_token')}` },
        body: JSON.stringify({ email, status: newStatus })
      });
      load();
    } catch (e) { console.error(e); }
  };

  const deleteUser = async (email) => {
    const user = d.users.find(u => u.email === email);
    if (!user) return;
    try {
      await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('seenhub_admin_token')}` }
      });
      load();
    } catch (e) { console.error(e); }
  };

  const updatePrintingCredits = async (email, credits) => {
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: creditForm.name,
          email,
          category: 'printing',
          space: 'Credit Adjustment',
          printingCredits: parseFloat(credits),
          total: 0,
          status: 'Confirmed',
          date: new Date().toISOString().split('T')[0]
        })
      });
      if (res.ok) {
        alert('Credits adjusted successfully via booking record!');
        load();
      } else {
        alert('Failed to update credits.');
      }
    } catch (e) {
      console.error(e);
      alert('Error updating credits.');
    }
  };

  const [creditModal, setCreditModal] = useState(false);
  const [creditForm, setCreditForm] = useState({ email: '', name: '', credits: 0 });

  const openCreditModal = (user) => {
    setCreditForm({ email: user.email, name: user.name, credits: user.printingCredits || 0 });
    setCreditModal(true);
  };

  const cancelBooking = async (id) => {
    if (confirm('Are you sure you want to cancel this booking? This will free up the slot for others.')) {
      // Optimistic update: Update local state immediately
      const previousBookings = [...d.bookings];
      setD(prev => ({
        ...prev,
        bookings: prev.bookings.map(b => b.id === id ? { ...b, status: 'Cancelled' } : b)
      }));

      try {
        await apiClient.post('/api/bookings', { id, status: 'Cancelled' });
      } catch (e) {
        console.error(e);
        setD(prev => ({ ...prev, bookings: previousBookings }));
        alert('Failed to cancel booking.');
      }
    }
  };

  const delWorkspace = async id => {
    console.log("Delete workspace clicked for id:", id);
    try {
      const response = await apiClient.delete(`/api/admin/workspace_categories/${id}`);
      console.log("Delete response:", response);
      if (response && response.data) {
        setD(prev => ({ ...prev, workspaces: response.data }));
      } else {
        load();
      }
    } catch (e) {
      console.error(e);
      alert('An error occurred while deleting: ' + (e.message || 'Unknown error'));
    }
  };

  const openEditWorkspace = (ws) => {
    if (!ws || ws.preventDefault || typeof ws.preventDefault === 'function') {
      setWsForm(defaultWsForm());
    } else {
      setWsForm({ ...ws, pricing: ws.pricing || defaultWsForm().pricing, workingHours: ws.workingHours || defaultWsForm().workingHours, gallery: ws.gallery || [], unitQrPrefixes: ws.unitQrPrefixes || [] });
    }
    setWsTab('basic');
    setWsModal(true);
  };

  if (!authChecked) return <GlobalLoader />;

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ background: '#fff', padding: '3rem', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', width: '100%', maxWidth: '420px', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', background: '#fff', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', overflow: 'hidden', border: '1px solid #f1f5f9', padding: '8px' }}>
            {qrSettings.logo ? (
              <Image src={qrSettings.logo} alt="Logo" width={64} height={64} unoptimized style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <Lock size={32} color="#0f172a" />
            )}
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>Platform Admin</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 2rem' }}>Sign in to access your authorized modules.</p>

          <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@seenhub.ae" required style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', background: '#f8fafc', fontSize: '0.9rem' }} />
            </div>
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', background: '#f8fafc', fontSize: '0.9rem' }} />
            </div>
            {loginError && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '1rem', textAlign: 'center', background: '#fef2f2', padding: '0.5rem', borderRadius: '8px' }}>{loginError}</div>}
            <button type="submit" style={{ width: '100%', padding: '0.9rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(15,23,42,0.15)' }}>
              Secure Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Define full nav
  // Define grouped nav
  const groupedNav = [
    {
      group: 'Main Navigation',
      items: [
        { n: 'Dashboard', i: <LayoutDashboard size={16} /> }
      ]
    },
    {
      group: 'Analytics',
      items: [
        { n: 'Analytics', i: <BarChart3 size={16} />, sub: [{ n: 'User Analytics' }, { n: 'Membership Analytics' }, { n: 'Space Analytics' }, { n: 'Event Analytics' }, { n: 'Payment Analytics' }, { n: 'Email Analytics' }] }
      ]
    },
    {
      group: 'User Management',
      items: [
        { n: 'Admin Users', i: <Shield size={16} /> },
        { n: 'Accounts', i: <User size={16} /> }
      ]
    },
    {
      group: 'Operations',
      items: [
        { n: 'Events', i: <CalendarCheck size={16} /> },
        { n: 'Booking', i: <CalendarCheck size={16} />, sub: [{ n: 'All Bookings' }, { n: 'Workspace Booking' }, { n: 'Membership Booking' }, { n: 'Event Booking' }, { n: 'Locker Booking' }, { n: 'Printing Booking' }] },
        { n: 'Cafe', i: <Coffee size={16} /> }
      ]
    },
    {
      group: 'Catalog Management',
      items: [
        { n: 'Categories', i: <Layers size={16} /> },
        { n: 'Catalogs', i: <Smartphone size={16} />, sub: [{ n: 'Workspaces' }, { n: 'Memberships' }, { n: 'Events' }, { n: 'Lockers' }, { n: 'Coupons' }] }
      ]
    },
    {
      group: 'Content & Communication',
      items: [
        { n: 'Blogs', i: <BookOpen size={16} /> },
        { n: 'Landing page', i: <Smartphone size={16} /> },
        { n: 'Promo Popup', i: <Smartphone size={16} /> },
        { n: 'Messages', i: <MessageSquare size={16} /> }
      ]
    },
    {
      group: 'Finance',
      items: [
        { n: 'Invoices', i: <FileText size={16} /> },
        { n: 'Tax Rates', i: <Landmark size={16} /> }
      ]
    },
    {
      group: 'System Settings',
      items: [
        { n: 'Settings', i: <Settings size={16} /> },
        { n: 'Translations', i: <Languages size={16} /> },
        { n: 'QR Settings', i: <Smartphone size={16} /> },
        { n: 'Printing', i: <Printer size={16} /> }
      ]
    },

    {
      group: 'Marketing',
      items: [
        { n: 'Emails', i: <Mail size={16} /> },
        { n: 'SEO', i: <Smartphone size={16} /> },
        { n: 'Site Analytics', i: <BarChart3 size={16} /> }
      ]
    }
  ];

  // RBAC Navigation Filtering
  const filteredNav = groupedNav.map(group => ({
    ...group,
    items: currentAdmin.role === 'Super Admin' ? group.items : group.items.filter(item => item.n === 'Dashboard' || currentAdmin.permissions.includes(item.n))
  })).filter(group => group.items.length > 0);

  const analytTabs = ['User Analytics', 'Membership Analytics', 'Space Analytics', 'Event Analytics', 'Payment Analytics', 'Email Analytics'];
  const knownTabs = ['Dashboard', 'Accounts', 'Events', 'Blogs', 'Admin Users', 'Workspaces', 'Lockers', 'Coupons', 'Memberships', 'All Bookings', 'Workspace Booking', 'Membership Booking', 'Event Booking', 'Locker Booking', 'Printing Booking', 'QR Settings', 'Cafe', 'Invoices', 'Messages', 'Landing page', 'Promo Popup', 'Printing', 'Frequently Asked Questions', 'Terms And Conditions', 'Privacy Policies', 'Copyrights', 'Settings', 'Tax Rates', 'Emails', 'SEO', 'Site Analytics', ...analytTabs];
  const inp = { width: '100%', padding: '0.65rem 0.9rem', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box', background: '#f8fafc', fontFamily: 'inherit' };
  const customInp = { ...inp, backgroundColor: '#fff', border: '1px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', color: '#1e293b', transition: 'border-color 0.2s' };
  const customSelect = {
    ...customInp,
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 0.8rem center',
    backgroundSize: '1.2rem',
    cursor: 'pointer',
    paddingRight: '2.5rem'
  };

  const saveQrSettings = async (e) => {
    e.preventDefault();
    setSavingQr(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(qrSettings)
      });
      if (res.ok) {
        alert('Settings updated successfully!');
        setQrSettings(await res.json());
      }
    } catch (e) {
      console.error(e);
      alert('Failed to save settings.');
    } finally {
      setSavingQr(false);
    }
  };



  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter',system-ui,sans-serif" }}>
      <AdminSidebar 
        tab={tab} 
        setTab={setTab} 
        menus={menus} 
        toggle={toggle} 
        currentAdmin={currentAdmin} 
        handleLogout={handleLogout} 
        time={time} 
      />

      {/* MAIN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={S.hdr}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Admin / <strong style={{ color: '#0f172a' }}>{tab}</strong></div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}><Clock size={11} />{time.toLocaleTimeString()}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={load} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '0.4rem 0.65rem', cursor: 'pointer', color: '#64748b', display: 'flex' }}><RefreshCw size={15} /></button>
            <div onClick={() => setTab('My Profile')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.8rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 50, cursor: 'pointer' }}>
              <div style={{ width: 26, height: 26, background: currentAdmin.role === 'Super Admin' ? '#0f172a' : '#2563eb', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, overflow: 'hidden' }}>
                {currentAdmin.avatar_url ? (
                  <img src={currentAdmin.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  currentAdmin.name.charAt(0).toUpperCase()
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 4 }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', lineHeight: 1 }}>{currentAdmin.name}</span>
                <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>{currentAdmin.role}</span>
              </div>
            </div>
          </div>
        </header>

        <div style={S.content}>
          {tab === 'Dashboard' && <AnalyticsOverview stats={d.s} />}
          {tab === 'Dashboard' && (
            <div style={{ ...S.card, marginTop: '2rem' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Recent Activity</h2>
               </div>
               <table style={S.table}>
                  <thead><tr>{['ID', 'Category', 'Customer', 'Amount', 'Status'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {d.bookings.slice(0, 5).map((b, i) => (
                      <tr key={i}>
                        <td style={S.td}>{b.id ? b.id.slice(-6) : 'N/A'}</td>
                        <td style={S.td}>{b.category}</td>
                        <td style={S.td}>{b.name}</td>
                        <td style={S.td}>AED {b.total}</td>
                        <td style={S.td}><span style={S.badge}>{b.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          )}

          {tab === 'Workspaces' && (
            <WorkspaceManager 
              workspaces={d.workspaces} 
              openModal={openEditWorkspace} 
              deleteWorkspace={delWorkspace} 
              S={S} 
            />
          )}

          {['All Bookings', 'Workspace Booking', 'Membership Booking', 'Event Booking', 'Locker Booking'].includes(tab) && (
            <BookingManager 
              bookings={d.bookings} 
              openManualBooking={() => setManualBookingModal(true)} 
              openQrModal={setQrModal} 
              deleteBooking={cancelBooking} 
              S={S} 
            />
          )}

          {['User Analytics', 'Membership Analytics', 'Space Analytics', 'Event Analytics', 'Payment Analytics', 'Email Analytics'].includes(tab) && (
            <AnalyticsDetail 
              tab={tab} 
              siteStats={siteStats} 
              loadingStats={loadingStats} 
              fetchAnalytics={fetchAnalytics} 
              S={S} 
            />
          )}

          {tab === 'Lockers' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Locker Management</h1>
                  <p style={{ margin: '0.3rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>{d.lockers.length} total lockers configured on platform</p>
                </div>
                <button onClick={() => { setLockerForm({ id: null, code: '', name: '', status: 'AVAILABLE', price: 10 }); setLockerModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 10, padding: '0.7rem 1.4rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                  <Plus size={16} /> Add New Locker
                </button>
              </div>
              <div style={S.card}>
                <table style={S.table}>
                  <thead><tr>{['Locker ID', 'Locker Code', 'Name', 'Status', 'Daily Rate', 'Created At', 'Actions'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {d.lockers.map((lk, i) => (
                      <tr key={i}>
                        <td style={{ ...S.td, fontWeight: 700, color: '#0f172a' }}>{lk.id}</td>
                        <td style={S.td}>{lk.code}</td>
                        <td style={S.td}>{lk.name}</td>
                        <td style={S.td}>
                          <span style={{ 
                            ...S.badge, 
                            background: lk.status === 'AVAILABLE' ? '#f0fdf4' : '#fff7ed', 
                            color: lk.status === 'AVAILABLE' ? '#166534' : '#9a3412' 
                          }}>
                            {lk.status}
                          </span>
                        </td>
                        <td style={S.td}>AED {lk.price}</td>
                        <td style={S.td}>{lk.createdAt}</td>
                        <td style={{ ...S.td, display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => { setLockerForm(lk); setLockerModal(true); }} style={{ background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: 6, padding: '0.35rem 0.6rem', cursor: 'pointer', display: 'flex' }}><Edit size={14} /></button>
                          <button onClick={() => deleteLocker(lk.id)} style={{ background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: 6, padding: '0.35rem 0.6rem', cursor: 'pointer', display: 'flex' }}><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                    {!d.lockers.length && <tr><td colSpan={7} style={{ ...S.td, textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No lockers configured. Click &quot;Add New Locker&quot; to begin.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* EVENTS */}
          {tab === 'Events' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Event Management</h1>
                  <p style={{ margin: '0.3rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>{d.events.length} events scheduled on platform</p>
                </div>
                <button onClick={() => setModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 10, padding: '0.7rem 1.4rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                  <Plus size={16} /> Add New Event
                </button>
              </div>
              <div style={S.card}>
                <table style={S.table}>
                  <thead><tr>{['Event Title', 'Location', 'Type', 'Tickets', 'Price', 'Date', 'Status', 'Actions'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {d.events.map((ev, i) => (
                      <tr key={i}>
                        <td style={{ ...S.td, fontWeight: 700, color: '#0f172a' }}>{ev.title}</td>
                        <td style={S.td}>{ev.location || '—'}</td>
                        <td style={S.td}>{ev.eventType || '—'}</td>
                        <td style={S.td}>{ev.totalTickets || 30}</td>
                        <td style={S.td}>AED {ev.price || 0}</td>
                        <td style={S.td}>{ev.startDate || '—'}</td>
                        <td style={S.td}><span style={S.badge}>{ev.status}</span></td>
                        <td style={{ ...S.td, display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => openEditEvent(ev)} style={{ background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: 6, padding: '0.35rem 0.6rem', cursor: 'pointer', display: 'flex' }}><Edit size={14} /></button>
                          <button onClick={() => delEv(ev.id)} style={{ background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: 6, padding: '0.35rem 0.6rem', cursor: 'pointer', display: 'flex' }}><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                    {!d.events.length && <tr><td colSpan={8} style={{ ...S.td, textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No events yet. Click &quot;Add New Event&quot; to get started.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* BLOGS */}
          {tab === 'Blogs' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Blog Management</h1>
                  <p style={{ margin: '0.3rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>Manage and publish articles to the SeenHub platform</p>
                </div>
                <button onClick={() => setBlogModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 10, padding: '0.7rem 1.4rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                  <Plus size={16} /> Add New Blog
                </button>
              </div>
              <div style={S.card}>
                <table style={S.table}>
                  <thead><tr>{['Blog Title', 'Author', 'Date', 'Actions'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {d.blogs.map((b, i) => (
                      <tr key={i}>
                        <td style={{ ...S.td, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          {b.image && <Image src={b.image} alt={b.title} width={40} height={40} unoptimized style={{ borderRadius: 8, objectFit: 'cover' }} />}
                          {b.title}
                        </td>
                        <td style={S.td}>{b.author || 'SeenHub Admin'}</td>
                        <td style={S.td}>{b.date}</td>
                        <td style={S.td}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => openEditBlog(b)} style={{ background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: 6, padding: '0.35rem 0.6rem', cursor: 'pointer', display: 'flex' }}><Edit size={14} /></button>
                            <button onClick={() => delBlog(b.id)} style={{ background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: 6, padding: '0.35rem 0.6rem', cursor: 'pointer', display: 'flex' }}><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!d.blogs.length && <tr><td colSpan={4} style={{ ...S.td, textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No blogs published yet. Click &quot;Add New Blog&quot; to get started.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ACCOUNTS */}
          {tab === 'Accounts' && (
            <div>
              <h1 style={{ margin: '0 0 2rem', fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>User Accounts</h1>
              <div style={S.card}>
                <table style={S.table}>
                  <thead><tr>{['Name', 'Email', 'Status', 'Actions'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {d.users.map((u, i) => (
                      <tr key={i}>
                        <td style={{ ...S.td, fontWeight: 600, color: '#0f172a' }}>{u.name}</td>
                        <td style={S.td}>{u.email}</td>
                        <td style={S.td}>
                          <span style={{
                            ...S.badge,
                            background: u.status === 'Disabled' ? '#fef2f2' : '#f0fdf4',
                            color: u.status === 'Disabled' ? '#991b1b' : '#166534'
                          }}>
                            {u.status || 'Active'}
                          </span>
                        </td>
                        <td style={{ ...S.td, display: 'flex', gap: '0.75rem' }}>
                          <button
                            onClick={() => toggleUserStatus(u.email)}
                            style={{
                              background: u.status === 'Disabled' ? '#f0fdf4' : '#f8fafc',
                              color: u.status === 'Disabled' ? '#166534' : '#64748b',
                              border: '1px solid #e2e8f0', borderRadius: 8, padding: '0.4rem 0.8rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700
                            }}
                          >
                            {u.status === 'Disabled' ? 'Enable' : 'Disable'}
                          </button>
                          <button
                            onClick={() => deleteUser(u.email)}
                            style={{
                              background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: 8, padding: '0.4rem 0.8rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!d.users.length && <tr><td colSpan={4} style={{ ...S.td, textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No users registered.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAX RATES */}
          {tab === 'Tax Rates' && (
            <div>
              <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Tax Management</h1>
                <p style={{ margin: '0.3rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>Configure global tax settings for all transactions</p>
              </div>

              <div style={{ ...S.card, maxWidth: '600px' }}>
                <form onSubmit={saveQrSettings}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>Enable Tax</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Apply tax calculation at checkout</div>
                    </div>
                    <label style={{ position: 'relative', display: 'inline-block', width: 50, height: 26 }}>
                      <input 
                        type="checkbox" 
                        checked={qrSettings.taxEnabled} 
                        onChange={e => setQrSettings({ ...qrSettings, taxEnabled: e.target.checked })}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: qrSettings.taxEnabled ? '#0f172a' : '#cbd5e1', transition: '.4s', borderRadius: 34 }}>
                        <span style={{ position: 'absolute', height: 18, width: 18, left: qrSettings.taxEnabled ? 28 : 4, bottom: 4, backgroundColor: 'white', transition: '.4s', borderRadius: '50%' }}></span>
                      </span>
                    </label>
                  </div>

                  <div style={{ padding: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.6rem', textTransform: 'uppercase' }}>Tax Percentage (%)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <input 
                        type="number" 
                        step="0.1"
                        disabled={!qrSettings.taxEnabled}
                        value={qrSettings.taxPercentage} 
                        onChange={e => setQrSettings({ ...qrSettings, taxPercentage: parseFloat(e.target.value) })}
                        style={{ ...inp, width: '120px', fontSize: '1.1rem', fontWeight: 700, opacity: qrSettings.taxEnabled ? 1 : 0.5 }} 
                      />
                      <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#64748b' }}>%</span>
                    </div>
                    <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#64748b' }}>
                      {qrSettings.taxEnabled 
                        ? `A ${qrSettings.taxPercentage}% tax will be added to the subtotal of all bookings and credit purchases.`
                        : 'Tax is currently disabled. Subtotal will be the final total.'}
                    </p>
                  </div>

                  <div style={{ padding: '1.5rem', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                      type="submit" 
                      disabled={savingQr}
                      style={{ padding: '0.8rem 2rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', opacity: savingQr ? 0.7 : 1 }}
                    >
                      {savingQr ? 'Saving...' : 'Save Tax Settings'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}


          {tab === 'Printing' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Printing Management</h1>
                  <p style={{ margin: '0.3rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>Manage user printing credits and global service configuration</p>
                </div>
              </div>

              {/* Global Config Section */}
              <div style={{ ...S.card, marginBottom: '2rem', background: '#f8fafc', border: '1px dashed #cbd5e1' }}>
                <h3 style={{ margin: '0 0 1.5rem', fontSize: '1rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Settings size={18} /> Global Printing Configuration
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Page Ratio (Pages/Credit)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>1 Credit =</span>
                      <input type="number" step="0.5" value={qrSettings.printCreditToPageRatio} onChange={e => setQrSettings({ ...qrSettings, printCreditToPageRatio: parseFloat(e.target.value) })} style={{ ...inp, width: '80px' }} />
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Pages</span>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Min Top-up Amount (AED)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>AED</span>
                      <input type="number" step="0.5" value={qrSettings.printMinTopUp} onChange={e => setQrSettings({ ...qrSettings, printMinTopUp: parseFloat(e.target.value) })} style={{ ...inp, width: '100px' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>AED to Credit Ratio</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>1 AED =</span>
                      <input type="number" step="0.1" value={qrSettings.printAedToCreditRatio} onChange={e => setQrSettings({ ...qrSettings, printAedToCreditRatio: parseFloat(e.target.value) })} style={{ ...inp, width: '80px' }} />
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Credits</span>
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={saveQrSettings} disabled={savingQr} style={{ padding: '0.6rem 1.5rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>
                    {savingQr ? 'Saving...' : 'Update Config'}
                  </button>
                </div>
              </div>
              <div style={S.card}>
                <table style={S.table}>
                  <thead>
                    <tr>{['User Name', 'Email Address', 'Available Credits', 'Equivalent Pages', 'Actions'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {d.users.map((u, i) => {
                      const userBookings = d.bookings.filter(b => b.email && b.email.toLowerCase() === u.email.toLowerCase() && b.status === 'Confirmed');
                      const totalCredits = userBookings.reduce((acc, b) => {
                        const credits = Number(b.printingCredits) || (Number(b.printingBundles || 0) * 5);
                        return acc + credits;
                      }, 0);
                      const totalPages = totalCredits * (qrSettings.printCreditToPageRatio || 2);
                      
                      return (
                        <tr key={i}>
                          <td style={{ ...S.td, fontWeight: 700, color: '#0f172a' }}>{u.name}</td>
                          <td style={S.td}>{u.email}</td>
                          <td style={{ ...S.td, fontWeight: 800, color: '#0f172a' }}>
                             <span style={{ background: '#fef3c7', padding: '0.3rem 0.6rem', borderRadius: '6px', color: '#92400e' }}>
                               {totalCredits.toFixed(1).replace('.0', '')} Credits
                             </span>
                          </td>
                          <td style={S.td}>{totalPages.toFixed(0)} Pages</td>
                          <td style={S.td}>
                            <button 
                              onClick={() => openCreditModal(u)}
                              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 8, padding: '0.5rem 1rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                            >
                              <Edit size={14} /> Adjust Credits
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {!d.users.length && <tr><td colSpan={5} style={{ ...S.td, textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No users found.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'SEO' && (
            <SEOManager 
              seoData={seoData} 
              setSeoData={setSeoData} 
              seoCategory={seoCategory} 
              setSeoCategory={setSeoCategory} 
              saveSeo={saveSeo} 
              savingSeo={savingSeo} 
              inp={inp} 
              S={S} 
            />
          )}
          {tab === 'Site Analytics' && (
            <AnalyticsDetail 
              tab={tab} 
              siteStats={siteStats} 
              loadingStats={loadingStats} 
              fetchAnalytics={fetchAnalytics} 
              S={S} 
            />
          )}

          {/* GLOBAL SETTINGS */}
          {tab === 'Settings' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Global Settings</h1>
                  <p style={{ margin: '0.3rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>Manage website logo, contact info, and footer configuration</p>
                </div>
                <button onClick={saveQrSettings} disabled={savingQr} style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '0.75rem 2rem', borderRadius: 10, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(15,23,42,0.15)', opacity: savingQr ? 0.7 : 1 }}>
                  {savingQr ? 'Saving...' : 'Save All Changes'}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Logo & Contact */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <div style={S.card}>
                    <h3 style={{ margin: '0 0 1.5rem', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Website Branding</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                      <div style={{ width: '120px', height: '120px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        <Image src={qrSettings.logo} alt="Logo Preview" width={120} height={120} unoptimized style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>Upload Logo</label>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const compressed = await compressImage(file, 800);
                              setQrSettings({ ...qrSettings, logo: compressed });
                            }
                          }}
                          style={{ fontSize: '0.8rem', color: '#64748b' }}
                        />
                        <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.5rem' }}>Recommended size: 200x60px (PNG or SVG)</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginTop: '2rem', borderTop: '1px solid #f1f5f9', paddingTop: '2rem' }}>
                      <div style={{ width: '120px', height: '120px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        <Image src={qrSettings.favicon || '/icon.png'} alt="Favicon Preview" width={64} height={64} unoptimized style={{ width: '64px', height: '64px', objectFit: 'contain' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>Upload Favicon (Tab Icon)</label>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const compressed = await compressImage(file, 128); // Smaller for favicon
                              setQrSettings({ ...qrSettings, favicon: compressed });
                            }
                          }}
                          style={{ fontSize: '0.8rem', color: '#64748b' }}
                        />
                        <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.5rem' }}>Square image (1:1 ratio) recommended for best results.</p>
                      </div>
                    </div>
                  </div>

                  <div style={S.card}>
                    <h3 style={{ margin: '0 0 1.5rem', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Support Contact Info</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>WhatsApp Number</label>
                        <input type="text" value={qrSettings.contactWhatsApp} onChange={e => setQrSettings({ ...qrSettings, contactWhatsApp: e.target.value })} style={inp} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>Phone Number</label>
                        <input type="text" value={qrSettings.contactPhone} onChange={e => setQrSettings({ ...qrSettings, contactPhone: e.target.value })} style={inp} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>Support Email</label>
                        <input type="text" value={qrSettings.contactEmail} onChange={e => setQrSettings({ ...qrSettings, contactEmail: e.target.value })} style={inp} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>Website URL</label>
                        <input type="text" value={qrSettings.websiteUrl} onChange={e => setQrSettings({ ...qrSettings, websiteUrl: e.target.value })} style={inp} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Timing & Social */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <div style={S.card}>
                    <h3 style={{ margin: '0 0 1.5rem', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Business Timing (Footer)</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {(qrSettings.openingHours || []).map((h, i) => (
                        <div key={i} style={{ display: 'flex', gap: '1rem' }}>
                          <input type="text" value={h.days} onChange={e => {
                            const newHours = [...qrSettings.openingHours];
                            newHours[i].days = e.target.value;
                            setQrSettings({ ...qrSettings, openingHours: newHours });
                          }} style={{ ...inp, flex: 1 }} placeholder="Days (e.g. Mon-Fri)" />
                          <input type="text" value={h.time} onChange={e => {
                            const newHours = [...qrSettings.openingHours];
                            newHours[i].time = e.target.value;
                            setQrSettings({ ...qrSettings, openingHours: newHours });
                          }} style={{ ...inp, flex: 1 }} placeholder="Time (e.g. 8AM-10PM)" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={S.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Social Media Links</h3>
                      <button 
                        onClick={() => {
                          const newLinks = [...(qrSettings.socialLinks || []), { platform: '', url: '', icon: '' }];
                          setQrSettings({ ...qrSettings, socialLinks: newLinks });
                        }}
                        style={{ padding: '0.4rem 0.8rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', color: '#0f172a' }}
                      >
                        + Add New Link
                      </button>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      {(qrSettings.socialLinks || []).map((s, i) => (
                        <div key={i} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-start', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                          
                          {/* Icon Upload & Preview */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                            <div style={{ width: '40px', height: '40px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                              {s.icon ? (
                                <Image src={s.icon} alt="icon" width={40} height={40} unoptimized style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                              ) : (
                                <span style={{ fontSize: '0.6rem', color: '#94a3b8' }}>No Icon</span>
                              )}
                            </div>
                            <label style={{ cursor: 'pointer', background: '#0f172a', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                              Upload
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={async (e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    const compressed = await compressImage(file, 64);
                                    const newLinks = [...qrSettings.socialLinks];
                                    newLinks[i].icon = compressed;
                                    setQrSettings({ ...qrSettings, socialLinks: newLinks });
                                  }
                                }} 
                                style={{ display: 'none' }} 
                              />
                            </label>
                          </div>

                          {/* Inputs */}
                          <div style={{ flex: 1, minWidth: '150px' }}>
                            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#64748b', marginBottom: '0.3rem' }}>Platform Name</label>
                            <input 
                              type="text" 
                              value={s.platform} 
                              onChange={e => {
                                const newLinks = [...qrSettings.socialLinks];
                                newLinks[i].platform = e.target.value;
                                setQrSettings({ ...qrSettings, socialLinks: newLinks });
                              }} 
                              style={{ ...inp, padding: '0.4rem 0.6rem' }} 
                              placeholder="e.g. Facebook" 
                            />
                          </div>

                          <div style={{ flex: 2, minWidth: '200px' }}>
                            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#64748b', marginBottom: '0.3rem' }}>Profile Link (URL)</label>
                            <input 
                              type="text" 
                              value={s.url} 
                              onChange={e => {
                                const newLinks = [...qrSettings.socialLinks];
                                newLinks[i].url = e.target.value;
                                setQrSettings({ ...qrSettings, socialLinks: newLinks });
                              }} 
                              style={{ ...inp, padding: '0.4rem 0.6rem' }} 
                              placeholder="https://..." 
                            />
                          </div>

                          {/* Remove */}
                          <button 
                            onClick={() => {
                              const newLinks = qrSettings.socialLinks.filter((_, idx) => idx !== i);
                              setQrSettings({ ...qrSettings, socialLinks: newLinks });
                            }}
                            style={{ padding: '0.4rem', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '1.2rem' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      
                      {(!qrSettings.socialLinks || qrSettings.socialLinks.length === 0) && (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.85rem', border: '2px dashed #e2e8f0', borderRadius: '12px' }}>
                          No social links added. Click &quot;+ Add New Link&quot; to start.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* COUPONS */}
          {tab === 'Coupons' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Coupon Codes</h1>
                  <p style={{ margin: '0.3rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>Create and manage discount codes for your customers.</p>
                </div>
                <button onClick={() => setCouponModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#0f172a', color: '#fff', border: 'none', padding: '0.75rem 1.25rem', borderRadius: 10, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(15,23,42,0.15)' }}>
                  <Tag size={16} /> Create Coupon
                </button>
              </div>
              <div style={S.card}>
                <table style={S.table}>
                  <thead><tr>{['Code', 'Discount', 'Category', 'Status', 'Actions'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {(d.coupons || []).map((c, i) => (
                      <tr key={i}>
                        <td style={{ ...S.td, fontWeight: 800, color: '#0f172a', letterSpacing: '0.5px' }}>{c.code}</td>
                        <td style={S.td}><span style={{ color: '#16a34a', fontWeight: 700 }}>{c.discount}% OFF</span></td>
                        <td style={S.td}><span style={{ color: '#64748b', fontWeight: 600 }}>{c.category || 'All'}</span></td>
                        <td style={S.td}><span style={S.badge}>Active</span></td>
                        <td style={S.td}>
                          <button onClick={() => delCoupon(c.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px' }} title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!d.coupons?.length && <tr><td colSpan={4} style={{ ...S.td, textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No coupon codes found. Click &quot;Create Coupon&quot; to add one.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MARKETING EMAILS */}
          {tab === 'Emails' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Email Marketing</h1>
                  <p style={{ margin: '0.3rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>Send broadcast emails to all {d.users.length} registered users</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    onClick={() => setEmailPreviewModal(true)}
                    style={{ background: '#f1f5f9', color: '#0f172a', border: '1px solid #e2e8f0', padding: '0.75rem 1.5rem', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}
                  >
                    Preview Template
                  </button>
                  <button 
                    onClick={async () => {
                    if (!marketingEmail.subject || !marketingEmail.content) {
                      alert("Please fill in both subject and content.");
                      return;
                    }
                    if (!confirm(`Are you sure you want to send this email to ${d.users.length} users?`)) return;
                    
                    setSendingEmail(true);
                    
                    const emailHtml = `
                      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
                        <div style="background: #f8fafc; padding: 40px 20px; text-align: center; border-bottom: 1px solid #e2e8f0;">
                          <img src="${qrSettings.logo.startsWith('data:') ? qrSettings.logo : window.location.origin + qrSettings.logo}" alt="SeenHub" style="max-height: 70px; width: auto;" />
                        </div>
                        <div style="padding: 40px 30px; color: #1e293b; line-height: 1.6; font-size: 16px;">
                          ${marketingEmail.content}
                        </div>
                        <div style="background: #0f172a; padding: 40px 30px; color: #ffffff; text-align: center;">
                          <h4 style="margin: 0 0 15px; font-size: 18px; color: #ffffff;">Stay Connected</h4>
                          <p style="margin: 0 0 10px; font-size: 14px; opacity: 0.8;">${qrSettings.contactPhone} | ${qrSettings.contactEmail}</p>
                          <p style="margin: 0 0 20px; font-size: 14px; opacity: 0.8;">${qrSettings.websiteUrl}</p>
                          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 12px; opacity: 0.6;">
                            &copy; 2026 SeenHub Business Hub. All rights reserved.
                          </div>
                        </div>
                      </div>
                    `;

                    // Simulate API call for sending emails
                    setTimeout(() => {
                      setSendingEmail(false);
                      setMarketingEmail({ subject: '', content: '' });
                      alert(`Successfully sent broadcast to ${d.users.length} users!`);
                      console.log("Broadcast Subject:", marketingEmail.subject);
                      console.log("Broadcast HTML:", emailHtml);
                    }, 2000);
                  }}
                  disabled={sendingEmail}
                  style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '0.75rem 2rem', borderRadius: 10, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(15,23,42,0.15)', opacity: sendingEmail ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Mail size={18} /> {sendingEmail ? 'Sending Broadcast...' : 'Send Broadcast Now'}
                </button>
              </div>
            </div>

            <div style={S.card}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Email Subject</label>
                  <input 
                    type="text" 
                    value={marketingEmail.subject} 
                    onChange={e => setMarketingEmail({ ...marketingEmail, subject: e.target.value })} 
                    placeholder="Enter email subject line..." 
                    style={inp} 
                  />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Message Template</label>
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
                    <RichTextEditor 
                      value={marketingEmail.content} 
                      onChange={val => setMarketingEmail({ ...marketingEmail, content: val })} 
                    />
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 12, border: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.8rem', marginBottom: '2rem' }}>
                   <strong>Pro Tip:</strong> You can use standard HTML formatting in the editor. Your email will be sent to all users listed in the Accounts section.
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '2rem' }}>
                  <h3 style={{ margin: '0 0 1.5rem', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Email Template Branding (Header & Footer)</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <div style={{ width: '100px', height: '40px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {qrSettings.logo ? (
                          <Image src={qrSettings.logo} alt="Logo" width={100} height={40} unoptimized style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        ) : (
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>No Logo</span>
                        )}
                      </div>
                      <button 
                        type="button"
                        onClick={() => setTab('Settings')}
                        style={{ display: 'inline-block', padding: '0.5rem 1rem', background: '#0f172a', color: '#fff', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', border: 'none' }}
                      >
                        Manage in Settings
                      </button>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.4rem' }}>Footer Phone</label>
                        <input type="text" value={qrSettings.contactPhone} onChange={e => setQrSettings({ ...qrSettings, contactPhone: e.target.value })} style={inp} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.4rem' }}>Footer Email</label>
                        <input type="text" value={qrSettings.contactEmail} onChange={e => setQrSettings({ ...qrSettings, contactEmail: e.target.value })} style={inp} />
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.4rem' }}>Footer Website URL</label>
                        <input type="text" value={qrSettings.websiteUrl} onChange={e => setQrSettings({ ...qrSettings, websiteUrl: e.target.value })} style={inp} />
                      </div>
                      <div style={{ gridColumn: 'span 2', textAlign: 'right', marginTop: '0.5rem' }}>
                        <button 
                          onClick={saveQrSettings}
                          disabled={savingQr}
                          style={{ padding: '0.6rem 1.5rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', color: '#0f172a' }}
                        >
                          {savingQr ? 'Saving Branding...' : 'Update Email Branding'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'QR Settings' && (
            <div style={{ maxWidth: 1100 }}>
              <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>QR Access Settings</h1>
                <p style={{ margin: '0.3rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>Configure the QR code prefix and generation rules for gate access.</p>
              </div>

              <div style={S.card}>
                <form onSubmit={saveQrSettings}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '3rem', alignItems: 'start' }}>
                    
                    {/* LEFT COLUMN: Global Settings */}
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.5rem' }}>Global & Default Settings</h3>
                      
                      <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Gate Prefix / QR Starting Digits</label>
                    <input
                      type="text"
                      value={qrSettings.qrPrefix}
                      onChange={e => setQrSettings(prev => ({ ...prev, qrPrefix: e.target.value }))}
                      placeholder="e.g. 920002"
                      style={inp}
                    />
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>The QR will follow the format: <strong>Prefix-RANDOMWORDS</strong> (e.g. {qrSettings.qrPrefix}-FFZVUQGAKH).</p>
                  </div>

                  <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Total QR Code Length</label>
                    <input
                      type="number"
                      value={qrSettings.qrTotalLength}
                      onChange={e => setQrSettings(prev => ({ ...prev, qrTotalLength: parseInt(e.target.value) }))}
                      placeholder="e.g. 10"
                      style={inp}
                    />
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>The total number of digits in the QR code string.</p>
                  </div>

                  <div style={{ marginTop: '2.5rem' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Membership & Event Defaults</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.4rem' }}>Global Membership Prefix</label>
                        <input 
                          type="text" 
                          value={qrSettings.membershipPrefix || ''} 
                          onChange={e => setQrSettings(prev => ({ ...prev, membershipPrefix: e.target.value }))}
                          placeholder="91"
                          style={inp}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.4rem' }}>Global Event Prefix</label>
                        <input 
                          type="text" 
                          value={qrSettings.eventPrefix || ''} 
                          onChange={e => setQrSettings(prev => ({ ...prev, eventPrefix: e.target.value }))}
                          placeholder="93"
                          style={inp}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: Category Overrides */}
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.5rem' }}>Workspace Specific Prefixes</h3>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '1.5rem', marginTop: '-1rem' }}>Assign a unique starting prefix to each individual unit. When a booking is confirmed, its QR code will start with that unit's prefix instead of the global default.</p>
                  
                  <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {/* Workspace & Unit Prefixes */}
                    <div>
                      {d.workspaces.map(ws => (
                          <div key={ws.id} style={{ marginBottom: '2rem', padding: '1rem', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{ws.title}</span>
                              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>({ws.units || 1} unit{(ws.units || 1) > 1 ? 's' : ''})</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '0.75rem' }}>
                              {ws.unitNames && ws.unitNames.length > 0 ? (
                                ws.unitNames.map((unitName, idx) => (
                                  <div key={idx}>
                                    <label style={{ display: 'block', fontSize: '0.72rem', color: '#475569', marginBottom: '0.35rem', fontWeight: 600 }}>{unitName}</label>
                                    <input 
                                      type="text" 
                                      value={qrSettings.unitPrefixes?.[ws.title]?.[unitName] || ''} 
                                      onChange={e => setQrSettings(prev => ({
                                        ...prev,
                                        unitPrefixes: {
                                          ...(prev.unitPrefixes || {}),
                                          [ws.title]: {
                                            ...((prev.unitPrefixes || {})[ws.title] || {}),
                                            [unitName]: e.target.value
                                          }
                                        }
                                      }))}
                                      placeholder={`e.g. 92${String(idx + 1).padStart(2, '0')}`}
                                      style={{ ...inp, fontSize: '0.8rem' }}
                                    />
                                  </div>
                                ))
                              ) : (
                                // Fallback: workspace has no named units, show unit index inputs
                                Array.from({ length: ws.units || 1 }, (_, idx) => (
                                  <div key={idx}>
                                    <label style={{ display: 'block', fontSize: '0.72rem', color: '#475569', marginBottom: '0.35rem', fontWeight: 600 }}>Unit {idx + 1}</label>
                                    <input 
                                      type="text" 
                                      value={qrSettings.unitPrefixes?.[ws.title]?.[`Unit ${idx + 1}`] || ''} 
                                      onChange={e => setQrSettings(prev => ({
                                        ...prev,
                                        unitPrefixes: {
                                          ...(prev.unitPrefixes || {}),
                                          [ws.title]: {
                                            ...((prev.unitPrefixes || {})[ws.title] || {}),
                                            [`Unit ${idx + 1}`]: e.target.value
                                          }
                                        }
                                      }))}
                                      placeholder={`e.g. 92${String(idx + 1).padStart(2, '0')}`}
                                      style={{ ...inp, fontSize: '0.8rem' }}
                                    />
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div> {/* End of 2-column grid */}

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem', marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    disabled={savingQr}
                    style={{ background: '#0f172a', color: '#fff', border: 'none', borderRadius: 10, padding: '0.8rem 1.5rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  >
                    {savingQr ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </form>
            </div>

              <div style={{ marginTop: '2rem', background: '#eff6ff', padding: '1.5rem', borderRadius: 16, border: '1px solid #dbeafe', color: '#1e40af' }}>
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', fontWeight: 700 }}>Integration Info</h3>
                <p style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.5 }}>
                  The unique QR data generated for each customer is saved in their booking details.
                  When a customer scans their QR at the gate, the reader should verify the prefix <strong>{qrSettings.qrPrefix}</strong> and the random ID against your active membership database.
                </p>
              </div>
            </div>
          )}

          {/* CAFE */}
          {tab === 'Cafe' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Cafe Management</h1>
                  <p style={{ margin: '0.3rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>Manage categories, products and view cafe invoices</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={() => { setCafeForm({ id: null, type: 'Category', name: '' }); setCafeModal(true); }} style={{ background: '#fff', color: '#0f172a', border: '1px solid #e2e8f0', padding: '0.7rem 1.4rem', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>+ Category</button>
                  <button onClick={() => { setCafeForm({ id: null, type: 'Product', name: '', category: '', price: 0, image: '', description: '' }); setCafeModal(true); }} style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '0.7rem 1.4rem', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>+ Product</button>
                </div>
              </div>

              {/* Sub Tabs */}
              <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                {['Products', 'Categories', 'Invoices'].map(st => (
                  <button
                    key={st}
                    onClick={() => setCafeSubTab(st)}
                    style={{
                      padding: '0.75rem 0',
                      background: 'none',
                      border: 'none',
                      borderBottom: cafeSubTab === st ? '2px solid #d88906' : '2px solid transparent',
                      color: cafeSubTab === st ? '#0f172a' : '#94a3b8',
                      fontWeight: cafeSubTab === st ? 800 : 600,
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Products View */}
              {cafeSubTab === 'Products' && (
                <div style={{ ...S.card, overflowX: 'auto' }}>
                  <table style={{ ...S.table, minWidth: 600 }}>
                    <thead><tr>{['Image', 'Product Name', 'Category', 'Price', 'Actions'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                    <tbody>
                      {d.cafeProducts.map((p, i) => (
                        <tr key={i}>
                          <td style={S.td}>{p.image ? <Image src={p.image} width={40} height={40} unoptimized style={{ borderRadius: 8, objectFit: 'cover' }} alt={p.name} /> : <div style={{ width: 40, height: 40, background: '#f1f5f9', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Coffee size={18} color="#94a3b8" /></div>}</td>
                          <td style={{ ...S.td, fontWeight: 700 }}>{p.name}</td>
                          <td style={S.td}>{p.category}</td>
                          <td style={S.td}>AED {p.price}</td>
                          <td style={{ ...S.td, display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => { setCafeForm({ ...p, type: 'Product' }); setCafeModal(true); }} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.35rem 0.6rem', borderRadius: 6, cursor: 'pointer' }}><Edit size={14} /></button>
                            <button onClick={() => delCafeItem(p.id, 'Product')} style={{ background: '#fef2f2', border: 'none', color: '#dc2626', padding: '0.35rem 0.6rem', borderRadius: 6, cursor: 'pointer' }}><Trash2 size={14} /></button>
                          </td>
                        </tr>
                      ))}
                      {!d.cafeProducts.length && <tr><td colSpan={5} style={{ ...S.td, textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>No products added yet. Click &quot;+ Product&quot; to begin.</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Categories View */}
              {cafeSubTab === 'Categories' && (
                <div style={{ ...S.card, overflowX: 'auto' }}>
                  <table style={{ ...S.table, minWidth: 600 }}>
                    <thead><tr>{['Category Name', 'Actions'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                    <tbody>
                      {d.cafeCategories.map((c, i) => (
                        <tr key={i}>
                          <td style={{ ...S.td, fontWeight: 700 }}>{c.name}</td>
                          <td style={{ ...S.td, display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => { setCafeForm({ ...c, type: 'Category' }); setCafeModal(true); }} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.35rem 0.6rem', borderRadius: 6, cursor: 'pointer' }}><Edit size={14} /></button>
                            <button onClick={() => delCafeItem(c.id, 'Category')} style={{ background: '#fef2f2', border: 'none', color: '#dc2626', padding: '0.35rem 0.6rem', borderRadius: 6, cursor: 'pointer' }}><Trash2 size={14} /></button>
                          </td>
                        </tr>
                      ))}
                      {!d.cafeCategories.length && <tr><td colSpan={2} style={{ ...S.td, textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>No categories created yet.</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}
              {/* Cafe Invoices - Always at bottom */}
              <div style={{ marginTop: '3rem' }}>
                <h2 style={{ margin: '0 0 1.25rem', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Recent Cafe Invoices</h2>
                <div style={S.card}>
                  <table style={S.table}>
                    <thead><tr>{['Invoice ID', 'Customer', 'Date', 'Total', 'Status', 'Actions'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                    <tbody>
                      {d.cafeInvoices.map((inv, i) => (
                        <tr key={i}>
                          <td style={{ ...S.td, fontWeight: 700 }}>{inv.id}</td>
                          <td style={S.td}>{inv.customerName}</td>
                          <td style={S.td}>{inv.date}</td>
                          <td style={S.td}>AED {inv.total}</td>
                          <td style={S.td}><span style={S.badge}>{inv.status}</span></td>
                          <td style={S.td}><button style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.35rem 0.6rem', borderRadius: 6, cursor: 'pointer' }}><FileText size={14} /></button></td>
                        </tr>
                      ))}
                      {!d.cafeInvoices.length && <tr><td colSpan={6} style={{ ...S.td, textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>No cafe invoices recorded.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* LANDING PAGE */}
          {tab === 'Landing page' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Website Content</h1>
                  <p style={{ margin: '0.3rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>Manage the sections of your main website.</p>
                </div>
              </div>

              {/* Sub Tabs */}
              <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                {['Home', 'About Us', 'FAQ', 'Legal'].map(st => (
                  <button
                    key={st}
                    onClick={() => setLandingSubTab(st)}
                    style={{
                      padding: '0.75rem 0.5rem',
                      background: 'none',
                      border: 'none',
                      borderBottom: landingSubTab === st ? '2px solid #0f172a' : '2px solid transparent',
                      color: landingSubTab === st ? '#0f172a' : '#94a3b8',
                      fontWeight: landingSubTab === st ? 700 : 500,
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      transition: 'all 0.2s'
                    }}
                  >{st}</button>
                ))}
              </div>

              <form onSubmit={saveLandingPage} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {landingSubTab === 'Home' && (
                  <>
                    {/* Hero Section */}
                    <div style={S.card}>
                      <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>Hero Section</h2>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div>
                          <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Main Title</label>
                            <input value={landingForm.heroTitle} onChange={e => setLandingForm({ ...landingForm, heroTitle: e.target.value })} style={inp} />
                          </div>
                          <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Sub-title</label>
                            <textarea rows={2} value={landingForm.heroSubtitle} onChange={e => setLandingForm({ ...landingForm, heroSubtitle: e.target.value })} style={{ ...inp, resize: 'none' }} />
                          </div>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Hero Background Image</label>
                          <div
                            onClick={() => { landingFileRef.current.dataset.field = 'heroImage'; landingFileRef.current.click(); }}
                            style={{ height: '140px', border: '2px dashed #e2e8f0', borderRadius: 12, background: landingForm.heroImage ? '#000' : '#f8fafc', overflow: 'hidden', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
                          >
                            {landingForm.heroImage ? <Image src={landingForm.heroImage} alt="Hero Background" fill unoptimized style={{ objectFit: 'cover', opacity: 0.6 }} /> : <Upload size={24} color="#94a3b8" />}
                            <div style={{ position: 'absolute', color: landingForm.heroImage ? '#fff' : '#64748b', fontSize: '0.8rem', fontWeight: 700 }}>Click to Upload</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Intro Quote */}
                    <div style={S.card}>
                      <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>Intro Quote Section</h2>
                      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Homepage Quote</label>
                          <textarea rows={4} value={landingForm.aboutQuote} onChange={e => setLandingForm({ ...landingForm, aboutQuote: e.target.value })} style={{ ...inp, resize: 'vertical' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Intro Image</label>
                          <div
                            onClick={() => { landingFileRef.current.dataset.field = 'aboutImage'; landingFileRef.current.click(); }}
                            style={{ height: '120px', border: '2px dashed #e2e8f0', borderRadius: 12, background: landingForm.aboutImage ? '#000' : '#f8fafc', overflow: 'hidden', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
                          >
                            {landingForm.aboutImage ? <Image src={landingForm.aboutImage} alt="About Section" fill unoptimized style={{ objectFit: 'cover', opacity: 0.6 }} /> : <Upload size={24} color="#94a3b8" />}
                            <div style={{ position: 'absolute', color: landingForm.aboutImage ? '#fff' : '#64748b', fontSize: '0.8rem', fontWeight: 700 }}>Click to Upload</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {landingSubTab === 'About Us' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={S.card}>
                      <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>1. Who We Are (Intro)</h2>
                      <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Main Heading</label>
                        <input value={landingForm.aboutTitle} onChange={e => setLandingForm({ ...landingForm, aboutTitle: e.target.value })} style={inp} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Intro Description</label>
                        <textarea rows={4} value={landingForm.aboutDescription} onChange={e => setLandingForm({ ...landingForm, aboutDescription: e.target.value })} style={{ ...inp, resize: 'vertical' }} />
                      </div>
                    </div>

                    <div style={S.card}>
                      <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>2. Three Pillars</h2>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                        {(landingForm.aboutPillars || []).map((p, i) => (
                          <div key={i} style={{ background: '#f8fafc', padding: '1rem', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                            <input value={p.t} onChange={e => {
                              const newP = [...landingForm.aboutPillars];
                              newP[i].t = e.target.value;
                              setLandingForm({ ...landingForm, aboutPillars: newP });
                            }} style={{ ...inp, marginBottom: '0.5rem', fontWeight: 700 }} />
                            <textarea rows={3} value={p.d} onChange={e => {
                              const newP = [...landingForm.aboutPillars];
                              newP[i].d = e.target.value;
                              setLandingForm({ ...landingForm, aboutPillars: newP });
                            }} style={{ ...inp, fontSize: '0.8rem', resize: 'none' }} />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={S.card}>
                      <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>3. Visionary Quote</h2>
                      <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Quote Heading (Title)</label>
                        <input value={landingForm.aboutQuoteTitle} onChange={e => setLandingForm({ ...landingForm, aboutQuoteTitle: e.target.value })} style={inp} />
                      </div>
                      <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Quote Text</label>
                        <textarea rows={3} value={landingForm.aboutQuoteText} onChange={e => setLandingForm({ ...landingForm, aboutQuoteText: e.target.value })} style={{ ...inp, fontStyle: 'italic' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Author Name</label>
                        <input value={landingForm.aboutQuoteAuthor} onChange={e => setLandingForm({ ...landingForm, aboutQuoteAuthor: e.target.value })} style={inp} />
                      </div>
                    </div>

                    <div style={S.card}>
                      <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>4. Vision & Mission</h2>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Our Vision</label>
                          <textarea rows={4} value={landingForm.aboutVision} onChange={e => setLandingForm({ ...landingForm, aboutVision: e.target.value })} style={inp} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Our Mission</label>
                          <textarea rows={4} value={landingForm.aboutMission} onChange={e => setLandingForm({ ...landingForm, aboutMission: e.target.value })} style={inp} />
                        </div>
                      </div>
                    </div>

                    <div style={S.card}>
                      <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>5. What We Offer</h2>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Section Image</label>
                          <div
                            onClick={() => { landingFileRef.current.dataset.field = 'aboutOfferImage'; landingFileRef.current.click(); }}
                            style={{ height: '200px', border: '2px dashed #e2e8f0', borderRadius: 12, background: landingForm.aboutOfferImage ? '#000' : '#f8fafc', overflow: 'hidden', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
                          >
                            {landingForm.aboutOfferImage ? <Image src={landingForm.aboutOfferImage} alt="Offer Section" fill unoptimized style={{ objectFit: 'cover', opacity: 0.6 }} /> : <Upload size={24} color="#94a3b8" />}
                            <div style={{ position: 'absolute', color: landingForm.aboutOfferImage ? '#fff' : '#64748b', fontSize: '0.8rem', fontWeight: 700 }}>Click to Upload</div>
                          </div>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Features List (comma separated)</label>
                          <textarea rows={8} value={(landingForm.aboutOfferList || []).join(', ')} onChange={e => setLandingForm({ ...landingForm, aboutOfferList: e.target.value.split(',').map(s => s.trim()) })} style={inp} />
                        </div>
                      </div>
                    </div>

                    <div style={S.card}>
                      <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>6. Final Note</h2>
                      <textarea rows={3} value={landingForm.aboutFinalNote} onChange={e => setLandingForm({ ...landingForm, aboutFinalNote: e.target.value })} style={inp} />
                    </div>
                  </div>
                )}

                {landingSubTab === 'FAQ' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Frequently Asked Questions</h2>
                      <button type="button" onClick={() => { setFaqForm({ id: null, question: '', answer: '' }); setFaqModal(true); }} style={{ background: '#0f172a', color: '#fff', border: 'none', borderRadius: 8, padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}>
                        <Plus size={14} style={{ marginRight: '0.4rem' }} /> Add FAQ
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {(landingForm.faqs || []).map((f, i) => (
                        <div key={i} style={{ ...S.card, padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderLeft: '4px solid #d88906' }}>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem', marginBottom: '0.5rem' }}>Q: {f.question}</h4>
                            <p style={{ color: '#475569', fontSize: '0.85rem', lineHeight: 1.6, background: '#f8fafc', padding: '1rem', borderRadius: 8 }}>A: {f.answer}</p>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1.5rem' }}>
                            <button type="button" onClick={() => { setFaqForm(f); setFaqModal(true); }} style={{ background: '#f1f5f9', color: '#0f172a', border: 'none', borderRadius: 6, padding: '0.5rem', cursor: 'pointer' }}><Edit size={14} /></button>
                            <button type="button" onClick={() => deleteFaq(f.id)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, padding: '0.5rem', cursor: 'pointer' }}><Trash2 size={14} /></button>
                          </div>
                        </div>
                      ))}
                      {(landingForm.faqs || []).length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94a3b8', background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                          <HelpCircle size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                          <p>No FAQs found. Add one to get started.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {landingSubTab === 'Legal' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {['terms', 'privacy', 'copyrights'].map(type => (
                      <div key={type} style={S.card}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', textTransform: 'capitalize' }}>{type.replace(/([A-Z])/g, ' $1').trim()}</h2>
                          <button 
                            type="button"
                            className="save-btn" 
                            onClick={() => saveLegal(type, landingForm.legal?.[type] || '')}
                            disabled={savingLegal}
                            style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '0.5rem 1.2rem', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem', opacity: savingLegal ? 0.7 : 1 }}
                          >
                            {savingLegal ? 'Saving...' : 'Save ' + type.charAt(0).toUpperCase() + type.slice(1)}
                          </button>
                        </div>
                        <RichTextEditor 
                          value={landingForm.legal?.[type] || ''} 
                          onChange={val => setLandingForm({ ...landingForm, legal: { ...(landingForm.legal || {}), [type]: val } })} 
                        />
                      </div>
                    ))}
                  </div>
                )}


                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button type="submit" style={{ padding: '1rem 3rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 10px 25px rgba(15,23,42,0.2)' }}>
                    Save All Changes
                  </button>
                </div>

                <input
                  type="file"
                  ref={landingFileRef}
                  style={{ display: 'none' }}
                  onChange={e => handleLandingImage(e, landingFileRef.current.dataset.field)}
                />
              </form>
            </div>
          )}

          {/* INVOICES */}
          {tab === 'Invoices' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Invoices & Billing</h1>
                  <p style={{ margin: '0.3rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>Comprehensive list of all platform transactions.</p>
                </div>
              </div>

              <div style={{ ...S.card, overflowX: 'auto' }}>
                <table style={{ ...S.table, minWidth: 800 }}>
                  <thead>
                    <tr>
                      {['Invoice ID', 'Type', 'Customer', 'Date', 'Amount', 'Status', 'Actions'].map(h => <th key={h} style={S.th}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Combine Bookings/Payments and Cafe Invoices for a master list */}
                    {[
                      ...d.bookings.map(b => ({ id: b.id, type: b.category === 'workspaces' ? 'Room Booking' : 'Membership', customer: b.userEmail, date: b.date, amount: `AED ${b.total || b.totalAmount || 0}`, status: 'Paid' })),
                      ...d.cafeInvoices.map(c => ({ id: c.id, type: 'Cafe Order', customer: c.customerName, date: c.date, amount: `AED ${c.total}`, status: c.status }))
                    ].sort((a, b) => new Date(b.date) - new Date(a.date)).map((inv, i) => (
                      <tr key={i}>
                        <td style={{ ...S.td, fontWeight: 700 }}>#{inv.id}</td>
                        <td style={S.td}>
                          <span style={{
                            ...S.badgeBlue,
                            background: inv.type === 'Cafe Order' ? '#fdf2f8' : (inv.type === 'Membership' ? '#f0fdf4' : '#eff6ff'),
                            color: inv.type === 'Cafe Order' ? '#9d174d' : (inv.type === 'Membership' ? '#166534' : '#1d4ed8')
                          }}>
                            {inv.type}
                          </span>
                        </td>
                        <td style={S.td}>{inv.customer}</td>
                        <td style={S.td}>{inv.date}</td>
                        <td style={{ ...S.td, fontWeight: 700, color: '#0f172a' }}>{inv.amount}</td>
                        <td style={S.td}><span style={S.badge}>{inv.status}</span></td>
                        <td style={S.td}><button style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.35rem 0.6rem', borderRadius: 6, cursor: 'pointer' }}><FileText size={14} /></button></td>
                      </tr>
                    ))}
                    {!d.bookings.length && !d.cafeInvoices.length && <tr><td colSpan={7} style={{ ...S.td, textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>No invoices found.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MESSAGES */}
          {tab === 'Messages' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Customer Messages</h1>
                  <p style={{ margin: '0.3rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>Queries and feedback from your website visitors.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ background: '#fff', padding: '0.5rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Total:</span>
                    <span style={{ fontWeight: 800, color: '#0f172a' }}>{d.messages.length}</span>
                  </div>
                </div>
              </div>

              <div style={S.card}>
                <table style={S.table}>
                  <thead>
                    <tr>
                      {['Date', 'Customer', 'Query Type', 'Message Preview', 'Status', 'Actions'].map(h => <th key={h} style={S.th}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {d.messages.map((m, i) => (
                      <tr key={i} style={{ opacity: m.status === 'Read' ? 0.7 : 1 }}>
                        <td style={S.td}>{m.date}</td>
                        <td style={S.td}>
                          <div style={{ fontWeight: 700 }}>{m.firstName} {m.lastName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{m.email}</div>
                        </td>
                        <td style={S.td}><span style={{ ...S.badge, background: m.queryType === 'Issue' ? '#fef2f2' : m.queryType === 'Feedback' ? '#f0fdf4' : '#f8fafc', color: m.queryType === 'Issue' ? '#dc2626' : m.queryType === 'Feedback' ? '#16a34a' : '#0f172a' }}>{m.queryType}</span></td>
                        <td style={{ ...S.td, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.message}</td>
                        <td style={S.td}>
                          <span style={{ ...S.badge, background: m.status === 'New' ? '#0f172a' : '#e2e8f0', color: m.status === 'New' ? '#fff' : '#64748b' }}>{m.status}</span>
                        </td>
                        <td style={S.td}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={async () => {
                                try {
                                  await fetch(`/api/messages`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('seenhub_admin_token')}` },
                                    body: JSON.stringify({ ...m, status: 'Read' })
                                  });
                                  load();
                                } catch(e) { console.error(e); }
                                alert(`Full Message:\n\nFrom: ${m.firstName} ${m.lastName}\nEmail: ${m.email}\n\n${m.message}`);
                              }}
                              style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.4rem', borderRadius: 8, cursor: 'pointer' }}
                            >
                              <FileText size={14} />
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm('Delete this message?')) {
                                  try {
                                    await fetch(`/api/messages?id=${m.id}`, {
                                      method: 'DELETE',
                                      headers: { 'Authorization': `Bearer ${localStorage.getItem('seenhub_admin_token')}` }
                                    });
                                    load();
                                  } catch(e) { console.error(e); }
                                }
                              }}
                              style={{ background: '#fef2f2', border: 'none', color: '#dc2626', padding: '0.4rem', borderRadius: 8, cursor: 'pointer' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!d.messages.length && (
                      <tr><td colSpan={6} style={{ ...S.td, textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>No messages received yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ANALYTICS */}
          {analytTabs.includes(tab) && (
            <div>
              <h1 style={{ margin: '0 0 2rem', fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>{tab}</h1>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1.5rem' }}>
                {tab === 'User Analytics' && <><Card title="Total Registered" val={d.s.users} sub={`${d.s.active} Active · ${d.s.inactive} Inactive`} /><Card title="Activation Rate" val="87%" sub="Profile completeness" /></>}
                {tab === 'Membership Analytics' && <><Card title="Active Memberships" val={d.s.mem} sub="Across all plans" /><Card title="Top Plan" val="Day Pass" sub="Coworking Space" /></>}
                {tab === 'Space Analytics' && <><Card title="Spaces Booked" val={d.s.spaces} sub="Out of 12 total" /><Card title="Occupancy Rate" val={`${d.s.occ}%`} sub="Current utilization" /></>}
                {tab === 'Event Analytics' && <><Card title="Total Events" val={d.events.length} sub="All scheduled" /><Card title="Completion Rate" val="100%" sub="Retention focus" /></>}
                {tab === 'Payment Analytics' && <><Card title="Total Revenue" val={`AED ${d.s.rev}`} sub={`${d.payments.length} transactions`} /><Card title="Refunds" val="AED 0" sub="0 transactions" /></>}
                {tab === 'Email Analytics' && <><Card title="Emails Sent" val="254" sub="Last 30 days" /><Card title="Delivery Rate" val="100%" sub="No failed deliveries" /></>}
              </div>
            </div>
          )}

          {/* PROMO POPUP */}
          {tab === 'Promo Popup' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Promo Popup</h1>
                  <p style={{ margin: '0.3rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>Configure the attractive popup shown to visitors</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', background: '#fff', padding: '0.5rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.85rem', fontWeight: 600 }}>
                    <input type="checkbox" checked={popupForm.enabled} onChange={e => setPopupForm({ ...popupForm, enabled: e.target.checked })} />
                    Enable Popup
                  </label>
                  <button onClick={savePopup} disabled={savingPopup} style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '0.75rem 2rem', borderRadius: 10, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(15,23,42,0.15)' }}>
                    {savingPopup ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* SETTINGS FORM */}
                <div style={S.card}>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Popup Title</label>
                    <input value={popupForm.title} onChange={e => setPopupForm({ ...popupForm, title: e.target.value })} style={inp} placeholder="Main Heading" />
                  </div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Popup Content</label>
                    <textarea rows={3} value={popupForm.content} onChange={e => setPopupForm({ ...popupForm, content: e.target.value })} style={{ ...inp, height: 'auto', resize: 'vertical' }} placeholder="Short attractive description" />
                  </div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Image URL / Upload</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input value={popupForm.image} onChange={e => setPopupForm({ ...popupForm, image: e.target.value })} style={inp} placeholder="/path/to/image.png" />
                      <button onClick={() => popupFileRef.current?.click()} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 8, padding: '0 1rem', cursor: 'pointer' }} title="Upload Image"><Upload size={16} /></button>
                      <input type="file" ref={popupFileRef} onChange={handlePopupImage} accept="image/*" style={{ display: 'none' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Button 1 Text</label>
                      <input value={popupForm.btn1Text} onChange={e => setPopupForm({ ...popupForm, btn1Text: e.target.value })} style={inp} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Button 1 Link</label>
                      <input value={popupForm.btn1Link} onChange={e => setPopupForm({ ...popupForm, btn1Link: e.target.value })} style={inp} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Button 2 Text</label>
                      <input value={popupForm.btn2Text} onChange={e => setPopupForm({ ...popupForm, btn2Text: e.target.value })} style={inp} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Button 2 Link</label>
                      <input value={popupForm.btn2Link} onChange={e => setPopupForm({ ...popupForm, btn2Link: e.target.value })} style={inp} />
                    </div>
                  </div>
                </div>

                {/* PREVIEW */}
                <div style={{ ...S.card, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', border: '2px dashed #cbd5e1' }}>
                  <div style={{ textAlign: 'center', width: '100%' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem' }}>Live Preview</div>
                    
                    {/* POPUP PREVIEW BOX - Updated to horizontal pattern */}
                    <div style={{ background: '#fff', borderRadius: 48, padding: '3rem 2rem', maxWidth: 420, margin: '0 auto', boxShadow: '0 25px 60px rgba(0,0,0,0.12)', textAlign: 'center' }}>
                      <div style={{ width: '100%', height: 180, background: '#f8fafc', borderRadius: 32, margin: '0 auto 2rem', overflow: 'hidden', border: '1px solid #f1f5f9', boxShadow: '0 12px 30px rgba(0,0,0,0.08)', position: 'relative' }}>
                        {popupForm.image ? <Image src={popupForm.image} fill unoptimized style={{ objectFit: 'cover' }} alt="Popup preview" /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}><Smartphone size={40} /></div>}
                      </div>
                      <h2 style={{ margin: '0 0 0.75rem', fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>{popupForm.title || 'Your Title Here'}</h2>
                      <p style={{ margin: '0 0 2rem', color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6 }}>{popupForm.content || 'Your content description will appear here...'}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <button style={{ width: '100%', padding: '1rem', borderRadius: 20, border: 'none', background: '#0f172a', color: '#fff', fontWeight: 800, fontSize: '1rem' }}>{popupForm.btn1Text || 'Button 1'}</button>
                        <button style={{ width: '100%', padding: '0.75rem', borderRadius: 16, border: 'none', background: 'transparent', color: '#64748b', fontWeight: 700, fontSize: '0.9rem' }}>{popupForm.btn2Text || 'Button 2'}</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MEMBERSHIPS */}
          {tab === 'Memberships' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Membership Plans</h1>
                  <p style={{ margin: '0.3rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>Manage all membership packages shown on the live website.</p>
                </div>
                <button
                  onClick={() => { setMembershipForm({ id: null, title: '', subtitle: '', desc: '', price: 0, icon: '🏢', slug: '', images: [], descBold: '', features: [], descThin: '', bookingUrl: '' }); setMembershipModal(true); }}
                  style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '0.7rem 1.4rem', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Plus size={16} /> Add Plan
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {d.memberships.map((m) => (
                  <div key={m.id} style={{ ...S.card, display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '3px solid #d88906' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '2.5rem', lineHeight: 1 }}>{m.icon}</span>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button onClick={() => { setMembershipForm({ ...m }); setMembershipModal(true); }} style={{ background: '#f1f5f9', color: '#0f172a', border: 'none', borderRadius: 8, padding: '0.4rem 0.75rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Edit size={13} /> Edit</button>
                        <button onClick={() => deleteMembership(m.id)} style={{ background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: 8, padding: '0.4rem 0.75rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Trash2 size={13} /> Delete</button>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', marginBottom: '0.2rem' }}>{m.title}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{m.subtitle}</div>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569', lineHeight: 1.55, background: '#f8fafc', padding: '0.75rem', borderRadius: 8, flexGrow: 1 }}>{m.desc}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f172a' }}>AED {m.price}</span>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', background: '#f1f5f9', padding: '0.3rem 0.6rem', borderRadius: 6, fontFamily: 'monospace' }}>{m.slug}</span>
                    </div>
                  </div>
                ))}
                {!d.memberships.length && (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem 2rem', background: '#fff', borderRadius: 16, border: '1px dashed #e2e8f0', color: '#94a3b8' }}>
                    <CreditCard size={48} strokeWidth={1.5} style={{ opacity: 0.25, marginBottom: '1rem' }} />
                    <p style={{ margin: 0, fontWeight: 600 }}>No membership plans yet.</p>
                    <p style={{ margin: '0.4rem 0 0', fontSize: '0.85rem' }}>Click &quot;Add Plan&quot; to create the first one.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* OTHER */}
          {!knownTabs.includes(tab) && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '1rem', color: '#94a3b8', textAlign: 'center' }}>
              <Database size={48} strokeWidth={1.5} />
              <h2 style={{ margin: 0, color: '#475569', fontSize: '1.1rem', fontWeight: 700 }}>{tab}</h2>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>Module syncing with live website data...</p>
            </div>
          )}
        </div>
      </div>

      {/* EMAIL PREVIEW MODAL */}
      {emailPreviewModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Email Preview</h2>
              <button onClick={() => setEmailPreviewModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', background: '#f1f5f9' }}>
              <div style={{ background: '#fff', borderRadius: 8, padding: '1rem', marginBottom: '1rem', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.4rem' }}><strong>Subject:</strong> {marketingEmail.subject || '(No Subject)'}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}><strong>From:</strong> SeenHub Team &lt;{qrSettings.contactEmail}&gt;</div>
              </div>
              
              {/* THE TEMPLATE WRAPPER */}
              <div style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", maxWidth: '600px', margin: '0 auto', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', background: '#ffffff', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                <div style={{ background: '#f8fafc', padding: '40px 20px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                  <Image src={qrSettings.logo} alt="SeenHub" width={140} height={70} unoptimized style={{ maxHeight: '70px', width: 'auto', objectFit: 'contain' }} />
                </div>
                <div style={{ padding: '40px 30px', color: '#1e293b', lineHeight: '1.6', fontSize: '16px', overflowWrap: 'break-word', wordBreak: 'break-word' }} dangerouslySetInnerHTML={{ __html: marketingEmail.content || '<p style="color:#94a3b8">Write some content to see the preview...</p>' }} />
                <div style={{ background: '#0f172a', padding: '40px 30px', color: '#ffffff', textAlign: 'center' }}>
                  <h4 style={{ margin: '0 0 15px', fontSize: '18px', color: '#ffffff' }}>Stay Connected</h4>
                  <p style={{ margin: '0 0 10px', fontSize: '14px', opacity: 0.8 }}>{qrSettings.contactPhone} | {qrSettings.contactEmail}</p>
                  <p style={{ margin: '0 0 20px', fontSize: '14px', opacity: 0.8 }}>{qrSettings.websiteUrl}</p>
                  <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '12px', opacity: 0.6 }}>
                    &copy; 2026 SeenHub Business Hub. All rights reserved.
                  </div>
                </div>
              </div>
            </div>
            <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid #e2e8f0', textAlign: 'right' }}>
              <button onClick={() => setEmailPreviewModal(false)} style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '0.6rem 2rem', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Close Preview</button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN USER MODAL */}
      {adminModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 500, display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderRadius: '20px 20px 0 0' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{adminForm.id ? 'Edit Admin' : 'Add New Sub-Admin'}</h2>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>{adminForm.role === 'Super Admin' ? 'Update your super admin credentials' : 'Set credentials and role permissions'}</p>
              </div>
              <button onClick={() => setAdminModal(false)} style={{ background: '#e2e8f0', border: 'none', borderRadius: 8, padding: '0.5rem', cursor: 'pointer', color: '#64748b', display: 'flex' }}><X size={18} /></button>
            </div>
            <form onSubmit={saveAdminUser} style={{ flex: 1, padding: '1.5rem 2rem' }}>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Admin Name *</label>
                <input required value={adminForm.name} onChange={e => setAdminForm({ ...adminForm, name: e.target.value })} placeholder="e.g. John Doe" style={inp} />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Email Address (Login) *</label>
                <input type="email" required value={adminForm.email} onChange={e => setAdminForm({ ...adminForm, email: e.target.value })} placeholder="admin@domain.com" style={inp} />
              </div>

              <div style={{ marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Password {adminForm.id ? '' : '*'}</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPass ? "text" : "password"} required={!adminForm.id} value={adminForm.password} onChange={e => setAdminForm({ ...adminForm, password: e.target.value })} placeholder="Secure password" style={{ ...inp, paddingRight: '2.5rem' }} />
                    <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', padding: '0.2rem' }}>
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Confirm Password {adminForm.id ? '' : '*'}</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showConfPass ? "text" : "password"} required={!adminForm.id} value={adminForm.password_confirmation} onChange={e => setAdminForm({ ...adminForm, password_confirmation: e.target.value })} placeholder="Confirm password" style={{ ...inp, paddingRight: '2.5rem' }} />
                    <button type="button" onClick={() => setShowConfPass(!showConfPass)} style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', padding: '0.2rem' }}>
                      {showConfPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {adminForm.role !== 'Super Admin' && (
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', display: 'block', marginBottom: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>Module Permissions</label>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '1rem' }}>Select which modules this sub-admin can view and manage.</p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', maxHeight: 200, overflowY: 'auto', padding: '0.2rem' }}>
                    {ALL_MODULES.map(mod => (
                      <label key={mod} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.5rem 0.8rem', borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, color: '#334155', width: 'calc(50% - 0.4rem)' }}>
                        <input
                          type="checkbox"
                          checked={adminForm.permissions.includes(mod)}
                          onChange={() => togglePermission(mod)}
                          style={{ cursor: 'pointer' }}
                        />
                        {mod}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setAdminModal(false)} style={{ padding: '0.65rem 1.25rem', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', color: '#64748b' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.65rem 1.75rem', borderRadius: 8, border: 'none', background: '#0f172a', color: '#fff', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>Save Admin</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MEMBERSHIP MODAL */}
      {membershipModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 560, boxShadow: '0 25px 60px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderRadius: '20px 20px 0 0' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{membershipForm.id ? 'Edit Membership' : 'Add New Membership'}</h2>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>Changes sync to the live website immediately.</p>
              </div>
              <button onClick={() => setMembershipModal(false)} style={{ background: '#e2e8f0', border: 'none', borderRadius: 8, padding: '0.5rem', cursor: 'pointer', color: '#64748b', display: 'flex' }}><X size={18} /></button>
            </div>
            <form onSubmit={saveMembership} style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', maxHeight: 'calc(90vh - 130px)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '72px 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Icon (Emoji)</label>
                  <input value={membershipForm.icon} onChange={e => setMembershipForm({ ...membershipForm, icon: e.target.value })} style={{ ...inp, textAlign: 'center', fontSize: '1.4rem', padding: '0.4rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Title *</label>
                  <input required value={membershipForm.title} onChange={e => setMembershipForm({ ...membershipForm, title: e.target.value })} placeholder="e.g. Day Pass" style={inp} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Subtitle (shown on cards)</label>
                <input value={membershipForm.subtitle} onChange={e => setMembershipForm({ ...membershipForm, subtitle: e.target.value })} placeholder="e.g. Work from the open area all day" style={inp} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Bold Tagline (detail page heading)</label>
                <input value={membershipForm.descBold || ''} onChange={e => setMembershipForm({ ...membershipForm, descBold: e.target.value })} placeholder="e.g. Full-Day Access – Starting From 89 AED" style={inp} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Gallery Images</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                  {(membershipForm.images || []).map((img, i) => (
                    <div key={i} style={{ position: 'relative', width: 80, height: 56, borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                      <Image src={img} fill unoptimized style={{ objectFit: 'cover' }} alt="" />
                      <button type="button" onClick={() => setMembershipForm(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))} style={{ position: 'absolute', top: 2, right: 2, background: '#dc2626', color: '#fff', border: 'none', borderRadius: 4, width: 18, height: 18, cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                    </div>
                  ))}
                  <div onClick={() => membershipImgRef.current?.click()} style={{ width: 80, height: 56, borderRadius: 8, border: '2px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94a3b8', background: '#f8fafc' }}><Plus size={18} /></div>
                </div>
                <input type="file" ref={membershipImgRef} onChange={handleMembershipImage} accept="image/*" multiple style={{ display: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Features (one per line)</label>
                <textarea rows={4} value={(membershipForm.features || []).join('\n')} onChange={e => setMembershipForm({ ...membershipForm, features: e.target.value.split('\n').map(f => f.trim()).filter(Boolean) })} placeholder={'High-Speed Wi-Fi\nFree Car Parking\n24/7 Security'} style={{ ...inp, resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Short Description (card)</label>
                <textarea rows={2} value={membershipForm.desc} onChange={e => setMembershipForm({ ...membershipForm, desc: e.target.value })} placeholder="Brief summary for the membership card" style={{ ...inp, resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Detail Page Body Text</label>
                <textarea rows={3} value={membershipForm.descThin || ''} onChange={e => setMembershipForm({ ...membershipForm, descThin: e.target.value })} placeholder="Full description shown on the membership detail page..." style={{ ...inp, resize: 'vertical' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Price (AED) *</label>
                  <input required type="number" min={0} value={membershipForm.price} onChange={e => setMembershipForm({ ...membershipForm, price: parseFloat(e.target.value) || 0 })} style={inp} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Slug (URL key) *</label>
                  <input required value={membershipForm.slug} onChange={e => setMembershipForm({ ...membershipForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} placeholder="e.g. day-pass" style={inp} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Booking URL</label>
                <input value={membershipForm.bookingUrl || ''} onChange={e => setMembershipForm({ ...membershipForm, bookingUrl: e.target.value })} placeholder="/booking?service=Day Pass" style={inp} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setMembershipModal(false)} style={{ padding: '0.65rem 1.25rem', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', color: '#64748b' }}>Cancel</button>
                <button type="submit" disabled={savingMembership} style={{ padding: '0.65rem 1.75rem', borderRadius: 8, border: 'none', background: '#0f172a', color: '#fff', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', opacity: savingMembership ? 0.7 : 1 }}>{savingMembership ? 'Saving...' : (membershipForm.id ? 'Update Plan' : 'Create Plan')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW QR MODAL */}
      {qrModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '1rem', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Scan QR Code</h2>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>{qrModal.space || 'Booking'}</p>
              </div>
              <button onClick={() => setQrModal(null)} style={{ background: '#e2e8f0', border: 'none', borderRadius: 8, padding: '0.5rem', cursor: 'pointer', color: '#64748b', display: 'flex' }}><X size={18} /></button>
            </div>
            <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#fff' }}>
              <div style={{ background: '#fff', padding: '1rem', borderRadius: 16, border: '1px solid #e2e8f0', marginBottom: '1.5rem', display: 'inline-block' }}>
                {qrModal.qrCode ? <QRCodeSVG value={qrModal.qrCode} size={220} /> : <div style={{width: 220, height: 220, display:'flex', alignItems:'center', justifyContent:'center', background:'#f8fafc', color:'#94a3b8', borderRadius:10}}>No QR Code</div>}
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', letterSpacing: '2px', background: '#f8fafc', padding: '0.6rem 1.5rem', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                {qrModal.qrCode || 'N/A'}
              </div>
              <p style={{ margin: '1rem 0 0', fontSize: '0.8rem', color: '#64748b', textAlign: 'center' }}>Present this QR code at the entrance scanner.</p>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL BOOKING MODAL */}
      {manualBookingModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 500, maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderRadius: '20px 20px 0 0' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Assign New Booking</h2>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>Create a booking on behalf of a user</p>
              </div>
              <button onClick={() => setManualBookingModal(false)} style={{ background: '#e2e8f0', border: 'none', borderRadius: 8, padding: '0.5rem', cursor: 'pointer', color: '#64748b', display: 'flex' }}><X size={18} /></button>
            </div>
            <form onSubmit={saveManualBooking} style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem', display: 'grid', gap: '1.2rem' }}>
              
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Select User *</label>
                <select 
                  onChange={e => {
                    const u = d.users.find(usr => usr.email === e.target.value);
                    if (u) setManualBookingForm({...manualBookingForm, name: u.name, email: u.email});
                    else setManualBookingForm({...manualBookingForm, name: '', email: ''});
                  }} 
                  style={customSelect} required>
                  <option value="">-- Choose Registered User --</option>
                  {d.users.map(u => <option key={u.id} value={u.email}>{u.name} ({u.email})</option>)}
                </select>
                {manualBookingForm.name && <p style={{fontSize:'0.7rem', color: '#16a34a', marginTop:'0.3rem', fontWeight: 600}}>✓ Selected: {manualBookingForm.name} ({manualBookingForm.email})</p>}
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Category *</label>
                <select value={manualBookingForm.category} onChange={e => setManualBookingForm({...manualBookingForm, category: e.target.value, space: ''})} style={customSelect} required>
                  <option value="workspaces">Workspace</option>
                  <option value="memberships">Membership</option>
                  <option value="events">Event</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Item / Space *</label>
                  <select value={manualBookingForm.space} onChange={e => setManualBookingForm({...manualBookingForm, space: e.target.value, assignedUnitName: '', assignedUnit: null})} style={customSelect} required>
                    <option value="">-- Select Item --</option>
                    {manualBookingForm.category === 'workspaces' && d.workspaces.map(w => <option key={w.id} value={w.title}>{w.title}</option>)}
                    {manualBookingForm.category === 'memberships' && d.memberships.map(m => <option key={m.id} value={m.title}>{m.title}</option>)}
                    {manualBookingForm.category === 'events' && d.events.map(ev => <option key={ev.id} value={ev.title}>{ev.title}</option>)}
                  </select>
                </div>
                
                {manualBookingForm.category === 'workspaces' && manualBookingForm.space && (
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Specific Unit (Optional)</label>
                    <select value={manualBookingForm.assignedUnitName || ''} onChange={e => {
                       const uName = e.target.value;
                       if(!uName) {
                         setManualBookingForm({...manualBookingForm, assignedUnitName: '', assignedUnit: null});
                         return;
                       }
                       const ws = d.workspaces.find(w => w.title === manualBookingForm.space);
                       const uIndex = ws?.unitNames?.indexOf(uName) ?? -1;
                       setManualBookingForm({...manualBookingForm, assignedUnitName: uName, assignedUnit: uIndex !== -1 ? uIndex + 1 : null});
                    }} style={customSelect}>
                      <option value="">-- Auto Assign --</option>
                      {(() => {
                        const ws = d.workspaces.find(w => w.title === manualBookingForm.space);
                        if (!ws) return null;
                        if (ws.unitNames && ws.unitNames.length > 0) {
                          return ws.unitNames.map(u => <option key={u} value={u}>{u}</option>);
                        }
                        const qrPrefix = ws.qrPrefix || ws.prefix;
                        return Array.from({length: ws.units || 1}).map((_, i) => {
                          let label = `Unit ${i+1}`;
                          if (qrPrefix) {
                            const match = qrPrefix.match(/^(.*?)(0*\d+)$/);
                            if (match) {
                              const base = match[1];
                              const numStr = match[2];
                              const val = parseInt(numStr, 10) + i;
                              const formattedNum = String(val).padStart(numStr.length, '0');
                              label = `${base}${formattedNum}`;
                            } else {
                              if (ws.units > 1) {
                                label = `${qrPrefix}-${i+1}`;
                              } else {
                                label = qrPrefix;
                              }
                            }
                          }
                          return <option key={i} value={label}>{label}</option>;
                        });
                      })()}
                    </select>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Date *</label>
                  <input type="date" value={manualBookingForm.date} onChange={e => setManualBookingForm({...manualBookingForm, date: e.target.value})} style={customInp} required />
                </div>
                {manualBookingForm.category === 'workspaces' && (
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Booking Type</label>
                    <select value={manualBookingForm.bookingType} onChange={e => setManualBookingForm({...manualBookingForm, bookingType: e.target.value})} style={customSelect}>
                      <option value="Hourly">Hourly</option>
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>
                )}
                
                {manualBookingForm.bookingType === 'Custom' && (
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Custom End Date *</label>
                    <input type="date" value={manualBookingForm.calculatedEndDate || ''} onChange={e => setManualBookingForm({...manualBookingForm, calculatedEndDate: e.target.value})} style={customInp} required />
                  </div>
                )}
              </div>

              {manualBookingForm.category === 'workspaces' && manualBookingForm.bookingType === 'Hourly' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Time From</label>
                    <input type="time" value={manualBookingForm.timeFrom} onChange={e => setManualBookingForm({...manualBookingForm, timeFrom: e.target.value})} style={customInp} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Time To</label>
                    <input type="time" value={manualBookingForm.timeTo} onChange={e => setManualBookingForm({...manualBookingForm, timeTo: e.target.value})} style={customInp} />
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Units Quantity</label>
                  <input type="number" min="1" value={manualBookingForm.totalUnits} onChange={e => setManualBookingForm({...manualBookingForm, totalUnits: parseInt(e.target.value)})} style={customInp} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Total Guests</label>
                  <input type="number" min="1" value={manualBookingForm.guests} onChange={e => setManualBookingForm({...manualBookingForm, guests: parseInt(e.target.value)})} style={customInp} required />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Total Amount (AED)</label>
                <input type="number" min="0" step="0.01" value={manualBookingForm.total} onChange={e => setManualBookingForm({...manualBookingForm, total: parseFloat(e.target.value)})} style={customInp} required />
              </div>

              <div style={{ paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setManualBookingModal(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ background: '#0f172a', color: '#fff', border: 'none', borderRadius: 8, padding: '0.7rem 1.5rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>Confirm & Assign</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EVENT MODAL */}

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 660, maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderRadius: '20px 20px 0 0' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Create New Event</h2>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>Fill in the details to publish a new event on the platform</p>
              </div>
              <button onClick={() => setModal(false)} style={{ background: '#e2e8f0', border: 'none', borderRadius: 8, padding: '0.5rem', cursor: 'pointer', color: '#64748b', display: 'flex' }}><X size={18} /></button>
            </div>
            <form onSubmit={saveEvent} style={{ flex: 1, overflowY: 'auto' }}>
              <div style={{ padding: '1.5rem 2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Event Title *</label>
                  <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Enter event name" style={inp} />
                </div>
                {[['Location', 'location', 'text', 'e.g. SeenHub Main Hall'], ['Gate Number', 'gateNumber', 'text', 'e.g. Gate 92'], ['Start Date *', 'startDate', 'date', ''], ['End Date', 'endDate', 'date', ''], ['Start Time', 'startTime', 'time', ''], ['End Time', 'endTime', 'time', ''], ['Total Tickets', 'totalTickets', 'number', '30'], ['Price (AED)', 'price', 'number', '0']].map(([l, k, t, ph]) => (
                  <div key={k}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>{l}</label>
                    <input type={t} placeholder={ph} required={l.includes('*')} value={form[k] || ''} onChange={e => setForm({ ...form, [k]: e.target.value })} style={inp} />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Event Type</label>
                  <select value={form.eventType} onChange={e => setForm({ ...form, eventType: e.target.value })} style={{ ...inp, cursor: 'pointer' }}>
                    {['Conference', 'Workshop', 'Networking', 'Seminar', 'Exhibition', 'Concert', 'Other'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Description</label>
                  <textarea rows={3} value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Detailed event information..." style={{ ...inp, resize: 'vertical' }} />
                </div>
              </div>
              <div style={{ padding: '1rem 2rem 1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setModal(false)} style={{ padding: '0.65rem 1.25rem', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', color: '#64748b' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.65rem 1.75rem', borderRadius: 8, border: 'none', background: '#0f172a', color: '#fff', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>Create Event</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BLOG MODAL */}
      {blogModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 800, maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderRadius: '20px 20px 0 0' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Publish New Blog</h2>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>Write and format a new article for the SeenHub website</p>
              </div>
              <button onClick={() => setBlogModal(false)} style={{ background: '#e2e8f0', border: 'none', borderRadius: 8, padding: '0.5rem', cursor: 'pointer', color: '#64748b', display: 'flex' }}><X size={18} /></button>
            </div>
            <form onSubmit={saveBlog} style={{ flex: 1, overflowY: 'auto' }}>
              <div style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Feature Image Upload */}
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Featured Image *</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      height: '140px',
                      border: '2px dashed #cbd5e1',
                      borderRadius: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: blogForm.image ? '#000' : '#f8fafc',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      position: 'relative',
                      color: blogForm.image ? '#fff' : '#64748b'
                    }}
                  >
                    {blogForm.image ? (
                      <Image src={blogForm.image} alt="Preview" fill unoptimized style={{ objectFit: 'cover', opacity: 0.6 }} />
                    ) : (
                      <>
                        <Upload size={24} style={{ marginBottom: '0.5rem' }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Click to upload image</span>
                        <span style={{ fontSize: '0.7rem' }}>PNG, JPG, WEBP (Max 5MB)</span>
                      </>
                    )}
                    {blogForm.image && <div style={{ position: 'absolute', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}><Upload size={16} /> Change Image</div>}
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" style={{ display: 'none' }} required={!blogForm.image} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Blog Title *</label>
                    <input required value={blogForm.title} onChange={e => setBlogForm({ ...blogForm, title: e.target.value })} placeholder="Enter an engaging title" style={inp} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Sub-title</label>
                    <input value={blogForm.subtitle} onChange={e => setBlogForm({ ...blogForm, subtitle: e.target.value })} placeholder="A brief hook or summary" style={inp} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Author *</label>
                    <input required value={blogForm.author} onChange={e => setBlogForm({ ...blogForm, author: e.target.value })} placeholder="Author name" style={inp} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Description / Content *</label>
                  <RichTextEditor value={blogForm.content} onChange={val => setBlogForm({ ...blogForm, content: val })} />
                </div>

              </div>
              <div style={{ padding: '1rem 2rem 1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setBlogModal(false)} style={{ padding: '0.65rem 1.25rem', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', color: '#64748b' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.65rem 1.75rem', borderRadius: 8, border: 'none', background: '#0f172a', color: '#fff', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>Publish Blog</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WORKSPACE MODAL - RICH TABBED FORM */}
      {wsModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 700, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>

            {/* Header */}
            <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderRadius: '20px 20px 0 0', flexShrink: 0 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>{wsForm.id ? 'Edit Workspace' : 'Add New Workspace'}</h2>
                <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>Changes will sync to the live website immediately.</p>
              </div>
              <button onClick={() => { setWsModal(false); setWsForm(defaultWsForm()); }} style={{ background: '#e2e8f0', border: 'none', borderRadius: 8, padding: '0.5rem', cursor: 'pointer', color: '#64748b', display: 'flex' }}><X size={18} /></button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#fff', flexShrink: 0 }}>
              {[{ k: 'basic', l: '① Basic Info' }, { k: 'pricing', l: '② Pricing' }, { k: 'availability', l: '③ Availability' }].map(t => (
                <button key={t.k} type="button" onClick={() => setWsTab(t.k)} style={{ flex: 1, padding: '0.75rem', border: 'none', background: 'transparent', fontWeight: wsTab === t.k ? 700 : 500, color: wsTab === t.k ? '#0f172a' : '#94a3b8', fontSize: '0.8rem', borderBottom: wsTab === t.k ? '2px solid #0f172a' : '2px solid transparent', cursor: 'pointer', transition: 'all 0.15s' }}>{t.l}</button>
              ))}
            </div>

            <form onSubmit={saveWorkspace} style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 1.75rem' }}>

              {/* TAB 1: BASIC INFO */}
              {wsTab === 'basic' && (
                <div>
                  {/* Featured Image */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Featured Image *</label>
                    <div onClick={() => wsFileInputRef.current?.click()} style={{ height: 130, border: '2px dashed #cbd5e1', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: wsForm.featuredImg ? '#000' : '#f8fafc', cursor: 'pointer', overflow: 'hidden', position: 'relative', color: wsForm.featuredImg ? '#fff' : '#64748b' }}>
                      {wsForm.featuredImg ? <Image src={wsForm.featuredImg} alt="Preview" fill unoptimized style={{ objectFit: 'cover', opacity: 0.7 }} /> : <><Upload size={22} style={{ marginBottom: '0.4rem' }} /><span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Click to upload featured image</span><span style={{ fontSize: '0.7rem', marginTop: 4 }}>16:9 ratio recommended</span></>}
                      {wsForm.featuredImg && <div style={{ position: 'absolute', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}><Upload size={14} /> Change Image</div>}
                    </div>
                    <input type="file" ref={wsFileInputRef} onChange={handleWsImageUpload} accept="image/*" style={{ display: 'none' }} />
                  </div>

                  {/* Gallery */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Gallery Images</label>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {(wsForm.gallery || []).map((img, i) => (
                        <div key={i} style={{ position: 'relative', width: 64, height: 44, borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                          <Image src={img} alt="" width={64} height={44} unoptimized style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button type="button" onClick={() => setWsForm(prev => ({ ...prev, gallery: prev.gallery.filter((_, idx) => idx !== i) }))} style={{ position: 'absolute', top: 2, right: 2, background: '#dc2626', color: '#fff', border: 'none', borderRadius: 4, width: 16, height: 16, cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                        </div>
                      ))}
                      <div onClick={() => wsGalleryInputRef.current?.click()} style={{ width: 64, height: 44, borderRadius: 8, border: '2px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94a3b8', background: '#f8fafc' }}>
                        <Plus size={18} />
                      </div>
                    </div>
                    <input type="file" ref={wsGalleryInputRef} onChange={handleWsGalleryUpload} accept="image/*" multiple style={{ display: 'none' }} />
                  </div>

                  {/* Title & Subtitle */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Title *</label>
                        <input required value={wsForm.title || ''} onChange={e => setWsForm({ ...wsForm, title: e.target.value })} placeholder="e.g. Meeting Room" style={inp} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.4px' }}>QR Code Prefix</label>
                        <input value={wsForm.qrPrefix || ''} onChange={e => setWsForm({ ...wsForm, qrPrefix: e.target.value })} placeholder="e.g. 02" style={inp} />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Subtitle</label>
                      <input value={wsForm.subtitle || ''} onChange={e => setWsForm({ ...wsForm, subtitle: e.target.value })} placeholder="e.g. Fully equipped for presentations" style={inp} />
                    </div>
                  </div>

                  {/* Description */}
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Description *</label>
                    <textarea required value={wsForm.description || ''} onChange={e => setWsForm({ ...wsForm, description: e.target.value })} placeholder="Full description of this workspace..." rows={3} style={{ ...inp, resize: 'vertical' }} />
                  </div>

                  {/* Link, Max Guests & Units */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.4px' }}>URL Slug (Link Path)</label>
                      <input value={wsForm.link || ''} onChange={e => setWsForm({ ...wsForm, link: e.target.value })} placeholder="/workspaces/my-workspace" style={inp} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Max Guests</label>
                      <input type="number" min={1} value={wsForm.maxGuests || 1} onChange={e => setWsForm({ ...wsForm, maxGuests: parseInt(e.target.value) })} style={inp} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.4px' }}>No. of Units</label>
                      <input type="number" min={1} value={wsForm.units || 1} onChange={e => setWsForm({ ...wsForm, units: parseInt(e.target.value) })} style={inp} />
                    </div>
                  </div>

                  <div style={{ marginTop: '1.5rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Specific Unit Names (Optional)</label>
                    <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '1rem' }}>Define names for each unit (e.g. &quot;Meeting Room 1&quot;). If empty, they will be named &quot;Unit 1&quot;, etc.</p>

                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                      <input
                        id="new-unit-name"
                        type="text"
                        placeholder="e.g. Meeting Room 1"
                        style={{ ...inp, flex: 1 }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = e.target.value.trim();
                            if (val) {
                              setWsForm(prev => ({ ...prev, unitNames: [...(prev.unitNames || []), val], units: (prev.unitNames || []).length + 1 }));
                              e.target.value = '';
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        style={{ padding: '0 1rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700 }}
                        onClick={() => {
                          const input = document.getElementById('new-unit-name');
                          const val = input.value.trim();
                          if (val) {
                            setWsForm(prev => ({ ...prev, unitNames: [...(prev.unitNames || []), val], units: (prev.unitNames || []).length + 1 }));
                            input.value = '';
                          }
                        }}
                      >Add</button>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {(wsForm.unitNames || []).map((un, idx) => (
                        <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.6rem 0.8rem', borderRadius: 10, fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '180px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 700, color: '#0f172a' }}>{un}</span>
                            <X size={14} style={{ cursor: 'pointer', color: '#ef4444' }} onClick={() => {
                              const newList = wsForm.unitNames.filter((_, i) => i !== idx);
                              setWsForm(prev => ({ ...prev, unitNames: newList, units: Math.max(1, newList.length) }));
                            }} />
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Prefix:</span>
                            <input
                              type="text"
                              placeholder={`e.g. 0${idx + 1}`}
                              value={(wsForm.unitQrPrefixes || [])[idx] || ''}
                              onChange={e => {
                                const newPrefixes = [...(wsForm.unitQrPrefixes || [])];
                                newPrefixes[idx] = e.target.value;
                                setWsForm({ ...wsForm, unitQrPrefixes: newPrefixes });
                              }}
                              style={{ ...inp, padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PRICING */}
              {wsTab === 'pricing' && (
                <div>
                  {/* Booking Types */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Available Booking Types</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {['Hourly', 'Daily', 'Weekly', 'Monthly'].map(type => (
                        <button key={type} type="button" onClick={() => setWsForm(prev => ({ ...prev, bookingTypes: (prev.bookingTypes || []).includes(type) ? (prev.bookingTypes || []).filter(t => t !== type) : [...(prev.bookingTypes || []), type] }))} style={{ padding: '0.45rem 1rem', borderRadius: 8, border: (wsForm.bookingTypes || []).includes(type) ? '2px solid #0f172a' : '2px solid #e2e8f0', background: (wsForm.bookingTypes || []).includes(type) ? '#0f172a' : '#fff', color: (wsForm.bookingTypes || []).includes(type) ? '#fff' : '#64748b', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>{type}</button>
                      ))}
                    </div>
                  </div>

                  {/* Price Tables */}
                  {['hourly', 'daily', 'weekly', 'monthly'].filter(t => (wsForm.bookingTypes || []).includes(t.charAt(0).toUpperCase() + t.slice(1))).map(type => (
                    <div key={type} style={{ marginBottom: '1.25rem', background: '#f8fafc', borderRadius: 12, padding: '1rem' }}>
                      <p style={{ margin: '0 0 0.75rem', fontWeight: 700, color: '#0f172a', fontSize: '0.85rem', textTransform: 'capitalize' }}>{type} Price (AED)</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>Individual</label>
                          <input type="number" min={0} value={wsForm.pricing[type]?.individual || 0} onChange={e => setWsForm(prev => ({ ...prev, pricing: { ...prev.pricing, [type]: { ...prev.pricing[type], individual: parseFloat(e.target.value) } } }))} style={inp} placeholder="0.00" />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>Corporate</label>
                          <input type="number" min={0} value={wsForm.pricing[type]?.corporate || 0} onChange={e => setWsForm(prev => ({ ...prev, pricing: { ...prev.pricing, [type]: { ...prev.pricing[type], corporate: parseFloat(e.target.value) } } }))} style={inp} placeholder="0.00" />
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Extra Guest Price */}
                  <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12, padding: '1rem', marginTop: '0.5rem' }}>
                    <p style={{ margin: '0 0 0.75rem', fontWeight: 700, color: '#92400e', fontSize: '0.85rem' }}>Extra Guest Price (per additional guest)</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>Individual (AED)</label>
                        <input type="number" min={0} value={wsForm.extraGuestPrice?.individual || 0} onChange={e => setWsForm(prev => ({ ...prev, extraGuestPrice: { ...prev.extraGuestPrice, individual: parseFloat(e.target.value) } }))} style={inp} placeholder="0.00" />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>Corporate (AED)</label>
                        <input type="number" min={0} value={wsForm.extraGuestPrice?.corporate || 0} onChange={e => setWsForm(prev => ({ ...prev, extraGuestPrice: { ...prev.extraGuestPrice, corporate: parseFloat(e.target.value) } }))} style={inp} placeholder="0.00" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: AVAILABILITY */}
              {wsTab === 'availability' && (
                <div>
                  <p style={{ margin: '0 0 1rem', fontSize: '0.82rem', color: '#64748b' }}>Set the working days and hours for this workspace. The booking form will only allow time slots within these hours.</p>
                  {Object.keys(wsForm.workingHours).map(day => {
                    const dh = wsForm.workingHours[day];
                    return (
                      <div key={day} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.7rem 0', borderBottom: '1px solid #f1f5f9' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', minWidth: 110 }}>
                          <input type="checkbox" checked={dh.enabled} onChange={e => setWsForm(prev => ({ ...prev, workingHours: { ...prev.workingHours, [day]: { ...prev.workingHours[day], enabled: e.target.checked } } }))} style={{ width: 16, height: 16, cursor: 'pointer' }} />
                          <span style={{ fontWeight: dh.enabled ? 700 : 400, color: dh.enabled ? '#0f172a' : '#94a3b8', fontSize: '0.85rem' }}>{day}</span>
                        </label>
                        {dh.enabled ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                            <input type="time" value={dh.from} onChange={e => setWsForm(prev => ({ ...prev, workingHours: { ...prev.workingHours, [day]: { ...prev.workingHours[day], from: e.target.value } } }))} style={{ ...inp, width: 'auto', flex: 1 }} />
                            <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>to</span>
                            <input type="time" value={dh.to} onChange={e => setWsForm(prev => ({ ...prev, workingHours: { ...prev.workingHours, [day]: { ...prev.workingHours[day], to: e.target.value } } }))} style={{ ...inp, width: 'auto', flex: 1 }} />
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.82rem', fontStyle: 'italic' }}>Closed</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Form Footer */}
              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {wsTab !== 'basic' && <button type="button" onClick={() => setWsTab(wsTab === 'availability' ? 'pricing' : 'basic')} style={{ padding: '0.6rem 1.1rem', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', color: '#64748b' }}>← Back</button>}
                  {wsTab !== 'availability' && <button type="button" onClick={() => setWsTab(wsTab === 'basic' ? 'pricing' : 'availability')} style={{ padding: '0.6rem 1.1rem', borderRadius: 8, border: '1px solid #0f172a', background: '#f8fafc', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', color: '#0f172a' }}>Next →</button>}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" onClick={() => { setWsModal(false); setWsForm(defaultWsForm()); }} style={{ padding: '0.6rem 1.1rem', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', color: '#64748b' }}>Cancel</button>
                  <button type="submit" disabled={isSavingWs} style={{ padding: '0.6rem 1.5rem', borderRadius: 8, border: 'none', background: isSavingWs ? '#64748b' : '#0f172a', color: '#fff', fontSize: '0.82rem', fontWeight: 700, cursor: isSavingWs ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>{isSavingWs ? 'Saving...' : '💾 Save Workspace'}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COUPON MODAL */}
      {couponModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 400, boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Create New Coupon</h2>
              <button onClick={() => setCouponModal(false)} style={{ background: '#e2e8f0', border: 'none', borderRadius: 8, padding: '0.4rem', cursor: 'pointer' }}><X size={16} /></button>
            </div>
            <form onSubmit={saveCoupon} style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Coupon Code</label>
                <input required value={couponForm.code} onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} placeholder="e.g. SAVE20" style={inp} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Discount Percentage (%)</label>
                <input type="number" required min={1} max={100} value={couponForm.discount} onChange={e => setCouponForm({ ...couponForm, discount: parseInt(e.target.value) })} style={inp} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Applied Category</label>
                <select value={couponForm.category} onChange={e => setCouponForm({ ...couponForm, category: e.target.value })} style={inp}>
                  <option value="All">All Categories</option>
                  <option value="Workspaces">Workspaces Only</option>
                  <option value="Memberships">Memberships Only</option>
                </select>
              </div>
              <button type="submit" style={{ width: '100%', padding: '0.8rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>Create Coupon</button>
            </form>
          </div>
        </div>
      )}

      {/* CAFE MODAL */}
      {cafeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 500, boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderRadius: '20px 20px 0 0' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{cafeForm.id ? 'Edit' : 'Add'} Cafe {cafeForm.type}</h2>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>{cafeForm.type === 'Product' ? 'Add a new item to your cafe menu' : 'Organize your products with categories'}</p>
              </div>
              <button onClick={() => setCafeModal(false)} style={{ background: '#e2e8f0', border: 'none', borderRadius: 8, padding: '0.5rem', cursor: 'pointer', color: '#64748b' }}><X size={18} /></button>
            </div>
            <form onSubmit={saveCafeItem} style={{ padding: '1.5rem 2rem' }}>
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem' }}>{cafeForm.type} Name *</label>
                <input required value={cafeForm.name} onChange={e => setCafeForm({ ...cafeForm, name: e.target.value })} style={inp} placeholder={`Enter ${cafeForm.type.toLowerCase()} name`} />
              </div>

              {cafeForm.type === 'Product' && (
                <>
                  <div style={{ marginBottom: '1.2rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem' }}>Category *</label>
                    <select required value={cafeForm.category} onChange={e => setCafeForm({ ...cafeForm, category: e.target.value })} style={{ ...inp, cursor: 'pointer' }}>
                      <option value="">Select Category</option>
                      {d.cafeCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div style={{ marginBottom: '1.2rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem' }}>Price (AED) *</label>
                    <input type="number" required step="0.01" value={cafeForm.price} onChange={e => setCafeForm({ ...cafeForm, price: parseFloat(e.target.value) })} style={inp} />
                  </div>
                  <div style={{ marginBottom: '1.2rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem' }}>Product Image</label>
                    <div onClick={() => cafeFileRef.current?.click()} style={{ height: 120, border: '2px dashed #cbd5e1', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: cafeForm.image ? '#000' : '#f8fafc', cursor: 'pointer', overflow: 'hidden', position: 'relative', color: cafeForm.image ? '#fff' : '#64748b' }}>
                      {cafeForm.image ? <Image src={cafeForm.image} alt="Product Preview" fill unoptimized style={{ objectFit: 'cover', opacity: 0.7 }} /> : <><Upload size={22} style={{ marginBottom: '0.4rem' }} /><span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Click to upload product image</span></>}
                      {cafeForm.image && <div style={{ position: 'absolute', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}><Upload size={14} /> Change Image</div>}
                    </div>
                    <input type="file" ref={cafeFileRef} onChange={handleCafeImage} accept="image/*" style={{ display: 'none' }} />
                  </div>
                </>
              )}
              <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setCafeModal(false)} style={{ padding: '0.65rem 1.25rem', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', color: '#64748b' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.65rem 1.75rem', borderRadius: 8, border: 'none', background: '#0f172a', color: '#fff', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>Save {cafeForm.type}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTING CREDIT MODAL */}
      {creditModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 450, boxShadow: '0 25px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Adjust Printing Credits</h2>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>For {creditForm.name}</p>
              </div>
              <button onClick={() => setCreditModal(false)} style={{ background: '#e2e8f0', border: 'none', borderRadius: 8, padding: '0.5rem', cursor: 'pointer', color: '#64748b' }}><X size={18} /></button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); updatePrintingCredits(creditForm.email, creditForm.credits); setCreditModal(false); }} style={{ padding: '2rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.6rem', textTransform: 'uppercase' }}>Credits Balance</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input 
                    type="number" 
                    step="0.5"
                    required 
                    value={creditForm.credits} 
                    onChange={e => setCreditForm({ ...creditForm, credits: e.target.value })} 
                    style={{ ...inp, fontSize: '1.2rem', fontWeight: 800, textAlign: 'center', padding: '1rem' }} 
                  />
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#64748b' }}>
                    = { (parseFloat(creditForm.credits || 0) * 2).toFixed(0) } Pages
                  </div>
                </div>
              </div>

              <div style={{ background: '#f0f9ff', padding: '1rem', borderRadius: 12, border: '1px solid #bae6fd', marginBottom: '2rem' }}>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#0369a1', fontWeight: 600 }}>
                   ⚠️ Updating this will immediately change the user&apos;s available printing balance. 1 Credit = 2 Pages.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => setCreditModal(false)} style={{ flex: 1, padding: '0.8rem', borderRadius: 12, border: '1px solid #e2e8f0', background: '#fff', fontWeight: 700, cursor: 'pointer', color: '#64748b' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '0.8rem', borderRadius: 12, border: 'none', background: '#0f172a', color: '#fff', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(15,23,42,0.2)' }}>Update Balance</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FAQ MODAL */}
      {faqModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 550, boxShadow: '0 25px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{faqForm.id ? 'Edit' : 'Add New'} FAQ</h2>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>Provide clear answers to common customer questions</p>
              </div>
              <button onClick={() => setFaqModal(false)} style={{ background: '#e2e8f0', border: 'none', borderRadius: 8, padding: '0.5rem', cursor: 'pointer', color: '#64748b' }}><X size={18} /></button>
            </div>
            
            <form onSubmit={saveFaq} style={{ padding: '2rem' }}>
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Question</label>
                <input 
                  required 
                  value={faqForm.question} 
                  onChange={e => setFaqForm({ ...faqForm, question: e.target.value })} 
                  placeholder="e.g. How do I top up my printing credits?" 
                  style={inp} 
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Answer</label>
                <textarea 
                  required 
                  rows={4}
                  value={faqForm.answer} 
                  onChange={e => setFaqForm({ ...faqForm, answer: e.target.value })} 
                  placeholder="Provide a detailed answer here..." 
                  style={{ ...inp, resize: 'vertical' }} 
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setFaqModal(false)} style={{ padding: '0.7rem 1.5rem', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', fontWeight: 600, cursor: 'pointer', color: '#64748b' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.7rem 2rem', borderRadius: 10, border: 'none', background: '#0f172a', color: '#fff', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(15,23,42,0.2)' }}>Save FAQ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOCKER MODAL */}
      {lockerModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 500, boxShadow: '0 25px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{lockerForm.id ? 'Edit' : 'Add New'} Locker</h2>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>Configure locker identification and pricing</p>
              </div>
              <button onClick={() => setLockerModal(false)} style={{ background: '#e2e8f0', border: 'none', borderRadius: 8, padding: '0.5rem', cursor: 'pointer', color: '#64748b' }}><X size={18} /></button>
            </div>
            
            <form onSubmit={saveLocker} style={{ padding: '2rem' }}>
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Locker Code *</label>
                <input required value={lockerForm.code} onChange={e => setLockerForm({ ...lockerForm, code: e.target.value })} placeholder="e.g. LK-01" style={inp} />
              </div>
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Locker Name *</label>
                <input required value={lockerForm.name} onChange={e => setLockerForm({ ...lockerForm, name: e.target.value })} placeholder="e.g. Premium Locker 1" style={inp} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Daily Price (AED)</label>
                  <input type="number" required value={lockerForm.price} onChange={e => setLockerForm({ ...lockerForm, price: parseFloat(e.target.value) })} style={inp} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Status</label>
                  <select value={lockerForm.status} onChange={e => setLockerForm({ ...lockerForm, status: e.target.value })} style={inp}>
                    <option value="AVAILABLE">Available</option>
                    <option value="OCCUPIED">Occupied</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setLockerModal(false)} style={{ padding: '0.7rem 1.5rem', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', fontWeight: 600, cursor: 'pointer', color: '#64748b' }}>Cancel</button>
                <button type="submit" disabled={savingLocker} style={{ padding: '0.7rem 2rem', borderRadius: 10, border: 'none', background: '#0f172a', color: '#fff', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(15,23,42,0.2)', opacity: savingLocker ? 0.7 : 1 }}>
                  {savingLocker ? 'Saving...' : 'Save Locker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
