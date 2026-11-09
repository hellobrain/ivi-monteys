import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

config({ path: ".env.local", quiet: true });
config({ quiet: true });

export async function runMigrations(url: string) {
  const sql = postgres(url, { max: 1, onnotice: () => {} });
  try {
    await migrate(drizzle(sql), { migrationsFolder: "./src/db/migrations" });
  } finally {
    await sql.end();
  }
}

const isMain = process.argv[1]?.endsWith("migrate.ts");
if (isMain) {
  const url = process.argv[2] === "--test" ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL (or TEST_DATABASE_URL with --test) is required");
  runMigrations(url)
    .then(() => console.log("Migrations applied."))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
