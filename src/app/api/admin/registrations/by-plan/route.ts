import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Registration from '@/models/Registration';
import Plan from '@/models/Plan';

function isAuthorized(req: NextRequest) {
  const cookie = req.cookies.get('admin_auth')?.value;
  const header = req.headers.get('x-admin-secret');
  return cookie === process.env.ADMIN_SECRET || header === process.env.ADMIN_SECRET;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const sp      = request.nextUrl.searchParams;
  const plan    = sp.get('plan')    ?? '';
  const search  = sp.get('search')  ?? '';
  const status  = sp.get('status')  ?? '';
  const payType = sp.get('paymentType') ?? '';
  const sort    = sp.get('sort')    ?? 'newest';
  const page    = Math.max(1, Number(sp.get('page')  ?? '1'));
  const limit   = Math.min(100, Number(sp.get('limit') ?? '20'));

  if (!plan) {
    return NextResponse.json({ success: false, message: 'plan param required' }, { status: 400 });
  }

  await connectDB();

  const query: Record<string, unknown> = {
    'payment.selectedPlan': plan,
  };

  if (status)  query.status = status;
  if (payType) query['payment.paymentType'] = payType;

  if (search) {
    const re = new RegExp(search, 'i');
    query.$or = [
      { 'student.firstName': re },
      { 'student.lastName':  re },
      { 'parent.email':      re },
      { 'parent.fullName':   re },
      { registrationId:      re },
    ];
  }

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    oldest: { createdAt:  1 },
    name:   { 'student.firstName': 1, 'student.lastName': 1 },
  };
  const sortObj = sortMap[sort] ?? sortMap.newest;

  const [total, data, fullCount, installCount, pendingCount, totalUnfiltered] = await Promise.all([
    Registration.countDocuments(query),
    Registration.find(query)
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(limit)
      .select('registrationId status paymentStatus createdAt student parent programs payment schedule')
      .lean(),
    Registration.countDocuments({ 'payment.selectedPlan': plan, 'payment.paymentType': 'full' }),
    Registration.countDocuments({ 'payment.selectedPlan': plan, 'payment.paymentType': 'installment' }),
    Registration.countDocuments({ 'payment.selectedPlan': plan, paymentStatus: 'pending_payment' }),
    Registration.countDocuments({ 'payment.selectedPlan': plan }),
  ]);

  // Get plan display name from DB
  const dbPlan = await Plan.findOne({ id: plan }).select('name').lean();
  const planName = dbPlan?.name ?? plan;

  return NextResponse.json({
    success: true,
    planName,
    data,
    summary: { total: totalUnfiltered, full: fullCount, installment: installCount, pending: pendingCount },
    pagination: { total, page, pages: Math.ceil(total / limit), limit },
  });
}
