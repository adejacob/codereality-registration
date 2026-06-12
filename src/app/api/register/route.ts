import { NextRequest, NextResponse } from 'next/server';
import { registrationSchema, RegistrationFormData } from '@/lib/validation';
import connectDB from '@/lib/mongodb';
import Registration from '@/models/Registration';
import Coupon from '@/models/Coupon';
import { sendRegistrationEmails } from '@/lib/sendEmails';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

const MAX_BODY_BYTES = 16 * 1024; // 16 KB

export async function POST(request: NextRequest) {
  // Rate limit: 10 submissions per IP per hour
  const ip = getClientIp(request);
  const rl = rateLimit(`register:${ip}`, { limit: 10, windowSecs: 60 * 60 });
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, message: 'Too many submissions. Please try again later.' },
      { status: 429 }
    );
  }

  // Body size guard
  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { success: false, message: 'Request too large.' },
      { status: 413 }
    );
  }

  try {
    const rawBody = await request.text();
    if (Buffer.byteLength(rawBody, 'utf8') > MAX_BODY_BYTES) {
      return NextResponse.json({ success: false, message: 'Request too large.' }, { status: 413 });
    }

    let body: RegistrationFormData;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ success: false, message: 'Invalid request body.' }, { status: 400 });
    }

    // Validate with Zod schema
    const validatedData = registrationSchema.parse(body);

    // Connect to MongoDB
    await connectDB();

    // Validate coupon if provided
    const couponCode = validatedData.payment.coupon?.trim();
    let couponData = null;
    
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      
      if (!coupon) {
        return NextResponse.json(
          { success: false, message: 'Invalid coupon code' },
          { status: 400 }
        );
      }
      
      if (!coupon.isActive) {
        return NextResponse.json(
          { success: false, message: 'This coupon is no longer active' },
          { status: 400 }
        );
      }
      
      if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
        return NextResponse.json(
          { success: false, message: 'This coupon has expired' },
          { status: 400 }
        );
      }
      
      if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
        return NextResponse.json(
          { success: false, message: 'This coupon has reached its usage limit' },
          { status: 400 }
        );
      }
      
      couponData = coupon;
      
      // Increment coupon usage count
      await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
    }

    // Set default payment type if coupon is used but no payment type selected
    if (couponData && !validatedData.payment.paymentType) {
      validatedData.payment.paymentType = 'full';
    }

    // Save to database
    const registration = await Registration.create(validatedData);

    // Send emails (blocking in serverless to ensure delivery)
    const emailData = {
      parentName:     registration.parent.fullName,
      studentName:    `${registration.student.firstName} ${registration.student.lastName}`,
      registrationId: registration.registrationId,
      programs:       registration.programs.programs,
      schedule:       registration.schedule.schedule,
      paymentType:    registration.payment.paymentType,
      submittedDate:  new Date(registration.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric',
      }),
      coupon:         registration.payment.coupon,
    };

    try {
      await sendRegistrationEmails(emailData, registration.parent.email);
      console.log('[Register] Emails sent successfully');
    } catch (emailErr) {
      // Log email error but don't fail the registration
      console.error('[Register] Email sending failed (registration saved):', emailErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Registration submitted successfully',
        registrationId: registration.registrationId,
        studentName: `${registration.student.firstName} ${registration.student.lastName}`,
        programs: registration.programs.programs,
        schedule: registration.schedule.schedule,
        paymentType: registration.payment.paymentType,
        coupon: registration.payment.coupon,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);

    // Surface Zod validation errors to the client; hide all other internals
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, message: 'Validation failed. Please check your input.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'An error occurred during registration.' },
      { status: 500 }
    );
  }
}

// GET all registrations (protected by a simple secret key header)
export async function GET(request: NextRequest) {
  const secret = request.headers.get('x-admin-secret');

  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();

    const registrations = await Registration.find({})
      .sort({ createdAt: -1 })
      .select('-__v')
      .lean();

    return NextResponse.json({ success: true, count: registrations.length, data: registrations });
  } catch (error) {
    console.error('Fetch registrations error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch registrations' },
      { status: 500 }
    );
  }
}
