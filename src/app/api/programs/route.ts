import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Program from '@/models/Program';

export async function GET() {
  try {
    await connectDB();
    const programs = await Program.find({ isActive: true })
      .sort({ order: 1, createdAt: 1 })
      .select('id name description color icon isFree isLimited')
      .lean();

    return NextResponse.json({ success: true, data: programs });
  } catch (error) {
    console.error('Public programs GET error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
