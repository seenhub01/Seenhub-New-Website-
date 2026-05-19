import { NextResponse } from 'next/server';

export async function POST(request) {
  // Mock resend logic
  return NextResponse.json({ success: true, message: 'OTP Resent' });
}
