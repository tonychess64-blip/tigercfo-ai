import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { NodeSqliteAdapter } from "../db/sqliteAdapter";
import { initializeDatabase } from "../db/client";
import { CompanyRepository } from "../db/repositories/companyRepository";

test("sqlite adapter runs migrations and persists records", () => {
  const dir = mkdtempSync(join(tmpdir(), "payrollpro-"));
  const dbPath = join(dir, "app.sqlite");

  const db = initializeDatabase(new NodeSqliteAdapter(dbPath));
  const companies = new CompanyRepository(db);
  companies.create({ id: "c1", name: "Payroll Pro LLC", state: "TX", payFrequency: "semi-monthly" });

  const results = companies.list();
  assert.equal(results.length, 1);
  assert.equal(results[0].id, "c1");

  db.close?.();
  rmSync(dir, { recursive: true, force: true });
});
