CREATE TABLE IF NOT EXISTS payroll_run_audit_events (
  id TEXT PRIMARY KEY,
  payroll_run_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  actor TEXT NOT NULL,
  details_json TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (payroll_run_id) REFERENCES payroll_runs(id) ON DELETE CASCADE
);

ALTER TABLE payroll_run_lines ADD COLUMN employee_input_snapshot_json TEXT;
ALTER TABLE payroll_run_lines ADD COLUMN tax_settings_snapshot_json TEXT;
