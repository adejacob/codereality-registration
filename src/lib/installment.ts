/** Single source of truth for installment payment calculations. */

export const REGISTRATION_FEE = 5_000; // ₦5,000

/** Plan fees in Naira (numeric) */
export const PLAN_FEES: Record<string, number> = {
  'starter':           50_000,
  'stem-explorer':     80_000,
  'growth':           150_000,
  'short':            100_000,
  'mastery':          250_000,
  'platinum':         300_000,
  'holiday-explorer':  50_000,
  'holiday-innovator': 80_000,
};

/** Plans that are NOT eligible for installment */
export const INSTALLMENT_INELIGIBLE = ['starter', 'holiday-explorer'];

export function isInstallmentEligible(planId: string): boolean {
  return !INSTALLMENT_INELIGIBLE.includes(planId);
}

export interface InstallmentBreakdown {
  planFee: number;           // e.g. 150000
  halfPlanFee: number;       // 50% of planFee
  registrationFee: number;   // 5000
  amountDueToday: number;    // halfPlanFee + registrationFee
  outstandingBalance: number; // remaining 50%
}

export function calcInstallmentFromFee(planFee: number): InstallmentBreakdown {
  const halfPlanFee = Math.round(planFee / 2);
  return {
    planFee,
    halfPlanFee,
    registrationFee: REGISTRATION_FEE,
    amountDueToday: halfPlanFee + REGISTRATION_FEE,
    outstandingBalance: planFee - halfPlanFee,
  };
}

export function calcInstallment(planId: string): InstallmentBreakdown {
  return calcInstallmentFromFee(PLAN_FEES[planId] ?? 0);
}

export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString('en-NG')}`;
}
