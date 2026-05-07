import { Employee } from "../types/employee";
import { PayrollBreakdown, TaxContext, TaxProfile } from "../types/payroll";
import { applyPreTaxBenefits } from "./benefits";
import { calculateFederalWithholding } from "./federalTax";
import { applyPostTaxGarnishments } from "./garnishments";
import { calculateMedicare, calculateSocialSecurity } from "./fica";
import { calculateStateWithholding } from "./stateTax";
import { calculateEmployerTaxes } from "./employerTax";

export function calculateGrossPay(employee: Employee): number {
  const basePay = employee.payType === "hourly" ? (employee.hourlyRate ?? 0) * (employee.hoursWorked ?? 0) : (employee.salaryPerPeriod ?? 0);
  return roundCurrency(basePay + (employee.additionalIncome ?? 0));
}

export function calculatePayroll(employee: Employee, context: TaxContext = {}, profile: TaxProfile = { taxYear: 2026 }): PayrollBreakdown {
  const grossPay = calculateGrossPay(employee);
  const benefits = applyPreTaxBenefits(grossPay, employee.preTaxBenefits ?? 0);

  const federalWithholding = calculateFederalWithholding(benefits.taxableWages, profile.filingStatus ?? "single", profile.payPeriodsPerYear ?? 24);
  const socialSecurity = calculateSocialSecurity(grossPay, context.yearToDateSocialSecurityWages ?? 0);
  const medicare = calculateMedicare(grossPay);
  const stateWithholding = calculateStateWithholding(benefits.taxableWages, employee.state, profile.stateAllowances ?? 0);

  const netBeforeGarnishments = grossPay - benefits.preTaxBenefits - federalWithholding - socialSecurity - medicare - stateWithholding;
  const postTaxGarnishments = applyPostTaxGarnishments(netBeforeGarnishments, employee.postTaxGarnishments ?? 0);
  const netPay = roundCurrency(netBeforeGarnishments - postTaxGarnishments);
  const employerTaxes = calculateEmployerTaxes(grossPay, employee.state);

  return {
    grossPay,
    taxableWages: benefits.taxableWages,
    federalWithholding,
    socialSecurity,
    medicare,
    stateWithholding,
    preTaxBenefits: benefits.preTaxBenefits,
    postTaxGarnishments,
    netPay,
    employerTaxes,
  };
}

function roundCurrency(amount: number): number { return Math.round(amount * 100) / 100; }
