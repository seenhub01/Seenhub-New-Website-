import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data', 'analytics.json');
const statsPath = path.join(process.cwd(), 'data', 'stats.json');

async function ensureDataFile() {
  if (!fs.existsSync(path.dirname(dataPath))) await fs.promises.mkdir(path.dirname(dataPath), { recursive: true });
  try { await fs.promises.access(dataPath); } catch (e) { await fs.promises.writeFile(dataPath, JSON.stringify([], null, 2)); }
  try { await fs.promises.access(statsPath); } catch (e) { await fs.promises.writeFile(statsPath, JSON.stringify({ totalVisits: 0, totalBookings: 0, totalRevenue: 0 }, null, 2)); }
}

export async function GET(req) {
  await ensureDataFile();
  const logs = JSON.parse(await fs.readFile(dataPath, 'utf8'));
  const stats = JSON.parse(await fs.readFile(statsPath, 'utf8'));
  
  const now = Date.now();
  const fiveMinsAgo = now - (5 * 60 * 1000);
  
  const liveUsers = new Set(logs.filter(l => l.timestamp > fiveMinsAgo).map(l => l.sessionId)).size;
  const totalVisits = stats.totalVisits || logs.length;
  
  // Group by page
  const pageViews = {};
  logs.forEach(l => { pageViews[l.path] = (pageViews[l.path] || 0) + 1; });
  
  // Group by Device
  const devices = { Mobile: 0, Desktop: 0 };
  logs.forEach(l => { if (l.device) devices[l.device]++; });

  return new Response(JSON.stringify({
    liveUsers,
    totalVisits,
    pageViews,
    devices,
    recentLogs: logs.slice(-100).reverse()
  }), { status: 200 });
}

export async function POST(req) {
  try {
    await ensureDataFile();
    const body = await req.json();
    const { path: pagePath, sessionId, referrer, location: clientLoc, type = 'visit' } = body;
    
    const scrub = (str) => {
      if (!str) return str;
      return str.replace(/(token|email|password|otp)=[^&]+/gi, '$1=[REDACTED]');
    };

    const cleanPath = scrub(pagePath);
    const cleanReferrer = scrub(referrer);

    const ip = req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    const ua = req.headers.get('user-agent') || '';
    const device = ua.includes('Mobi') ? 'Mobile' : 'Desktop';

    const logs = JSON.parse(await fs.readFile(dataPath, 'utf8'));
    logs.push({
      id: `AN-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      path: cleanPath,
      sessionId,
      referrer: cleanReferrer,
      ip,
      device,
      location: clientLoc || 'Unknown',
      type,
      timestamp: Date.now()
    });
    
    // Update Persistent Stats
    const stats = JSON.parse(await fs.readFile(statsPath, 'utf8'));
    if (type === 'visit') stats.totalVisits = (stats.totalVisits || 0) + 1;
    await fs.writeFile(statsPath, JSON.stringify(stats, null, 2));

    // Increase limit to 20k
    const trimmedLogs = logs.slice(-20000);
    await fs.writeFile(dataPath, JSON.stringify(trimmedLogs, null, 2));
    
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: 'Failed to log analytics' }), { status: 500 });
  }
}
