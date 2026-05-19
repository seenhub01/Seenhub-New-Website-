import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'bookings.json');

export async function GET(request, { params }) {
  const { id } = params;
  
  if (!fs.existsSync(DATA_FILE)) {
    return NextResponse.json({ success: false, message: 'No bookings found' }, { status: 404 });
  }

  const data = fs.readFileSync(DATA_FILE, 'utf8');
  const bookings = JSON.parse(data);
  
  const booking = bookings.find(b => b.id === id);
  
  if (!booking) {
    return NextResponse.json({ success: false, message: 'Invalid QR Code or Booking ID' }, { status: 404 });
  }
  
  return NextResponse.json({
    success: true,
    verified: true,
    booking: {
      id: booking.id,
      name: booking.name,
      service: booking.service,
      date: booking.date,
      time: booking.time,
      status: booking.status
    }
  });
}
