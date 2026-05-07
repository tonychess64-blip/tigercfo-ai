PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  pay_frequency TEXT NOT NULL,
  ein_last4 TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  state TEXT NOT NULL,
  pay_type TEXT NOT NULL,
  hourly_rate_cents INTEGER,
  salary_per_period_cents INTEGER,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS employee_tax_settings (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL UNIQUE,
  filing_status TEXT NOT NULL,
  federal_extra_withholding_cents INTEGER NOT NULL DEFAULT 0,
  state_allowances INTEGER NOT NULL DEFAULT 0,
  ssn_last4 TEXT,
  encrypted_ssn_ciphertext TEXT,
  encrypted_ssn_key_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS direct_deposit_accounts (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL,
  account_type TEXT NOT NULL,
  bank_name TEXT,
  routing_number_last4 TEXT,
  account_number_last4 TEXT,
  encrypted_routing_ciphertext TEXT,
  encrypted_account_ciphertext TEXT,
  encrypted_bank_key_id TEXT,
  allocation_type TEXT NOT NULL,
  allocation_value_bps INTEGER,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS benefit_plans (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  name TEXT NOT NULL,
  plan_type TEXT NOT NULL,
  pre_tax INTEGER NOT NULL DEFAULT 1,
  employer_contribution_bps INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS employee_benefits (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL,
  benefit_plan_id TEXT NOT NULL,
  deduction_type TEXT NOT NULL,
  deduction_value_cents INTEGER,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (benefit_plan_id) REFERENCES benefit_plans(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS garnishments (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL,
  agency_name TEXT NOT NULL,
  order_reference TEXT,
  deduction_type TEXT NOT NULL,
  deduction_value_cents INTEGER NOT NULL,
  max_total_cents INTEGER,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payroll_runs (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  pay_period_start TEXT NOT NULL,
  pay_period_end TEXT NOT NULL,
  pay_date TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payroll_run_lines (
  id TEXT PRIMARY KEY,
  payroll_run_id TEXT NOT NULL,
  employee_id TEXT NOT NULL,
  gross_pay_cents INTEGER NOT NULL,
  taxable_wages_cents INTEGER NOT NULL,
  federal_withholding_cents INTEGER NOT NULL,
  social_security_cents INTEGER NOT NULL,
  medicare_cents INTEGER NOT NULL,
  state_withholding_cents INTEGER NOT NULL,
  pre_tax_benefits_cents INTEGER NOT NULL,
  post_tax_garnishments_cents INTEGER NOT NULL,
  net_pay_cents INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (payroll_run_id) REFERENCES payroll_runs(id) ON DELETE CASCADE,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tax_settings (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  tax_year INTEGER NOT NULL,
  social_security_wage_base_cents INTEGER NOT NULL,
  medicare_rate_bps INTEGER NOT NULL,
  federal_withholding_method TEXT NOT NULL,
  state_withholding_mode TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(company_id, tax_year),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);
