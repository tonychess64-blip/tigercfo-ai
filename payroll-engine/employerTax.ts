export function calculateEmployerTaxes(grossPay: number, state: string) {
  const socialSecurityEmployer = round(grossPay * 0.062);
  const medicareEmployer = round(grossPay * 0.0145);
  const futa = round(grossPay * 0.006);
  const sutaRate = state === "TX" ? 0.027 : state === "CA" ? 0.034 : 0.03;
  const suta = round(grossPay * sutaRate);
  const totalEmployerTax = round(socialSecurityEmployer + medicareEmployer + futa + suta);

  return { socialSecurityEmployer, medicareEmployer, futa, suta, totalEmployerTax };
}

function round(amount: number) { return Math.round(amount * 100) / 100; }
