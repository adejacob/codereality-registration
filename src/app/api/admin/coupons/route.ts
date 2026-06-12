import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Coupon from '@/models/Coupon';

function isAuthorized(request: NextRequest): boolean {
  const cookie = request.cookies.get('admin_auth')?.value;
  const header = request.headers.get('x-admin-secret');
  const secret = process.env.ADMIN_SECRET;
  return cookie === secret || header === secret;
}

// GET - List all coupons
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');

    // Build filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};
    if (isActive !== null && isActive !== '') {
      query.isActive = isActive === 'true';
    }

    const coupons = await Coupon.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      data: coupons,
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch coupons';
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}

// POST - Create new coupon
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.code || body.discountValue === undefined || body.discountValue === '') {
      return NextResponse.json(
        { success: false, message: 'Code and discount value are required' },
        { status: 400 }
      );
    }

    // Validate code format (alphanumeric, no spaces)
    const codeRegex = /^[A-Z0-9_-]+$/i;
    if (!codeRegex.test(body.code)) {
      return NextResponse.json(
        { success: false, message: 'Code must contain only letters, numbers, hyphens, and underscores' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if coupon code already exists
    const existing = await Coupon.findOne({ code: body.code.toUpperCase() });
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Coupon code already exists' },
        { status: 409 }
      );
    }

    const coupon = await Coupon.create({
      code: body.code.toUpperCase(),
      description: body.description || '',
      discountType: body.discountType || 'percentage',
      discountValue: Number(body.discountValue),
      isActive: body.isActive ?? true,
      usageLimit: body.usageLimit ? Number(body.usageLimit) : null,
      usedCount: 0,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
    });

    return NextResponse.json(
      { success: true, message: 'Coupon created successfully', data: coupon },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating coupon:', error);
    
    // Handle MongoDB duplicate key error
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'Coupon code already exists' },
        { status: 409 }
      );
    }
    
    // Handle Mongoose validation errors
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ValidationError') {
      const messages = Object.values((error as any).errors || {}).map((e: any) => e.message).join(', ');
      return NextResponse.json(
        { success: false, message: `Validation error: ${messages}` },
        { status: 400 }
      );
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, message: `Failed to create coupon: ${errorMessage}` },
      { status: 500 }
    );
  }
}
