import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Plan from '@/models/Plan';

const DEFAULT_PLANS = [
  { id: 'starter',       name: 'Starter Plan',          duration: '1 Month (4 Weeks)',   fee: 50000,  installmentEligible: false, popular: false },
  { id: 'stem-explorer', name: 'STEM Explorer Program',  duration: '2 Months (8 Weeks)',  fee: 80000,  installmentEligible: true,  popular: true  },
  { id: 'growth',        name: 'Growth Plan',            duration: '3 Months (12 Weeks)', fee: 150000, installmentEligible: true,  popular: false },
  { id: 'mastery',       name: 'Mastery Plan',           duration: '6 Months (24 Weeks)', fee: 250000, installmentEligible: true,  popular: false },
  { id: 'platinum',      name: 'Platinum Plan',          duration: '6 Months (24 Weeks)', fee: 300000, installmentEligible: true,  popular: false },
];

export async function GET() {
  try {
    await connectDB();
    let plans = await Plan.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).lean();

    if (plans.length === 0) {
      return NextResponse.json({ success: true, data: DEFAULT_PLANS });
    }

    return NextResponse.json({ success: true, data: plans });
  } catch {
    return NextResponse.json({ success: true, data: DEFAULT_PLANS });
  }
}
