import { randomUUID } from "node:crypto";
import { SqliteDatabase } from "../client";
import { Employee } from "../../types/employee";

interface EmployeeRow {
  id: string;
  first_name: string;
  last_name: string;
  state: string;
  pay_type: Employee["payType"];
  hourly_rate_cents: number | null;
  salary_per_period_cents: number | null;
}

export class EmployeeRepository {
  constructor(private readonly db: SqliteDatabase) {}

  create(companyId: string, input: Omit<Employee, "id"> & { id?: string }): Employee {
    const id = input.id ?? randomUUID();

    this.db
      .prepare(
        `INSERT INTO employees (id, company_id, first_name, last_name, state, pay_type, hourly_rate_cents, salary_per_period_cents)
         VALUES (@id, @company_id, @first_name, @last_name, @state, @pay_type, @hourly_rate_cents, @salary_per_period_cents)`,
      )
      .run({
        id,
        company_id: companyId,
        first_name: input.firstName,
        last_name: input.lastName,
        state: input.state,
        pay_type: input.payType,
        hourly_rate_cents: input.hourlyRate ? Math.round(input.hourlyRate * 100) : null,
        salary_per_period_cents: input.salaryPerPeriod ? Math.round(input.salaryPerPeriod * 100) : null,
      });

    return { ...input, id };
  }

  listByCompany(companyId: string): Employee[] {
    const rows = this.db
      .prepare(
        `SELECT id, first_name, last_name, state, pay_type, hourly_rate_cents, salary_per_period_cents
         FROM employees WHERE company_id = @company_id ORDER BY last_name, first_name`,
      )
      .all<EmployeeRow>({ company_id: companyId });

    return rows.map((row) => ({
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      state: row.state,
      payType: row.pay_type,
      hourlyRate: row.hourly_rate_cents ? row.hourly_rate_cents / 100 : undefined,
      salaryPerPeriod: row.salary_per_period_cents ? row.salary_per_period_cents / 100 : undefined,
    }));
  }
}
