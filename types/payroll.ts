import { Company } from "./company";
import { Employee } from "./employee";

export interface PayrollInput {
  company: Company;
  employee: Employee;
}

export interface EmployerTaxBreakdown {
  socialSecurityEmployer: number;
  medicareEmployer: number;
  futa: number;
  suta: number;
  totalEmployerTax: number;
}

export interface PayrollBreakdown {
  grossPay: number;
  taxableWages: number;
  federalWithholding: number;
  socialSecurity: number;
  medicare: number;
  stateWithholding: number;
  preTaxBenefits: number;
  postTaxGarnishments: number;
  netPay: number;
  employerTaxes: EmployerTaxBreakdown;
}

export interface TaxContext {
  yearToDateSocialSecurityWages?: number;
}

export interface TaxProfile {
  taxYear: number;
  filingStatus?: "single" | "married";
  payPeriodsPerYear?: number;
  stateAllowances?: number;
}
