import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

export async function POST(request) {
  try {
    const { email, otp } = await request.json();
    
    // In this mock dev environment, any 6-digit OTP is valid.
    if (otp && otp.length === 6) {
      if (!fs.existsSync(USERS_FILE)) {
        return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
      }

      const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
      const user = users.find(u => u.email === email);

      if (user) {
        return NextResponse.json({
          success: true,
          token: 'mock-jwt-token-' + user.id,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            printingCredits: user.printingCredits || 0
          }
        });
      }
    }
    
    return NextResponse.json({ success: false, message: 'Invalid OTP' }, { status: 401 });
  } catch (e) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 });
  }
}
