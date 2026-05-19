import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

export async function GET() {
  try {
    if (!fs.existsSync(USERS_FILE)) return NextResponse.json([]);
    const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    return NextResponse.json(users);
  } catch (e) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { email, printingCredits } = await request.json();
    if (!fs.existsSync(USERS_FILE)) return NextResponse.json({ success: false, message: 'No users found' }, { status: 404 });
    
    let users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    const idx = users.findIndex(u => u.email === email);
    
    if (idx === -1) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }
    
    // Update credits
    users[idx].printingCredits = printingCredits;
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    
    return NextResponse.json({ success: true, user: users[idx] });
  } catch (e) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 });
  }
}

import crypto from 'crypto';

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(request) {
  try {
    const body = await request.json();
    const newUser = body.user;
    const password = body.password || 'Seenhub@2026'; // Default password for new users if not provided
    
    if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
      fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
    }

    let users = [];
    if (fs.existsSync(USERS_FILE)) {
      users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    }

    const existing = users.find(u => u.email === newUser.email);
    if (existing) {
      return NextResponse.json({ success: false, message: 'User already exists' }, { status: 400 });
    }

    const userToSave = {
      id: Date.now(),
      email: newUser.email,
      name: `${newUser.first_name || ''} ${newUser.last_name || ''}`.trim() || newUser.name,
      phone: newUser.phone_number || newUser.phone,
      password: hashPassword(password),
      joiningDate: new Date().toLocaleDateString('en-AE'),
      status: 'Active',
      printingCredits: 0
    };

    users.push(userToSave);
    
    // Atomic Write: Write to temp file then rename
    const TEMP_FILE = `${USERS_FILE}.tmp`;
    fs.writeFileSync(TEMP_FILE, JSON.stringify(users, null, 2));
    fs.renameSync(TEMP_FILE, USERS_FILE);

    return NextResponse.json({
      success: true,
      pending_verification: true, // This triggers the OTP modal in AuthModal.js
      user: userToSave
    });
  } catch (e) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 });
  }
}
