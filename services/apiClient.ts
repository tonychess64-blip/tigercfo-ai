import { Company } from "../types/company";
import { Employee } from "../types/employee";

export async function fetchCompanies(): Promise<Company[]> {
  const res = await fetch("/api/companies", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch companies");
  return res.json();
}

export async function createCompany(input: Omit<Company, "id">): Promise<Company> {
  const res = await fetch("/api/companies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to create company");
  return res.json();
}

export async function fetchEmployees(companyId: string): Promise<Employee[]> {
  const res = await fetch(`/api/companies/${companyId}/employees`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch employees");
  return res.json();
}
