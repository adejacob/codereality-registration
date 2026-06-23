import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import connectDB from '@/lib/mongodb';
import { getAdminPassword, verifyPassword } from '@/models/AdminConfig';

export async function POST(request: NextRequest) {
  // Rate limit: 5 attempts per IP per 15 minutes
  const ip = getClientIp(request);
  const rl = rateLimit(`login:${ip}`, { limit: 5, windowSecs: 15 * 60 });
  if (!rl.allowed) {
    const retryAfterSecs = Math.ceil((rl.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { success: false, message: 'Too many login attempts. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(retryAfterSecs) } }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const password = typeof body?.password === 'string' ? body.password : '';

    const storedSecret = process.env.ADMIN_SECRET ?? '';
    if (!storedSecret) {
      return NextResponse.json(
        { success: false, message: 'Server configuration error' },
        { status: 500 }
      );
    }

    await connectDB();
    const dbPassword = await getAdminPassword();
    let matched = false;

    if (dbPassword) {
      // A password has been set via the dashboard — verify against DB hash
      matched = verifyPassword(password, dbPassword);
    } else {
      // Fallback to env var password for initial setup
      const storedPassword = process.env.ADMIN_PASSWORD ?? '';
      if (!storedPassword) {
        return NextResponse.json(
          { success: false, message: 'Server configuration error' },
          { status: 500 }
        );
      }
      // Timing-safe comparison prevents timing-based password enumeration
      const inputBuf  = Buffer.from(password.padEnd(storedPassword.length, '\0'));
      const storedBuf = Buffer.from(storedPassword.padEnd(password.length, '\0'));
      matched =
        inputBuf.length === storedBuf.length &&
        timingSafeEqual(inputBuf, storedBuf);
    }

    if (!matched) {
      return NextResponse.json(
        // Generic message — don't hint at whether password exists
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true, message: 'Login successful' });

    response.cookies.set('admin_auth', storedSecret, {
      httpOnly: true,
      secure: true,             // always send over HTTPS only
      sameSite: 'strict',       // upgraded from 'lax' — blocks CSRF
      maxAge: 60 * 60 * 8,      // 8 hours
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: 'Login failed' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Logged out' });
  response.cookies.delete('admin_auth');
  return response;
}
