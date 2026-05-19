import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const POPUP_FILE = path.join(process.cwd(), 'data', 'popup.json');

function getPopupData() {
  if (!fs.existsSync(POPUP_FILE)) {
    return {
      enabled: false,
      image: "",
      title: "",
      content: "",
      btn1Text: "",
      btn1Link: "",
      btn2Text: "",
      btn2Link: ""
    };
  }
  try {
    return JSON.parse(fs.readFileSync(POPUP_FILE, 'utf8'));
  } catch (e) {
    return {};
  }
}

export async function GET() {
  const data = getPopupData();
  return NextResponse.json(data);
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
      fs.mkdirSync(path.join(process.cwd(), 'data'));
    }
    fs.writeFileSync(POPUP_FILE, JSON.stringify(body, null, 2));
    return NextResponse.json({ success: true, data: body });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
