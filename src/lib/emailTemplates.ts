export interface EnrollmentEmailData {
  parentName: string;
  studentName: string;
  registrationId: string;
  enrollmentNumber: string;
  programs: string[];
  schedule: string;
  enrollmentDate: string;
}

export interface EmailData {
  parentName: string;
  studentName: string;
  registrationId: string;
  programs: string[];
  schedule: string;
  paymentType: string;
  submittedDate: string;
  coupon?: string;
  selectedPlan?: string;
  planAmount?: string;
  registrationFee?: string;
  totalAmount?: string;
  installmentAmountDue?: string;
  installmentOutstanding?: string;
}

function formatSchedule(s: string) {
  const map: Record<string, string> = {
    weekend: 'Weekend Classes',
    'after-school': 'After-School Classes',
    holiday: 'Holiday Intensive',
    private: 'Private Tutoring',
  };
  return map[s] ?? s;
}

function formatPayment(p: string) {
  return p === 'full' ? 'Full Payment' : 'Installment Plan';
}

function formatPlan(planId?: string): { name: string; amount: string; duration?: string } {
  const plans: Record<string, { name: string; amount: string; duration?: string }> = {
    starter: { name: 'Starter Plan', amount: '₦50,000', duration: '1 Month' },
    'stem-explorer': { name: 'STEM Explorer Program', amount: '₦80,000', duration: '2 Months' },
    growth: { name: 'Growth Plan', amount: '₦150,000', duration: '3 Months' },
    short: { name: 'Short Program', amount: '₦100,000', duration: '2 Months' },
    mastery: { name: 'Mastery Plan', amount: '₦250,000', duration: '6 Months' },
    platinum: { name: 'Platinum Plan', amount: '₦300,000', duration: '6 Months' },
    'holiday-explorer': { name: 'Holiday Explorer Track', amount: '₦50,000', duration: '1 Month' },
    'holiday-innovator': { name: 'Holiday Innovator Track', amount: '₦80,000', duration: '2 Months' },
  };
  return planId ? plans[planId] : { name: 'Not selected', amount: 'N/A' };
}

function programList(programs: string[]) {
  return programs
    .map((p) => `<li style="margin:6px 0;color:#4f46e5;font-weight:600;">• ${p}</li>`)
    .join('');
}

