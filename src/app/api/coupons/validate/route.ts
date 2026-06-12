import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

// Validate a coupon code
export async function POST(request: NextRequest) {
  // Rate limit: 20 validation attempts per IP per minute
  const ip = getClientIp(request);
  const rl = rateLimit(`coupon-validate:${ip}`, { limit: 20, windowSecs: 60 });
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, message: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Coupon code is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const coupon = await Coupon.findOne({ code: code.toUpperCase() }).lean();

    if (!coupon) {
      return NextResponse.json(
        { success: false, message: 'Invalid coupon code' },
        { status: 404 }
      );
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return NextResponse.json(
        { success: false, message: 'This coupon is no longer active' },
        { status: 400 }
      );
    }

    // Check if coupon has expired
    if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
      return NextResponse.json(
        { success: false, message: 'This coupon has expired' },
        { status: 400 }
      );
    }

    // Check if usage limit reached
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        { success: false, message: 'This coupon has reached its usage limit' },
        { status: 400 }
      );
    }

    // Coupon is valid
    return NextResponse.json({
      success: true,
      data: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to validate coupon' },
      { status: 500 }
    );
  }
}
