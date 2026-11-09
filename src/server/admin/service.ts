import "server-only";
import { and, asc, count, desc, eq, getTableColumns, sql, type SQL } from "drizzle-orm";
import type { PgColumn, PgTable } from "drizzle-orm/pg-core";
import type { Db } from "@/db/client";
import * as s from "@/db/schema";
import { canTransition, type PublicationStatus, type Role } from "@/domain/editorial";
import { isSafeExternalUrl } from "@/lib/safe-url";
import { escapeLike } from "@/server/repo/public";
import { getResource, type FieldDef, type ResourceDef } from "./resources";

type Row = Record<string, unknown>;
// The registry is dynamic by design; columns are looked up by property name.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTable = PgTable & Record<string, any>;

function cols(table: PgTable): Record<string, PgColumn> {
  return getTableColumns(table) as Record<string, PgColumn>;
}
function col(table: PgTable, name: string): PgColumn {
  const c = cols(table)[name];
  if (!c) throw new Error(`Unknown column ${name}`);
  return c;
}

export class ValidationError extends Error {
  constructor(public fieldErrors: Record<string, string>) {
    super("Validation failed");
  }
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Turn submitted form data into column values, validating every field. Pure; unit-tested. */
export function parseFields(fields: FieldDef[], form: FormData): { values: Row; errors: Record<string, string> } {
  const values: Row = {};
  const errors: Record<string, string> = {};
  for (const f of fields) {
    const raw = form.get(f.name);
    const str = typeof raw === "string" ? raw.trim() : "";
    const empty = str === "";
    if (f.type === "boolean") {
      values[f.name] = raw === "on" || raw === "true";
      continue;
    }
    if (empty) {
      if (f.required) errors[f.name] = "Required.";
      values[f.name] = f.type === "tags" ? [] : null;
      continue;
    }
    switch (f.type) {
      case "text":
      case "textarea":
      case "markdown":
        if (str.length > 100_000) errors[f.name] = "Too long.";
        if (f.name === "slug" && !SLUG.test(str)) errors[f.name] = "Use lowercase letters, numbers and single hyphens.";
        values[f.name] = str;
        break;
      case "url":
        if (!isSafeExternalUrl(str)) errors[f.name] = "Enter a full http(s) URL.";
        values[f.name] = str;
        break;
      case "number": {
        const n = Number(str);
        if (!Number.isFinite(n)) errors[f.name] = "Enter a number.";
        values[f.name] = n;
        break;
      }
      case "select":
        if (!f.options?.includes(str)) errors[f.name] = "Choose one of the options.";
        values[f.name] = str;
        break;
      case "ref":
        if (!UUID.test(str)) errors[f.name] = "Invalid reference.";
        values[f.name] = str;
        break;
      case "tags":
        values[f.name] = str
          .split(/\r?\n/)
          .map((t) => t.trim())
          .filter(Boolean)
          .slice(0, 50);
        break;
    }
  }
  return { values, errors };
}

/* ───────────── Reading ───────────── */

export async function listRecords(db: Db, r: ResourceDef, opts: { q?: string; status?: string; page?: number } = {}) {
  const t = r.table as AnyTable;
  const conds: SQL[] = [];
  if (opts.q) {
    const like = `%${escapeLike(opts.q)}%`;
    const searchable = [r.titleField, r.subtitleField, r.slugField].filter((x): x is string => !!x && cols(t)[x]?.columnType === "PgText");
    if (searchable.length) conds.push(sql`(${sql.join(searchable.map((f) => sql`${col(t, f)} ilike ${like}`), sql` or `)})`);
  }
  if (opts.status && r.hasWorkflow) conds.push(eq(col(t, "publicationStatus"), opts.status));
  const where = conds.length ? and(...conds) : undefined;
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = 50;
  const orderCol = cols(t).updatedAt ?? cols(t).createdAt ?? col(t, r.titleField);
  const [rows, [{ total }]] = await Promise.all([
    db
      .select()
      .from(t)
      .where(where)
      .orderBy(cols(t).updatedAt || cols(t).createdAt ? desc(orderCol) : asc(orderCol))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ total: count() }).from(t).where(where),
  ]);
  return { rows: rows as Row[], total, page, pageSize };
}

