
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const OUTBOX_FILE = path.join(process.cwd(), 'data', 'email_outbox.json');

export async function POST(request) {
  try {
    const body = await request.json();
    const { subject, html, recipientCount } = body;

    if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
      fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
    }

    let outbox = [];
    if (fs.existsSync(OUTBOX_FILE)) {
      outbox = JSON.parse(fs.readFileSync(OUTBOX_FILE, 'utf8'));
    }

    const newBroadcast = {
      id: `BR-${Date.now()}`,
      timestamp: new Date().toISOString(),
      subject,
      html,
      recipientCount,
      status: 'Queued'
    };

    outbox.push(newBroadcast);
    fs.writeFileSync(OUTBOX_FILE, JSON.stringify(outbox, null, 2));

    return NextResponse.json({ success: true, broadcastId: newBroadcast.id });
  } catch (e) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 });
  }
}
