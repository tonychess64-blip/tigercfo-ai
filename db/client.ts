import { runMigrations, SqliteExecutor } from "./migrate";

export interface SqliteStatement {
  run(params?: Record<string, unknown>): { changes: number; lastInsertRowid?: number | bigint } | void;
  get<T = unknown>(params?: Record<string, unknown>): T | undefined;
  all<T = unknown>(params?: Record<string, unknown>): T[];
}

export interface SqliteDatabase extends SqliteExecutor {
  prepare(sql: string): SqliteStatement;
  close?(): void;
}

export function initializeDatabase(db: SqliteDatabase): SqliteDatabase {
  db.exec("PRAGMA foreign_keys = ON;");
  runMigrations(db);
  return db;
}
