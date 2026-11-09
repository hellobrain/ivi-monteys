import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";
import { seedDatabase } from "@/content/seed/run";

config({ path: ".env.local", quiet: true });
config({ quiet: true });

async function main() {
  const url = process.argv.includes("--test") ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");
  const reset = process.argv.includes("--reset");
  const sql = postgres(url, { max: 1, onnotice: () => {} });
  try {
    await seedDatabase(drizzle(sql, { schema }), { reset });
    console.log(`Seed complete${reset ? " (content tables reset)" : ""}.`);
  } finally {
    await sql.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
