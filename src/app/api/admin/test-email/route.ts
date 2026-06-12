import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function GET(request: NextRequest) {
  const secret = request.cookies.get('admin_auth')?.value;
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  const to   = process.env.ADMIN_EMAIL;

  if (!user || !pass) return NextResponse.json({ error: 'GMAIL_USER or GMAIL_APP_PASSWORD not set' }, { status: 500 });
  if (!to)           return NextResponse.json({ error: 'ADMIN_EMAIL not set' },                       { status: 500 });

  try {
    const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });
    const result = await transporter.sendMail({
      from:    `"Codereality Academy" <${user}>`,
      to,
      subject: '✅ Codereality Email Test',
      html:    '<p>Email system is working correctly! The Gmail integration is set up.</p>',
    });
    return NextResponse.json({ success: true, messageId: result.messageId });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
