import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Registration from '@/models/Registration';
import { generateEnrollmentCertificate } from '@/lib/generateCertificate';

function isAuthorized(req: NextRequest) {
  const cookie = req.cookies.get('admin_auth')?.value;
  const header = req.headers.get('x-admin-secret');
  return cookie === process.env.ADMIN_SECRET || header === process.env.ADMIN_SECRET;
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

    const reg = await Registration.findById(id).lean();
    if (!reg) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    if (!reg.enrollmentNumber) {
      return NextResponse.json({ success: false, message: 'Not yet enrolled' }, { status: 400 });
    }

    const enrollmentDateStr = reg.enrollmentDate
      ? new Date(reg.enrollmentDate).toLocaleDateString('en-GB', {
          day: 'numeric', month: 'long', year: 'numeric',
        })
      : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    const pdfBytes = await generateEnrollmentCertificate({
      studentName:      `${reg.student.firstName} ${reg.student.lastName}`,
      enrollmentNumber: reg.enrollmentNumber,
      programs:         reg.programs.programs,
      schedule:         reg.schedule?.schedule ?? 'N/A',
      enrollmentDate:   enrollmentDateStr,
      registrationId:   reg.registrationId,
    });

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type':        'application/pdf',
        'Content-Disposition': `attachment; filename="Enrollment-Letter-${reg.enrollmentNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Certificate error:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
