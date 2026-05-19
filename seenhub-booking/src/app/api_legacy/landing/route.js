import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const LANDING_FILE = path.join(process.cwd(), 'data', 'landing.json');

function getLandingData() {
  if (!fs.existsSync(LANDING_FILE)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(LANDING_FILE, 'utf8'));
  } catch (e) {
    return null;
  }
}

export async function GET() {
  const data = getLandingData();
  return NextResponse.json(data || {});
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
      fs.mkdirSync(path.join(process.cwd(), 'data'));
    }
    fs.writeFileSync(LANDING_FILE, JSON.stringify(body, null, 2));
    return NextResponse.json({ success: true, data: body });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
