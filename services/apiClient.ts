import { getTauriInvoke } from "./tauriClient";
import { Company } from "../types/company";
import { Employee } from "../types/employee";

export async function fetchCompanies(): Promise<Company[]> {
  const invoke = getTauriInvoke();
  if (invoke) {
    const rows = await invoke("list_companies");
    return rows.map((r: any) => ({ id: r.id, name: r.name, state: r.state, payFrequency: r.pay_frequency }));
  }
  const res = await fetch("/api/companies", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch companies");
  return res.json();
}

export async function createCompany(input: Omit<Company, "id">): Promise<Company> {
  const invoke = getTauriInvoke();
  if (invoke) {
    const id = await invoke("create_company", { name: input.name, state: input.state, payFrequency: input.payFrequency });
    return { ...input, id };
  }
  const res = await fetch("/api/companies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to create company");
  return res.json();
}

export async function fetchEmployees(companyId: string): Promise<Employee[]> {
  const invoke = getTauriInvoke();
  if (invoke) {
    const rows = await invoke("list_employees", { companyId });
    return rows.map((r: any) => ({ id: r.id, firstName: r.first_name, lastName: r.last_name, state: r.state, payType: r.pay_type }));
  }
  const res = await fetch(`/api/companies/${companyId}/employees`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch employees");
  return res.json();
}

export async function createPayrollRun(input: { companyId: string; payPeriodStart: string; payPeriodEnd: string; payDate: string; actor?: string }) {
  const invoke = getTauriInvoke();
  if (invoke) {
    return { runId: await invoke("create_payroll_run", input) };
  }

  const res = await fetch("/api/payroll-runs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "create", ...input }),
  });
  if (!res.ok) throw new Error("Failed to create payroll run");
  return res.json();
}

export async function finalizePayrollRun(runId: string, actor = "system") {
  const invoke = getTauriInvoke();
  if (invoke) {
    await invoke("finalize_payroll_run", { runId });
    return { ok: true };
  }

  const res = await fetch("/api/payroll-runs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "finalize", runId, actor }),
  });
  if (!res.ok) throw new Error("Failed to finalize payroll run");
  return res.json();
}
