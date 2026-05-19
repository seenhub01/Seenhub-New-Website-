import { NextResponse } from 'next/server';
import net from 'net';
import fs from 'fs';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');
const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json');

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const fileName = formData.get('fileName') || 'print_job.pdf';
    const userId = formData.get('userId');

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 });
    }

    // Security Fix: Dynamic Printer IP from Settings
    let printerIp = '10.255.254.56'; // Default fallback
    if (fs.existsSync(SETTINGS_FILE)) {
      const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
      if (settings.printerIp) printerIp = settings.printerIp;
    }

    // Security Fix: Printing Credit Verification
    if (!userId) {
       return NextResponse.json({ success: false, message: 'User authentication required for printing.' }, { status: 401 });
    }

    const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    const userIdx = users.findIndex(u => String(u.id) === String(userId));
    
    if (userIdx === -1) {
      return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
    }

    if ((users[userIdx].printingCredits || 0) < 1) {
      return NextResponse.json({ success: false, message: 'Insufficient printing credits. Please top up your account.' }, { status: 402 });
    }

    const pdfBuffer = Buffer.from(await file.arrayBuffer());

    // Security Fix: Basic PDF Validation (Prevent Raw Injection)
    const fileHeader = pdfBuffer.slice(0, 4).toString();
    if (fileHeader !== '%PDF') {
      return NextResponse.json({ success: false, message: 'Invalid file format. Only PDF is allowed.' }, { status: 400 });
    }

    // Hardware Fix: Simple Printer Queue (Locking)
    const LOCK_FILE = path.join(process.cwd(), 'data', 'printer.lock');
    let attempts = 0;
    while (fs.existsSync(LOCK_FILE) && attempts < 15) {
      await new Promise(r => setTimeout(r, 2000));
      attempts++;
    }
    if (fs.existsSync(LOCK_FILE)) {
      return NextResponse.json({ success: false, message: 'Printer is busy processing another job. Please wait.' }, { status: 429 });
    }
    fs.writeFileSync(LOCK_FILE, Date.now().toString());

    const pjlHeader = Buffer.from([
      0x1b, 0x25, 0x2d, 0x31, 0x32, 0x38, 0x34, 0x34, 0x58,
      0x40, 0x50, 0x4a, 0x4c, 0x20, 0x45, 0x4e, 0x54, 0x45, 0x52, 0x20, 0x4c, 0x41, 0x4e, 0x47, 0x55, 0x41, 0x47, 0x45, 0x3d, 0x50, 0x44, 0x46, 0x0a
    ]);
    const pjlFooter = Buffer.from([
      0x1b, 0x25, 0x2d, 0x31, 0x32, 0x38, 0x34, 0x34, 0x58
    ]);

    const buffer = Buffer.concat([pjlHeader, pdfBuffer, pjlFooter]);

    return new Promise((resolve) => {
      const socket = new net.Socket();
      let resolved = false;

      const finish = (success, message) => {
        // Hardware Fix: Always release lock
        try { if (fs.existsSync(LOCK_FILE)) fs.unlinkSync(LOCK_FILE); } catch(e) {}
        
        if (!resolved) {
          resolved = true;
          socket.destroy();
          if (success) {
            // Security Fix: Deduct Credit after success
            users[userIdx].printingCredits = (users[userIdx].printingCredits || 1) - 1;
            fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

            // NEW: Record the print job as a booking debit for global sync
            try {
              const BOOKINGS_FILE = path.join(process.cwd(), 'data', 'bookings.json');
              let bookings = [];
              if (fs.existsSync(BOOKINGS_FILE)) {
                bookings = JSON.parse(fs.readFileSync(BOOKINGS_FILE, 'utf8'));
              }
              const newDebit = {
                id: 'PRT-' + Date.now().toString().slice(-6),
                name: users[userIdx].name,
                email: users[userIdx].email,
                category: 'printing',
                space: `Printed: ${fileName}`,
                printingCredits: -1, // Each job is currently 1 credit in this API logic
                total: 0,
                status: 'Confirmed',
                date: new Date().toISOString().split('T')[0],
                createdAt: new Date().toISOString()
              };
              bookings.push(newDebit);
              fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
            } catch (e) {
              console.error("Failed to record print debit booking:", e);
            }

            resolve(NextResponse.json({ success: true, message, remainingCredits: users[userIdx].printingCredits }));
          } else {
            resolve(NextResponse.json({ success: false, message }, { status: 500 }));
          }
        }
      };

      socket.setTimeout(60000); // 60s timeout for large files

      socket.connect(9100, printerIp, () => {
        socket.write(buffer, (err) => {
          if (err) {
            finish(false, 'Failed to send data: ' + err.message);
          } else {
            // Give printer time to process
            setTimeout(() => finish(true, `${fileName} sent to printer! 📄✨`), 3000);
          }
        });
      });

      socket.on('timeout', () => finish(false, 'Printer connection timed out.'));
      socket.on('error', (err) => finish(false, 'Connection error: ' + err.message));
    });

  } catch (e) {
    console.error('API Error:', e);
    return NextResponse.json({ success: false, message: e.message }, { status: 500 });
  }
}
