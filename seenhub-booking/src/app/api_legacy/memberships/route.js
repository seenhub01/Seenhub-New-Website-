import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const MEMBERSHIPS_FILE = path.join(process.cwd(), 'data', 'memberships.json');

function getMemberships() {
  if (!fs.existsSync(MEMBERSHIPS_FILE)) {
    return [
      { 
        id: 1, 
        title: 'Day Pass-Coworking Space', 
        subtitle: 'Work from the open area all day', 
        price: 100, 
        icon: '🏢', 
        desc: 'Work from the open area all day, with calm and productive vibes.',
        slug: 'day-pass'
      },
      { 
        id: 2, 
        title: 'Monthly Membership', 
        subtitle: 'Your everyday space', 
        price: 1620, 
        icon: '📅', 
        desc: 'Your everyday space, with 2 private space uses per month.',
        slug: 'monthly-membership'
      },
      { 
        id: 3, 
        title: 'Student Membership', 
        subtitle: 'Study, create, and grow', 
        price: 1200, 
        icon: '🎓', 
        desc: 'Study, create, and grow at a student-friendly rate.',
        slug: 'student-membership'
      },
      { 
        id: 4, 
        title: 'VIP Daily Pass', 
        subtitle: 'Your day, elevated', 
        price: 120, 
        icon: '⭐', 
        desc: 'Your day, elevated with private access and premium comfort.',
        slug: 'vip-daily-pass'
      }
    ];
  }
  try {
    return JSON.parse(fs.readFileSync(MEMBERSHIPS_FILE, 'utf8'));
  } catch (e) {
    return [];
  }
}

export async function GET() {
  const data = getMemberships();
  return NextResponse.json(data);
}

export async function POST(request) {
  try {
    const data = await request.json();
    if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
      fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
    }
    fs.writeFileSync(MEMBERSHIPS_FILE, JSON.stringify(data, null, 2));
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
