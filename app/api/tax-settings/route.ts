import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "../../../db/sqliteAdapter";
import { TaxSettingsRepository } from "../../../db/repositories/taxSettingsRepository";

export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get("companyId");
  if (!companyId) return NextResponse.json({ error: "companyId required" }, { status: 400 });
  return NextResponse.json(new TaxSettingsRepository(getDatabase()).listByCompany(companyId));
}

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const record = new TaxSettingsRepository(getDatabase()).upsert(payload);
  return NextResponse.json(record, { status: 201 });
}