export function parentConfirmationEmail(data: EmailData): string {
  const waNumber  = process.env.WHATSAPP_NUMBER ?? '2348000000000';
  const bankName  = process.env.BANK_NAME        ?? 'YOUR BANK NAME';
  const accName   = process.env.ACCOUNT_NAME     ?? 'YOUR ACCOUNT NAME';
  const accNumber = process.env.ACCOUNT_NUMBER   ?? 'YOUR ACCOUNT NUMBER';

  const hasCoupon = !!data.coupon && data.coupon.trim() !== '';
  const isInstallment = data.paymentType === 'installment' && !!data.installmentAmountDue;

  const waMessage = hasCoupon
    ? encodeURIComponent(
        `Hello Codereality Academy,\n\nI have registered with coupon code ${data.coupon}.\n\nRegistration ID: ${data.registrationId}\n\nStudent Name: ${data.studentName}\n\nThank you.`
      )
    : encodeURIComponent(
        `Hello Codereality Academy,\n\nI have completed payment for registration ID ${data.registrationId}.\n\nStudent Name: ${data.studentName}\n\nPlease find my payment confirmation attached.\n\nThank you.`
      );
  const waLink = `https://wa.me/${waNumber}?text=${waMessage}`;

  // Conditional Next Steps
  const nextSteps = hasCoupon
    ? [
        ['1', '#4f46e5', 'Registration Confirmed', 'Your free registration has been confirmed with coupon code.'],
        ['2', '#7c3aed', 'Await Enrollment', 'We will process your enrollment and contact you within 24 hours.'],
        ['3', '#059669', 'Check Your Email', 'You will receive orientation details and class schedule shortly.'],
      ]
    : isInstallment
    ? [
        ['1', '#1d4ed8', 'Pay First Installment', `Transfer ${data.installmentAmountDue} (50% + registration fee) using the bank details below.`],
        ['2', '#059669', 'Send Payment Receipt', 'Send your payment proof via WhatsApp to confirm your spot.'],
        ['3', '#7c3aed', 'Await Confirmation', 'We will confirm your enrollment within 24 hours of payment.'],
        ['4', '#dc2626', 'Pay Remaining Balance', `Your outstanding balance of ${data.installmentOutstanding} is due by the end of your child's first month.`],
      ]
    : [
        ['1', '#4f46e5', 'Complete Payment', 'Use the bank details below to make your payment.'],
        ['2', '#059669', 'Send Payment Receipt', 'Send your payment proof via WhatsApp to confirm your spot.'],
        ['3', '#7c3aed', 'Await Confirmation', 'We will confirm your enrollment within 24 hours of payment.'],
      ];

  // Conditional WhatsApp button text
  const whatsappButtonText = hasCoupon ? '💬 Contact Us on WhatsApp' : '💬 Send Payment Receipt on WhatsApp';
  const whatsappSubtext = hasCoupon
    ? 'Tap the button above to open WhatsApp with your registration details'
    : 'Tap the button above to open WhatsApp with a pre-filled message';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1.0" />
<title>Registration Confirmation</title>
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f4f4f9;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f9;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);border-radius:16px 16px 0 0;padding:40px 40px 32px;text-align:center;">
          <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:50%;width:64px;height:64px;line-height:64px;font-size:32px;margin-bottom:16px;">🎓</div>
          <h1 style="margin:0;color:#fff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">Codereality Academy</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">STEM Education for the Next Generation</p>
        </td></tr>

        <!-- Celebration Banner -->
        <tr><td style="background:#fff;padding:36px 40px 0;text-align:center;">
          <div style="font-size:48px;margin-bottom:12px;">🎉</div>
          <h2 style="margin:0 0 8px;color:#1e1b4b;font-size:24px;font-weight:800;">Congratulations, ${data.parentName}!</h2>
          <p style="margin:0;color:#6b7280;font-size:16px;line-height:1.6;">Your child's registration has been received successfully.</p>
          ${hasCoupon ? `
          <div style="margin-top:16px;padding:12px 20px;background:#f0fdf4;border:1px solid #86efac;border-radius:10px;display:inline-block;">
            <p style="margin:0;color:#166534;font-size:14px;font-weight:600;">✅ Free Registration Applied</p>
            <p style="margin:4px 0 0;color:#22c55e;font-size:12px;font-family:monospace;">Coupon: ${data.coupon}</p>
          </div>
          ` : ''}
        </td></tr>

        <!-- Registration Summary -->
        <tr><td style="background:#fff;padding:28px 40px;">
          <div style="background:#f8f7ff;border:1px solid #e0e7ff;border-radius:12px;padding:24px;">
            <h3 style="margin:0 0 16px;color:#4f46e5;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Registration Summary</h3>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:6px 0;color:#6b7280;font-size:14px;width:45%;">Student Name</td>
                <td style="padding:6px 0;color:#111827;font-size:14px;font-weight:600;">${data.studentName}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#6b7280;font-size:14px;">Registration ID</td>
                <td style="padding:6px 0;font-size:14px;font-weight:700;font-family:monospace;color:#4f46e5;">${data.registrationId}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#6b7280;font-size:14px;">Schedule</td>
                <td style="padding:6px 0;color:#111827;font-size:14px;font-weight:600;">${formatSchedule(data.schedule)}</td>
              </tr>
              ${!hasCoupon ? `
              <tr>
                <td style="padding:6px 0;color:#6b7280;font-size:14px;">Payment Plan</td>
                <td style="padding:6px 0;color:#111827;font-size:14px;font-weight:600;">${isInstallment ? 'Installment (50%)' : formatPayment(data.paymentType)}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#6b7280;font-size:14px;">Selected Plan</td>
                <td style="padding:6px 0;color:#111827;font-size:14px;font-weight:600;">${formatPlan(data.selectedPlan).name}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#6b7280;font-size:14px;">Program Fee (Full)</td>
                <td style="padding:6px 0;color:#111827;font-size:14px;font-weight:600;">${data.planAmount || formatPlan(data.selectedPlan).amount}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#6b7280;font-size:14px;">Registration Fee</td>
                <td style="padding:6px 0;color:#111827;font-size:14px;font-weight:600;">${data.registrationFee || '₦5,000'}</td>
              </tr>
              ${isInstallment ? `
              <tr>
                <td style="padding:8px 0;border-top:2px solid #dbeafe;"><strong style="color:#1d4ed8;font-size:15px;">Amount Due Today (50% + Reg. Fee)</strong></td>
                <td style="padding:8px 0;border-top:2px solid #dbeafe;color:#1d4ed8;font-size:18px;font-weight:800;">${data.installmentAmountDue}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#6b7280;font-size:14px;">Outstanding Balance</td>
                <td style="padding:6px 0;color:#dc2626;font-size:14px;font-weight:700;">${data.installmentOutstanding}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#6b7280;font-size:14px;">Balance Due By</td>
                <td style="padding:6px 0;color:#dc2626;font-size:14px;font-weight:700;">End of 1st Month of Enrollment</td>
              </tr>
              ` : `
              <tr>
                <td style="padding:8px 0;border-top:2px solid #e0e7ff;"><strong style="color:#111827;font-size:15px;">Total Amount to Pay</strong></td>
                <td style="padding:8px 0;border-top:2px solid #e0e7ff;color:#059669;font-size:18px;font-weight:800;">${data.totalAmount || '₦' + (parseInt((data.planAmount || formatPlan(data.selectedPlan).amount).replace(/[^0-9]/g, '')) + 5000).toLocaleString()}</td>
              </tr>
              `}
              ` : ''}
              <tr>
                <td style="padding:6px 0;color:#6b7280;font-size:14px;">Date Submitted</td>
                <td style="padding:6px 0;color:#111827;font-size:14px;font-weight:600;">${data.submittedDate}</td>
              </tr>
            </table>
            <div style="margin-top:16px;padding-top:16px;border-top:1px solid #e0e7ff;">
              <p style="margin:0 0 8px;color:#6b7280;font-size:14px;">Selected Programs</p>
              <ul style="margin:0;padding:0;list-style:none;">${programList(data.programs)}</ul>
            </div>
          </div>
        </td></tr>

        <!-- Next Steps -->
        <tr><td style="background:#fff;padding:0 40px 28px;">
          <h3 style="margin:0 0 16px;color:#1e1b4b;font-size:16px;font-weight:700;">Next Steps</h3>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${nextSteps.map(([num, color, title, desc]) => `
            <tr><td style="padding:10px 0;">
              <table cellpadding="0" cellspacing="0"><tr>
                <td style="vertical-align:top;padding-right:14px;">
                  <div style="width:32px;height:32px;background:${color};border-radius:50%;text-align:center;line-height:32px;color:#fff;font-size:14px;font-weight:800;">${num}</div>
                </td>
                <td style="vertical-align:top;">
                  <p style="margin:0 0 2px;color:#111827;font-size:14px;font-weight:700;">${title}</p>
                  <p style="margin:0;color:#6b7280;font-size:13px;">${desc}</p>
                </td>
              </tr></table>
            </td></tr>`).join('')}
          </table>
        </td></tr>

        ${isInstallment ? `
        <!-- Installment Warning Notice -->
        <tr><td style="background:#fff;padding:0 40px 20px;">
          <div style="background:#fff7ed;border:2px solid #fed7aa;border-radius:14px;padding:20px 24px;">
            <p style="margin:0 0 8px;color:#92400e;font-size:14px;font-weight:800;">⚠️ Important Installment Payment Notice</p>
            <p style="margin:0 0 10px;color:#78350f;font-size:13px;line-height:1.6;">Your registration has been completed using the <strong>Installment Payment Plan</strong>. This payment covers:</p>
            <ul style="margin:0 0 10px;padding-left:18px;color:#78350f;font-size:13px;line-height:1.8;">
              <li>50% of your selected program fee</li>
              <li>One-time registration fee</li>
            </ul>
            <p style="margin:0;color:#78350f;font-size:13px;line-height:1.6;">The remaining tuition balance of <strong style="color:#dc2626;">${data.installmentOutstanding}</strong> must be paid <strong>on or before the end of your child's first month of enrollment</strong>. Failure to complete the outstanding balance by this deadline will result in your child's classes being placed on hold until payment has been received.</p>
          </div>
        </td></tr>
        ` : ''}

        ${!hasCoupon ? `
        <!-- Payment Details - Only show when NO coupon -->
        <tr><td style="background:#fff;padding:0 40px 28px;">
          <!-- Section label -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
            <tr>
              <td style="border-left:4px solid #4f46e5;padding-left:10px;">
                <p style="margin:0;color:#4f46e5;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:1px;">💳 Payment Details</p>
                <p style="margin:2px 0 0;color:#6b7280;font-size:12px;">Transfer to the account below, then send proof via WhatsApp</p>
              </td>
            </tr>
          </table>
          <!-- Card -->
          <div style="border:2px solid #4f46e5;border-radius:14px;overflow:hidden;">
            <!-- Card header strip -->
            <div style="background:#4f46e5;padding:12px 20px;">
              <p style="margin:0;color:#fff;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;">Bank Transfer Information</p>
            </div>
            <!-- Card body -->
            <div style="background:#fafafe;padding:20px;">
              <!-- Row: Bank Name -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
                <tr>
                  <td style="width:38%;vertical-align:top;">
                    <p style="margin:0;color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;">Bank Name</p>
                  </td>
                  <td style="vertical-align:top;">
                    <p style="margin:0;color:#111827;font-size:15px;font-weight:800;">${bankName}</p>
                  </td>
                </tr>
              </table>
              <!-- Divider -->
              <div style="height:1px;background:#e0e7ff;margin-bottom:14px;"></div>
              <!-- Row: Account Name -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
                <tr>
                  <td style="width:38%;vertical-align:top;">
                    <p style="margin:0;color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;">Account Name</p>
                  </td>
                  <td style="vertical-align:top;">
                    <p style="margin:0;color:#111827;font-size:15px;font-weight:800;">${accName}</p>
                  </td>
                </tr>
              </table>
              <!-- Divider -->
              <div style="height:1px;background:#e0e7ff;margin-bottom:14px;"></div>
              <!-- Account Number — highlighted box -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:38%;vertical-align:middle;">
                    <p style="margin:0;color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;">Account Number</p>
                  </td>
                  <td style="vertical-align:middle;">
                    <div style="display:inline-block;background:#eef2ff;border:2px solid #4f46e5;border-radius:8px;padding:8px 16px;">
                      <p style="margin:0;color:#1e1b4b;font-size:22px;font-weight:900;font-family:Courier New,Courier,monospace;letter-spacing:4px;">${accNumber}</p>
                    </div>
                  </td>
                </tr>
              </table>
            </div>
            <!-- Card footer -->
            <div style="background:#eff6ff;border-top:1px solid #c7d2fe;padding:12px 20px;">
              <p style="margin:0;color:#3730a3;font-size:12px;font-weight:600;">⚠️ Use your Registration ID <span style="font-family:Courier New,monospace;background:#e0e7ff;padding:1px 6px;border-radius:4px;">${data.registrationId}</span> as your payment reference/narration.</p>
            </div>
          </div>
        </td></tr>
        ` : ''}

        <!-- WhatsApp Button -->
        <tr><td style="background:#fff;padding:0 40px 36px;text-align:center;">
          <a href="${waLink}" style="display:inline-block;background:#25d366;color:#fff;text-decoration:none;padding:16px 32px;border-radius:50px;font-size:16px;font-weight:700;letter-spacing:0.3px;">
            ${whatsappButtonText}
          </a>
          <p style="margin:12px 0 0;color:#9ca3af;font-size:12px;">${whatsappSubtext}</p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f8f7ff;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;border-top:1px solid #e0e7ff;">
          <p style="margin:0 0 4px;color:#6b7280;font-size:13px;">Questions? Reply to this email or contact us</p>
          <p style="margin:0;color:#4f46e5;font-size:13px;font-weight:600;">coderealityacademy.tech@gmail.com</p>
          <p style="margin:16px 0 0;color:#d1d5db;font-size:11px;">© ${new Date().getFullYear()} Codereality Academy. All rights reserved.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function adminNotificationEmail(data: EmailData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><title>New Registration</title></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f4f4f9;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f9;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#1e1b4b 0%,#4f46e5 100%);border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;">🔔 New Registration Received</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.7);font-size:13px;">Codereality Academy Admin Notification</p>
        </td></tr>

        <tr><td style="background:#fff;padding:32px 40px;">
          <!-- ID Banner -->
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px 20px;margin-bottom:24px;text-align:center;">
            <p style="margin:0 0 4px;color:#15803d;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Registration ID</p>
            <p style="margin:0;color:#166534;font-size:22px;font-weight:800;font-family:monospace;">${data.registrationId}</p>
          </div>

          <!-- Student Details -->
          <h3 style="margin:0 0 12px;color:#4f46e5;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Student Details</h3>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr><td style="padding:5px 0;color:#6b7280;font-size:13px;width:40%;">Full Name</td><td style="padding:5px 0;color:#111827;font-size:13px;font-weight:600;">${data.studentName}</td></tr>
            <tr><td style="padding:5px 0;color:#6b7280;font-size:13px;">Date Submitted</td><td style="padding:5px 0;color:#111827;font-size:13px;font-weight:600;">${data.submittedDate}</td></tr>
          </table>

          <!-- Parent Details -->
          <h3 style="margin:0 0 12px;color:#4f46e5;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Parent Details</h3>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr><td style="padding:5px 0;color:#6b7280;font-size:13px;width:40%;">Full Name</td><td style="padding:5px 0;color:#111827;font-size:13px;font-weight:600;">${data.parentName}</td></tr>
          </table>

          <!-- Program Details -->
          <h3 style="margin:0 0 12px;color:#4f46e5;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Program & Payment</h3>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
            <tr><td style="padding:5px 0;color:#6b7280;font-size:13px;width:40%;">Programs</td><td style="padding:5px 0;color:#111827;font-size:13px;font-weight:600;">${data.programs.join(', ')}</td></tr>
            <tr><td style="padding:5px 0;color:#6b7280;font-size:13px;">Schedule</td><td style="padding:5px 0;color:#111827;font-size:13px;font-weight:600;">${data.schedule}</td></tr>
            <tr><td style="padding:5px 0;color:#6b7280;font-size:13px;">Payment Option</td><td style="padding:5px 0;color:#111827;font-size:13px;font-weight:600;">${data.paymentType}</td></tr>
            ${data.selectedPlan ? `
            <tr><td style="padding:5px 0;color:#6b7280;font-size:13px;">Selected Plan</td><td style="padding:5px 0;color:#111827;font-size:13px;font-weight:600;">${formatPlan(data.selectedPlan).name}</td></tr>
            <tr><td style="padding:5px 0;color:#6b7280;font-size:13px;">Plan Amount</td><td style="padding:5px 0;color:#111827;font-size:13px;font-weight:600;">${data.planAmount || formatPlan(data.selectedPlan).amount}</td></tr>
            <tr><td style="padding:5px 0;color:#6b7280;font-size:13px;">Registration Fee</td><td style="padding:5px 0;color:#111827;font-size:13px;font-weight:600;">${data.registrationFee || '₦5,000'}</td></tr>
            <tr><td style="padding:5px 0;color:#6b7280;font-size:13px;"><strong>Total Amount</strong></td><td style="padding:5px 0;color:#059669;font-size:14px;font-weight:800;">${data.totalAmount || '₦' + (parseInt((data.planAmount || formatPlan(data.selectedPlan).amount).replace(/[^0-9]/g, '')) + 5000).toLocaleString()}</td></tr>
            ` : ''}
          </table>
        </td></tr>

        <tr><td style="background:#f8f7ff;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;border-top:1px solid #e0e7ff;">
          <p style="margin:0;color:#6b7280;font-size:12px;">Log in to the admin dashboard to manage this registration.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function enrollmentConfirmationEmail(data: EnrollmentEmailData): string {
  const waNumber  = process.env.WHATSAPP_NUMBER ?? '';
  const waLink    = waNumber ? `https://wa.me/${waNumber}` : '#';
  const website   = 'https://www.coderealityacademy.com.ng';
  const email     = 'coderealityacademy.tech@gmail.com';
  const phone     = process.env.ACADEMY_PHONE ?? '07049625646';

  const steps = [
    { icon: '✅', title: 'Enrollment Confirmed',           desc: 'Your child is officially enrolled at Codereality Academy.' },
    { icon: '📚', title: 'Class Placement in Progress',    desc: 'We are placing your child in the right class group.' },
    { icon: '📅', title: 'Orientation Info Coming Soon',   desc: 'You will receive orientation details and class schedule shortly.' },
    { icon: '📞', title: 'Academy Team Will Contact You',  desc: 'Our team will reach out before the first class day.' },
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1.0" />
<title>Enrollment Confirmed – Codereality Academy</title>
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f0fdf4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#059669 0%,#10b981 50%,#34d399 100%);border-radius:16px 16px 0 0;padding:44px 40px 36px;text-align:center;">
          <div style="display:inline-block;background:rgba(255,255,255,0.2);border-radius:50%;width:72px;height:72px;line-height:72px;font-size:36px;margin-bottom:20px;">🎓</div>
          <h1 style="margin:0 0 4px;color:#fff;font-size:28px;font-weight:900;letter-spacing:-0.5px;">Codereality Academy</h1>
          <p style="margin:0;color:rgba(255,255,255,0.8);font-size:13px;font-weight:500;letter-spacing:1px;text-transform:uppercase;">STEM Education for the Next Generation</p>
        </td></tr>

        <!-- Celebration -->
        <tr><td style="background:#fff;padding:40px 40px 24px;text-align:center;">
          <div style="font-size:56px;margin-bottom:16px;">🎉</div>
          <h2 style="margin:0 0 10px;color:#064e3b;font-size:26px;font-weight:900;">Enrollment Confirmed!</h2>
          <p style="margin:0;color:#6b7280;font-size:16px;line-height:1.7;">
            Dear <strong style="color:#111827;">${data.parentName}</strong>, we are thrilled to welcome
            <strong style="color:#059669;">${data.studentName}</strong> to the Codereality Academy family!
          </p>
        </td></tr>

        <!-- Enrollment Card -->
        <tr><td style="background:#fff;padding:0 40px 28px;">
          <div style="background:linear-gradient(135deg,#064e3b 0%,#065f46 50%,#047857 100%);border-radius:16px;padding:28px;text-align:center;">
            <p style="margin:0 0 6px;color:rgba(255,255,255,0.6);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;">Enrollment Number</p>
            <p style="margin:0 0 20px;color:#ffffff;font-size:26px;font-weight:900;font-family:monospace;letter-spacing:3px;">${data.enrollmentNumber}</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:6px 8px;text-align:center;border-right:1px solid rgba(255,255,255,0.1);">
                  <p style="margin:0 0 2px;color:rgba(255,255,255,0.5);font-size:10px;text-transform:uppercase;letter-spacing:1px;">Student</p>
                  <p style="margin:0;color:#fff;font-size:13px;font-weight:700;">${data.studentName}</p>
                </td>
                <td style="padding:6px 8px;text-align:center;border-right:1px solid rgba(255,255,255,0.1);">
                  <p style="margin:0 0 2px;color:rgba(255,255,255,0.5);font-size:10px;text-transform:uppercase;letter-spacing:1px;">Reg ID</p>
                  <p style="margin:0;color:#fff;font-size:13px;font-weight:700;font-family:monospace;">${data.registrationId}</p>
                </td>
                <td style="padding:6px 8px;text-align:center;">
                  <p style="margin:0 0 2px;color:rgba(255,255,255,0.5);font-size:10px;text-transform:uppercase;letter-spacing:1px;">Date</p>
                  <p style="margin:0;color:#fff;font-size:13px;font-weight:700;">${data.enrollmentDate}</p>
                </td>
              </tr>
            </table>
          </div>
        </td></tr>

        <!-- Programs -->
        <tr><td style="background:#fff;padding:0 40px 28px;">
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px 24px;">
            <p style="margin:0 0 10px;color:#065f46;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Enrolled Programs</p>
            <div>${data.programs.map((p) => `<span style="display:inline-block;margin:3px;padding:5px 14px;background:#059669;color:#fff;border-radius:50px;font-size:13px;font-weight:600;text-transform:capitalize;">${p}</span>`).join('')}</div>
            <p style="margin:12px 0 0;color:#374151;font-size:13px;">Schedule: <strong>${formatSchedule(data.schedule)}</strong></p>
          </div>
        </td></tr>

        <!-- Next Steps -->
        <tr><td style="background:#fff;padding:0 40px 28px;">
          <h3 style="margin:0 0 18px;color:#111827;font-size:16px;font-weight:800;">What Happens Next</h3>
          ${steps.map(({ icon, title, desc }, i) => `
          <table cellpadding="0" cellspacing="0" style="margin-bottom:14px;width:100%;"><tr>
            <td style="vertical-align:top;width:44px;padding-right:12px;">
              <div style="width:40px;height:40px;background:${['#059669','#3b82f6','#8b5cf6','#f59e0b'][i]};border-radius:10px;text-align:center;line-height:40px;font-size:18px;">${icon}</div>
            </td>
            <td style="vertical-align:top;padding-top:4px;">
              <p style="margin:0 0 3px;color:#111827;font-size:14px;font-weight:700;">${title}</p>
              <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.5;">${desc}</p>
            </td>
          </tr></table>`).join('')}
        </td></tr>

        <!-- Contact -->
        <tr><td style="background:#fff;padding:0 40px 36px;">
          <div style="background:#f8f7ff;border:1px solid #e0e7ff;border-radius:12px;padding:20px 24px;">
            <p style="margin:0 0 14px;color:#4f46e5;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Contact Us</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="padding:5px 0;color:#6b7280;font-size:13px;width:30%;">Email</td><td style="padding:5px 0;font-size:13px;font-weight:600;color:#4f46e5;">${email}</td></tr>
              <tr><td style="padding:5px 0;color:#6b7280;font-size:13px;">Phone</td><td style="padding:5px 0;font-size:13px;font-weight:600;color:#111827;">${phone}</td></tr>
              <tr><td style="padding:5px 0;color:#6b7280;font-size:13px;">WhatsApp</td><td style="padding:5px 0;"><a href="${waLink}" style="color:#25d366;font-size:13px;font-weight:600;text-decoration:none;">Chat with us</a></td></tr>
              <tr><td style="padding:5px 0;color:#6b7280;font-size:13px;">Website</td><td style="padding:5px 0;"><a href="${website}" style="color:#4f46e5;font-size:13px;font-weight:600;text-decoration:none;">${website}</a></td></tr>
            </table>
          </div>
        </td></tr>

        <!-- Welcome message -->
        <tr><td style="background:#059669;padding:28px 40px;text-align:center;">
          <p style="margin:0;color:#fff;font-size:18px;font-weight:800;">Welcome to the Codereality Family! 🚀</p>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Your child's journey into technology starts here.</p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f0fdf4;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;border-top:1px solid #bbf7d0;">
          <p style="margin:0 0 4px;color:#6b7280;font-size:12px;">Enrollment letter attached to this email as PDF.</p>
          <p style="margin:8px 0 0;color:#d1d5db;font-size:11px;">© ${new Date().getFullYear()} Codereality Academy. All rights reserved.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
