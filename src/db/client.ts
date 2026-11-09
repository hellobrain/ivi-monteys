import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Single shared connection pool. In development the module can be re-evaluated
 * on hot reload, so the pool is cached on globalThis.
 */
const globalForDb = globalThis as unknown as { __bestiariumSql?: postgres.Sql };

function createSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and point it at a PostgreSQL database (see README).",
    );
  }
  return postgres(url, {
    max: Number(process.env.DATABASE_POOL_MAX ?? 10),
    // Supabase's transaction pooler (port 6543) does not support prepared statements.
    prepare: process.env.DATABASE_PREPARE !== "false",
  });
}

export function getSql() {
  if (!globalForDb.__bestiariumSql) globalForDb.__bestiariumSql = createSql();
  return globalForDb.__bestiariumSql;
}

let _db: ReturnType<typeof drizzle<typeof schema>> | undefined;

export function getDb() {
  if (!_db) _db = drizzle(getSql(), { schema, casing: "snake_case" });
  return _db;
}

export type Db = ReturnType<typeof getDb>;
export { schema };
