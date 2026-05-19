import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  if (!type) return NextResponse.json({ error: 'Type required' }, { status: 400 });

  // Security Fix: Prevent unauthorized access to sensitive files
  const sensitiveTypes = ['messages', 'users', 'bookings', 'login_attempts'];
  const adminToken = request.headers.get('Admin-Token');
  
  if (sensitiveTypes.includes(type) && !adminToken) {
    return NextResponse.json({ error: 'Unauthorized access to sensitive data' }, { status: 403 });
  }

  const filePath = path.join(DATA_DIR, `${type}.json`);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json([]);
  }

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json([]);
  }
}

export async function POST(request) {
  try {
    const { type, data } = await request.json();
    if (!type) return NextResponse.json({ error: 'Type required' }, { status: 400 });

    // Security Fix: Basic CSRF Protection
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    if (origin && !origin.includes(host)) {
       return NextResponse.json({ error: 'CSRF Protection: Invalid origin' }, { status: 403 });
    }

    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    const filePath = path.join(DATA_DIR, `${type}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
