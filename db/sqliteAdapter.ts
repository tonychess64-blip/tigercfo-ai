import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { SqliteDatabase, SqliteStatement, initializeDatabase } from "./client";

class NodeSqliteStatement implements SqliteStatement {
  constructor(private readonly statement: any) {}

  run(params?: Record<string, unknown>) {
    return params ? this.statement.run(params as any) : this.statement.run();
  }

  get<T = unknown>(params?: Record<string, unknown>): T | undefined {
    return (params ? this.statement.get(params as any) : this.statement.get()) as T | undefined;
  }

  all<T = unknown>(params?: Record<string, unknown>): T[] {
    return (params ? this.statement.all(params as any) : this.statement.all()) as T[];
  }
}

export class NodeSqliteAdapter implements SqliteDatabase {
  private readonly db: DatabaseSync;

  constructor(filename: string) {
    mkdirSync(dirname(filename), { recursive: true });
    this.db = new DatabaseSync(filename);
  }

  exec(sql: string): void {
    this.db.exec(sql);
  }

  prepare(sql: string): SqliteStatement {
    return new NodeSqliteStatement(this.db.prepare(sql));
  }

  close(): void {
    this.db.close();
  }
}

let singletonDb: SqliteDatabase | null = null;

export function getDatabase(filename = "./data/payrollpro.sqlite"): SqliteDatabase {
  if (!singletonDb) {
    singletonDb = initializeDatabase(new NodeSqliteAdapter(filename));
  }

  return singletonDb;
}
