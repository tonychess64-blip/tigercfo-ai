export function applyPreTaxBenefits(grossPay: number, preTaxBenefits = 0): { preTaxBenefits: number; taxableWages: number } {
  const deductions = Math.min(Math.max(preTaxBenefits, 0), Math.max(grossPay, 0));
  const taxableWages = Math.max(0, grossPay - deductions);

  return {
    preTaxBenefits: roundCurrency(deductions),
    taxableWages: roundCurrency(taxableWages),
  };
}

function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100;
}
