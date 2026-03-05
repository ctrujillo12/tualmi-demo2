import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// fromEnv() auto-reads KV_REST_API_URL and KV_REST_API_TOKEN
const redis = Redis.fromEnv();

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

    const normalized = email.trim().toLowerCase();

    // Check for duplicates
    const exists = await redis.sismember('invite:emails', normalized);
    if (exists) {
      return NextResponse.json({ success: true }); // silent success
    }

    // Store in a Redis set (deduped automatically)
    await redis.sadd('invite:emails', normalized);

    // Also store with timestamp in a sorted set (score = unix timestamp)
    await redis.zadd('invite:emails:timestamped', {
      score: Date.now(),
      member: normalized,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error saving email:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// View collected emails at /api/invite?secret=YOUR_INVITE_ADMIN_SECRET
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');

  if (secret !== process.env.INVITE_ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const emails = await redis.zrange('invite:emails:timestamped', 0, -1, {
    withScores: true,
  });

  // zrange with withScores returns [member, score, member, score, ...]
  const formatted = [];
  for (let i = 0; i < emails.length; i += 2) {
    formatted.push({
      email: emails[i],
      signedUpAt: new Date(Number(emails[i + 1])).toISOString(),
    });
  }

  return NextResponse.json({ count: formatted.length, emails: formatted });
}