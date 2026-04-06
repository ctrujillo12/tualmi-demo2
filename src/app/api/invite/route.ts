import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Invalid email.' }, { status: 400 });
  }

  const res = await fetch('https://sheetdb.io/api/v1/9550th9aimf6t', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: { email, date: new Date().toISOString() } }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to save.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}