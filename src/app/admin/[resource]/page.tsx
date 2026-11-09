import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getDb } from "@/db/client";
import { PUBLICATION_STATUSES, publicationLabels } from "@/domain/editorial";
import { requireRole } from "@/server/auth/dal";
import { getResource } from "@/server/admin/resources";
import { listRecords } from "@/server/admin/service";

export default function ResourceList({ params, searchParams }: PageProps<"/admin/[resource]">) {
  return (
    <Suspense fallback={<p className="label text-muted">Loading…</p>}>
      <List params={params} searchParams={searchParams} />
    </Suspense>
  );
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

async function List({ params, searchParams }: Pick<PageProps<"/admin/[resource]">, "params" | "searchParams">) {
  const user = await requireRole("editor");
  const [{ resource }, sp] = await Promise.all([params, searchParams]);
  const r = getResource(resource);
  if (!r || (r.adminOnly && user.role !== "admin")) notFound();
  const q = one(sp.q)?.slice(0, 100);
  const status = one(sp.status);
  const page = Number(one(sp.page) ?? 1) || 1;
  const { rows, total, pageSize } = await listRecords(getDb(), r, { q, status, page });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-[3.5rem]">{r.label}</h1>
        {r.canCreate !== false && (
          <Link href={`/admin/${r.key}/new`} className="pill pill-solid">
            New {r.singular}
          </Link>
        )}
      </div>
      <form method="get" className="mt-6 flex flex-wrap gap-3">
        <input name="q" defaultValue={q} placeholder="Search…" className="input max-w-xs" type="search" />
        {r.hasWorkflow && (
          <select name="status" defaultValue={status ?? ""} className="input max-w-[12rem] bg-ink">
            <option value="">Any status</option>
            {PUBLICATION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {publicationLabels[s]}
              </option>
            ))}
          </select>
        )}
        <button className="pill">Filter</button>
      </form>
      <p className="label mt-4 text-muted">{total} records</p>
      <ul className="mt-2">
        {rows.map((row) => (
          <li key={String(row.id)} className="border-b border-rule">
            <Link href={`/admin/${r.key}/${row.id}`} className="flex items-baseline justify-between gap-4 py-3 hover:text-vermilion">
              <span className="min-w-0">
                <span className="block truncate font-serif text-lg">{String(row[r.titleField] ?? "(untitled)").slice(0, 140)}</span>
                {r.subtitleField && row[r.subtitleField] != null && <span className="label block truncate text-muted">{String(row[r.subtitleField]).slice(0, 140)}</span>}
              </span>
              <span className="label-caps shrink-0 text-muted">
                {r.hasWorkflow ? String(row.publicationStatus) : ""} {row.researchStatus ? `· ${String(row.researchStatus)}` : ""}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {total > pageSize && (
        <nav className="mt-6 flex gap-3 label" aria-label="Pages">
          {page > 1 && <Link href={`?${new URLSearchParams({ ...(q ? { q } : {}), ...(status ? { status } : {}), page: String(page - 1) })}`}>← Previous</Link>}
          {page * pageSize < total && <Link href={`?${new URLSearchParams({ ...(q ? { q } : {}), ...(status ? { status } : {}), page: String(page + 1) })}`}>Next →</Link>}
        </nav>
      )}
    </div>
  );
}
