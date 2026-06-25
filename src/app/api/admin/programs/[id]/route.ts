import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Program from '@/models/Program';

function isAuthorized(request: NextRequest): boolean {
  const cookie = request.cookies.get('admin_auth')?.value;
  const header = request.headers.get('x-admin-secret');
  const secret = process.env.ADMIN_SECRET;
  return cookie === secret || header === secret;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const allowed: Record<string, unknown> = {};

    if (typeof body.name        === 'string' && body.name.trim())        allowed.name        = body.name.trim();
    if (typeof body.description === 'string' && body.description.trim()) allowed.description = body.description.trim();
    if (typeof body.color       === 'string' && body.color.trim())       allowed.color       = body.color.trim();
    if (typeof body.icon        === 'string' && body.icon.trim())        allowed.icon        = body.icon.trim();
    if (typeof body.isFree      === 'boolean') allowed.isFree      = body.isFree;
    if (typeof body.isLimited   === 'boolean') allowed.isLimited   = body.isLimited;
    if (typeof body.isActive    === 'boolean') allowed.isActive    = body.isActive;
    if (typeof body.order       === 'number')  allowed.order       = body.order;

    await connectDB();
    const program = await Program.findOneAndUpdate(
      { id },
      { $set: allowed },
      { new: true }
    ).lean();

    if (!program) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: program });
  } catch (error) {
    console.error('Programs PATCH error:', error);
    return NextResponse.json({ success: false, message: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await connectDB();
    const result = await Program.findOneAndDelete({ id });
    if (!result) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Deleted' });
  } catch (error) {
    console.error('Programs DELETE error:', error);
    return NextResponse.json({ success: false, message: 'Delete failed' }, { status: 500 });
  }
}
