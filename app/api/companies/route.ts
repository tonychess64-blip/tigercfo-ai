import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "../../../db/sqliteAdapter";
import { CompanyRepository } from "../../../db/repositories/companyRepository";

export async function GET() {
  const repo = new CompanyRepository(getDatabase());
  return NextResponse.json(repo.list());
}

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const repo = new CompanyRepository(getDatabase());

  const company = repo.create({
    name: payload.name,
    state: payload.state,
    payFrequency: payload.payFrequency,
  });

  return NextResponse.json(company, { status: 201 });
}