export async function getRecord(db: Db, r: ResourceDef, id: string) {
  if (!UUID.test(id)) return null;
  const t = r.table as AnyTable;
  const [row] = await db.select().from(t).where(eq(col(t, "id"), id)).limit(1);
  if (!row) return null;
  const relations: Record<string, string[]> = {};
  for (const rel of r.relations ?? []) {
    const jt = rel.table as AnyTable;
    const linked = await db.select({ other: col(jt, rel.otherColumn) }).from(jt).where(eq(col(jt, rel.ownColumn), id));
    relations[rel.name] = linked.map((l) => String(l.other));
  }
  return { row: row as Row, relations };
}

/** Options for reference pickers: id + human label. */
export async function refOptions(db: Db, resourceKey: string) {
  const r = getResource(resourceKey);
  if (!r) return [];
  const t = r.table as AnyTable;
  const title = col(t, r.titleField);
  const sub = r.subtitleField ? cols(t)[r.subtitleField] : undefined;
  const rows = await db
    .select({ id: col(t, "id"), title, sub: sub ?? sql`null` })
    .from(t)
    .orderBy(asc(title))
    .limit(1000);
  return rows.map((x) => ({
    id: String(x.id),
    label: [x.title, x.sub].filter((v) => v !== null && v !== undefined && v !== "").map((v) => String(v).slice(0, 80)).join(" · ") || String(x.id).slice(0, 8),
  }));
}

/* ───────────── Writing ───────────── */

async function audit(db: Db, userId: string, action: string, entityType: string, entityId: string | null, detail?: unknown) {
  await db.insert(s.auditLog).values({ userId, action, entityType, entityId, detail: detail ?? null });
}

export async function saveRecord(
  db: Db,
  user: { id: string; role: Role },
  r: ResourceDef,
  id: string | null,
  form: FormData,
): Promise<string> {
  if (r.adminOnly && user.role !== "admin") throw new Error("Not allowed");
  if (!id && r.canCreate === false) throw new Error("Records of this type cannot be created here");
  const { values, errors } = parseFields(r.fields, form);
  if (Object.keys(errors).length) throw new ValidationError(errors);

  const relationValues: Record<string, string[]> = {};
  for (const rel of r.relations ?? []) {
    relationValues[rel.name] = [...new Set(form.getAll(`rel:${rel.name}`).map(String))].filter((v) => UUID.test(v));
  }

  const t = r.table as AnyTable;
  // Empty optional inputs for NOT NULL columns with a default fall back to that default.
  for (const [name, c] of Object.entries(cols(t))) {
    if (name in values && values[name] === null && c.notNull && c.hasDefault) delete values[name];
  }
  return db.transaction(async (tx) => {
    let recordId = id;
    if (recordId) {
      await tx.update(t).set(values).where(eq(col(t, "id"), recordId));
    } else {
      // New records always start as drafts, whatever was submitted.
      const insertValues = r.hasWorkflow ? { ...values, publicationStatus: "draft" } : values;
      const [created] = await tx.insert(t).values(insertValues).returning({ id: col(t, "id") });
      recordId = String(created.id);
    }
    for (const rel of r.relations ?? []) {
      const jt = rel.table as AnyTable;
      await tx.delete(jt).where(eq(col(jt, rel.ownColumn), recordId));
      const targets = relationValues[rel.name].filter((v) => !(rel.target === r.key && v === recordId));
      if (targets.length) {
        await tx.insert(jt).values(targets.map((other) => ({ [rel.ownColumn]: recordId, [rel.otherColumn]: other })));
      }
    }
    await audit(tx as unknown as Db, user.id, id ? "update" : "create", r.key, recordId);
    return recordId!;
  });
}

export async function transitionRecord(db: Db, user: { id: string; role: Role }, r: ResourceDef, id: string, to: PublicationStatus) {
  if (!r.hasWorkflow) throw new Error("This record type has no publication workflow");
  const t = r.table as AnyTable;
  const current = await getRecord(db, r, id);
  if (!current) throw new Error("Not found");
  const from = current.row.publicationStatus as PublicationStatus;
  if (!canTransition(from, to, user.role)) throw new Error(`Moving from ${from} to ${to} is not allowed for ${user.role}s`);
  await db.update(t).set({ publicationStatus: to }).where(eq(col(t, "id"), id));
  await audit(db, user.id, `status:${from}->${to}`, r.key, id);
}

