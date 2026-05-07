import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { initializeDatabase } from "../db/client";
import { NodeSqliteAdapter } from "../db/sqliteAdapter";
import { CompanyRepository } from "../db/repositories/companyRepository";
import { EmployeeRepository } from "../db/repositories/employeeRepository";
import { PayrollRunRepository } from "../db/repositories/payrollRunRepository";
import { PayrollRunWorkflow } from "../payroll-workflows/runPayrollWorkflow";

test("payroll workflow creates draft lines, finalizes, and reruns", () => {
  const dir = mkdtempSync(join(tmpdir(), "payroll-flow-"));
  const db = initializeDatabase(new NodeSqliteAdapter(join(dir, "db.sqlite")));

  const companyRepo = new CompanyRepository(db);
  const employeeRepo = new EmployeeRepository(db);
  const runRepo = new PayrollRunRepository(db);
  const workflow = new PayrollRunWorkflow(employeeRepo, runRepo);

  const company = companyRepo.create({ id: "c1", name: "Demo", state: "TX", payFrequency: "semi-monthly" });
  employeeRepo.create(company.id, { id: "e1", firstName: "A", lastName: "B", state: "TX", payType: "salary", salaryPerPeriod: 2000 });

  const created = workflow.startDraftRun({ companyId: company.id, payPeriodStart: "2026-05-01", payPeriodEnd: "2026-05-15", payDate: "2026-05-20", actor: "qa" });
  assert.equal(created.lineCount, 1);

  const lines = runRepo.listRunLines(created.runId);
  assert.equal(lines.length, 1);
  assert.ok(lines[0].employeeInputSnapshotJson);

  workflow.finalizeRun(created.runId, "qa");
  const finalized = runRepo.getRunById(created.runId);
  assert.equal(finalized?.status, "finalized");

  const rerun = workflow.rerunFromExisting(created.runId, "qa");
  const rerunLines = runRepo.listRunLines(rerun.newRunId);
  assert.equal(rerunLines.length, 1);

  db.close?.();
  rmSync(dir, { recursive: true, force: true });
});
