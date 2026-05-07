import fs from "node:fs";
import path from "node:path";

export interface SqliteExecutor {
  exec(sql: string): void;
  prepare(sql: string): {
    run(params?: Record<string, unknown>): void;
    all(): unknown[];
  };
}

export function runMigrations(db: SqliteExecutor, migrationsDir = path.join(process.cwd(), "db/migrations")): void {
  db.exec("CREATE TABLE IF NOT EXISTS schema_migrations (id TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);");

  const appliedRows = db.prepare("SELECT id FROM schema_migrations").all() as { id: string }[];
  const applied = new Set(appliedRows.map((row) => row.id));

  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    if (applied.has(file)) continue;

    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    db.exec("BEGIN");
    try {
      db.exec(sql);
      db.prepare("INSERT INTO schema_migrations (id) VALUES (@id)").run({ id: file });
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }
}
