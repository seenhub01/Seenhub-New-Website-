"use client";
import React, { useState, useEffect } from 'react';
import CustomSelect from './CustomSelect';
import { Calendar, Trash2, Tag } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useRouter } from 'next/navigation';

export default function BookingForm({ onComplete }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState('workspaces');
  const [workspacesData, setWorkspacesData] = useState([]);
  const [eventsData, setEventsData] = useState([]);
  const [lockersData, setLockersData] = useState([]);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', bookingType: 'Hourly', date: '', timeFrom: '', timeTo: '',
    guests: '1', space: '', notes: '', addons: [], lockerCode: '', printingBundles: 0,
    couponCode: '', discountPercent: 0, appliedCoupon: '',
  });
  const [availability, setAvailability] = useState(null); // null | { available, unit, totalUnits }
  const [checkingAvail, setCheckingAvail] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [occupiedSlots, setOccupiedSlots] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Client-side initialization
    const params = new URLSearchParams(window.location.search);
    const catParam = params.get('category');
    const serviceParam = params.get('service');
    const guestsParam = params.get('guests');
    const defaultCat = localStorage.getItem('seenhub_default_category');
    
    const finalCat = catParam || defaultCat || 'workspaces';
    setCategory(finalCat);
    if (finalCat === 'events') setStep(3);

    const storedEvents = JSON.parse(localStorage.getItem('seenhub_events') || '[]');
    setEventsData(storedEvents);

    const storedUser = localStorage.getItem('seenhub_user');
    let u = null;
    if (storedUser) {
      u = JSON.parse(storedUser);
      setUser(u);
    }

    setFormData(prev => {
      const updated = { ...prev };
      if (serviceParam) updated.space = serviceParam;
      if (guestsParam) updated.guests = guestsParam;
      if (u) {
        updated.name = u.name || '';
        updated.email = u.email || '';
      }

      if (finalCat === 'events' && serviceParam) {
        const ev = storedEvents.find(e => e.title === serviceParam);
        if (ev) {
          updated.date = ev.startDate;
          updated.timeFrom = ev.startTime;
          updated.timeTo = ev.endTime;
          updated.bookingType = 'Event';
        }
      }
      return updated;
    });

    if (defaultCat) localStorage.removeItem('seenhub_default_category');
  }, []);
  const [printSettings, setPrintSettings] = useState({ printCreditToPageRatio: 5, printAedToCreditRatio: 0.2, printMinTopUp: 2 }); // Defaults matching the user's screenshot
  const [taxSettings, setTaxSettings] = useState({ taxEnabled: false, taxPercentage: 5 });

  const toMin = (t) => {
    if (!t) return 0;
    const [h, m] = t.split(':').map(Number);
    return h * 60 + (m || 0);
  };

  const isTimeInSlot = (t, start, end) => {
    const time = toMin(t);
    return time >= toMin(start) && time < toMin(end);
  };

  const slotsOverlap = (fromA, toA, fromB, toB) => {
    return toMin(fromA) < toMin(toB) && toMin(toA) > toMin(fromB);
  };
  
  useEffect(() => {
    // Initial fetch for workspaces
    const fetchWorkspaces = async () => {
      try {
        const res = await fetch('/api/workspaces', { cache: 'no-store' });
        const data = await res.json();
        if (Array.isArray(data)) {
          setWorkspacesData(data);
        } else {
          const savedWs = JSON.parse(localStorage.getItem('seenhub_workspaces') || '[]');
          setWorkspacesData(savedWs);
        }
      } catch (e) {
        console.error("Failed to fetch workspaces:", e);
        const savedWs = JSON.parse(localStorage.getItem('seenhub_workspaces') || '[]');
        setWorkspacesData(savedWs);
      }
    };

    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings', { cache: 'no-store' });
        const data = await res.json();
        if (data) {
          setPrintSettings({
            printCreditToPageRatio: data.printCreditToPageRatio || 5,
            printAedToCreditRatio: data.printAedToCreditRatio || 0.2,
            printMinTopUp: data.printMinTopUp || 2
          });
          setTaxSettings({
            taxEnabled: !!data.taxEnabled,
            taxPercentage: data.taxPercentage || 5
          });
        }
      } catch (e) {
        console.error("Failed to fetch settings:", e);
      }
    };
    fetchWorkspaces();
    fetchSettings();

    // Fetch Lockers
    fetch('/api/lockers', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setLockersData(data);
      })
      .catch(e => console.error("Locker fetch error:", e));

  }, []);



  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCustomSelectChange = (name, value) => {
    setFormData(prev => {
      let update = { [name]: value };
      
      // Auto-set "To" time to 1 hour later whenever "From" is changed
      if (name === 'timeFrom') {
        let h, m;
        if (value === 'now') {
          const now = new Date();
          h = now.getHours();
          m = now.getMinutes();
        } else {
          [h, m] = value.split(':').map(Number);
        }
        
        update.timeFrom = `${h}:${String(m).padStart(2, '0')}`;
        
        // Auto-set timeTo to 1 hour later, capped at closing time
        let nextMins = (h * 60 + m) + 60;
        
        let closingTotal = 22 * 60;
        const selectedWs = workspacesData.find(ws => ws.title === prev.space);
        if (selectedWs?.workingHours && prev.date) {
          const dayName = new Date(prev.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' });
          const dayHours = selectedWs.workingHours[dayName];
          if (dayHours && dayHours.to) {
            const [cH, cM] = dayHours.to.split(':').map(Number);
            closingTotal = cH * 60 + cM;
          }
        }

        if (nextMins > closingTotal) {
          nextMins = closingTotal;
        }

        const nextH = Math.floor(nextMins / 60);
        const nextMinStr = String(nextMins % 60).padStart(2, '0');
        update.timeTo = `${nextH}:${nextMinStr}`;
      }

      if (name === 'space' && category === 'memberships') {
        if (value.toLowerCase().includes('day') || value.toLowerCase().includes('daily')) {
          update.bookingType = 'Daily';
        } else if (value.toLowerCase().includes('monthly') || value.toLowerCase().includes('student')) {
          update.bookingType = 'Monthly';
        } else {
          update.bookingType = 'Monthly';
        }
      }
      if (name === 'space' && category === 'events') {
        const ev = eventsData.find(e => e.title === value);
        if (ev) {
          update.date = ev.startDate;
          update.timeFrom = ev.startTime;
          update.timeTo = ev.endTime;
          update.bookingType = 'Event';
        }
      }
      return { ...prev, ...update };
    });
  };

  const handleAddonToggle = (addon) => {
    setFormData(prev => {
      if (prev.addons.includes(addon)) {
        return { ...prev, addons: prev.addons.filter(a => a !== addon) };
      } else {
        return { ...prev, addons: [...prev.addons, addon] };
      }
    });
  };

  const handleApplyCoupon = async () => {
    if (!formData.couponCode) return;
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: formData.couponCode, category })
      });
      const data = await res.json();
      
      if (data.success) {
        setFormData({ ...formData, discountPercent: data.discount, appliedCoupon: data.code });
        alert(`Success! ${data.discount}% discount applied.`);
      } else {
        alert(data.error || "Invalid coupon code.");
        setFormData({ ...formData, discountPercent: 0, appliedCoupon: '' });
      }
    } catch (e) {
      alert("Error validating coupon.");
      setFormData({ ...formData, discountPercent: 0, appliedCoupon: '' });
    }
  };

  const calculateFinalPrice = () => {
    const total = calculatePrice();
    if (formData.discountPercent > 0) {
      return Math.round(total * (1 - formData.discountPercent / 100));
    }
    return total;
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  // Auto-calculate end date
  const calculatedEndDate = React.useMemo(() => {
    let endDate = '';
    if (formData.date) {
      const startDate = new Date(formData.date);
      if (category === 'workspaces' && (formData.bookingType === 'Weekly' || formData.bookingType === 'Monthly')) {
        if (formData.bookingType === 'Weekly') {
          startDate.setDate(startDate.getDate() + 7);
        } else if (formData.bookingType === 'Monthly') {
          startDate.setMonth(startDate.getMonth() + 1);
        }
        endDate = startDate.toISOString().split('T')[0];
      } else if (category === 'memberships' && formData.space) {
        if (formData.space.includes('Day Pass') || formData.space.includes('Daily Pass')) {
          startDate.setDate(startDate.getDate() + 1); 
        } else if (formData.space.includes('Monthly') || formData.space.includes('Student')) {
          startDate.setMonth(startDate.getMonth() + 1); 
        } else {
          startDate.setMonth(startDate.getMonth() + 1); 
        }
        endDate = startDate.toISOString().split('T')[0];
      }
    }
    return endDate;
  }, [formData.date, category, formData.bookingType, formData.space]);

  useEffect(() => {
    const checkAvailability = async () => {
      if ((category === 'workspaces' || category === 'memberships') && (!formData.space || !formData.date)) {
        // Move state updates inside an async block or ensure they aren't synchronous if possible
        // But here, we just want to clear them.
        setAvailability(null);
        setOccupiedSlots([]);
        return;
      }

      setCheckingAvail(true);
      try {
        const ws = workspacesData.find(w => w.title === formData.space);
        const totalUnits = ws?.units || 1;
        
        // 1. Check specific selection availability
        const params = new URLSearchParams({
          space: formData.space,
          date: formData.date,
          bookingType: formData.bookingType,
          units: totalUnits,
          ...(formData.bookingType === 'Hourly' ? { timeFrom: formData.timeFrom, timeTo: formData.timeTo } : {}),
          calculatedEndDate: calculatedEndDate || ''
        });
        const res = await fetch(`/api/bookings?${params}`);
        const data = await res.json();
        setAvailability(data);

        const allRes = await fetch(`/api/bookings?space=${encodeURIComponent(formData.space)}`);
        const allData = await allRes.json();
        const dayBookings = Array.isArray(allData) ? allData.filter(b => {
          if (b.space !== formData.space || b.status === 'Cancelled') return false;
          
          // Date overlap check
          const bStart = new Date(b.date);
          const bEnd = b.calculatedEndDate ? new Date(b.calculatedEndDate) : new Date(b.date);
          const reqDate = new Date(formData.date);
          
          bStart.setHours(0,0,0,0);
          bEnd.setHours(23,59,59,999);
          reqDate.setHours(12,0,0,0); 
          
          return (reqDate >= bStart && reqDate <= bEnd);
        }) : [];
        setOccupiedSlots(dayBookings);
      } catch (e) {
        console.error("Availability check failed:", e);
      } finally {
        setCheckingAvail(false);
      }
    };

    const timeoutId = setTimeout(() => {
      checkAvailability();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [category, formData.space, formData.date, formData.timeFrom, formData.timeTo, formData.bookingType, calculatedEndDate, workspacesData]);

  // Handle late locker assignment if addon was checked before availability arrived
  useEffect(() => {
    if (formData.addons.includes('Locker') && !formData.lockerCode && availability?.availableLocker) {
      setFormData(prev => ({ ...prev, lockerCode: availability.availableLocker }));
    }
  }, [availability, formData.addons, formData.lockerCode]);

  // Build workspace options dynamically from fetched data
  const workspaceOptions = Array.isArray(workspacesData) 
    ? workspacesData.map(ws => ({ label: ws.title, value: ws.title }))
    : [];

  const membershipOptions = [
    { label: 'Day Pass-Coworking Space', value: 'Day Pass' },
    { label: 'Monthly Membership', value: 'Monthly Membership' },
    { label: 'Student Membership', value: 'Student Membership' },
    { label: 'VIP Daily Pass', value: 'VIP Daily Pass' },
  ];

  const eventOptions = eventsData
    .filter(ev => {
      if (ev.status === 'Cancelled') return false;
      const today = new Date();
      today.setHours(0,0,0,0);
      const evEnd = new Date(ev.endDate || ev.startDate);
      evEnd.setHours(23,59,59,999);
      return evEnd >= today;
    })
    .map(ev => ({ label: ev.title, value: ev.title }));

  // Get the selected workspace's full data
  const selectedWs = Array.isArray(workspacesData) ? workspacesData.find(ws => ws.title === formData.space) : null;

  // Available booking types for the selected workspace
  const availableBookingTypes = selectedWs?.bookingTypes || ['Hourly', 'Daily', 'Weekly', 'Monthly'];

  // Time options filtered by the workspace's working hours for the selected day
  const getTimeOptions = () => {
    if (!selectedWs?.workingHours || !formData.date) {
      const opts = [];
      for (let i = 8; i <= 22; i++) {
        const ampm = i >= 12 ? 'PM' : 'AM';
        const h12 = i % 12 || 12;
        opts.push({ label: `${h12}:00 ${ampm}`, value: `${i}:00` });
      }
      return opts;
    }
    const dayName = new Date(formData.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' });
    const dayHours = selectedWs.workingHours?.[dayName];
    
    if (dayHours && dayHours.enabled === false) {
      return [{ label: `Closed on ${dayName}`, value: '' }];
    }
    
    const [fromH, fromM] = (dayHours?.from || '08:00').split(':').map(Number);
    const [toH, toM] = (dayHours?.to || '22:00').split(':').map(Number);
    const fromTotal = fromH * 60 + fromM;
    const toTotal = toH * 60 + toM;
    const opts = [];
    
    const today = new Date();
    const tYear = today.getFullYear();
    const tMonth = String(today.getMonth() + 1).padStart(2, '0');
    const tDay = String(today.getDate()).padStart(2, '0');
    const todayStr = `${tYear}-${tMonth}-${tDay}`;
    const isToday = formData.date === todayStr;
    const now = new Date();
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

    for (let m = fromTotal; m <= toTotal; m += 60) {
      // If today, skip times that have already passed
      if (isToday && m < currentTotalMinutes) continue;

      const h24 = Math.floor(m / 60);
      const min = m % 60;
      const value = `${h24}:${min === 0 ? '00' : String(min).padStart(2, '0')}`;
      const ampm = h24 >= 12 ? 'PM' : 'AM';
      const h12 = h24 % 12 || 12;
      const label = `${h12}:${min === 0 ? '00' : String(min).padStart(2, '0')} ${ampm}`;
      opts.push({ label, value });
    }

    const availableOptions = opts.filter(opt => {
      const ws = workspacesData.find(w => w.title === formData.space);
      const totalUnits = ws?.units || 1;
      const concurrent = occupiedSlots.filter(b => {
        if (b.bookingType !== 'Hourly') return true; 
        return isTimeInSlot(opt.value, b.timeFrom, b.timeTo);
      }).length;
      return concurrent < totalUnits;
    });

    if (availableOptions.length === 0) {
      return [{ label: isToday ? 'No more slots today' : 'No available slots', value: '' }];
    }

    return availableOptions;
  };

  const getAllTimeOptions = () => {
    if (!selectedWs?.workingHours || !formData.date) {
      const opts = [];
      for (let i = 8; i <= 22; i++) {
        const ampm = i >= 12 ? 'PM' : 'AM';
        const h12 = i % 12 || 12;
        opts.push({ label: `${h12}:00 ${ampm}`, value: `${i}:00` });
      }
      return opts;
    }
    const dayName = new Date(formData.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' });
    const dayHours = selectedWs.workingHours?.[dayName];
    if (dayHours && dayHours.enabled === false) return [];
    
    const [fromH, fromM] = (dayHours?.from || '08:00').split(':').map(Number);
    const [toH, toM] = (dayHours?.to || '22:00').split(':').map(Number);
    const fromTotal = fromH * 60 + fromM;
    const toTotal = toH * 60 + toM;
    const opts = [];
    for (let m = fromTotal; m <= toTotal; m += 60) {
      const h24 = Math.floor(m / 60);
      const min = m % 60;
      const value = `${h24}:${String(min).padStart(2, '0')}`;
      const ampm = h24 >= 12 ? 'PM' : 'AM';
      const h12 = h24 % 12 || 12;
      opts.push({ label: `${h12}:${String(min).padStart(2, '0')} ${ampm}`, value });
    }
    return opts;
  };

  const timeOptionsList = getTimeOptions();
  const allDayTimeOptions = getAllTimeOptions();

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;
  const isToday = formData.date === todayStr;

  const formatTimeDisplay = (val) => {
    if (!val) return '';
    const [h, m] = val.split(':').map(Number);
    if (isNaN(h)) return val;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${String(m || 0).padStart(2, '0')} ${ampm}`;
  };

  const fromOptionsList = isToday ? [{ label: 'Now', value: 'now' }, ...timeOptionsList] : [...timeOptionsList];
  if (formData.timeFrom && formData.timeFrom !== 'now' && !fromOptionsList.find(o => o.value === formData.timeFrom)) {
    fromOptionsList.unshift({ label: formatTimeDisplay(formData.timeFrom), value: formData.timeFrom });
  }

  const getToTimeOptions = () => {
    let closingTotal = 22 * 60;
    if (selectedWs?.workingHours && formData.date) {
      const dayName = new Date(formData.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' });
      const dayHours = selectedWs.workingHours[dayName];
      if (dayHours && dayHours.to) {
        const [h, m] = dayHours.to.split(':').map(Number);
        closingTotal = h * 60 + m;
      }
    }

    let startTotal;
    if (formData.timeFrom === 'now') {
      const now = new Date();
      startTotal = Math.min(closingTotal, now.getHours() * 60 + now.getMinutes() + 15); // Minimum 15 mins from now, capped at closing
    } else if (formData.timeFrom) {
      const [fromH, fromM] = formData.timeFrom.split(':').map(Number);
      startTotal = Math.min(closingTotal, fromH * 60 + fromM + 15); // Minimum 15 mins after from time
    } else {
      return [...timeOptionsList];
    }

    const opts = [];
    // Use allDayTimeOptions to ensure we see all potential end times
    allDayTimeOptions.forEach(opt => {
      const [h, m] = opt.value.split(':').map(Number);
      const total = h * 60 + m;
      if (total >= startTotal && total <= closingTotal) {
        opts.push(opt);
      }
    });

    // 2. Add the exact "1 hour later" slot
    let oneHourLater;
    if (formData.timeFrom === 'now') {
      const now = new Date();
      oneHourLater = now.getHours() * 60 + now.getMinutes() + 60;
    } else {
      const [fromH, fromM] = formData.timeFrom.split(':').map(Number);
      oneHourLater = fromH * 60 + fromM + 60;
    }
    
    if (oneHourLater <= closingTotal) {
      const h24 = Math.floor(oneHourLater / 60);
      const min = oneHourLater % 60;
      const val = `${h24}:${String(min).padStart(2, '0')}`;
      if (!opts.find(o => o.value === val)) {
        const ampm = h24 >= 12 ? 'PM' : 'AM';
        const h12 = h24 % 12 || 12;
        opts.push({ label: `${h12}:${String(min).padStart(2, '0')} ${ampm}`, value: val });
      }
    } else {
      // If 1 hour later is past closing, add closing time if not already there
      const h24 = Math.floor(closingTotal / 60);
      const min = closingTotal % 60;
      const val = `${h24}:${String(min).padStart(2, '0')}`;
      if (!opts.find(o => o.value === val)) {
        const ampm = h24 >= 12 ? 'PM' : 'AM';
        const h12 = h24 % 12 || 12;
        opts.push({ label: `${h12}:${String(min).padStart(2, '0')} ${ampm}`, value: val });
      }
    }

    // 3. Always ensure closing time is an option if we can still book something
    const closingVal = `${Math.floor(closingTotal / 60)}:${String(closingTotal % 60).padStart(2, '0')}`;
    if (!opts.find(o => o.value === closingVal)) {
      const h24 = Math.floor(closingTotal / 60);
      const min = closingTotal % 60;
      const ampm = h24 >= 12 ? 'PM' : 'AM';
      const h12 = h24 % 12 || 12;
      opts.push({ label: `${h12}:${String(min).padStart(2, '0')} ${ampm}`, value: closingVal });
    }

    // Sort options by time
    opts.sort((a, b) => {
      const [ah, am] = a.value.split(':').map(Number);
      const [bh, bm] = b.value.split(':').map(Number);
      return (ah * 60 + am) - (bh * 60 + bm);
    });

    // 4. Filter options by availability (unit overlap)
    const filteredOpts = opts.filter(opt => {
      const ws = workspacesData.find(w => w.title === formData.space);
      const totalUnits = ws?.units || 1;
      const concurrent = occupiedSlots.filter(b => {
        if (b.bookingType !== 'Hourly') return true; 
        return slotsOverlap(formData.timeFrom, opt.value, b.timeFrom, b.timeTo);
      }).length;
      return concurrent < totalUnits;
    });

    if (filteredOpts.length === 0) {
      return [{ label: 'No available end slots', value: '' }];
    }
    return filteredOpts;
  };

  const toOptionsListBase = formData.timeFrom ? getToTimeOptions() : [...timeOptionsList];
  const toOptionsList = [...toOptionsListBase];
  if (formData.timeTo && !toOptionsList.find(o => o.value === formData.timeTo)) {
    toOptionsList.unshift({ label: formatTimeDisplay(formData.timeTo), value: formData.timeTo });
  }

  const membershipPrices = {
    'Day Pass': 100,
    'Monthly Membership': 1500,
    'Student Membership': 800,
    'VIP Daily Pass': 250
  };

  const calculatePrice = () => {
    let subtotal = 0;
    let durationLabel = '';
    let spaceSubtotal = 0;
    const isCorp = user?.role === 'Corporate' || user?.isCorporate;
    const pType = isCorp ? 'corporate' : 'individual';

    if (category === 'workspaces' && selectedWs) {
      const pricing = selectedWs.pricing || {};
      // Use individual pricing (can later be extended for corporate)
      if (formData.bookingType === 'Hourly') {
        let hours = 1;
        if (formData.timeFrom && formData.timeTo) {
          const fromParts = formData.timeFrom.split(':');
          const toParts = formData.timeTo.split(':');
          const from = parseInt(fromParts[0]) + (fromParts[1] === '30' ? 0.5 : 0);
          const to = parseInt(toParts[0]) + (toParts[1] === '30' ? 0.5 : 0);
          hours = Math.max(1, to - from);
        }
        const hourPrice = pricing.hourly?.individual || 0;
        spaceSubtotal = hourPrice * hours;
        durationLabel = `${hours} Hour(s) - Hourly (${hours} x AED ${hourPrice})`;
      } else if (formData.bookingType === 'Daily') {
        const dayPrice = pricing.daily?.individual || 0;
        spaceSubtotal = dayPrice;
        durationLabel = `Daily Booking (1 Day x AED ${dayPrice})`;
      } else if (formData.bookingType === 'Weekly') {
        const weekPrice = pricing.weekly?.individual || 0;
        spaceSubtotal = weekPrice;
        durationLabel = `Weekly Booking (1 Week x AED ${weekPrice})`;
      } else if (formData.bookingType === 'Monthly') {
        const monthPrice = pricing.monthly?.[pType] || 0;
        spaceSubtotal = monthPrice;
        durationLabel = `Monthly Booking (1 Month x AED ${monthPrice})${isCorp ? ' [Corp Rate]' : ''}`;
      }
      // Extra guests
      const extraGuests = Math.max(0, parseInt(formData.guests || 1) - 1);
      const extraGuestPrice = selectedWs.extraGuestPrice?.[pType] || 0;
      if (extraGuests > 0 && extraGuestPrice > 0) {
        subtotal += extraGuests * extraGuestPrice;
      }
    } else if (category === 'memberships') {
      const basePrice = membershipPrices[formData.space] || 0;
      spaceSubtotal = basePrice;
      durationLabel = `Pass - ${formData.space} (1 Pass x AED ${basePrice})`;
    } else if (category === 'events') {
      const ev = eventsData.find(e => e.title === formData.space);
      const basePrice = ev?.price || 0;
      const ticketCount = parseInt(formData.guests || 1);
      spaceSubtotal = basePrice * ticketCount;
      durationLabel = `Event Ticket - ${formData.space} (${ticketCount} Ticket${ticketCount > 1 ? 's' : ''} x AED ${basePrice})`;
    }

    subtotal += spaceSubtotal;

    let addonTotal = 0;
    if (formData.addons.includes('Locker')) {
      const selectedLocker = lockersData.find(l => l.code === formData.lockerCode);
      addonTotal += (selectedLocker?.price || 10);
    }
    if (formData.printingBundles > 0) {
      const pricePerBundle = 1 / (printSettings.printAedToCreditRatio || 1);
      addonTotal += (formData.printingBundles * pricePerBundle);
    }
    subtotal += addonTotal;

    const taxRate = taxSettings.taxEnabled ? (taxSettings.taxPercentage / 100) : 0;
    const discount = subtotal * (formData.discountPercent / 100);
    const subtotalAfterDiscount = subtotal - discount;
    const tax = subtotalAfterDiscount * taxRate;
    const total = subtotalAfterDiscount + tax;

    return { subtotal, discount, tax, total, durationLabel, spaceSubtotal };
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return 'DD/MM/YYYY';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const getMinDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const minDate = getMinDate();



  const handleSubmit = (e) => {
    e.preventDefault();
    const priceBreakdown = calculatePrice();
    const params = new URLSearchParams({
      category: category,
      service: formData.space,
      guests: formData.guests || '1',
      date: formData.date,
      timeFrom: formData.timeFrom || '',
      timeTo: formData.timeTo || '',
      subtotal: priceBreakdown.spaceSubtotal.toString(),
      total: priceBreakdown.total.toString(),
      bookingType: formData.bookingType || '',
      printingBundles: formData.printingBundles.toString(),
      lockerCode: formData.lockerCode || '',
      priceType: (user?.role === 'Corporate' || user?.isCorporate) ? 'Corporate' : 'Individual'
    });
    router.push(`/checkout?${params.toString()}`);
  };

  const isStep1Valid = formData.space !== '';
  const isStep2Valid = (() => {
    if (category === 'workspaces' && formData.bookingType === 'Hourly') {
      if (!formData.date || !formData.timeFrom || !formData.timeTo || !formData.guests) return false;
      
      const toMin = (t) => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
      };
      return toMin(formData.timeTo) > toMin(formData.timeFrom);
    }
    return formData.date && formData.guests;
  })();

  return (
    <div className="booking-form-wrapper">
      <div className="step-indicator">
        <div className={`step ${step >= 1 ? 'active' : ''}`}>1</div>
        <div className="step-line"></div>
        <div className={`step ${step >= 2 ? 'active' : ''}`}>2</div>
        <div className="step-line"></div>
        <div className={`step ${step >= 3 ? 'active' : ''}`}>3</div>
      </div>

      <div className="booking-card animate-fade-in">
        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="form-step">
              <div className="form-header">
                <h3>Choose your preferred Space</h3>
                <p>Select a category and workspace.</p>
              </div>
              
              <div className="form-group">
                <label>Category</label>
                <div className="category-toggle">
                  <button 
                    type="button" 
                    className={`toggle-btn ${category === 'workspaces' ? 'active' : ''}`}
                    onClick={() => { setCategory('workspaces'); setFormData({...formData, space: '', discountPercent: 0, appliedCoupon: '', couponCode: ''}); }}
                  >
                    Workspaces
                  </button>
                  <button 
                    type="button" 
                    className={`toggle-btn ${category === 'memberships' ? 'active' : ''}`}
                    onClick={() => { setCategory('memberships'); setFormData({...formData, space: '', discountPercent: 0, appliedCoupon: '', couponCode: ''}); }}
                  >
                    Memberships
                  </button>
                  <button 
                    type="button" 
                    className={`toggle-btn ${category === 'events' ? 'active' : ''}`}
                    onClick={() => { setCategory('events'); setFormData({...formData, space: '', discountPercent: 0, appliedCoupon: '', couponCode: ''}); }}
                  >
                    Events
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Spaces / Events</label>
                <CustomSelect 
                  options={category === 'workspaces' ? workspaceOptions : (category === 'memberships' ? membershipOptions : eventOptions)}
                  value={formData.space}
                  onChange={(val) => handleCustomSelectChange('space', val)}
                  placeholder={`Select a ${category === 'workspaces' ? 'Workspace' : (category === 'memberships' ? 'Membership' : 'Event')}`}
                />
              </div>

              {category === 'workspaces' && (
                <div className="form-group" style={{marginTop: '1.5rem'}}>
                  <label>Booking Type</label>
                  <div className="type-grid">
                    {availableBookingTypes.map(type => (
                      <button
                        key={type}
                        type="button"
                        className={`type-btn ${formData.bookingType === type ? 'active' : ''}`}
                        onClick={() => handleCustomSelectChange('bookingType', type)}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="btn-group single-btn">
                <button type="button" className="btn-dark" onClick={nextStep} disabled={!isStep1Valid}>Next Step</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="form-step">
              <div className="form-header">
                <h3>Schedule & Details</h3>
                <p>When are you planning to visit?</p>
              </div>
              
              {category === 'workspaces' && (formData.bookingType === 'Hourly' || formData.bookingType === 'Daily') && (
                <div className="form-group">
                  <label>Date</label>
                  <div className="custom-date-wrapper modern-datepicker-wrapper">
                    <DatePicker
                      selected={formData.date ? new Date(formData.date + 'T12:00:00') : null}
                      onChange={(date) => {
                        if (date) {
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(2, '0');
                          const day = String(date.getDate()).padStart(2, '0');
                          setFormData({ ...formData, date: `${year}-${month}-${day}` });
                        } else {
                          setFormData({ ...formData, date: '' });
                        }
                      }}
                      minDate={new Date()}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="DD/MM/YYYY"
                      className="modern-date-input"
                      calendarClassName="modern-calendar"
                      required
                    />
                    <Calendar size={18} color="#888" className="calendar-icon-overlay" />
                  </div>
                </div>
              )}

              {(category === 'memberships' || (category === 'workspaces' && (formData.bookingType === 'Weekly' || formData.bookingType === 'Monthly'))) && (
                <div className="input-grid">
                  <div className="form-group">
                    <label>Start Date</label>
                    <div className="custom-date-wrapper modern-datepicker-wrapper">
                      <DatePicker
                        selected={formData.date ? new Date(formData.date + 'T12:00:00') : null}
                        onChange={(date) => {
                          if (date) {
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const day = String(date.getDate()).padStart(2, '0');
                            setFormData({ ...formData, date: `${year}-${month}-${day}` });
                          } else {
                            setFormData({ ...formData, date: '' });
                          }
                        }}
                        minDate={new Date()}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="DD/MM/YYYY"
                        className="modern-date-input"
                        calendarClassName="modern-calendar"
                        required
                      />
                      <Calendar size={18} color="#888" className="calendar-icon-overlay" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <div className="custom-date-wrapper">
                      <div className="custom-date-display read-only-date">
                        <span>{formatDateDisplay(calculatedEndDate)}</span>
                        <Calendar size={18} color="#aaa" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {category === 'workspaces' && formData.bookingType === 'Hourly' && (
                <div className="input-grid">
                  <div className="form-group">
                    <label>From</label>
                    <CustomSelect 
                      options={fromOptionsList}
                      value={formData.timeFrom}
                      onChange={(val) => handleCustomSelectChange('timeFrom', val)}
                      placeholder="Select time"
                      disabled={!formData.date}
                    />
                  </div>
                  <div className="form-group">
                    <label>To</label>
                    <CustomSelect 
                      options={toOptionsList}
                      value={formData.timeTo}
                      onChange={(val) => handleCustomSelectChange('timeTo', val)}
                      placeholder="Select time"
                      disabled={!formData.date}
                    />
                  </div>
                </div>
              )}

              {/* Availability Status Badge */}
              {category === 'workspaces' && formData.space && formData.date && (
                <div style={{ margin: '1rem 0', padding: '0.75rem 1rem', borderRadius: 10, display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', fontWeight: 600,
                  background: checkingAvail ? '#f8fafc' : availability?.available === false ? '#fef2f2' : availability?.available ? '#f0fdf4' : '#f8fafc',
                  border: checkingAvail ? '1px solid #e2e8f0' : availability?.available === false ? '1px solid #fecaca' : availability?.available ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                  color: checkingAvail ? '#64748b' : availability?.available === false ? '#dc2626' : availability?.available ? '#16a34a' : '#64748b'
                }}>
                  {checkingAvail && <span style={{ fontSize: '1rem' }}>⏳</span>}
                  {!checkingAvail && availability?.available === false && <span style={{ fontSize: '1rem' }}>🚫</span>}
                  {!checkingAvail && availability?.available === true && <span style={{ fontSize: '1rem' }}>✅</span>}
                  {!checkingAvail && !availability && <span style={{ fontSize: '1rem' }}>📅</span>}
                  <span>
                    {checkingAvail && 'Checking availability...'}
                    {!checkingAvail && availability?.available === false && `All ${availability.totalUnits} unit(s) of "${formData.space}" are fully booked for this slot. Please choose a different time.`}
                    {!checkingAvail && availability?.available === true && (
                      <span>
                        ✓ Available
                      </span>
                    )}
                    {!checkingAvail && !availability && 'Select date & time to check availability'}
                  </span>
                </div>
              )}

              <div className="form-group">
                <label>Number of Guests</label>
                <input 
                  type="number" 
                  name="guests" 
                  value={formData.guests} 
                  onChange={handleChange} 
                  min="1" 
                  max={selectedWs?.maxGuests || 50} 
                  required 
                  placeholder="1"
                />
                {selectedWs?.maxGuests && <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '0.3rem 0 0' }}>Max capacity: {selectedWs.maxGuests} guests</p>}
              </div>

              <div className="btn-group">
                <button type="button" className="btn-light" onClick={prevStep}>Back</button>
                <button type="button" className="btn-dark" onClick={nextStep} disabled={!isStep2Valid || availability?.available === false}>Next Step</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="form-step">
              <div className="form-header">
                <h3>Add-ons & Summary</h3>
                <p>Choose additional services or add-ons.</p>
              </div>

              <div className="addons-card">
                <label className="addons-label">Add extra services (optional):</label>
                
                <div className="addon-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <label className="addon-checkbox-label" style={{ width: '100%' }}>
                    <input 
                      type="checkbox" 
                      checked={formData.addons.includes('Locker')}
                      onChange={() => {
                        if (formData.addons.includes('Locker')) {
                          setFormData(prev => ({ 
                            ...prev, 
                            addons: prev.addons.filter(a => a !== 'Locker'),
                            lockerCode: ''
                          }));
                        } else {
                          const assignedLockerCode = availability?.availableLocker;
                          if (assignedLockerCode) {
                            setFormData(prev => ({ 
                              ...prev, 
                              addons: [...prev.addons, 'Locker'],
                              lockerCode: assignedLockerCode
                            }));
                          } else {
                            // Fallback to local status if API hasn't loaded or date not selected
                            const availableLockers = lockersData.filter(l => l.status === 'AVAILABLE');
                            if (availableLockers.length > 0) {
                              setFormData(prev => ({ 
                                ...prev, 
                                addons: [...prev.addons, 'Locker'],
                                lockerCode: availableLockers[0].code
                              }));
                            } else {
                              alert("Sorry, no lockers are currently available for this date.");
                            }
                          }
                        }
                      }}
                    />
                    <span className="custom-checkbox"></span>
                    Book a Locker (Full Day)
                  </label>
                  
                  {formData.addons.includes('Locker') && (
                    <div style={{ width: '100%', marginLeft: '2.5rem' }}>
                      <p style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 700, margin: 0 }}>
                        ✓ Locker Assigned: {formData.lockerCode || 'Pending Assignment...'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="addon-item bundle-item">
                  <div className="bundle-info">
                    <strong>Printing Credits - AED {(1 / (printSettings.printAedToCreditRatio || 1)).toFixed(2)}</strong>
                    <span className="bundle-hint">1 Credit = {printSettings.printCreditToPageRatio} Pages</span>
                  </div>
                  <div className="counter-controls">
                    <button type="button" onClick={() => setFormData(prev => {
                      // If decrementing from 2, snap to 0
                      if (prev.printingBundles <= 2) return { ...prev, printingBundles: 0 };
                      return { ...prev, printingBundles: prev.printingBundles - 1 };
                    })}>-</button>
                    <span>{formData.printingBundles}</span>
                    <button type="button" onClick={() => setFormData(prev => {
                      // If starting from 0, jump to 2 (or minimum credits based on AED top-up)
                      if (prev.printingBundles === 0) {
                        const minCredits = Math.ceil((printSettings.printMinTopUp || 2) * (printSettings.printAedToCreditRatio || 1));
                        return { ...prev, printingBundles: Math.max(2, minCredits) };
                      }
                      return { ...prev, printingBundles: prev.printingBundles + 1 };
                    })}>+</button>
                  </div>
                </div>
              </div>

              {(() => {
                const { subtotal, discount, tax, total, durationLabel, spaceSubtotal } = calculatePrice();
                return (
                  <div className="invoice-summary">
                    <div className="invoice-row item-row">
                      <span>{durationLabel}</span>
                      <span className="price-col">AED {spaceSubtotal.toFixed(2)} <Trash2 size={16} color="#ef4444" className="trash-icon" onClick={() => { setFormData({...formData, space: ''}); setStep(1); }} /></span>
                    </div>
                    {parseInt(formData.guests) > 1 && (() => {
                      const isCorp = user?.role === 'Corporate' || user?.isCorporate;
                      const pType = isCorp ? 'corporate' : 'individual';
                      const extraGuests = parseInt(formData.guests) - 1;
                      const extraGuestPrice = selectedWs?.extraGuestPrice?.[pType] || 0;
                      const totalExtraGuestPrice = extraGuests * extraGuestPrice;
                      return (
                        <div className="invoice-row item-row">
                          <span>Guests (+{extraGuests})</span>
                          <span className="price-col">AED {totalExtraGuestPrice.toFixed(2)} <Trash2 size={16} color="#ef4444" className="trash-icon" onClick={() => setFormData({...formData, guests: '1'})} /></span>
                        </div>
                      );
                    })()}
                    {formData.addons.includes('Locker') && (
                      <div className="invoice-row item-row">
                        <span>Locker Add-on ({formData.lockerCode})</span>
                        <span className="price-col">AED {(lockersData.find(l => l.code === formData.lockerCode)?.price || 10).toFixed(2)} <Trash2 size={16} color="#ef4444" className="trash-icon" onClick={() => { handleAddonToggle('Locker'); setFormData({...formData, lockerCode: ''}); }} /></span>
                      </div>
                    )}
                    {formData.printingBundles > 0 && (
                      <div className="invoice-row item-row">
                        <span>Printing Credits (x{formData.printingBundles})</span>
                        <span className="price-col">AED {(formData.printingBundles * (1 / (printSettings.printAedToCreditRatio || 1))).toFixed(2)} <Trash2 size={16} color="#ef4444" className="trash-icon" onClick={() => setFormData({...formData, printingBundles: 0})} /></span>
                      </div>
                    )}
                    
                    <hr className="invoice-divider" />
                    
                    <div className="invoice-row">
                      <span>Subtotal</span>
                      <span>AED {subtotal.toFixed(2)}</span>
                    </div>
                    
                    {discount > 0 && (
                      <div className="invoice-row" style={{ color: '#16a34a', fontWeight: 600 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Tag size={14} /> Discount ({formData.discountPercent}%)
                        </span>
                        <span>- AED {discount.toFixed(2)}</span>
                      </div>
                    )}

                    {taxSettings.taxEnabled && (
                      <div className="invoice-row">
                        <span>Tax ({taxSettings.taxPercentage || 5}%)</span>
                        <span>AED {tax.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="invoice-row invoice-total">
                      <span>Total</span>
                      <span>AED {total.toFixed(2)}</span>
                    </div>
                    
                    {/* Coupon Input Box */}
                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Promo Code</label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input 
                          type="text" 
                          placeholder="Enter code" 
                          value={formData.couponCode}
                          onChange={(e) => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })}
                          style={{ flex: 1, padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.85rem' }}
                        />
                        <button 
                          onClick={handleApplyCoupon}
                          type="button"
                          style={{ padding: '0.6rem 1rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                          Apply
                        </button>
                      </div>
                      {formData.appliedCoupon && (
                        <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>✓ Code <strong>{formData.appliedCoupon}</strong> applied!</p>
                      )}
                    </div>
                  </div>
                );
              })()}

              <div className="btn-group">
                <button type="button" className="btn-light" onClick={prevStep}>Back</button>
                <button type="submit" className="btn-dark">Book Now</button>
              </div>

              {/* Submit Error */}
              {submitError && (
                <div style={{ marginTop: '1rem', padding: '0.85rem 1rem', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '0.82rem', fontWeight: 600, display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1rem', flexShrink: 0 }}>🚫</span>
                  <span>{submitError}</span>
                </div>
              )}

              {/* Assigned Unit Confirmation */}
              {availability?.available && (
                <div style={{ marginTop: '0.75rem', padding: '0.65rem 1rem', borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', fontSize: '0.8rem', fontWeight: 600 }}>
                  ✅ You will be assigned: <strong>{formData.space} {availability.unit}</strong>
                </div>
              )}
            </div>
          )}

          {/* Step 4 Removed to send users directly to checkout */}
        </form>
      </div>
    </div>
  );
}

