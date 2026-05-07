import { EmployeeRepository } from "../db/repositories/employeeRepository";
import { PayrollRunRepository } from "../db/repositories/payrollRunRepository";
import { calculatePayroll } from "../payroll-engine/calculatePayroll";

export interface StartPayrollRunInput {
  companyId: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  payDate: string;
  actor: string;
}

export class PayrollRunWorkflow {
  constructor(
    private readonly employeeRepo: EmployeeRepository,
    private readonly runRepo: PayrollRunRepository,
  ) {}

  startDraftRun(input: StartPayrollRunInput): { runId: string; lineCount: number } {
    const run = this.runRepo.createRun({
      companyId: input.companyId,
      payPeriodStart: input.payPeriodStart,
      payPeriodEnd: input.payPeriodEnd,
      payDate: input.payDate,
      status: "draft",
    });

    const employees = this.employeeRepo.listByCompany(input.companyId);
    for (const employee of employees) {
      const calc = calculatePayroll(employee);
      this.runRepo.addRunLine({
        payrollRunId: run.id,
        employeeId: employee.id,
        ...calc,
        employeeInputSnapshotJson: JSON.stringify(employee),
        taxSettingsSnapshotJson: JSON.stringify({ state: employee.state, generatedAt: new Date().toISOString() }),
      });
    }

    this.runRepo.addAuditEvent(run.id, "RUN_CREATED", input.actor, { employeeCount: employees.length });
    return { runId: run.id, lineCount: employees.length };
  }

  finalizeRun(runId: string, actor: string): void {
    this.runRepo.updateStatus(runId, "finalized");
    this.runRepo.addAuditEvent(runId, "RUN_FINALIZED", actor, {});
  }

  rerunFromExisting(previousRunId: string, actor: string): { newRunId: string } {
    const lines = this.runRepo.listRunLines(previousRunId);
    if (lines.length === 0) throw new Error("Previous run has no lines");

    const source = this.runRepo.getRunById(previousRunId);
    if (!source) throw new Error("Source run not found");
    const newRun = this.runRepo.createRun({
      companyId: source.companyId,
      payPeriodStart: source.payPeriodStart,
      payPeriodEnd: source.payPeriodEnd,
      payDate: source.payDate,
      status: "draft",
    });

    for (const line of lines) {
      this.runRepo.addRunLine({ ...line, id: undefined, payrollRunId: newRun.id });
    }

    this.runRepo.addAuditEvent(newRun.id, "RUN_RERUN_CREATED", actor, { sourceRunId: previousRunId });
    return { newRunId: newRun.id };
  }
}
