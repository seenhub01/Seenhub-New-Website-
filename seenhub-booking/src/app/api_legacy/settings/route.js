import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json');

function getSettings() {
  const defaults = { 
    qrPrefix: "92", 
    qrTotalLength: 10,
    taxEnabled: false,
    taxPercentage: 5,
    printCreditToPageRatio: 2,
    printMinTopUp: 2,
    printAedToCreditRatio: 1,
    currency: 'AED',
    printerIp: '10.255.254.56',
    logo: '/logo.png',
    favicon: '/icon.png',
    contactWhatsApp: '+971 50 000 0000',
    contactPhone: '+971 50 000 0000',
    contactEmail: 'support@seenhub.ae',
    openingHours: [
      { days: 'Monday To Friday', time: '8 AM To 10 PM' },
      { days: 'Saturday To Sunday', time: '10 AM To 6 PM' }
    ],
    socialLinks: [
      { platform: 'Facebook', url: '#', icon: 'Fb' },
      { platform: 'Instagram', url: '#', icon: 'Ig' },
      { platform: 'X', url: '#', icon: '𝕏' },
      { platform: 'LinkedIn', url: '#', icon: 'In' },
      { platform: 'YouTube', url: '#', icon: 'Yt' },
      { platform: 'TikTok', url: '#', icon: 'Tk' },
      { platform: 'Pinterest', url: '#', icon: 'Pt' },
      { platform: 'Snapchat', url: '#', icon: 'Sc' },
      { platform: 'Threads', url: '#', icon: 'Th' }
    ]
  };
  if (!fs.existsSync(SETTINGS_FILE)) {
    return defaults;
  }
  const saved = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
  return { ...defaults, ...saved };
}

export async function GET() {
  return NextResponse.json(getSettings());
}

export async function POST(request) {
  const body = await request.json();
  const current = getSettings();
  const updated = { ...current, ...body };
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2));
  return NextResponse.json(updated);
}
