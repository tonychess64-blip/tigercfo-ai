import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { runMigrations } from "../db/migrate";

class FakeDb {
  public executed: string[] = [];
  public applied: { id: string }[] = [];

  exec(sql: string): void {
    this.executed.push(sql.trim());
  }

  prepare(sql: string) {
    if (sql.startsWith("SELECT id FROM schema_migrations")) {
      return { run: () => {}, all: () => this.applied };
    }

    if (sql.startsWith("INSERT INTO schema_migrations")) {
      return {
        run: (params?: Record<string, unknown>) => {
          this.applied.push({ id: String(params?.id) });
        },
        all: () => [],
      };
    }

    return { run: () => {}, all: () => [] };
  }
}

test("runs unapplied sql migrations", () => {
  const db = new FakeDb();
  runMigrations(db, path.join(process.cwd(), "db/migrations"));

  assert.ok(db.executed.some((sql) => sql.includes("CREATE TABLE IF NOT EXISTS companies")));
  assert.ok(db.applied.some((row) => row.id === "0001_initial_schema.sql"));
});
