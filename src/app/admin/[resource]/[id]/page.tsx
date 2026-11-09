import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { RecordForm } from "@/components/admin/record-form";
import { getDb } from "@/db/client";
import { allowedTransitions, publicationLabels, type PublicationStatus } from "@/domain/editorial";
import { deleteAction, transitionAction } from "@/server/actions/admin";
import { requireRole } from "@/server/auth/dal";
import { getResource } from "@/server/admin/resources";
import { getRecord, refOptions, similarTitles } from "@/server/admin/service";

export default function EditRecord({ params, searchParams }: PageProps<"/admin/[resource]/[id]">) {
  return (
    <Suspense fallback={<p className="label text-muted">Loading…</p>}>
      <Editor params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Editor({ params, searchParams }: Pick<PageProps<"/admin/[resource]/[id]">, "params" | "searchParams">) {
  const user = await requireRole("editor");
  const [{ resource, id }, sp] = await Promise.all([params, searchParams]);
  const r = getResource(resource);
  if (!r || (r.adminOnly && user.role !== "admin")) notFound();
  const db = getDb();
  const isNew = id === "new";
  if (isNew && r.canCreate === false) notFound();
  const record = isNew ? null : await getRecord(db, r, id);
  if (!isNew && !record) notFound();

  const refKeys = [...new Set([...r.fields.filter((f) => f.type === "ref").map((f) => f.ref!), ...(r.relations ?? []).map((x) => x.target)])];
  const opts = Object.fromEntries(await Promise.all(refKeys.map(async (k) => [k, await refOptions(db, k)] as const)));
  const row = record?.row ?? {};
  const status = row.publicationStatus as PublicationStatus | undefined;
  const title = String(row[r.titleField] ?? "");
  const similar = record ? await similarTitles(db, r, title, id) : [];
  const publicPath = record && r.publicPath ? r.publicPath(row) : null;

  return (
    <div className="grid gap-12 xl:grid-cols-[minmax(0,1fr)_280px]">
      <div>
        <Link href={`/admin/${r.key}`} className="label text-muted hover:text-paper">
          ← {r.label}
        </Link>
        <h1 className="display mt-3 text-[clamp(2.5rem,4vw,3.5rem)]">{isNew ? `New ${r.singular}` : title.slice(0, 120) || `(${r.singular})`}</h1>
        {sp.created && <p className="label mt-2 text-moss">Created as a draft.</p>}
        <div className="mt-8">
          <RecordForm
            resource={r.key}
            id={isNew ? null : id}
            fields={r.fields}
            values={row}
            refOptions={opts}
            relations={(r.relations ?? []).map((rel) => ({
              name: rel.name,
              label: rel.label,
              options: (opts[rel.target] ?? []).filter((o) => o.id !== id),
              selected: record?.relations[rel.name] ?? [],
            }))}
          />
        </div>
      </div>

      {!isNew && (
        <aside className="space-y-8">
          {r.hasWorkflow && status && (
            <section className="border border-rule p-4">
              <h2 className="label-caps text-muted">Publication</h2>
              <p className="mt-2 font-display text-3xl">{publicationLabels[status]}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {allowedTransitions(status, user.role).map((to) => (
                  <form key={to} action={transitionAction}>
                    <input type="hidden" name="_resource" value={r.key} />
                    <input type="hidden" name="_id" value={id} />
                    <input type="hidden" name="to" value={to} />
                    <button className={`pill ${to === "published" ? "pill-solid" : ""}`}>→ {publicationLabels[to]}</button>
                  </form>
                ))}
              </div>
              {status !== "published" && <p className="label mt-3 text-muted">Not visible on the public site.</p>}
              {publicPath && status === "published" && (
                <Link href={publicPath} className="label mt-3 inline-block underline">
                  View public page
                </Link>
              )}
            </section>
          )}
          {similar.length > 0 && (
            <section className="border border-vermilion/60 p-4">
              <h2 className="label-caps text-vermilion">Similar records</h2>
              <ul className="label mt-2 space-y-1">
                {similar.map((x) => (
                  <li key={x.id}>
                    <Link href={`/admin/${r.key}/${x.id}`} className="underline">
                      {x.title}
                    </Link>{" "}
                    <span className="text-muted">{x.score.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {user.role === "admin" && (
            <details className="border border-rule p-4">
              <summary className="label-caps cursor-pointer text-muted">Delete permanently</summary>
              <form action={deleteAction} className="mt-3 space-y-2">
                <input type="hidden" name="_resource" value={r.key} />
                <input type="hidden" name="_id" value={id} />
                <p className="label text-muted">Prefer “Withdrawn” to keep the research. Type delete to confirm.</p>
                <input name="confirm" className="input" autoComplete="off" />
                <button className="pill">Delete</button>
              </form>
            </details>
          )}
        </aside>
      )}
    </div>
  );
}
