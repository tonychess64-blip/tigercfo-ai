const FEDERAL_BRACKETS_2026 = {
  single: [
    { upTo: 11600, rate: 0.1 },
    { upTo: 47150, rate: 0.12 },
    { upTo: 100525, rate: 0.22 },
    { upTo: Infinity, rate: 0.24 },
  ],
  married: [
    { upTo: 23200, rate: 0.1 },
    { upTo: 94300, rate: 0.12 },
    { upTo: 201050, rate: 0.22 },
    { upTo: Infinity, rate: 0.24 },
  ],
} as const;

export function calculateFederalWithholding(
  taxableWagesPerPeriod: number,
  filingStatus: "single" | "married" = "single",
  payPeriodsPerYear = 24,
): number {
  const annualized = Math.max(0, taxableWagesPerPeriod) * payPeriodsPerYear;
  const taxAnnual = progressiveTax(annualized, FEDERAL_BRACKETS_2026[filingStatus]);
  return roundCurrency(taxAnnual / payPeriodsPerYear);
}

function progressiveTax(income: number, brackets: ReadonlyArray<{ upTo: number; rate: number }>): number {
  let tax = 0;
  let lower = 0;
  for (const b of brackets) {
    const upper = b.upTo;
    const taxable = Math.max(0, Math.min(income, upper) - lower);
    tax += taxable * b.rate;
    if (income <= upper) break;
    lower = upper;
  }
  return tax;
}

function roundCurrency(amount: number): number { return Math.round(amount * 100) / 100; }
