import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Registration from '@/models/Registration';
import Program from '@/models/Program';

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
  const program = sp.get('program') ?? '';
  const search  = sp.get('search')  ?? '';
  const status  = sp.get('status')  ?? '';
  const payType = sp.get('paymentType') ?? '';
  const sort    = sp.get('sort')    ?? 'newest';
  const page    = Math.max(1, Number(sp.get('page')  ?? '1'));
  const limit   = Math.min(100, Number(sp.get('limit') ?? '20'));

  if (!program) {
    return NextResponse.json({ success: false, message: 'program param required' }, { status: 400 });
  }

  await connectDB();

  // Build query
  const query: Record<string, unknown> = {
    'programs.programs': program,
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

  const [total, data, fullCount, installCount, pendingCount] = await Promise.all([
    Registration.countDocuments(query),
    Registration.find(query)
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(limit)
      .select('registrationId status paymentStatus createdAt student parent programs payment schedule')
      .lean(),
    Registration.countDocuments({ 'programs.programs': program, 'payment.paymentType': 'full' }),
    Registration.countDocuments({ 'programs.programs': program, 'payment.paymentType': 'installment' }),
    Registration.countDocuments({ 'programs.programs': program, paymentStatus: 'pending_payment' }),
  ]);

  // Get program display name from DB
  const prog = await Program.findOne({ id: program }).select('name').lean();
  const programName = prog?.name ?? program;

  return NextResponse.json({
    success: true,
    programName,
    data,
    summary: { total: await Registration.countDocuments({ 'programs.programs': program }), full: fullCount, installment: installCount, pending: pendingCount },
    pagination: { total, page, pages: Math.ceil(total / limit), limit },
  });
}
