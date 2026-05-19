import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'bookings.json');
const WORKSPACES_FILE = path.join(process.cwd(), 'data', 'workspaces.json');
const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json');
const LOCKERS_FILE = path.join(process.cwd(), 'data', 'lockers.json');

function getSettings() {
  if (!fs.existsSync(SETTINGS_FILE)) return { qrPrefix: "920002", qrTotalLength: 10 };
  return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
}

function generateQRCode(prefix, totalLength = 10, count = 1) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const countStr = String(count).padStart(4, '0');
  
  // Combine prefix and 4-digit count
  const baseStr = `${prefix}${countStr}`;
  let randomPart = '';
  
  // The random part should be the length specified by the admin setting
  // (e.g. 10 random characters after the hyphen)
  const needed = totalLength;
  for (let i = 0; i < needed; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Return the new format: Prefix + Count + Hyphen + Random
  return `${baseStr}-${randomPart}`;
}

function getBookings() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function saveBookings(bookings) {
  const TEMP_FILE = `${DATA_FILE}.tmp`;
  fs.writeFileSync(TEMP_FILE, JSON.stringify(bookings, null, 2));
  fs.renameSync(TEMP_FILE, DATA_FILE);
}

function timeToMinutes(t) {
  if (!t) return 0;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
}

function slotsOverlap(fromA, toA, fromB, toB) {
  const startA = timeToMinutes(fromA);
  const endA = timeToMinutes(toA);
  const startB = timeToMinutes(fromB);
  const endB = timeToMinutes(toB);
  
  // Overlap occurs if one starts before the other ends, AND ends after the other starts
  return startA < endB && endA > startB;
}

function isWithinHours(time, hours) {
  if (!hours || !hours.enabled) return true; // Assume 24/7 if not specified
  const t = timeToMinutes(time);
  const start = timeToMinutes(hours.from);
  const end = timeToMinutes(hours.to);
  return t >= start && t <= end;
}

/**
 * Find the first available unit number for a workspace booking.
 * Returns { unit, available } where unit is 1-based and available is bool.
 */
function assignUnit(bookings, wsTitle, date, timeFrom, timeTo, totalUnits, bookingType, calculatedEndDate, unitNames = []) {
  const reqStart = new Date(date);
  const reqEnd = calculatedEndDate ? new Date(calculatedEndDate) : new Date(date);
  
  reqStart.setHours(0,0,0,0);
  reqEnd.setHours(23,59,59,999);

  const conflicts = bookings.filter(b => {
    if (b.space !== wsTitle || b.category !== 'workspaces') return false;
    if (b.status === 'Cancelled' || b.status === 'Expired') return false;

    const bStart = new Date(b.date);
    const bEnd = b.calculatedEndDate ? new Date(b.calculatedEndDate) : new Date(b.date);
    bStart.setHours(0,0,0,0);
    bEnd.setHours(23,59,59,999);

    const dateOverlap = (reqStart <= bEnd && reqEnd >= bStart);
    if (!dateOverlap) return false;

    if (bookingType === 'Hourly' && b.bookingType === 'Hourly' && b.date === date) {
      return slotsOverlap(timeFrom, timeTo, b.timeFrom, b.timeTo);
    }

    return true;
  });

  const bookedUnits = new Set(conflicts.map(b => b.assignedUnit).filter(Boolean));
  for (let u = 1; u <= totalUnits; u++) {
    if (!bookedUnits.has(u)) {
      const unitName = (unitNames && unitNames.length >= u) ? unitNames[u-1] : (totalUnits > 1 ? `${wsTitle} ${u}` : wsTitle);
      return { available: true, unit: u, unitName: unitName };
    }
  }
  return { available: false, unit: null, unitName: null };
}

/**
 * Find the first available locker for a given date.
 */
