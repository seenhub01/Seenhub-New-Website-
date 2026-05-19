import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const COUPONS_FILE = path.join(process.cwd(), 'data', 'coupons.json');

function getCoupons() {
  if (!fs.existsSync(COUPONS_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(COUPONS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to read coupons file:", e);
    return [];
  }
}

function saveCoupons(coupons) {
  const dir = path.dirname(COUPONS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(COUPONS_FILE, JSON.stringify(coupons, null, 2));
}

export async function GET() {
  const cp = getCoupons();
  return NextResponse.json(cp);
}

export async function POST(request) {
  try {
    const body = await request.json();
    let coupons = getCoupons();

    if (Array.isArray(body)) {
      if (body.length === 0 && coupons.length > 0) {
        return NextResponse.json({ success: false, message: 'Bulk deletion is restricted for security.' }, { status: 403 });
      }
      coupons = body;
    } else {
      const idx = coupons.findIndex(c => c.id === body.id);
      const codeExists = coupons.find(c => c.code === body.code && c.id !== body.id);
      
      if (codeExists) {
        return NextResponse.json({ success: false, error: 'CODE_EXISTS', message: `The coupon code "${body.code}" already exists.` }, { status: 409 });
      }

      if (idx !== -1) {
        coupons[idx] = { ...coupons[idx], ...body };
      } else {
        coupons.push({ ...body, id: body.id || Date.now() });
      }
    }

    saveCoupons(coupons);
    return NextResponse.json({ success: true, coupons });
  } catch (e) {
    console.error("Failed to save coupons:", e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });

    let coupons = getCoupons();
    coupons = coupons.filter(c => String(c.id) !== String(id));
    saveCoupons(coupons);
    
    return NextResponse.json({ success: true, coupons });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
