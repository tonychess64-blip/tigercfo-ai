export function applyPostTaxGarnishments(netBeforeGarnishments: number, garnishment = 0): number {
  const clamped = Math.min(Math.max(garnishment, 0), Math.max(netBeforeGarnishments, 0));
  return roundCurrency(clamped);
}

function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100;
}
