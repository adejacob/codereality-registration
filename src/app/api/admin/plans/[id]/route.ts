import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Plan from '@/models/Plan';

function isAuthorized(request: NextRequest): boolean {
  const cookie = request.cookies.get('admin_auth')?.value;
  const header = request.headers.get('x-admin-secret');
  const secret = process.env.ADMIN_SECRET;
  return cookie === secret || header === secret;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    await connectDB();
    const body = await request.json();
    const allowed = ['name', 'duration', 'fee', 'features', 'installmentEligible', 'popular', 'isActive', 'order'];
    const update: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) update[key] = body[key];
    }

    const plan = await Plan.findOneAndUpdate({ id }, update, { new: true });
    if (!plan) return NextResponse.json({ success: false, message: 'Plan not found' }, { status: 404 });

    return NextResponse.json({ success: true, data: plan });
  } catch (error) {
    console.error('Plan PATCH error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update plan' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    await connectDB();
    const plan = await Plan.findOneAndDelete({ id });
    if (!plan) return NextResponse.json({ success: false, message: 'Plan not found' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Plan deleted' });
  } catch (error) {
    console.error('Plan DELETE error:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete plan' }, { status: 500 });
  }
}
