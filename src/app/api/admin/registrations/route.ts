import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Registration from '@/models/Registration';

function isAuthorized(request: NextRequest): boolean {
  const cookie = request.cookies.get('admin_auth')?.value;
  const header = request.headers.get('x-admin-secret');
  const secret = process.env.ADMIN_SECRET;
  return cookie === secret || header === secret;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const VALID_STATUSES  = new Set(['pending', 'contacted', 'approved', 'enrolled', 'rejected']);
  const VALID_PROGRAMS  = new Set(['coding', 'robotics', 'ai', 'web', 'mobile', 'game', '3d', 'graphic', 'digital', 'scratch', 'workshop']);

  const search   = searchParams.get('search') ?? '';
  const statusRaw  = searchParams.get('status') ?? '';
  const programRaw = searchParams.get('program') ?? '';
  const couponFilter = searchParams.get('coupon') ?? '';
  const status   = VALID_STATUSES.has(statusRaw)  ? statusRaw  : '';
  const program  = VALID_PROGRAMS.has(programRaw) ? programRaw : '';
  const dateFrom = searchParams.get('dateFrom') ?? '';
  const dateTo   = searchParams.get('dateTo') ?? '';
  const page     = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit    = Math.min(100, parseInt(searchParams.get('limit') ?? '20'));

  try {
    await connectDB();

    // Build filter query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};

    if (status) query.status = status;

    // Special "coupon" filter: registrations that used a coupon code
    if (statusRaw === 'coupon') {
      query['payment.coupon'] = { $exists: true, $ne: '' };
    }

    // Filter by specific coupon code
    if (couponFilter) {
      const safeCoupon = couponFilter.slice(0, 50).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query['payment.coupon'] = { $regex: safeCoupon, $options: 'i' };
    }

    if (program) query['programs.programs'] = program;

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo)   query.createdAt.$lte = new Date(new Date(dateTo).setHours(23, 59, 59, 999));
    }

    if (search) {
      // Escape all regex special characters to prevent ReDoS
      const safeSearch = search.slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = { $regex: safeSearch, $options: 'i' };
      query.$or = [
        { 'student.firstName': regex },
        { 'student.lastName':  regex },
        { 'parent.email':      regex },
        { 'parent.phone':      regex },
        { registrationId:      regex },
        { 'student.schoolName': regex },
      ];
    }

    const total = await Registration.countDocuments(query);
    const registrations = await Registration.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-__v')
      .lean();

    // Stats summary (always full collection, ignoring filters)
    const [stats] = await Registration.aggregate([
      {
        $group: {
          _id: null,
          total:            { $sum: 1 },
          pending:          { $sum: { $cond: [{ $eq: ['$status', 'pending']   }, 1, 0] } },
          contacted:        { $sum: { $cond: [{ $eq: ['$status', 'contacted'] }, 1, 0] } },
          approved:         { $sum: { $cond: [{ $eq: ['$status', 'approved']  }, 1, 0] } },
          enrolled:         { $sum: { $cond: [{ $eq: ['$status', 'enrolled']  }, 1, 0] } },
          rejected:         { $sum: { $cond: [{ $eq: ['$status', 'rejected']  }, 1, 0] } },
          pendingPayment:   { $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending_payment']   }, 1, 0] } },
          paymentSubmitted: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'payment_submitted'] }, 1, 0] } },
          paymentConfirmed: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'payment_confirmed'] }, 1, 0] } },
          couponRegistrations: { $sum: { $cond: [{ $and: [{ $ne: ['$payment.coupon', null] }, { $ne: ['$payment.coupon', ''] }] }, 1, 0] } },
        },
      },
    ]);

    const defaultStats = {
      total: 0, pending: 0, contacted: 0, approved: 0, enrolled: 0, rejected: 0,
      pendingPayment: 0, paymentSubmitted: 0, paymentConfirmed: 0, couponRegistrations: 0,
    };

    return NextResponse.json({
      success: true,
      data: registrations,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
      stats: stats ?? defaultStats,
    });
  } catch (error) {
    console.error('Fetch registrations error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch registrations';
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
