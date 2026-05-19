import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ADMINS_FILE = path.join(process.cwd(), 'data', 'system_admins.json');
const SESSIONS_FILE = path.join(process.cwd(), 'data', 'admin_sessions.json');

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    if (!fs.existsSync(ADMINS_FILE)) {
      return NextResponse.json({ error: 'System not initialized' }, { status: 500 });
    }

    const admins = JSON.parse(fs.readFileSync(ADMINS_FILE, 'utf8'));
    const admin = admins.find(a => a.email === email);

    if (!admin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Check password (handling both plain text legacy and hashed if implemented)
    // For now, supporting plain text check as per existing code, but recommending hashing.
    if (admin.password !== password) {
       return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Save session
    let sessions = [];
    if (fs.existsSync(SESSIONS_FILE)) {
      sessions = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
    }
    
    const expiry = Date.now() + (12 * 60 * 60 * 1000); // 12 Hours
    sessions.push({ token, adminId: admin.id, expiry });
    
    // Cleanup old sessions
    const activeSessions = sessions.filter(s => s.expiry > Date.now());
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(activeSessions, null, 2));

    return NextResponse.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions
      }
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
