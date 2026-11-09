import type { Metadata } from "next";
import Link from "next/link";
import { resources } from "@/server/admin/resources";

export const metadata: Metadata = { title: "Editorial desk", robots: { index: false, follow: false } };

const groups = ["Research", "Objects", "Curriculum", "Library", "People"] as const;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-shell mt-10 grid gap-10 lg:grid-cols-[220px_1fr]">
      <nav aria-label="Editorial desk" className="label space-y-6">
        <Link href="/admin" className="block font-display text-2xl">
          Editorial desk
        </Link>
        {groups.map((g) => (
          <div key={g}>
            <p className="label-caps text-muted">{g}</p>
            <ul className="mt-1 space-y-0.5">
              {resources
                .filter((r) => r.group === g)
                .map((r) => (
                  <li key={r.key}>
                    <Link href={`/admin/${r.key}`} className="hover:text-vermilion">
                      {r.label}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </nav>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
