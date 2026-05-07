import { NextResponse } from "next/server";
import { getDatabase } from "../../../../../db/sqliteAdapter";
import { EmployeeRepository } from "../../../../../db/repositories/employeeRepository";

export async function GET(_: Request, { params }: { params: { companyId: string } }) {
  const repo = new EmployeeRepository(getDatabase());
  return NextResponse.json(repo.listByCompany(params.companyId));
}
