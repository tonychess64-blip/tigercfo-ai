ALTER TABLE payroll_run_lines ADD COLUMN employer_social_security_cents INTEGER NOT NULL DEFAULT 0;
ALTER TABLE payroll_run_lines ADD COLUMN employer_medicare_cents INTEGER NOT NULL DEFAULT 0;
ALTER TABLE payroll_run_lines ADD COLUMN futa_cents INTEGER NOT NULL DEFAULT 0;
ALTER TABLE payroll_run_lines ADD COLUMN suta_cents INTEGER NOT NULL DEFAULT 0;
ALTER TABLE payroll_run_lines ADD COLUMN employer_total_tax_cents INTEGER NOT NULL DEFAULT 0;
