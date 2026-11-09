/**
 * Create or update a user from the command line (the only way to create the
 * first admin). Usage:
 *   npm run user:create -- --email you@example.org --name "Your Name" --role admin
 * The password is read from the BESTIARIUM_PASSWORD environment variable or
 * prompted for, never passed as an argument (it would end up in shell history).
 */
import { config } from "dotenv";
import { createInterface } from "node:readline/promises";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import postgres from "postgres";
import * as schema from "@/db/schema";
import { hashPassword } from "@/server/auth/password";

config({ path: ".env.local", quiet: true });
config({ quiet: true });

function arg(name: string) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
}

async function main() {
  const email = arg("email");
  const name = arg("name") ?? email?.split("@")[0];
  const role = (arg("role") ?? "reader") as "reader" | "editor" | "admin";
  if (!email || !["reader", "editor", "admin"].includes(role)) throw new Error("Usage: --email <email> [--name <name>] [--role reader|editor|admin]");
  let password = process.env.BESTIARIUM_PASSWORD;
  if (!password) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    password = await rl.question("Password (min 10 chars): ");
    rl.close();
  }
  if (password.length < 10) throw new Error("Password must be at least 10 characters");
  const client = postgres(process.env.DATABASE_URL!, { max: 1 });
  const db = drizzle(client, { schema });
  const passwordHash = await hashPassword(password);
  const existing = await db.select().from(schema.users).where(sql`lower(${schema.users.email}) = ${email.toLowerCase()}`);
  if (existing.length) {
    await db.update(schema.users).set({ role, passwordHash, displayName: name! }).where(sql`id = ${existing[0].id}`);
    console.log(`Updated ${email} (${role}).`);
  } else {
    await db.insert(schema.users).values({ email, displayName: name!, role, passwordHash });
    console.log(`Created ${email} (${role}).`);
  }
  await client.end();
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
