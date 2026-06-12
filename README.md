# Codereality Academy — Student Registration & Enrollment System

> **RC Number: 9057670**  
> Official student registration, enrollment management, and PDF letter generation system for **Codereality Academy**.  
> Website: https://www.coderealityacademy.com.ng  
> Email: coderealityacademy.tech@gmail.com  
> Phone: 07049625646

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Environment Variables](#environment-variables)
5. [Local Development Setup](#local-development-setup)
6. [How the System Works](#how-the-system-works)
7. [Admin Portal Guide](#admin-portal-guide)
8. [Coupon System](#coupon-system)
9. [Email System](#email-system)
10. [PDF Enrollment Letter](#pdf-enrollment-letter)
11. [Security](#security)
12. [API Reference](#api-reference)
13. [Deployment (Netlify)](#deployment-netlify)
14. [Deployment (Vercel)](#deployment-vercel)
15. [Common Issues & Fixes](#common-issues--fixes)
16. [Contact](#contact)

---

## Overview

This is a full-stack Next.js web application that handles:

- **Public registration form** — a 6-step guided form where parents enroll their child for STEM programs
- **Automated emails** — confirmation emails to parents and alert emails to the admin on every registration
- **Admin portal** — a password-protected dashboard where staff can view, search, filter, edit, and manage all registrations
- **Enrollment confirmation** — one-click enrollment that sends a professional PDF enrollment letter to the parent's email
- **Coupon code system** — create and manage discount/free registration coupons with usage limits and expiry dates
- **Data export** — download all registrations as Excel (`.xlsx`) or CSV

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Form handling | React Hook Form + Zod |
| Database | MongoDB via Mongoose (MongoDB Atlas) |
| Email | Nodemailer (Gmail SMTP) |
| PDF generation | pdf-lib |
| Export | SheetJS (xlsx) |
| Icons | Lucide React |
| Deployment | Netlify (recommended) or Vercel |

---

## Project Structure

```
registration-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── admin/
│   │   │   │   ├── export/route.ts              ← Export all registrations as XLSX or CSV
│   │   │   │   ├── login/route.ts               ← Admin login (POST) and logout (DELETE)
│   │   │   │   ├── test-email/route.ts          ← Test Gmail connection (admin only)
│   │   │   │   └── registrations/
│   │   │   │       ├── route.ts                 ← List registrations with filters & stats
│   │   │   │       └── [id]/
│   │   │   │           ├── route.ts             ← GET / PATCH (edit info/status) / DELETE
│   │   │   │           ├── enroll/route.ts      ← Confirm enrollment + send PDF email
│   │   │   │           └── certificate/route.ts ← Download enrollment PDF letter
│   │   │   ├── coupons/
│   │   │   │   ├── route.ts                     ← List / Create coupons (GET/POST)
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts                 ← Update / Delete coupon (PATCH/DELETE)
│   │   │   ├── coupons/validate/route.ts      ← Public coupon validation API
│   │   │   └── register/route.ts                ← Public registration submission
│   │   ├── admin/
│   │   │   ├── layout.tsx                       ← Admin sidebar + top bar layout
│   │   │   ├── login/page.tsx                   ← Admin login page
│   │   │   ├── page.tsx                         ← Admin dashboard (stats overview)
│   │   │   ├── registrations/page.tsx           ← Full registrations management table
│   │   │   └── coupons/page.tsx                 ← Coupon management (create, activate, delete)
│   │   ├── register/page.tsx                    ← Public registration page
│   │   ├── success/page.tsx                     ← Post-registration success page
│   │   └── page.tsx                             ← Public landing/home page
│   ├── components/
│   │   ├── form/
│   │   │   ├── RegistrationForm.tsx             ← Multi-step form shell + navigation
│   │   │   ├── StepIndicator.tsx                ← Step progress bar
│   │   │   ├── StudentInfoStep.tsx              ← Step 1: student details
│   │   │   ├── ParentInfoStep.tsx               ← Step 2: parent/guardian details
│   │   │   ├── ProgramSelectionStep.tsx         ← Step 3: program selection cards
│   │   │   ├── ScheduleStep.tsx                 ← Step 4: class schedule
│   │   │   ├── PaymentStep.tsx                  ← Step 5: payment type + coupon input
│   │   │   └── ReviewStep.tsx                   ← Step 6: review & submit (shows coupon badge)
│   │   ├── sections/
│   │   │   ├── Hero.tsx                         ← Landing hero section
│   │   │   ├── Statistics.tsx                   ← Animated stat counters
│   │   │   ├── WhyChooseUs.tsx                  ← Feature cards
│   │   │   ├── Testimonials.tsx                 ← Auto-rotating testimonials
│   │   │   ├── FAQ.tsx                          ← Accordion FAQ
│   │   │   └── TrustBadges.tsx                  ← Trust/certification badges
│   │   └── ui/
│   │       ├── Button.tsx / Card.tsx / Input.tsx / Select.tsx
│   ├── lib/
│   │   ├── mongodb.ts                           ← Mongoose connection singleton (cached)
│   │   ├── validation.ts                        ← Zod schemas for all form fields
│   │   ├── emailTemplates.ts                    ← HTML email templates (parent + admin + enrollment)
│   │   ├── generateCertificate.ts               ← PDF enrollment letter generator (pdf-lib)
│   │   ├── sendEmails.ts                        ← Nodemailer email dispatch helper
│   │   └── rateLimit.ts                         ← In-memory per-IP rate limiter
│   └── models/
│       ├── Registration.ts                      ← Mongoose schema + TypeScript interface
│       └── Coupon.ts                            ← Coupon code schema for free registrations
├── next.config.ts                               ← Security headers configuration
├── package.json
└── .env.local                                   ← Secret environment variables (never commit)
```

---

## Environment Variables

Create a file called **`.env.local`** in the project root (same folder as `package.json`). It is already in `.gitignore` — **never commit it to Git or share it publicly.**

```env
# ── Database ──────────────────────────────────────────────────────
# MongoDB Atlas connection string. Add /codereality before ? for db name.
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/codereality?retryWrites=true&w=majority

# ── Admin Authentication ───────────────────────────────────────────
# Password the admin types at /admin/login
ADMIN_PASSWORD=your_strong_admin_password_here

# Long random string used as the session cookie value (use 32+ random chars)
ADMIN_SECRET=a_very_long_random_secret_string_at_least_32_chars

# ── Email (Gmail SMTP) ─────────────────────────────────────────────
# The Gmail address used to send all emails FROM
GMAIL_USER=coderealityacademy.tech@gmail.com

# Gmail App Password (NOT your Gmail login password — see setup below)
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx

# The email address that receives new registration alert emails
ADMIN_EMAIL=coderealityacademy.tech@gmail.com

# ── Optional ───────────────────────────────────────────────────────
# WhatsApp link shown on success page and emails
WHATSAPP_NUMBER=2348012345678
ACADEMY_PHONE=07049625646
```

### How to get a Gmail App Password
1. Go to your Google Account → **Security**
2. Enable **2-Step Verification** (required)
3. Go to **Security → App passwords**
4. Select app: **Mail**, device: **Other** → type "Codereality"
5. Click **Generate** — copy the 16-character password into `GMAIL_APP_PASSWORD`

> Without this, emails will not send and the server will log an error.

---

## Local Development Setup

### Prerequisites
- Node.js 18 or higher
- A free MongoDB Atlas account (https://www.mongodb.com/atlas)

### Steps

**1. Install dependencies**
```bash
npm install
```

**2. Set up MongoDB Atlas**
1. Create a free account at https://www.mongodb.com/atlas
2. Create a free **M0 cluster**
3. Under **Database Access** → add a user with a username and password
4. Under **Network Access** → Add IP Address → **Allow Access from Anywhere** (`0.0.0.0/0`)
5. Click **Connect → Drivers** → copy the connection string

**3. Create `.env.local`**  
Copy the template from the [Environment Variables](#environment-variables) section above and fill in your real values.

**4. Start development server**
```bash
npm run dev
```

Open http://localhost:3000

**5. Build for production (test before deploying)**
```bash
npm run build
```

---

## How the System Works

### Registration Flow (Public)

```
Parent visits /register
       ↓
Fills 6-step form (Student → Parent → Programs → Schedule → Payment → Review)
       ↓
POST /api/register
       ↓
Zod validates all fields → coupon validated (if provided) → saved to MongoDB
       ↓
Two emails fire simultaneously:
  • Parent gets confirmation email (with payment details OR enrollment details if coupon used)
  • Admin gets an alert email with full student/parent data
       ↓
Parent is redirected to /success with their Registration ID
       ↓
Success page shows different message based on coupon usage
```

### Enrollment Flow (Admin)

```
Admin logs in at /admin/login
       ↓
Reviews registrations at /admin/registrations
       ↓
Opens a registration → clicks "Confirm Enrollment"
       ↓
POST /api/admin/registrations/[id]/enroll
       ↓
System assigns Enrollment Number (e.g. CRA-ENR-2026-0001)
Status set to "enrolled", paymentStatus set to "payment_confirmed"
       ↓
PDF enrollment letter is generated (pdf-lib)
       ↓
Enrollment confirmation email + PDF sent to parent's email
       ↓
Admin can download the PDF anytime via "Download Letter"
```

---

## Admin Portal Guide

### Accessing the Admin Portal

- **URL:** `/admin/login`
- **Password:** the value of `ADMIN_PASSWORD` in your `.env.local`
- Sessions last **8 hours** then expire automatically

### Dashboard (`/admin`)

Shows live statistics:
- Total registrations
- Count per status (Pending / Contacted / Approved / Enrolled / Rejected)
- Payment status breakdown

### Registrations Page (`/admin/registrations`)

**Searching & Filtering:**
- Search by student name, parent email, phone, school, or Registration ID
- Filter by Status, Program, and Date Range
- 20 results per page with pagination

**Registration Card Actions (click any row to open the detail modal):**

| Tab | What you can do |
|---|---|
| **View Details** | Read all student, parent, program, schedule, and payment info |
| **Edit Info** | Edit any student or parent field and save directly to the database |

**Admin Actions panel (in View Details tab):**

| Action | Description |
|---|---|
| Change Status | Set to Pending / Contacted / Approved / Enrolled / Rejected |
| Change Payment Status | Pending Payment / Payment Submitted / Payment Confirmed |
| Internal Notes | Private notes visible only in the admin panel |
| Save Changes | Saves status, payment status, and notes |
| Confirm Enrollment | Triggers full enrollment: assigns number, generates PDF, sends email |
| Download Letter | Downloads the PDF enrollment letter for an already-enrolled student |
| Revoke Enrollment | Resets status back to Approved and clears enrollment data |
| Delete | Permanently deletes the registration (cannot be undone) |

**Exporting Data:**
- Click **Export XLSX** or **Export CSV** in the top-right of the registrations page
- Downloads all registrations (not just the current page/filter) in a spreadsheet

---

## Coupon System

The coupon system allows you to create discount codes and free registration vouchers. When a coupon is applied, the registration becomes free (no payment required) and emails show enrollment details instead of payment instructions.

### Admin Coupon Management (`/admin/coupons`)

Manage discount and free registration coupon codes:

**Creating Coupons:**
- Click **Create Coupon** button
- Enter unique coupon code (uppercase, letters/numbers/hyphens/underscores)
- Set description (e.g., "Summer 2026 Free Registration")
- Choose discount type: **percentage** or **fixed** amount
- Set discount value (e.g., 100 for 100% free, or 50000 for ₦50,000 off)
- Set usage limit (optional) — how many times the coupon can be used
- Set expiry date (optional) — coupon becomes inactive after this date
- Toggle **Active** status — inactive coupons cannot be used

**Managing Coupons:**
- View all coupons grouped by Active and Inactive
- Click the toggle switch to activate/deactivate any coupon
- Click the trash icon to permanently delete a coupon
- View usage stats: how many times used vs. usage limit

**Coupon Behavior:**
- When a coupon is applied during registration:
  - Payment options are hidden (no payment required)
  - Success page shows "Free registration applied" badge
  - Email contains enrollment details (not payment details)
  - Coupon usage count increments automatically

---

### Status Workflow

Recommended progression:

```
pending → contacted → approved → enrolled
                              ↘ rejected (if declined)
```

| Status | Meaning |
|---|---|
| `pending` | New registration, not yet reviewed |
| `contacted` | Staff has reached out to the parent |
| `approved` | Registration accepted, awaiting payment confirmation |
| `enrolled` | Payment confirmed, enrollment letter sent |
| `rejected` | Registration declined |

---

## Email System

All emails are sent via **Gmail SMTP** using Nodemailer. Four email types are used:

### 1. Parent Registration Confirmation
**Sent when:** A new registration is submitted  
**To:** Parent's email address  
**Contains (Payment Registration):**
- Welcome message with student name
- Registration ID
- Selected programs and schedule
- Payment details (bank account info, payment type)
- Contact information

**Contains (Coupon/Free Registration):**
- Welcome message with student name
- Registration ID
- Selected programs and schedule
- **No payment details** — shows "Free Registration" confirmation
- Enrollment next steps
- Coupon code used (if applicable)

### 2. Admin Registration Alert
**Sent when:** A new registration is submitted  
**To:** `ADMIN_EMAIL` in `.env.local`  
**Contains:**
- Full student details
- Full parent details
- Programs, schedule, payment type
- Direct link to view in admin panel

### 3. Enrollment Confirmation Email
**Sent when:** Admin clicks "Confirm Enrollment"  
**To:** Parent's email address  
**Contains:**
- Enrollment number (bold, visible color on dark card)
- Student name, Registration ID, enrollment date
- Programs enrolled in
- Academy contact information
- **PDF attachment:** Official enrollment letter

### 4. Coupon Validation
**When:** User enters coupon code in registration form  
**Process:**
- Real-time validation via `/api/coupons/validate`
- Checks: active status, expiry date, usage limit
- Returns discount details if valid
- Rate limited to prevent abuse

### Testing Email Configuration
Visit `/api/admin/test-email` while logged in as admin to send a test email to `ADMIN_EMAIL`. Check the server logs if it fails.

---

## PDF Enrollment Letter

The enrollment letter is generated entirely in code using **pdf-lib** — no external PDF service is needed.

### Letter Contents
- **Header band:** Academy name, logo box (CR), tagline, website, phone, RC Number: 9057670
- **Reference:** Registration ID and enrollment date (top-right of header)
- **Document title:** ENROLLMENT CONFIRMATION LETTER
- **Body:** Formal salutation and intro paragraph
- **Student name box:** Highlighted name in large text
- **Details table:** Enrollment Number, Registration ID, Date, Schedule, Programs
- **Closing paragraph and signature block**
- **Official stamp:** Concentric ellipse stamp with "OFFICIALLY ENROLLED + year"
- **Footer:** Contact email, website, phone — RC: 9057670

### Downloading the Letter
- Admin can download from the admin portal at any time after enrollment
- Parent automatically receives it as an email attachment on enrollment

---

## Security

The following security measures are implemented:

| Threat | Protection |
|---|---|
| Brute-force login | Rate limited to **5 attempts per IP per 15 minutes** |
| Timing-based password attacks | `crypto.timingSafeEqual` comparison — response time is constant |
| Registration spam | Rate limited to **10 submissions per IP per hour** |
| Oversized payload (DoS) | Request body hard-capped at **16 KB** |
| ReDoS via search field | User search string is regex-escaped before MongoDB query |
| NoSQL injection via filter params | `status` and `program` params validated against a strict whitelist |
| Clickjacking | `X-Frame-Options: DENY` header on all routes |
| MIME sniffing | `X-Content-Type-Options: nosniff` |
| HTTPS enforcement | `Strict-Transport-Security` header (1 year) |
| CSRF on admin actions | Admin session cookie is `sameSite: strict` |
| XSS | `Content-Security-Policy` and `X-XSS-Protection` headers |
| Info leakage in errors | Internal error messages never returned to client |
| Unbounded database writes | All string fields have `.max()` length limits in Zod schema |

---

## API Reference

All admin endpoints require either:
- Cookie `admin_auth` = value of `ADMIN_SECRET`, **or**
- Header `x-admin-secret` = value of `ADMIN_SECRET`

### Public

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/register` | Submit a new registration |

### Admin (protected)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/admin/login` | Login — sets `admin_auth` cookie |
| `DELETE` | `/api/admin/login` | Logout — clears cookie |
| `GET` | `/api/admin/registrations` | List registrations (search, filter, paginate) |
| `GET` | `/api/admin/registrations/[id]` | Get one registration by MongoDB ID |
| `PATCH` | `/api/admin/registrations/[id]` | Update status / notes / student info / parent info |
| `DELETE` | `/api/admin/registrations/[id]` | Permanently delete a registration |
| `POST` | `/api/admin/registrations/[id]/enroll` | Confirm enrollment + send PDF email |
| `GET` | `/api/admin/registrations/[id]/certificate` | Download enrollment PDF |
| `GET` | `/api/admin/export?format=xlsx` | Export all registrations as Excel |
| `GET` | `/api/admin/export?format=csv` | Export all registrations as CSV |
| `GET` | `/api/admin/test-email` | Send a test email to `ADMIN_EMAIL` |

### Coupon APIs

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/coupons` | List all coupons (filter by isActive) |
| `POST` | `/api/admin/coupons` | Create new coupon (requires admin auth) |
| `PATCH` | `/api/admin/coupons/[id]` | Update coupon (status, expiry, etc.) |
| `DELETE` | `/api/admin/coupons/[id]` | Delete coupon permanently |
| `POST` | `/api/coupons/validate` | Public: validate a coupon code |

---

## Deployment (Netlify)

Netlify is the recommended host with excellent Next.js support and a generous free tier.

### Steps

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Drag and drop the `dist` folder to Netlify, OR
   - Connect your GitHub repo for auto-deploys

3. **Add Environment Variables**  
   In Netlify → **Site settings → Environment variables**, add all variables from `.env.local`:

   | Variable | Required |
   |---|---|
   | `MONGODB_URI` | ✅ |
   | `ADMIN_PASSWORD` | ✅ |
   | `ADMIN_SECRET` | ✅ |
   | `GMAIL_USER` | ✅ |
   | `GMAIL_APP_PASSWORD` | ✅ |
   | `ADMIN_EMAIL` | ✅ |
   | `WHATSAPP_NUMBER` | Optional |
   | `ACADEMY_PHONE` | Optional |

4. **Set up custom domain** (optional)  
   Netlify Settings → **Domain management** → add `www.coderealityacademy.com.ng`

---

## Deployment (Vercel) — Alternative

Vercel also has native Next.js support.

### Steps

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com → **Add New Project**
   - Select your GitHub repo
   - Vercel auto-detects Next.js

3. **Add Environment Variables**  
   In Vercel project → **Settings → Environment Variables**, add every variable from the `.env.local` section:

   | Variable | Required |
   |---|---|
   | `MONGODB_URI` | ✅ |
   | `ADMIN_PASSWORD` | ✅ |
   | `ADMIN_SECRET` | ✅ |
   | `GMAIL_USER` | ✅ |
   | `GMAIL_APP_PASSWORD` | ✅ |
   | `ADMIN_EMAIL` | ✅ |
   | `WHATSAPP_NUMBER` | Optional |
   | `ACADEMY_PHONE` | Optional |

4. **Deploy**  
   Click **Deploy**. Every future `git push` to `main` will auto-redeploy.

5. **Set up custom domain** (optional)  
   Vercel Settings → **Domains** → add `www.coderealityacademy.com.ng`

### Important: MongoDB Atlas IP Whitelist
When deploying to any platform (Netlify/Vercel), you MUST whitelist all IPs in MongoDB Atlas:
- Go to MongoDB Atlas → **Network Access** → **Add IP Address**
- Select **Allow Access from Anywhere** (`0.0.0.0/0`)
- This is required because serverless functions use dynamic IPs

---

## Common Issues & Fixes

### Emails not sending
- Verify `GMAIL_USER` and `GMAIL_APP_PASSWORD` are set correctly
- Make sure you used a **Gmail App Password** (not your regular Gmail password)
- Visit `/api/admin/test-email` while logged in — check server logs for the exact error
- Ensure 2-Step Verification is ON for the Gmail account

### "Too many login attempts" error
- The IP is rate-limited after 5 failed login attempts
- Wait 15 minutes, then try again
- If locked out in production, redeploy the app to reset the in-memory counter

### PDF download does nothing / fails
- Ensure the student is fully enrolled (status = `enrolled`, enrollment number assigned)
- Check the server logs for any `pdf-lib` errors

### MongoDB connection failing
- Check that your Atlas **Network Access** allows `0.0.0.0/0` (all IPs)
- Verify the connection string in `MONGODB_URI` is correct (username, password, cluster name)
- Make sure the database user has **read/write** permissions

### Build fails on Vercel/Netlify
- Check that all required environment variables are set in deployment settings
- Run `npm run build` locally first to catch TypeScript errors before pushing
- For Netlify: ensure `next.config.ts` has `output: 'export'` if using static export

### Coupons not showing in admin panel
- Verify MongoDB Atlas **Network Access** allows `0.0.0.0/0` (all IPs)
- Check browser console for API error messages
- Ensure `ADMIN_SECRET` is set correctly for API authorization

### "Next button not working" on program selection
- Programs are validated against an allowlist. Valid program IDs are:
  `coding`, `robotics`, `ai`, `web`, `mobile`, `game`, `3d`, `graphic`, `digital`, `scratch`

---

## Contact

**Codereality Academy**
- Website: https://www.coderealityacademy.com.ng
- Email: coderealityacademy.tech@gmail.com
- Phone: 07049625646
- RC Number: 9057670
