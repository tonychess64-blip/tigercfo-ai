const STATE_RULES: Record<string, { baseRate: number; allowanceReduction: number }> = {
  CA: { baseRate: 0.06, allowanceReduction: 0.0025 },
  NY: { baseRate: 0.055, allowanceReduction: 0.002 },
  TX: { baseRate: 0, allowanceReduction: 0 },
  FL: { baseRate: 0, allowanceReduction: 0 },
};

export function calculateStateWithholding(taxableWages: number, state: string, allowances = 0): number {
  const rule = STATE_RULES[state] ?? { baseRate: 0.04, allowanceReduction: 0.001 };
  const effectiveRate = Math.max(0, rule.baseRate - allowances * rule.allowanceReduction);
  return roundCurrency(Math.max(0, taxableWages) * effectiveRate);
}

function roundCurrency(amount: number): number { return Math.round(amount * 100) / 100; }
