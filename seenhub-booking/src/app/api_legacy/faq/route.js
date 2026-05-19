import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const FAQ_FILE = path.join(process.cwd(), 'data', 'faq.json');

function getFaqs() {
  if (!fs.existsSync(FAQ_FILE)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(FAQ_FILE, 'utf8'));
}

export async function GET() {
  return NextResponse.json(getFaqs());
}

export async function POST(request) {
  const body = await request.json();
  let faqs = getFaqs();

  if (body.id) {
    // Update
    faqs = faqs.map(f => f.id === body.id ? body : f);
  } else {
    // Create
    const newFaq = { ...body, id: Date.now() };
    faqs.push(newFaq);
  }

  fs.writeFileSync(FAQ_FILE, JSON.stringify(faqs, null, 2));
  return NextResponse.json(faqs);
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = parseInt(searchParams.get('id'));
  let faqs = getFaqs();
  faqs = faqs.filter(f => f.id !== id);
  fs.writeFileSync(FAQ_FILE, JSON.stringify(faqs, null, 2));
  return NextResponse.json({ success: true });
}
