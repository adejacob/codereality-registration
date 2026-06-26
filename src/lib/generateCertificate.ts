import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface CertificateData {
  studentName: string;
  enrollmentNumber: string;
  programs: string[];
  schedule: string;
  enrollmentDate: string;
  registrationId: string;
}

// ── Safe ASCII-only palette & helpers ─────────────────────────
const C = {
  indigoDark:  rgb(0.502, 0.282, 0.000),  // #804800 deep orange-brown (header bg)
  indigo:      rgb(1.000, 0.608, 0.141),  // #FF9B24 brand orange
  indigoLight: rgb(1.000, 0.953, 0.886),  // #fff3e2 pale orange tint
  indigoMid:   rgb(0.878, 0.478, 0.051),  // #e07a0d medium orange
  gold:        rgb(0.839, 0.631, 0.094),  // #d6a118 gold accent
  goldLight:   rgb(0.996, 0.957, 0.839),  // #fef4d6 gold fill
  emerald:     rgb(0.020, 0.588, 0.408),  // #059668 kept for variety
  emeraldLight:rgb(0.925, 0.992, 0.961),  // #ecfdf5
  dark:        rgb(0.161, 0.102, 0.020),  // #291a05 deep warm dark
  grayDark:    rgb(0.220, 0.231, 0.259),  // #383b42
  gray:        rgb(0.431, 0.451, 0.498),  // #6e737f
  grayLight:   rgb(0.878, 0.886, 0.910),  // #e0e2e8
  white:       rgb(1, 1, 1),
  offWhite:    rgb(0.996, 0.988, 0.976),  // #fefcf9 warm off-white
  paperTint:   rgb(0.992, 0.980, 0.965),  // #fcf9f6
};

// Draw centred text helper
function centreText(
  page: ReturnType<PDFDocument['addPage']>,
  text: string,
  y: number,
  size: number,
  font: Awaited<ReturnType<PDFDocument['embedFont']>>,
  color: ReturnType<typeof rgb>,
  pageWidth: number,
) {
  const w = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: (pageWidth - w) / 2, y, size, font, color });
}

