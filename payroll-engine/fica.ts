const SOCIAL_SECURITY_RATE = 0.062;
const MEDICARE_RATE = 0.0145;
export const SOCIAL_SECURITY_WAGE_BASE_2026 = 176100;

export function calculateSocialSecurity(
  grossPay: number,
  yearToDateSocialSecurityWages = 0,
): number {
  const remainingTaxable = Math.max(0, SOCIAL_SECURITY_WAGE_BASE_2026 - yearToDateSocialSecurityWages);
  const wagesSubjectToTax = Math.min(Math.max(grossPay, 0), remainingTaxable);
  return roundCurrency(wagesSubjectToTax * SOCIAL_SECURITY_RATE);
}

export function calculateMedicare(grossPay: number): number {
  return roundCurrency(Math.max(0, grossPay) * MEDICARE_RATE);
}

function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100;
}
