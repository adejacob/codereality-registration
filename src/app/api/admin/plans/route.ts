import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Plan from '@/models/Plan';

function isAuthorized(request: NextRequest): boolean {
  const cookie = request.cookies.get('admin_auth')?.value;
  const header = request.headers.get('x-admin-secret');
  const secret = process.env.ADMIN_SECRET;
  return cookie === secret || header === secret;
}

// Seed defaults if the collection is empty
const DEFAULT_PLANS = [
  { id: 'starter',           name: 'Starter Plan',            duration: '1 Month (4 Weeks)',   fee: 50000,  installmentEligible: false, popular: false, order: 1 },
  { id: 'stem-explorer',     name: 'STEM Explorer Program',   duration: '2 Months (8 Weeks)',  fee: 80000,  installmentEligible: true,  popular: true,  order: 2 },
  { id: 'growth',            name: 'Growth Plan',             duration: '3 Months (12 Weeks)', fee: 150000, installmentEligible: true,  popular: false, order: 3 },
  { id: 'mastery',           name: 'Mastery Plan',            duration: '6 Months (24 Weeks)', fee: 250000, installmentEligible: true,  popular: false, order: 4 },
  { id: 'platinum',          name: 'Platinum Plan',           duration: '6 Months (24 Weeks)', fee: 300000, installmentEligible: true,  popular: false, order: 5 },
];

export async function GET() {
  try {
    await connectDB();

    let plans = await Plan.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).lean();

    if (plans.length === 0) {
      await Plan.insertMany(DEFAULT_PLANS);
      plans = await Plan.find({ isActive: true }).sort({ order: 1 }).lean();
    }

    return NextResponse.json({ success: true, data: plans });
  } catch (error) {
    console.error('Plans GET error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch plans' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await request.json();
    const { name, duration, fee, features, installmentEligible, popular } = body;

    if (!name?.trim() || !duration?.trim() || typeof fee !== 'number' || fee < 0) {
      return NextResponse.json({ success: false, message: 'Name, duration, and fee are required' }, { status: 400 });
    }

    // Generate slug-like id
    const id = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const existing = await Plan.findOne({ id });
    if (existing) {
      return NextResponse.json({ success: false, message: 'A plan with this name already exists' }, { status: 409 });
    }

    const count = await Plan.countDocuments();
    const plan = await Plan.create({
      id,
      name: name.trim(),
      duration: duration.trim(),
      fee,
      features: Array.isArray(features) ? features.filter(Boolean) : [],
      installmentEligible: installmentEligible !== false,
      popular: popular === true,
      isActive: true,
      order: count + 1,
    });

    return NextResponse.json({ success: true, data: plan }, { status: 201 });
  } catch (error) {
    console.error('Plans POST error:', error);
    return NextResponse.json({ success: false, message: 'Failed to create plan' }, { status: 500 });
  }
}
