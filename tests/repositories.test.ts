import test from "node:test";
import assert from "node:assert/strict";
import { CompanyRepository } from "../db/repositories/companyRepository";
import { EmployeeRepository } from "../db/repositories/employeeRepository";

class FakeStatement {
  constructor(private handler: (params?: Record<string, unknown>) => unknown) {}
  run(params?: Record<string, unknown>) { this.handler(params); return { changes: 1 }; }
  get<T = unknown>(): T | undefined { return undefined; }
  all<T = unknown>(params?: Record<string, unknown>): T[] { return this.handler(params) as T[]; }
}

class FakeDb {
  companies: any[] = [];
  employees: any[] = [];
  prepare(sql: string) {
    if (sql.includes("INSERT INTO companies")) return new FakeStatement((p) => { this.companies.push(p); return []; });
    if (sql.includes("SELECT id, name, state, pay_frequency FROM companies")) return new FakeStatement(() => this.companies.map((c) => ({ id: c.id, name: c.name, state: c.state, pay_frequency: c.pay_frequency })));
    if (sql.includes("INSERT INTO employees")) return new FakeStatement((p) => { this.employees.push(p); return []; });
    if (sql.includes("FROM employees WHERE company_id")) return new FakeStatement((p) => this.employees.filter((e) => e.company_id === p?.company_id).map((e) => ({ id: e.id, first_name: e.first_name, last_name: e.last_name, state: e.state, pay_type: e.pay_type, hourly_rate_cents: e.hourly_rate_cents, salary_per_period_cents: e.salary_per_period_cents })));
    return new FakeStatement(() => []);
  }
}

test("company repository create/list", () => {
  const db = new FakeDb() as any;
  const repo = new CompanyRepository(db);
  repo.create({ id: "c1", name: "PayrollPro", state: "TX", payFrequency: "semi-monthly" });
  const companies = repo.list();
  assert.equal(companies.length, 1);
  assert.equal(companies[0].name, "PayrollPro");
});

test("employee repository create/listByCompany", () => {
  const db = new FakeDb() as any;
  const repo = new EmployeeRepository(db);
  repo.create("c1", { id: "e1", firstName: "Jane", lastName: "Doe", state: "TX", payType: "salary", salaryPerPeriod: 2500 });
  const employees = repo.listByCompany("c1");
  assert.equal(employees.length, 1);
  assert.equal(employees[0].salaryPerPeriod, 2500);
});
