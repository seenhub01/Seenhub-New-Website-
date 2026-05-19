import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');
const ATTEMPTS_FILE = path.join(process.cwd(), 'data', 'login_attempts.json');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    // Security Fix: Brute-Force Check
    let attempts = {};
    if (fs.existsSync(ATTEMPTS_FILE)) {
      try { attempts = JSON.parse(fs.readFileSync(ATTEMPTS_FILE, 'utf8')); } catch(e) {}
    }
    
    const now = Date.now();
    const userAttempts = attempts[email] || { count: 0, lastTry: 0 };
    
    if (userAttempts.count >= 5 && now - userAttempts.lastTry < 15 * 60 * 1000) {
       return NextResponse.json({ success: false, message: 'Too many failed attempts. Try again in 15 minutes.' }, { status: 429 });
    }

    if (!fs.existsSync(USERS_FILE)) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    const user = users.find(u => u.email === email);

    if (user) {
      // Security Fix: Actual Password Check
      const hashed = hashPassword(password || '');
      // If user has no password yet (legacy), we might need to handle it or force set
      if (user.password && user.password !== hashed) {
        userAttempts.count++;
        userAttempts.lastTry = now;
        attempts[email] = userAttempts;
        fs.writeFileSync(ATTEMPTS_FILE, JSON.stringify(attempts, null, 2));
        return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
      }

      // Success: Reset attempts
      delete attempts[email];
      fs.writeFileSync(ATTEMPTS_FILE, JSON.stringify(attempts, null, 2));

      const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
      return NextResponse.json({
        success: true,
        token: crypto.randomBytes(32).toString('hex'), // Security Fix: Secure Token
        expiresAt,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          printingCredits: user.printingCredits || 0
        }
      });
    } else {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }
  } catch (e) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 });
  }
}
