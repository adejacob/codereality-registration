import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import connectDB from '@/lib/mongodb';
import { getAdminPassword, setAdminPassword, verifyPassword } from '@/models/AdminConfig';

export async function POST(request: NextRequest) {
  // Rate limit: 5 attempts per IP per 15 minutes
  const ip = getClientIp(request);
  const rl = rateLimit(`change-password:${ip}`, { limit: 5, windowSecs: 15 * 60 });
  if (!rl.allowed) {
    const retryAfterSecs = Math.ceil((rl.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { success: false, message: 'Too many attempts. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(retryAfterSecs) } }
    );
  }

  // Authenticate the admin via cookie
  const authCookie = request.cookies.get('admin_auth')?.value;
  const adminSecret = process.env.ADMIN_SECRET ?? '';
  if (!adminSecret || !authCookie || authCookie !== adminSecret) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const currentPassword = typeof body?.currentPassword === 'string' ? body.currentPassword : '';
    const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : '';

    // Validate new password
    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: 'New password must be at least 8 characters long' },
        { status: 400 }
      );
    }
    if (newPassword === currentPassword) {
      return NextResponse.json(
        { success: false, message: 'New password must be different from the current password' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify current password
    const dbPassword = await getAdminPassword();
    let currentMatched = false;

    if (dbPassword) {
      currentMatched = verifyPassword(currentPassword, dbPassword);
    } else {
      // Fallback to env var password
      const storedPassword = process.env.ADMIN_PASSWORD ?? '';
      if (!storedPassword) {
        return NextResponse.json(
          { success: false, message: 'Server configuration error' },
          { status: 500 }
        );
      }
      const inputBuf = Buffer.from(currentPassword.padEnd(storedPassword.length, '\0'));
      const storedBuf = Buffer.from(storedPassword.padEnd(currentPassword.length, '\0'));
      currentMatched =
        inputBuf.length === storedBuf.length &&
        timingSafeEqual(inputBuf, storedBuf);
    }

    if (!currentMatched) {
      return NextResponse.json(
        { success: false, message: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Update password
    await setAdminPassword(newPassword);

    return NextResponse.json({ success: true, message: 'Password changed successfully' });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Failed to change password' },
      { status: 500 }
    );
  }
}
