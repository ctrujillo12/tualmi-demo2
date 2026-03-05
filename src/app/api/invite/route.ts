import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // On Vercel, /tmp is the only writable directory
    const filePath = path.join('/tmp', 'invite-emails.txt');

    const entry = `${email.trim().toLowerCase()} | ${new Date().toISOString()}\n`;
    await fs.appendFile(filePath, entry, 'utf8');

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error saving email:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}