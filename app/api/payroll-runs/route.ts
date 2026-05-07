import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "../../../db/sqliteAdapter";
import { EmployeeRepository } from "../../../db/repositories/employeeRepository";
import { PayrollRunRepository } from "../../../db/repositories/payrollRunRepository";
import { PayrollRunWorkflow } from "../../../payroll-workflows/runPayrollWorkflow";

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const db = getDatabase();
  const workflow = new PayrollRunWorkflow(new EmployeeRepository(db), new PayrollRunRepository(db));

  if (payload.action === "create") {
    const result = workflow.startDraftRun({
      companyId: payload.companyId,
      payPeriodStart: payload.payPeriodStart,
      payPeriodEnd: payload.payPeriodEnd,
      payDate: payload.payDate,
      actor: payload.actor ?? "system",
    });
    return NextResponse.json(result, { status: 201 });
  }

  if (payload.action === "finalize") {
    workflow.finalizeRun(payload.runId, payload.actor ?? "system");
    return NextResponse.json({ ok: true });
  }

  if (payload.action === "rerun") {
    return NextResponse.json(workflow.rerunFromExisting(payload.runId, payload.actor ?? "system"), { status: 201 });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
