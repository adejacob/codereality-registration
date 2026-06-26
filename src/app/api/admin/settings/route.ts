import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import AdminConfig from '@/models/AdminConfig';

function isAuthorized(request: NextRequest): boolean {
  const cookie = request.cookies.get('admin_auth')?.value;
  const header = request.headers.get('x-admin-secret');
  const secret = process.env.ADMIN_SECRET;
  return cookie === secret || header === secret;
}

// GET - fetch all settings (or a single key via ?key=xxx)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (key) {
      const config = await AdminConfig.findOne({ key }).lean();
      return NextResponse.json({ success: true, value: config?.value ?? null });
    }

    const all = await AdminConfig.find({
      key: { $in: ['installment_enabled'] },
    }).lean();

    const settings: Record<string, string> = {};
    for (const item of all) {
      settings[item.key] = item.value;
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch settings' }, { status: 500 });
  }
}

// POST - update a setting (admin only)
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await request.json();
    const { key, value } = body;

    const ALLOWED_KEYS = ['installment_enabled'];
    if (!key || !ALLOWED_KEYS.includes(key)) {
      return NextResponse.json({ success: false, message: 'Invalid setting key' }, { status: 400 });
    }

    await AdminConfig.findOneAndUpdate(
      { key },
      { key, value: String(value) },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, message: 'Setting updated' });
  } catch (error) {
    console.error('Settings POST error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update setting' }, { status: 500 });
  }
}
