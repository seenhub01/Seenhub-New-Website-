import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const LOCKERS_FILE = path.join(process.cwd(), 'data', 'lockers.json');

function getLockers() {
  if (!fs.existsSync(path.dirname(LOCKERS_FILE))) {
    fs.mkdirSync(path.dirname(LOCKERS_FILE), { recursive: true });
  }
  if (!fs.existsSync(LOCKERS_FILE)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(LOCKERS_FILE, 'utf8'));
  } catch (e) {
    return [];
  }
}

export async function GET() {
  return NextResponse.json(getLockers());
}

export async function POST(request) {
  const body = await request.json();
  let lockers = getLockers();

  if (body.id) {
    // Update
    lockers = lockers.map(l => l.id === body.id ? { ...body, updatedAt: new Date().toISOString() } : l);
  } else {
    // Create
    const newLocker = { 
      ...body, 
      id: Date.now(), 
      createdAt: new Date().toLocaleString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      }) 
    };
    lockers.push(newLocker);
  }

  fs.writeFileSync(LOCKERS_FILE, JSON.stringify(lockers, null, 2));
  return NextResponse.json(lockers);
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = parseInt(searchParams.get('id'));
  let lockers = getLockers();
  lockers = lockers.filter(l => l.id !== id);
  fs.writeFileSync(LOCKERS_FILE, JSON.stringify(lockers, null, 2));
  return NextResponse.json({ success: true });
}
