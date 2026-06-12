import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Registration from '@/models/Registration';

function isAuthorized(request: NextRequest): boolean {
  const cookie = request.cookies.get('admin_auth')?.value;
  const header = request.headers.get('x-admin-secret');
  const secret = process.env.ADMIN_SECRET;
  return cookie === secret || header === secret;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await connectDB();
    const registration = await Registration.findById(id).select('-__v').lean();
    if (!registration) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: registration });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
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

    const validStatuses = ['pending', 'contacted', 'approved', 'enrolled', 'rejected'];
    const validPaymentStatuses = ['pending_payment', 'payment_submitted', 'payment_confirmed'];
    if (body.status && validStatuses.includes(body.status)) allowed.status = body.status;
    if (body.paymentStatus && validPaymentStatuses.includes(body.paymentStatus)) allowed.paymentStatus = body.paymentStatus;
    if (typeof body.notes === 'string') allowed.notes = body.notes;
    if (body.enrollmentNumber === null) allowed.enrollmentNumber = undefined;
    if (body.enrollmentDate  === null) allowed.enrollmentDate  = undefined;

    // Student info updates
    if (body.student && typeof body.student === 'object') {
      const s = body.student;
      if (typeof s.firstName   === 'string' && s.firstName.trim())   allowed['student.firstName']   = s.firstName.trim();
      if (typeof s.lastName    === 'string' && s.lastName.trim())    allowed['student.lastName']    = s.lastName.trim();
      if (['male','female','other'].includes(s.gender))               allowed['student.gender']      = s.gender;
      if (typeof s.dateOfBirth === 'string' && s.dateOfBirth.trim()) allowed['student.dateOfBirth'] = s.dateOfBirth.trim();
      if (typeof s.schoolName  === 'string' && s.schoolName.trim())  allowed['student.schoolName']  = s.schoolName.trim();
      if (typeof s.classGrade  === 'string' && s.classGrade.trim())  allowed['student.classGrade']  = s.classGrade.trim();
    }

    // Parent info updates
    if (body.parent && typeof body.parent === 'object') {
      const p = body.parent;
      if (typeof p.fullName   === 'string' && p.fullName.trim())   allowed['parent.fullName']   = p.fullName.trim();
      if (typeof p.email      === 'string' && p.email.trim())      allowed['parent.email']      = p.email.trim().toLowerCase();
      if (typeof p.phone      === 'string' && p.phone.trim())      allowed['parent.phone']      = p.phone.trim();
      if (typeof p.whatsapp   === 'string' && p.whatsapp.trim())   allowed['parent.whatsapp']   = p.whatsapp.trim();
      if (typeof p.address    === 'string' && p.address.trim())    allowed['parent.address']    = p.address.trim();
      if (typeof p.occupation === 'string' && p.occupation.trim()) allowed['parent.occupation'] = p.occupation.trim();
    }

    await connectDB();
    const registration = await Registration.findByIdAndUpdate(
      id,
      { $set: allowed },
      { new: true, select: '-__v' }
    ).lean();

    if (!registration) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: registration });
  } catch (error) {
    console.error(error);
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
    const result = await Registration.findByIdAndDelete(id);
    if (!result) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Delete failed' }, { status: 500 });
  }
}
