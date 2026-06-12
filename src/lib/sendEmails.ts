import nodemailer from 'nodemailer';
import { parentConfirmationEmail, adminNotificationEmail, EmailData } from './emailTemplates';

function createTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error('GMAIL_USER or GMAIL_APP_PASSWORD not set in environment variables');
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user, pass },
    connectionTimeout: 30000, // 30 seconds for serverless cold starts
    greetingTimeout: 30000,
    socketTimeout: 30000,
    debug: process.env.NODE_ENV === 'development',
    logger: process.env.NODE_ENV === 'development',
  });
}

export async function sendRegistrationEmails(data: EmailData, parentEmail: string) {
  const user    = process.env.GMAIL_USER;
  const adminTo = process.env.ADMIN_EMAIL ?? '';

  if (!user || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('GMAIL_USER or GMAIL_APP_PASSWORD not set — skipping email send');
    return;
  }

  const transporter = createTransporter();
  const from        = `"Codereality Academy" <${user}>`;

  const results = await Promise.allSettled([
    // Parent confirmation
    transporter.sendMail({
      from,
      replyTo:  from,
      to:       parentEmail,
      subject:  `Registration Confirmed - ${data.studentName} | Codereality Academy`,
      html:     parentConfirmationEmail(data),
      headers: {
        'X-Mailer':         'Codereality Academy Registration System',
        'X-Priority':       '3',
        'Precedence':       'bulk',
        'List-Unsubscribe': `<mailto:${user}?subject=unsubscribe>`,
      },
    }),

    // Admin notification (only if ADMIN_EMAIL is set)
    ...(adminTo
      ? [transporter.sendMail({
          from,
          replyTo:  from,
          to:       adminTo,
          subject:  `[Admin] New Registration - ${data.studentName} (${data.registrationId})`,
          html:     adminNotificationEmail(data),
        })]
      : []),
  ]);

  results.forEach((r, i) => {
    const label = i === 0 ? 'parent' : 'admin';
    if (r.status === 'rejected') {
      const err = (r as PromiseRejectedResult).reason;
      console.error(`[Email] ${label} send FAILED:`, err?.message ?? err);
      if (err?.responseCode) console.error(`[Email] SMTP response code:`, err.responseCode);
    } else {
      console.log(`[Email] ${label} sent OK — messageId:`, (r as PromiseFulfilledResult<any>).value?.messageId);
    }
  });

  return results;
}