export async function deleteRecord(db: Db, user: { id: string; role: Role }, r: ResourceDef, id: string) {
  if (user.role !== "admin") throw new Error("Only admins can delete. Editors can withdraw or return records to draft instead.");
  const t = r.table as AnyTable;
  await db.delete(t).where(eq(col(t, "id"), id));
  await audit(db, user.id, "delete", r.key, id);
}

/* ───────────── Dashboard ───────────── */

export async function dashboard(db: Db) {
  const workflow = await db.execute<{ resource: string; status: string; n: number }>(sql`
    select 'animals' as resource, publication_status::text as status, count(*)::int as n from animals group by 2
    union all select 'legends', publication_status::text, count(*)::int from legends group by 2
    union all select 'symbols', publication_status::text, count(*)::int from symbols group by 2
    union all select 'lessons', publication_status::text, count(*)::int from lessons group by 2
    union all select 'manuscripts', publication_status::text, count(*)::int from manuscripts group by 2
    union all select 'artworks', publication_status::text, count(*)::int from artworks group by 2
    union all select 'images', publication_status::text, count(*)::int from images group by 2
  `);
  const [uncited] = await db.execute<{ n: number }>(
    sql`select count(*)::int as n from claims c where not exists (select 1 from citations ci where ci.claim_id = c.id)`,
  );
  const [unreviewed] = await db.execute<{ n: number }>(sql`select count(*)::int as n from claims where review_status = 'unreviewed'`);
  const recent = await db
    .select({ action: s.auditLog.action, entityType: s.auditLog.entityType, entityId: s.auditLog.entityId, createdAt: s.auditLog.createdAt, who: s.users.displayName })
    .from(s.auditLog)
    .leftJoin(s.users, eq(s.users.id, s.auditLog.userId))
    .orderBy(desc(s.auditLog.createdAt))
    .limit(15);
  return { workflow: [...workflow], uncitedClaims: uncited?.n ?? 0, unreviewedClaims: unreviewed?.n ?? 0, recent };
}

/**
 * Possible duplicate animals: similar canonical names, or an alternative name
 * of one animal that resembles another animal's canonical name (pg_trgm).
 */
export async function findDuplicateAnimals(db: Db, threshold = 0.45) {
  const rows = await db.execute<{ a: string; a_name: string; b: string; b_name: string; via: string; score: number }>(sql`
    select a1.id as a, a1.canonical_name as a_name, a2.id as b, a2.canonical_name as b_name, 'name' as via,
           similarity(a1.canonical_name, a2.canonical_name) as score
      from animals a1 join animals a2 on a1.id < a2.id
     where similarity(a1.canonical_name, a2.canonical_name) >= ${threshold}
    union all
    select a1.id, a1.canonical_name, a2.id, a2.canonical_name, 'alt name: ' || n.name,
           similarity(n.name, a2.canonical_name)
      from animal_names n join animals a1 on a1.id = n.animal_id join animals a2 on a2.id <> a1.id
     where similarity(n.name, a2.canonical_name) >= ${threshold}
    order by score desc limit 50
  `);
  return [...rows].map((r) => ({ ...r, score: Number(r.score) }));
}

/** Records whose title resembles the given text; shown while editing to prevent duplicates. */
export async function similarTitles(db: Db, r: ResourceDef, text: string, excludeId?: string) {
  if (!text || text.length < 3) return [];
  const t = r.table as AnyTable;
  const title = col(t, r.titleField);
  if (title.columnType !== "PgText") return [];
  const rows = await db
    .select({ id: col(t, "id"), title, score: sql<number>`similarity(${title}, ${text})` })
    .from(t)
    .where(and(sql`similarity(${title}, ${text}) > 0.35`, excludeId ? sql`${col(t, "id")} <> ${excludeId}` : undefined))
    .orderBy(desc(sql`similarity(${title}, ${text})`))
    .limit(5);
  return rows.map((x) => ({ id: String(x.id), title: String(x.title), score: Number(x.score) }));
}

