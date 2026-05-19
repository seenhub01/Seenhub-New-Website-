import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ADMINS_FILE = path.join(process.cwd(), 'data', 'system_admins.json');
const SESSIONS_FILE = path.join(process.cwd(), 'data', 'admin_sessions.json');

export async function GET(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    if (!fs.existsSync(SESSIONS_FILE)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessions = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
    const session = sessions.find(s => s.token === token && s.expiry > Date.now());

    if (!session) {
      return NextResponse.json({ error: 'Session expired or invalid' }, { status: 401 });
    }

    const admins = JSON.parse(fs.readFileSync(ADMINS_FILE, 'utf8'));
    const admin = admins.find(a => a.id === session.adminId);

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
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
