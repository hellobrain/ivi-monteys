import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";
import { seedDatabase } from "@/content/seed/run";
import { runMigrations } from "../../scripts/migrate";

config({ path: ".env.local", quiet: true });
config({ quiet: true });

/** Fresh, migrated and seeded test database. Never points at DATABASE_URL. */
export async function setupTestDb() {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) throw new Error("TEST_DATABASE_URL must be set for integration tests");
  if (url === process.env.DATABASE_URL) throw new Error("TEST_DATABASE_URL must differ from DATABASE_URL");
  const admin = postgres(url, { max: 1, onnotice: () => {} });
  await admin.unsafe("drop schema if exists public cascade; drop schema if exists drizzle cascade; create schema public;");
  await admin.end();
  await runMigrations(url);
  const sql = postgres(url, { max: 4, onnotice: () => {} });
  const db = drizzle(sql, { schema, casing: "snake_case" });
  await seedDatabase(db, { reset: false });
  return { db, close: () => sql.end() };
}
