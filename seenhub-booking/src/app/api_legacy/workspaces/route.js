import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const WORKSPACES_FILE = path.join(process.cwd(), 'data', 'workspaces.json');

function getWorkspaces() {
  if (!fs.existsSync(WORKSPACES_FILE)) {
    // Return empty array if file doesn't exist; frontend will handle initialization
    // and then POST back to save them on server.
    return [];
  }
  try {
    const data = fs.readFileSync(WORKSPACES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to read workspaces file:", e);
    return [];
  }
}

function saveWorkspaces(workspaces) {
  const dir = path.dirname(WORKSPACES_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(WORKSPACES_FILE, JSON.stringify(workspaces, null, 2));
}

export async function GET() {
  const ws = getWorkspaces();
  return NextResponse.json(ws);
}

export async function POST(request) {
  try {
    const body = await request.json();
    let workspaces = getWorkspaces();

    if (Array.isArray(body)) {
      // Bulk update/initialization
      workspaces = body;
    } else {
      // Single workspace update/create
      const idx = workspaces.findIndex(w => w.id === body.id || w.title === body.title);
      if (idx !== -1) {
        workspaces[idx] = { ...workspaces[idx], ...body };
      } else {
        workspaces.push({ ...body, id: body.id || Date.now() });
      }
    }

    saveWorkspaces(workspaces);
    return NextResponse.json({ success: true, workspaces });
  } catch (e) {
    console.error("Failed to save workspaces:", e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });

    let workspaces = getWorkspaces();
    workspaces = workspaces.filter(w => String(w.id) !== String(id));
    saveWorkspaces(workspaces);
    
    return NextResponse.json({ success: true, workspaces });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
