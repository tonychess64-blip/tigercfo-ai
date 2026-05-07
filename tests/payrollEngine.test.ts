import test from "node:test";
import assert from "node:assert/strict";
import { calculatePayroll } from "../payroll-engine/calculatePayroll";
import { SOCIAL_SECURITY_WAGE_BASE_2026 } from "../payroll-engine/fica";

test("hourly employee", () => {
  const result = calculatePayroll({ id: "e1", firstName: "Alex", lastName: "Kim", state: "TX", payType: "hourly", hourlyRate: 25, hoursWorked: 80 });
  assert.equal(result.grossPay, 2000);
  assert.ok(result.netPay > 0);
});

test("salary employee", () => {
  const result = calculatePayroll({ id: "e2", firstName: "Riley", lastName: "Park", state: "CA", payType: "salary", salaryPerPeriod: 3500 });
  assert.equal(result.grossPay, 3500);
  assert.ok(result.stateWithholding > 0);
});

test("Social Security wage base cap", () => {
  const result = calculatePayroll({ id: "e3", firstName: "Jordan", lastName: "Stone", state: "TX", payType: "salary", salaryPerPeriod: 10000 }, { yearToDateSocialSecurityWages: SOCIAL_SECURITY_WAGE_BASE_2026 - 500 });
  assert.equal(result.socialSecurity, 31);
});

test("Medicare", () => {
  const result = calculatePayroll({ id: "e4", firstName: "Morgan", lastName: "Vale", state: "TX", payType: "salary", salaryPerPeriod: 1000 });
  assert.equal(result.medicare, 14.5);
});

test("pre-tax benefit deduction", () => {
  const result = calculatePayroll({ id: "e5", firstName: "Taylor", lastName: "Reed", state: "TX", payType: "salary", salaryPerPeriod: 2000, preTaxBenefits: 200 });
  assert.equal(result.preTaxBenefits, 200);
  assert.equal(result.taxableWages, 1800);
});

test("post-tax garnishment", () => {
  const result = calculatePayroll({ id: "e6", firstName: "Casey", lastName: "Lane", state: "TX", payType: "salary", salaryPerPeriod: 2000, postTaxGarnishments: 300 });
  assert.equal(result.postTaxGarnishments, 300);
});

test("state withholding rules and allowances", () => {
  const ca = calculatePayroll({ id: "e7", firstName: "Sky", lastName: "Ng", state: "CA", payType: "salary", salaryPerPeriod: 1000 }, {}, { taxYear: 2026, stateAllowances: 0 });
  const caWithAllowance = calculatePayroll({ id: "e8", firstName: "Sky", lastName: "Ng", state: "CA", payType: "salary", salaryPerPeriod: 1000 }, {}, { taxYear: 2026, stateAllowances: 3 });
  assert.ok(ca.stateWithholding > caWithAllowance.stateWithholding);
});

test("employer taxes are calculated", () => {
  const result = calculatePayroll({ id: "e9", firstName: "Pat", lastName: "Lo", state: "TX", payType: "salary", salaryPerPeriod: 1000 });
  assert.ok(result.employerTaxes.totalEmployerTax > 0);
});
