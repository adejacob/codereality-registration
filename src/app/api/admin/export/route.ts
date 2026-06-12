import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import connectDB from '@/lib/mongodb';
import Registration, { IRegistration } from '@/models/Registration';

function isAuthorized(request: NextRequest): boolean {
  const cookie = request.cookies.get('admin_auth')?.value;
  const header = request.headers.get('x-admin-secret');
  const secret = process.env.ADMIN_SECRET;
  return cookie === secret || header === secret;
}

function flatten(reg: IRegistration & { _id?: unknown; createdAt?: Date }) {
  return {
    'Registration ID':    reg.registrationId,
    'Status':             reg.status,
    'Student First Name': reg.student.firstName,
    'Student Last Name':  reg.student.lastName,
    'Gender':             reg.student.gender,
    'Date of Birth':      reg.student.dateOfBirth,
    'School':             reg.student.schoolName,
    'Class/Grade':        reg.student.classGrade,
    'Parent Name':        reg.parent.fullName,
    'Parent Email':       reg.parent.email,
    'Phone':              reg.parent.phone,
    'WhatsApp':           reg.parent.whatsapp,
    'Address':            reg.parent.address,
    'Occupation':         reg.parent.occupation,
    'Programs':           reg.programs.programs.join(', '),
    'Schedule':           reg.schedule.schedule,
    'Payment Type':       reg.payment.paymentType,
    'Coupon':             reg.payment.coupon ?? '',
    'Payment Status':     reg.paymentStatus ?? 'pending_payment',
    'Notes':              reg.notes ?? '',
    'Registered On':      reg.createdAt ? new Date(reg.createdAt).toLocaleString() : '',
  };
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const format = new URL(request.url).searchParams.get('format') ?? 'xlsx';

  try {
    await connectDB();
    const registrations = await Registration.find({}).sort({ createdAt: -1 }).lean() as unknown as (IRegistration & { _id?: unknown; createdAt?: Date })[];

    const rows = registrations.map(flatten);

    if (format === 'csv') {
      const ws = XLSX.utils.json_to_sheet(rows);
      const csv = XLSX.utils.sheet_to_csv(ws);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="registrations-${Date.now()}.csv"`,
        },
      });
    }

    // Default: xlsx
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = Object.keys(rows[0] ?? {}).map(() => ({ wch: 22 }));
    XLSX.utils.book_append_sheet(wb, ws, 'Registrations');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="registrations-${Date.now()}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ success: false, message: 'Export failed' }, { status: 500 });
  }
}
