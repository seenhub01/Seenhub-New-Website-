import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const BLOGS_FILE = path.join(process.cwd(), 'data', 'blogs.json');

function getBlogs() {
  if (!fs.existsSync(BLOGS_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(BLOGS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to read blogs file:", e);
    return [];
  }
}

function saveBlogs(blogs) {
  const dir = path.dirname(BLOGS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(BLOGS_FILE, JSON.stringify(blogs, null, 2));
}

export async function GET() {
  const blogs = getBlogs();
  return NextResponse.json(blogs);
}

export async function POST(request) {
  try {
    const body = await request.json();
    let blogs = getBlogs();

    if (Array.isArray(body)) {
      // Bulk update/initialization
      blogs = body;
    } else {
      // Single blog update/create
      const idx = blogs.findIndex(b => b.id === body.id);
      if (idx !== -1) {
        blogs[idx] = { ...blogs[idx], ...body };
      } else {
        blogs.push({ ...body, id: body.id || Date.now(), date: body.date || new Date().toLocaleDateString() });
      }
    }

    saveBlogs(blogs);
    return NextResponse.json({ success: true, blogs });
  } catch (e) {
    console.error("Failed to save blogs:", e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });

    let blogs = getBlogs();
    blogs = blogs.filter(b => String(b.id) !== String(id));
    saveBlogs(blogs);
    
    return NextResponse.json({ success: true, blogs });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
