import { randomUUID } from "node:crypto";
import { SqliteDatabase } from "../client";
import { Company } from "../../types/company";

interface CompanyRow {
  id: string;
  name: string;
  state: string;
  pay_frequency: Company["payFrequency"];
}

export class CompanyRepository {
  constructor(private readonly db: SqliteDatabase) {}

  create(input: Omit<Company, "id"> & { id?: string }): Company {
    const id = input.id ?? randomUUID();
    this.db
      .prepare(
        `INSERT INTO companies (id, name, state, pay_frequency, ein_last4)
         VALUES (@id, @name, @state, @pay_frequency, @ein_last4)`,
      )
      .run({
        id,
        name: input.name,
        state: input.state,
        pay_frequency: input.payFrequency,
        ein_last4: input.ein ?? null,
      });

    return { id, name: input.name, state: input.state, payFrequency: input.payFrequency, ein: input.ein };
  }

  list(): Company[] {
    const rows = this.db.prepare("SELECT id, name, state, pay_frequency FROM companies ORDER BY name").all<CompanyRow>();
    return rows.map((row) => ({ id: row.id, name: row.name, state: row.state, payFrequency: row.pay_frequency }));
  }
}
