import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Registration from '@/models/Registration';
import { generateEnrollmentCertificate } from '@/lib/generateCertificate';
import { enrollmentConfirmationEmail } from '@/lib/emailTemplates';
import nodemailer from 'nodemailer';

function isAuthorized(req: NextRequest) {
  const cookie = req.cookies.get('admin_auth')?.value;
  const header = req.headers.get('x-admin-secret');
  return cookie === process.env.ADMIN_SECRET || header === process.env.ADMIN_SECRET;
}

async function generateEnrollmentNumber(): Promise<string> {
  const year  = new Date().getFullYear();
  const count = await Registration.countDocuments({ enrollmentNumber: { $exists: true, $ne: null } });
  const seq   = String(count + 1).padStart(4, '0');
  return `CRA-ENR-${year}-${seq}`;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await connectDB();

    const reg = await Registration.findById(id);
    if (!reg) {
      return NextResponse.json({ success: false, message: 'Registration not found' }, { status: 404 });
    }

    if (reg.status === 'enrolled' && reg.enrollmentNumber) {
      return NextResponse.json({ success: false, message: 'Already enrolled' }, { status: 400 });
    }

    const enrollmentNumber = await generateEnrollmentNumber();
    const enrollmentDate   = new Date();

    reg.status          = 'enrolled';
    reg.paymentStatus   = 'payment_confirmed';
    reg.enrollmentNumber = enrollmentNumber;
    reg.enrollmentDate   = enrollmentDate;
    await reg.save();

    const enrollmentDateStr = enrollmentDate.toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    });

    const certData = {
      studentName:      `${reg.student.firstName} ${reg.student.lastName}`,
      enrollmentNumber,
      programs:         reg.programs.programs,
      schedule:         reg.schedule.schedule,
      enrollmentDate:   enrollmentDateStr,
      registrationId:   reg.registrationId,
    };

    // Generate PDF certificate
    const pdfBytes = await generateEnrollmentCertificate(certData);

    // Send enrollment confirmation email with PDF attached
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;

    if (gmailUser && gmailPass) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: gmailUser, pass: gmailPass },
      });

      const emailData = {
        parentName:       reg.parent.fullName,
        studentName:      `${reg.student.firstName} ${reg.student.lastName}`,
        registrationId:   reg.registrationId,
        enrollmentNumber,
        programs:         reg.programs.programs,
        schedule:         reg.schedule.schedule,
        enrollmentDate:   enrollmentDateStr,
      };

      await transporter.sendMail({
        from:    `"Codereality Academy" <${gmailUser}>`,
        to:      reg.parent.email,
        subject: `🎉 Welcome to Codereality Academy – Enrollment Confirmed`,
        html:    enrollmentConfirmationEmail(emailData),
        attachments: [
          {
            filename:    `Enrollment-Letter-${enrollmentNumber}.pdf`,
            content:     Buffer.from(pdfBytes),
            contentType: 'application/pdf',
          },
        ],
      }).catch((err) => console.error('Enrollment email send failed:', err));
    } else {
      console.warn('Gmail credentials not set — skipping enrollment email');
    }

    return NextResponse.json({
      success: true,
      message: 'Enrollment confirmed',
      data: {
        enrollmentNumber,
        enrollmentDate: enrollmentDate.toISOString(),
        status: 'enrolled',
        paymentStatus: 'payment_confirmed',
      },
    });
  } catch (error) {
    console.error('Enroll error:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}
