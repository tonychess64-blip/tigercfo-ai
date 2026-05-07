import { randomUUID } from "node:crypto";
import { SqliteDatabase } from "../client";
import { PayrollBreakdown } from "../../types/payroll";

export interface PayrollRunRecord {
  id: string;
  companyId: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  payDate: string;
  status: "draft" | "finalized";
}

export interface PayrollRunLineRecord extends PayrollBreakdown {
  id: string;
  payrollRunId: string;
  employeeId: string;
  employeeInputSnapshotJson?: string;
  taxSettingsSnapshotJson?: string;
}

function toCents(amount: number): number { return Math.round(amount * 100); }
function fromCents(amount: number): number { return amount / 100; }

export class PayrollRunRepository {
  constructor(private readonly db: SqliteDatabase) {}

  createRun(run: Omit<PayrollRunRecord, "id"> & { id?: string }): PayrollRunRecord {
    const id = run.id ?? randomUUID();
    this.db.prepare(`INSERT INTO payroll_runs (id, company_id, pay_period_start, pay_period_end, pay_date, status)
      VALUES (@id, @company_id, @pay_period_start, @pay_period_end, @pay_date, @status)`).run({
      id, company_id: run.companyId, pay_period_start: run.payPeriodStart, pay_period_end: run.payPeriodEnd, pay_date: run.payDate, status: run.status,
    });
    return { ...run, id };
  }

  updateStatus(payrollRunId: string, status: PayrollRunRecord["status"]): void {
    this.db.prepare("UPDATE payroll_runs SET status=@status, updated_at=CURRENT_TIMESTAMP WHERE id=@id").run({ id: payrollRunId, status });
  }

  addAuditEvent(payrollRunId: string, eventType: string, actor: string, details: Record<string, unknown>): void {
    this.db.prepare("INSERT INTO payroll_run_audit_events (id, payroll_run_id, event_type, actor, details_json) VALUES (@id,@payroll_run_id,@event_type,@actor,@details_json)")
      .run({ id: randomUUID(), payroll_run_id: payrollRunId, event_type: eventType, actor, details_json: JSON.stringify(details) });
  }

  addRunLine(line: Omit<PayrollRunLineRecord, "id"> & { id?: string }): PayrollRunLineRecord {
    const id = line.id ?? randomUUID();
    this.db.prepare(`INSERT INTO payroll_run_lines (
      id, payroll_run_id, employee_id, gross_pay_cents, taxable_wages_cents,
      federal_withholding_cents, social_security_cents, medicare_cents, state_withholding_cents,
      pre_tax_benefits_cents, post_tax_garnishments_cents, net_pay_cents, employee_input_snapshot_json, tax_settings_snapshot_json,
      employer_social_security_cents, employer_medicare_cents, futa_cents, suta_cents, employer_total_tax_cents)
      VALUES (
      @id, @payroll_run_id, @employee_id, @gross_pay_cents, @taxable_wages_cents,
      @federal_withholding_cents, @social_security_cents, @medicare_cents, @state_withholding_cents,
      @pre_tax_benefits_cents, @post_tax_garnishments_cents, @net_pay_cents, @employee_input_snapshot_json, @tax_settings_snapshot_json,
      @employer_social_security_cents, @employer_medicare_cents, @futa_cents, @suta_cents, @employer_total_tax_cents)`).run({
      id,
      payroll_run_id: line.payrollRunId,
      employee_id: line.employeeId,
      gross_pay_cents: toCents(line.grossPay), taxable_wages_cents: toCents(line.taxableWages), federal_withholding_cents: toCents(line.federalWithholding), social_security_cents: toCents(line.socialSecurity), medicare_cents: toCents(line.medicare), state_withholding_cents: toCents(line.stateWithholding), pre_tax_benefits_cents: toCents(line.preTaxBenefits), post_tax_garnishments_cents: toCents(line.postTaxGarnishments), net_pay_cents: toCents(line.netPay),
      employee_input_snapshot_json: line.employeeInputSnapshotJson ?? null,
      tax_settings_snapshot_json: line.taxSettingsSnapshotJson ?? null,
      employer_social_security_cents: toCents(line.employerTaxes.socialSecurityEmployer),
      employer_medicare_cents: toCents(line.employerTaxes.medicareEmployer),
      futa_cents: toCents(line.employerTaxes.futa),
      suta_cents: toCents(line.employerTaxes.suta),
      employer_total_tax_cents: toCents(line.employerTaxes.totalEmployerTax),
    });
    return { ...line, id };
  }


  getRunById(runId: string): PayrollRunRecord | null {
    const r = this.db.prepare("SELECT id, company_id, pay_period_start, pay_period_end, pay_date, status FROM payroll_runs WHERE id=@id").get<any>({ id: runId });
    if (!r) return null;
    return { id: r.id, companyId: r.company_id, payPeriodStart: r.pay_period_start, payPeriodEnd: r.pay_period_end, payDate: r.pay_date, status: r.status };
  }

  listRuns(companyId: string): PayrollRunRecord[] {
    const rows = this.db.prepare("SELECT id, company_id, pay_period_start, pay_period_end, pay_date, status FROM payroll_runs WHERE company_id = @company_id ORDER BY pay_date DESC").all<any>({ company_id: companyId });
    return rows.map((r: any) => ({ id: r.id, companyId: r.company_id, payPeriodStart: r.pay_period_start, payPeriodEnd: r.pay_period_end, payDate: r.pay_date, status: r.status }));
  }

  listRunLines(payrollRunId: string): PayrollRunLineRecord[] {
    const rows = this.db.prepare("SELECT * FROM payroll_run_lines WHERE payroll_run_id = @payroll_run_id ORDER BY created_at ASC").all<any>({ payroll_run_id: payrollRunId });
    return rows.map((r: any) => ({
      id: r.id, payrollRunId: r.payroll_run_id, employeeId: r.employee_id,
      grossPay: fromCents(r.gross_pay_cents), taxableWages: fromCents(r.taxable_wages_cents), federalWithholding: fromCents(r.federal_withholding_cents), socialSecurity: fromCents(r.social_security_cents), medicare: fromCents(r.medicare_cents), stateWithholding: fromCents(r.state_withholding_cents), preTaxBenefits: fromCents(r.pre_tax_benefits_cents), postTaxGarnishments: fromCents(r.post_tax_garnishments_cents), netPay: fromCents(r.net_pay_cents),
      employeeInputSnapshotJson: r.employee_input_snapshot_json ?? undefined,
      taxSettingsSnapshotJson: r.tax_settings_snapshot_json ?? undefined,
      employerTaxes: {
        socialSecurityEmployer: fromCents(r.employer_social_security_cents ?? 0),
        medicareEmployer: fromCents(r.employer_medicare_cents ?? 0),
        futa: fromCents(r.futa_cents ?? 0),
        suta: fromCents(r.suta_cents ?? 0),
        totalEmployerTax: fromCents(r.employer_total_tax_cents ?? 0),
      },
    }));
  }
}
