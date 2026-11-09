import Link from "next/link";
import { Suspense } from "react";
import { getDb } from "@/db/client";
import { PUBLICATION_STATUSES, publicationLabels } from "@/domain/editorial";
import { requireRole } from "@/server/auth/dal";
import { dashboard, findDuplicateAnimals } from "@/server/admin/service";

export default function AdminHome() {
  return (
    <Suspense fallback={<p className="label text-muted">Loading…</p>}>
      <Dashboard />
    </Suspense>
  );
}

async function Dashboard() {
  const user = await requireRole("editor");
  const db = getDb();
  const [d, dupes] = await Promise.all([dashboard(db), findDuplicateAnimals(db)]);
  const resources = [...new Set(d.workflow.map((w) => w.resource))];
  return (
    <div className="space-y-14">
      <header>
        <h1 className="display text-[4rem]">Editorial desk</h1>
        <p className="label text-muted">
          Signed in as {user.displayName} ({user.role}). Editors move records through research and review; admins publish and withdraw.
        </p>
      </header>

      <section>
        <h2 className="label-caps text-muted">Workflow</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] label">
            <thead>
              <tr className="border-b border-rule text-left text-muted">
                <th className="py-2 font-normal">Records</th>
                {PUBLICATION_STATUSES.map((s) => (
                  <th key={s} className="py-2 font-normal">
                    {publicationLabels[s]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {resources.map((r) => (
                <tr key={r} className="border-b border-rule">
                  <td className="py-2">
                    <Link href={`/admin/${r}`} className="underline">
                      {r}
                    </Link>
                  </td>
                  {PUBLICATION_STATUSES.map((s) => {
                    const n = d.workflow.find((w) => w.resource === r && w.status === s)?.n ?? 0;
                    return (
                      <td key={s} className="py-2">
                        {n ? (
                          <Link href={`/admin/${r}?status=${s}`} className="underline">
                            {n}
                          </Link>
                        ) : (
                          <span className="text-muted">0</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <Link href="/admin/claims" className="border border-rule p-5 hover:border-paper">
          <p className="display text-[3rem]">{d.uncitedClaims}</p>
          <p className="label">claims without any citation</p>
        </Link>
        <Link href="/admin/claims" className="border border-rule p-5 hover:border-paper">
          <p className="display text-[3rem]">{d.unreviewedClaims}</p>
          <p className="label">claims awaiting editorial review</p>
        </Link>
      </section>

      <section>
        <h2 className="label-caps text-muted">Possible duplicate animals</h2>
        {dupes.length ? (
          <ul className="mt-3 label">
            {dupes.map((x, i) => (
              <li key={i} className="border-b border-rule py-2">
                <Link href={`/admin/animals/${x.a}`} className="underline">
                  {x.a_name}
                </Link>{" "}
                ↔{" "}
                <Link href={`/admin/animals/${x.b}`} className="underline">
                  {x.b_name}
                </Link>{" "}
                <span className="text-muted">
                  ({x.via}, similarity {x.score.toFixed(2)})
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="label mt-3 text-muted">None found.</p>
        )}
      </section>

      <section>
        <h2 className="label-caps text-muted">Recent changes</h2>
        <ul className="mt-3 label">
          {d.recent.map((a, i) => (
            <li key={i} className="border-b border-rule py-2">
              {a.who ?? "—"} · {a.action} · {a.entityType}{" "}
              {a.entityId && (
                <Link href={`/admin/${a.entityType}/${a.entityId}`} className="underline">
                  open
                </Link>
              )}{" "}
              <span className="text-muted">{a.createdAt.toISOString().slice(0, 16).replace("T", " ")}</span>
            </li>
          ))}
          {d.recent.length === 0 && <li className="text-muted">No edits yet.</li>}
        </ul>
      </section>
    </div>
  );
}
