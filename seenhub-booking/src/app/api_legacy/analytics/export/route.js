
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data', 'analytics.json');

export async function GET() {
  try {
    if (!fs.existsSync(dataPath)) {
      return new Response('No data found', { status: 404 });
    }

    const logs = JSON.parse(await fs.readFile(dataPath, 'utf8'));
    
    // Create CSV Header
    let csv = 'ID,Timestamp,Path,Device,Location,Referrer,Type,IP\n';
    
    // Add Rows
    logs.forEach(l => {
      const row = [
        l.id,
        new Date(l.timestamp).toISOString(),
        `"${l.path}"`,
        l.device || 'Unknown',
        `"${l.location || 'Unknown'}"`,
        `"${l.referrer || 'Direct'}"`,
        l.type || 'visit',
        l.ip || '0.0.0.0'
      ].join(',');
      csv += row + '\n';
    });

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=seenhub_analytics_export.csv'
      }
    });
  } catch (e) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 });
  }
}
