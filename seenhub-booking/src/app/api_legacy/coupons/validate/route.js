import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const COUPONS_FILE = path.join(process.cwd(), 'data', 'coupons.json');

export async function POST(request) {
  try {
    const { code, category } = await request.json();
    
    if (!code) {
      return NextResponse.json({ success: false, error: 'Coupon code is required' }, { status: 400 });
    }

    let coupons = [];
    if (fs.existsSync(COUPONS_FILE)) {
      coupons = JSON.parse(fs.readFileSync(COUPONS_FILE, 'utf8'));
    }

    const found = coupons.find(c => c.code.toUpperCase() === code.toUpperCase());

    if (!found) {
      return NextResponse.json({ success: false, error: 'Invalid coupon code' }, { status: 404 });
    }

    // Check category restriction
    const couponCat = found.category || 'All';
    const currentCat = (category || '').toLowerCase(); // 'workspaces', 'memberships', or 'events'
    
    let isValid = true;
    let errorMessage = '';
    
    if (couponCat === 'Workspaces' && currentCat !== 'workspaces') {
      isValid = false;
      errorMessage = "This coupon is only valid for Workspace bookings.";
    } else if (couponCat === 'Memberships' && currentCat !== 'memberships') {
      isValid = false;
      errorMessage = "This coupon is only valid for Membership plans.";
    } else if (couponCat === 'Events' && currentCat !== 'events') {
      isValid = false;
      errorMessage = "This coupon is only valid for Events.";
    }

    if (isValid) {
      return NextResponse.json({ success: true, discount: found.discount, code: found.code });
    } else {
      return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
    }

  } catch (e) {
    console.error("Coupon validation error:", e);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