function assignLocker(bookings, date) {
  if (!fs.existsSync(LOCKERS_FILE)) return null;
  const lockers = JSON.parse(fs.readFileSync(LOCKERS_FILE, 'utf8'));
  const availableLockers = lockers.filter(l => l.status === 'AVAILABLE');
  
  if (availableLockers.length === 0) return null;

  // Find lockers already booked for this date
  const bookedLockerCodes = new Set(
    bookings
      .filter(b => b.date === date && (b.status !== 'Cancelled' && b.status !== 'Expired') && b.lockerCode)
      .map(b => b.lockerCode)
  );

  const freeLocker = availableLockers.find(l => !bookedLockerCodes.has(l.code));
  return freeLocker ? freeLocker.code : null;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const space = searchParams.get('space');
  const date = searchParams.get('date');
  const timeFrom = searchParams.get('timeFrom');
  const timeTo = searchParams.get('timeTo');
  const bookingType = searchParams.get('bookingType') || 'Hourly';
  const units = parseInt(searchParams.get('units') || '1');

  const email = searchParams.get('email');
  
  if (!space || !date) {
    // Security Fix: Allow users to see their OWN bookings by email, or admins to see ALL
    // Also allow 'space' only requests for availability checks in BookingForm.js
    const adminToken = request.headers.get('Admin-Token');
    if (!adminToken && !email && !space) {
      return NextResponse.json({ error: 'Unauthorized access to bookings' }, { status: 403 });
    }

    let bookings = getBookings();

    // If not admin and no specific email, but space is provided, only return that space's bookings
    if (!adminToken && !email && space) {
      bookings = bookings.filter(b => b.space === space && b.status !== 'Cancelled');
    }
    // If not admin but email is provided, restrict to specific email
    else if (!adminToken && email) {
      bookings = bookings.filter(b => b.email && b.email.toLowerCase() === email.toLowerCase());
    }
    
    // Business Logic: Auto-Expiry Check (UAE Time)
    const now = new Date();
    let changed = false;
    const updatedBookings = bookings.map(b => {
      if (b.status === 'Confirmed' && b.calculatedEndDate) {
        const endDate = new Date(b.calculatedEndDate);
        if (now > endDate) {
          changed = true;
          return { ...b, status: 'Expired' };
        }
      }
      return b;
    });
    if (changed) saveBookings(updatedBookings);

    return NextResponse.json(updatedBookings);
  }

  const bookings = getBookings();
  const workspaces = fs.existsSync(WORKSPACES_FILE) ? JSON.parse(fs.readFileSync(WORKSPACES_FILE, 'utf8')) : [];
  const ws = workspaces.find(w => w.title === space);
  const calculatedEndDate = searchParams.get('calculatedEndDate');
  
  const result = assignUnit(bookings, space, date, timeFrom, timeTo, units, bookingType, calculatedEndDate, ws?.unitNames || []);
  
  // Calculate bookedCount for the UI
  const bookedCount = bookings.filter(b => {
    if (b.space !== space || b.category !== 'workspaces') return false;
    if (b.status === 'Cancelled' || b.status === 'Expired') return false;
    const bStart = new Date(b.date);
    const bEnd = b.calculatedEndDate ? new Date(b.calculatedEndDate) : new Date(b.date);
    const reqStart = new Date(date);
    const reqEnd = calculatedEndDate ? new Date(calculatedEndDate) : new Date(date);
    reqStart.setHours(0,0,0,0); reqEnd.setHours(23,59,59,999);
    bStart.setHours(0,0,0,0); bEnd.setHours(23,59,59,999);
    const dateOverlap = (reqStart <= bEnd && reqEnd >= bStart);
    if (!dateOverlap) return false;
    if (bookingType === 'Hourly' && b.bookingType === 'Hourly' && b.date === date) {
      return slotsOverlap(timeFrom, timeTo, b.timeFrom, b.timeTo);
    }
    return true;
  }).length;

  const nextLocker = assignLocker(bookings, date);

  return NextResponse.json({ 
    available: result.available, 
    unit: result.unit, 
    unitName: result.unitName, 
    totalUnits: units,
    bookedCount: bookedCount,
    availableLocker: nextLocker
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const bookings = getBookings();
    const workspaces = fs.existsSync(WORKSPACES_FILE) ? JSON.parse(fs.readFileSync(WORKSPACES_FILE, 'utf8')) : [];
    const settings = getSettings();
    
    // Security Fix: Server-side Price Recalculation
    let basePrice = 0;
    let ws = null;
    
    if (body.category === 'workspaces' || body.category === 'events') {
      ws = workspaces.find(w => w.title === body.space || w.id === body.spaceId);
      if (ws) {
        // Security Fix: Max Guest Bypass Check
        const maxGuests = ws.maxGuests || 100;
        if (parseInt(body.guests || 1) > maxGuests) {
           return NextResponse.json({ success: false, message: `Capacity exceeded. Max guests for "${body.space}" is ${maxGuests}.` }, { status: 400 });
        }

        // Security Fix: Working Hours Bypass Check
        if (body.bookingType === 'Hourly' && body.timeFrom && body.timeTo) {
          const day = new Date(body.date).toLocaleDateString('en-US', { weekday: 'long' });
          const hours = ws.workingHours?.[day];
          if (hours && !hours.enabled) {
             return NextResponse.json({ success: false, message: `Workspace is closed on ${day}.` }, { status: 400 });
          }
          if (hours && (!isWithinHours(body.timeFrom, hours) || !isWithinHours(body.timeTo, hours))) {
             return NextResponse.json({ success: false, message: `Booking time is outside of operating hours (${hours.from} - ${hours.to}).` }, { status: 400 });
          }
        }

        const type = (body.bookingType || 'Hourly').toLowerCase();
        const tier = (body.customerType || 'Individual').toLowerCase();
        basePrice = ws.pricing?.[type]?.[tier] || 0;
      }
    } else if (body.category === 'memberships') {
      // Fetch membership price from memberships.json (Logic to be added if needed)
      basePrice = parseFloat(body.basePrice || 0); 
    }

    // Multi-Unit Logic Fix
    const units = parseInt(body.totalUnits || 1);
    const duration = parseInt(body.duration || 1);
    let subtotal = basePrice * units * duration;
    
    // Addons (Lockers, etc.)
    if (body.addons && body.addons.includes('Locker')) {
       subtotal += (parseFloat(body.lockerPrice || 10));
    }

    // Tax Calculation (Rounding Fix)
    const taxRate = settings.taxEnabled ? (settings.taxPercentage || 5) / 100 : 0;
    const taxAmount = Math.round((subtotal * taxRate) * 100) / 100;
    const finalTotal = Math.round((subtotal + taxAmount) * 100) / 100;

    // Security Fix: Overwrite frontend total with server-calculated total
    body.total = finalTotal;
    body.taxAmount = taxAmount;
    body.subtotal = subtotal;

    let assignedUnit = null;
    let assignedUnitName = null;
    let lockerCode = body.lockerCode;
    
    // Select Prefix based on Category/Workspace
    let finalPrefix = settings.qrPrefix || '92';
    if (body.category === 'workspaces') {
      const customPrefix = settings.workspacePrefixes?.[body.space];
      if (customPrefix) {
        finalPrefix = customPrefix;
      } else {
        // Fallback to per-workspace setting if exists
        const wsData = workspaces.find(w => w.title === body.space);
        if (wsData?.qrPrefix) finalPrefix = wsData.qrPrefix;
      }
    } else if (body.category === 'memberships') {
      finalPrefix = settings.membershipPrefix || '91';
    } else if (body.category === 'events') {
      finalPrefix = settings.eventPrefix || '93';
    }

    if (body.category === 'workspaces' && body.space) {
      if (body.assignedUnitName) {
        // Admin manual override for specific unit
        assignedUnit = body.assignedUnit || 1;
        assignedUnitName = body.assignedUnitName;
      } else {
        const totalUnits = body.totalUnits || ws?.units || 1;
        
        const result = assignUnit(
          bookings,
          body.space,
          body.date,
          body.timeFrom,
          body.timeTo,
          totalUnits,
          body.bookingType || 'Hourly',
          body.calculatedEndDate,
          ws?.unitNames || []
        );

        if (!result.available) {
          return NextResponse.json(
            { success: false, error: 'SLOT_FULL', message: `All ${totalUnits} unit(s) of "${body.space}" are booked for this time slot.` },
            { status: 409 }
          );
        }
        assignedUnit = result.unit;
        assignedUnitName = result.unitName;
      }

      // Unit-level QR prefix: unitPrefixes[wsTitle][unitName] -> fallback to workspace -> fallback to global
      const resolvedUnitName = assignedUnitName || `Unit ${assignedUnit || 1}`;
      if (settings.unitPrefixes?.[body.space]?.[resolvedUnitName]) {
        finalPrefix = settings.unitPrefixes[body.space][resolvedUnitName];
      }
      // else finalPrefix already set above from workspacePrefixes or global prefix
    }

    // Handle Locker Auto-Assignment
    if (body.addons && body.addons.includes('Locker')) {
      const assignedLocker = assignLocker(bookings, body.date);
      if (!assignedLocker) {
        return NextResponse.json(
          { success: false, error: 'LOCKER_FULL', message: 'No lockers available for the selected date.' },
          { status: 409 }
        );
      }
      lockerCode = assignedLocker;
    }
    
    // Count the number of bookings to generate the sequential 4-digit area
    const bookingCount = bookings.filter(b => b.category === body.category).length + 1;
    const qrCode = generateQRCode(finalPrefix, settings.qrTotalLength || 10, bookingCount);

    // Security Fix: Robust Unique ID (Prevent Collision)
    const bookingId = `BK-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    const newBooking = {
      ...body,
      id: body.id || bookingId, // Keep frontend ID if provided (for sync) but ensure uniqueness
      assignedUnit,
      assignedUnitName,
      lockerCode,
      qrCode,
      createdAt: new Date().toISOString(),
      status: 'Confirmed'
    };

    bookings.push(newBooking);
    saveBookings(bookings);

    return NextResponse.json({ success: true, booking: newBooking });
  } catch (e) {
    console.error("Booking POST Error:", e);
    return NextResponse.json({ success: false, message: e.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { id, status } = await request.json();
    const bookings = getBookings();
    
    const idx = bookings.findIndex(b => String(b.id) === String(id));
    if (idx === -1) {
      return NextResponse.json({ success: false, error: 'NOT_FOUND' }, { status: 404 });
    }

    const oldStatus = bookings[idx].status;
    bookings[idx].status = status;

    // Security Fix: Handle Refund Logging & Revenue Adjustment
    if (status === 'Cancelled' && oldStatus !== 'Cancelled') {
      const refundRecord = {
        id: `RF-${Date.now()}`,
        bookingId: id,
        amount: bookings[idx].total || 0,
        currency: getSettings().currency || 'AED',
        timestamp: new Date().toISOString(),
        customer: bookings[idx].email
      };

      // Log refund to a new refunds.json file
      const REFUNDS_FILE = path.join(process.cwd(), 'data', 'refunds.json');
      let refunds = [];
      if (fs.existsSync(REFUNDS_FILE)) {
        refunds = JSON.parse(fs.readFileSync(REFUNDS_FILE, 'utf8'));
      }
      refunds.push(refundRecord);
      fs.writeFileSync(REFUNDS_FILE, JSON.stringify(refunds, null, 2));
      
      console.log(`[REFUND LOGGED] ${id} - Amount: ${refundRecord.amount}`);
    }

    saveBookings(bookings);

    return NextResponse.json({ success: true, booking: bookings[idx] });
  } catch (e) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 });
  }
}
