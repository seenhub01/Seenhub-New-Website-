import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const LEGAL_FILE = path.join(process.cwd(), 'data', 'legal.json');

function getLegal() {
  if (!fs.existsSync(LEGAL_FILE)) {
    return { terms: '', privacy: '', copyrights: '' };
  }
  return JSON.parse(fs.readFileSync(LEGAL_FILE, 'utf8'));
}

export async function GET() {
  return NextResponse.json(getLegal());
}

export async function POST(request) {
  const body = await request.json();
  const legal = { ...getLegal(), ...body };
  fs.writeFileSync(LEGAL_FILE, JSON.stringify(legal, null, 2));
  return NextResponse.json(legal);
}