export async function generateEnrollmentCertificate(data: CertificateData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page   = pdfDoc.addPage([595, 842]); // A4
  const W = 595, H = 842;

  const bold    = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // ── 1. PAPER BACKGROUND ──────────────────────────────────────
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C.offWhite });

  // ── 2. OUTER DECORATIVE BORDER (double rule) ─────────────────
  // Outer thick rule
  page.drawRectangle({ x: 14, y: 14, width: W - 28, height: H - 28,
    borderColor: C.indigo, borderWidth: 3, color: C.offWhite });
  // Inner thin rule
  page.drawRectangle({ x: 22, y: 22, width: W - 44, height: H - 44,
    borderColor: C.gold, borderWidth: 1, color: C.offWhite });

  // Corner accent squares
  const corners = [
    { x: 14, y: H - 30 }, { x: W - 30, y: H - 30 },
    { x: 14, y: 14 },     { x: W - 30, y: 14 },
  ];
  corners.forEach(({ x, y }) => {
    page.drawRectangle({ x, y, width: 16, height: 16, color: C.indigo });
    page.drawRectangle({ x: x + 3, y: y + 3, width: 10, height: 10, color: C.gold });
  });

  // ── 3. HEADER BAND ───────────────────────────────────────────
  const HDR_TOP = H - 30;
  const HDR_H   = 110;
  page.drawRectangle({ x: 30, y: HDR_TOP - HDR_H, width: W - 60, height: HDR_H, color: C.indigoDark });

  // Gold accent bar at bottom of header
  page.drawRectangle({ x: 30, y: HDR_TOP - HDR_H - 5, width: W - 60, height: 5, color: C.gold });

  // Logo box (left of header)
  page.drawRectangle({ x: 44, y: HDR_TOP - HDR_H + 20, width: 56, height: 56, color: C.indigoMid });
  page.drawRectangle({ x: 47, y: HDR_TOP - HDR_H + 23, width: 50, height: 50,
    borderColor: C.gold, borderWidth: 1, color: C.indigoMid });
  const logoTxt = 'CR';
  const logoW = bold.widthOfTextAtSize(logoTxt, 22);
  page.drawText(logoTxt, { x: 44 + (56 - logoW) / 2, y: HDR_TOP - HDR_H + 38, size: 22, font: bold, color: C.white });

  // Academy name
  page.drawText('CODEREALITY ACADEMY', {
    x: 114, y: HDR_TOP - HDR_H + 68, size: 22, font: bold, color: C.white,
  });
  // Tagline
  page.drawText('STEM Education  |  Coding  |  Robotics  |  Artificial Intelligence', {
    x: 114, y: HDR_TOP - HDR_H + 50, size: 8, font: regular, color: rgb(1.00, 0.86, 0.67),
  });
  // Contact line
  page.drawText('www.coderealityacademy.com.ng  |  07049625646', {
    x: 114, y: HDR_TOP - HDR_H + 34, size: 7.5, font: regular, color: rgb(1.00, 0.82, 0.60),
  });
  // RC Number
  page.drawText('RC Number: 9057670', {
    x: 114, y: HDR_TOP - HDR_H + 20, size: 7, font: regular, color: rgb(1.00, 0.78, 0.52),
  });

  // Ref number top-right of header
  const refLabel = `Ref: ${data.registrationId}`;
  const refW = regular.widthOfTextAtSize(refLabel, 8);
  page.drawText(refLabel, {
    x: W - 44 - refW, y: HDR_TOP - HDR_H + 68, size: 8, font: regular, color: rgb(1.00, 0.82, 0.60),
  });
  const dateLabel = `Date: ${data.enrollmentDate}`;
  const dateLabelW = regular.widthOfTextAtSize(dateLabel, 8);
  page.drawText(dateLabel, {
    x: W - 44 - dateLabelW, y: HDR_TOP - HDR_H + 54, size: 8, font: regular, color: rgb(1.00, 0.82, 0.60),
  });

  // ── 4. DOCUMENT TITLE ────────────────────────────────────────
  const titleY = HDR_TOP - HDR_H - 38;
  centreText(page, 'ENROLLMENT CONFIRMATION LETTER', titleY, 16, bold, C.indigoDark, W);

  // Decorative rule under title
  const ruleW = 260;
  page.drawRectangle({ x: (W - ruleW) / 2, y: titleY - 10, width: ruleW, height: 2, color: C.gold });
  page.drawRectangle({ x: (W - ruleW + 20) / 2, y: titleY - 14, width: ruleW - 20, height: 1, color: C.indigoDark });

  // ── 5. SALUTATION & INTRO PARAGRAPH ─────────────────────────
  const bodyL = 44;
  const bodyR = W - 44;
  const bodyW = bodyR - bodyL;
  let   curY  = titleY - 44;

  const issued = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  page.drawText(`Dear Parent / Guardian,`, {
    x: bodyL, y: curY, size: 11, font: bold, color: C.dark,
  });
  curY -= 20;

  const para1 = `This is to officially certify that the following student has been duly enrolled at`;
  const para2 = `Codereality Academy for the ${new Date().getFullYear()} academic programme. This letter`;
  const para3 = `serves as proof of enrollment and may be presented to any relevant authority.`;
  [para1, para2, para3].forEach((line) => {
    page.drawText(line, { x: bodyL, y: curY, size: 10.5, font: regular, color: C.grayDark });
    curY -= 17;
  });

  // ── 6. STUDENT NAME HIGHLIGHT BOX ───────────────────────────
  curY -= 14;
  const nameBoxH = 58;
  page.drawRectangle({ x: bodyL, y: curY - nameBoxH + 14, width: bodyW, height: nameBoxH,
    color: C.indigoLight, borderColor: C.indigo, borderWidth: 2 });
  // Top coloured bar
  page.drawRectangle({ x: bodyL, y: curY + 10, width: bodyW, height: 16, color: C.indigo });
  centreText(page, 'STUDENT NAME', curY + 14, 7.5, regular, C.white, W);

  const safeName = data.studentName ?? '';
  const nameSize = safeName.length > 24 ? 18 : 22;
  centreText(page, safeName.toUpperCase(), curY - 18, nameSize, bold, C.indigoDark, W);
  curY -= nameBoxH + 18;

  // ── 7. DETAILS TABLE ─────────────────────────────────────────
  const rows: [string, string][] = [
    ['Enrollment Number', data.enrollmentNumber ?? ''],
    ['Registration ID',   data.registrationId   ?? ''],
    ['Enrollment Date',   data.enrollmentDate   ?? ''],
    ['Schedule',          scheduleLabel(data.schedule ?? 'N/A')],
    ['Program(s)',        (data.programs ?? []).filter(Boolean).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ') || 'N/A'],
  ];

  const rowH    = 26;
  const labelCW = 170;
  const tableW  = bodyW;

  // Table header
  page.drawRectangle({ x: bodyL, y: curY - rowH + 8, width: tableW, height: rowH, color: C.indigo });
  page.drawText('ENROLLMENT DETAILS', {
    x: bodyL + 12, y: curY - 10, size: 9, font: bold, color: C.white,
  });
  curY -= rowH;

  rows.forEach((row, i) => {
    const rowColor = i % 2 === 0 ? C.offWhite : C.indigoLight;
    page.drawRectangle({ x: bodyL, y: curY - rowH + 8, width: tableW, height: rowH,
      color: rowColor, borderColor: C.grayLight, borderWidth: 0.5 });

    // Vertical divider
    page.drawRectangle({ x: bodyL + labelCW, y: curY - rowH + 8, width: 1, height: rowH, color: C.grayLight });

    page.drawText(row[0], { x: bodyL + 10, y: curY - 8, size: 9.5, font: bold,    color: C.gray });
    page.drawText(row[1], { x: bodyL + labelCW + 12, y: curY - 8, size: 9.5, font: bold, color: C.indigoDark });
    curY -= rowH;
  });

  curY -= 16;

  // ── 8. BODY CLOSING PARAGRAPH ────────────────────────────────
  const closing = [
    `We warmly welcome ${data.studentName} to our growing community of innovators and`,
    `technology leaders. Our team is committed to providing an excellent learning`,
    `experience, and we look forward to a productive and inspiring journey together.`,
    `Please do not hesitate to contact us should you require any further information.`,
  ];
  closing.forEach((line) => {
    page.drawText(line, { x: bodyL, y: curY, size: 10, font: regular, color: C.grayDark });
    curY -= 16;
  });

  curY -= 8;
  page.drawText('Yours sincerely,', { x: bodyL, y: curY, size: 10.5, font: regular, color: C.grayDark });
  curY -= 36;

  // ── 9. SIGNATURE BLOCK ───────────────────────────────────────
  // Signature underline
  page.drawRectangle({ x: bodyL, y: curY, width: 160, height: 1.5, color: C.indigoDark });
  curY -= 14;
  page.drawText('Academy Director', { x: bodyL, y: curY, size: 10.5, font: bold, color: C.dark });
  curY -= 14;
  page.drawText('Codereality Academy', { x: bodyL, y: curY, size: 9.5, font: regular, color: C.gray });
  curY -= 13;
  page.drawText(`Date Issued: ${issued}`, { x: bodyL, y: curY, size: 8.5, font: regular, color: C.gray });

  // ── 10. OFFICIAL STAMP (right side of signature) ─────────────
  const stX = W - 115;
  const stY = curY + 50;

  // Outer ring
  page.drawEllipse({ x: stX, y: stY, xScale: 55, yScale: 55, borderColor: C.indigo, borderWidth: 3 });
  // Middle ring
  page.drawEllipse({ x: stX, y: stY, xScale: 46, yScale: 46, borderColor: C.gold, borderWidth: 1.5 });
  // Inner fill
  page.drawEllipse({ x: stX, y: stY, xScale: 42, yScale: 42, color: C.goldLight });

  const s1 = 'OFFICIALLY';
  const s2 = 'ENROLLED';
  const s3 = String(new Date().getFullYear());
  page.drawText(s1, { x: stX - bold.widthOfTextAtSize(s1, 7.5)   / 2, y: stY + 14, size: 7.5, font: bold,    color: C.indigoDark });
  page.drawText(s2, { x: stX - bold.widthOfTextAtSize(s2, 10)     / 2, y: stY - 1,  size: 10,  font: bold,    color: C.indigo });
  page.drawText(s3, { x: stX - regular.widthOfTextAtSize(s3, 8)   / 2, y: stY - 16, size: 8,   font: regular, color: C.grayDark });
  // Small gold rule inside stamp
  page.drawRectangle({ x: stX - 20, y: stY - 23, width: 40, height: 1, color: C.gold });

  // ── 11. GOLD FOOTER BAND ─────────────────────────────────────
  const ftY = 30;
  page.drawRectangle({ x: 30, y: ftY - 2, width: W - 60, height: 2, color: C.indigo });
  centreText(
    page,
    'coderealityacademy.tech@gmail.com   |   www.coderealityacademy.com.ng   |   07049625646',
    ftY + 4, 7.5, regular, C.gray, W,
  );
  centreText(
    page,
    `This document is digitally generated and is valid without a physical signature.   RC: 9057670   Ref: ${data.registrationId}`,
    ftY - 8, 7, regular, C.grayLight, W,
  );

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

function scheduleLabel(s: string) {
  const map: Record<string, string> = {
    weekend:        'Weekend Classes',
    'after-school': 'After School',
    holiday:        'Holiday Intensive',
    private:        'Private Tutoring',
  };
  return map[s] ?? s;
}
