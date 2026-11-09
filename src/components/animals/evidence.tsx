import Link from "next/link";
import { EvidenceBadge, LayerBadge } from "@/components/ui/badges";
import type { EvidenceStatus, KnowledgeLayer } from "@/domain/editorial";
import type { Citation } from "@/server/repo/public";

export interface ClaimView {
  id: string;
  key: string;
  text: string;
  layer: KnowledgeLayer;
  evidenceStatus: EvidenceStatus;
  citations: Citation[];
}

/** Claim-level evidence. Claims without a citation are flagged, never hidden. */
export function ClaimList({ claims }: { claims: ClaimView[] }) {
  return (
    <ol className="space-y-0">
      {claims.map((c) => (
        <li key={c.id} id={`claim-${c.key}`} className="grid gap-3 border-b border-rule py-5 md:grid-cols-[1fr_minmax(0,22rem)] md:gap-10">
          <div>
            <p className="text-[1.0625rem] leading-snug">{c.text}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <LayerBadge layer={c.layer} />
              <EvidenceBadge status={c.evidenceStatus} />
            </div>
          </div>
          <div className="label">
            {c.citations.length === 0 ? (
              <span className="text-vermilion">Citation needed</span>
            ) : (
              <ul className="space-y-1.5">
                {c.citations.map((ci, i) => (
                  <li key={i}>
                    <Link href={ci.href} className="underline decoration-rule hover:decoration-vermilion">
                      {ci.label}
                    </Link>
                    {ci.locator && <span className="text-muted">, {ci.locator}</span>}
                    {ci.note && <span className="block text-muted">{ci.note}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function InterpretationList({
  items,
}: {
  items: { id?: string; layer: KnowledgeLayer; interpretation: string; historicalContext?: string | null; evidenceStatus: EvidenceStatus; traditionName?: string | null; symbolSlug?: string | null; symbolConcept?: string | null; animalSlug?: string | null; animalName?: string | null }[];
}) {
  return (
    <ul className="grid border-l border-t border-rule md:grid-cols-2">
      {items.map((it, i) => (
        <li key={it.id ?? i} className="border-b border-r border-rule p-6">
          <div className="flex flex-wrap gap-2">
            <LayerBadge layer={it.layer} />
            <EvidenceBadge status={it.evidenceStatus} />
          </div>
          <p className="mt-4 text-[1.0625rem] leading-snug">{it.interpretation}</p>
          <p className="label mt-4 text-muted">
            {[it.traditionName, it.historicalContext].filter(Boolean).join(" · ")}
            {it.symbolSlug && (
              <>
                {" "}
                · theme:{" "}
                <Link href={`/symbols/${it.symbolSlug}`} className="underline">
                  {it.symbolConcept}
                </Link>
              </>
            )}
            {it.animalSlug && (
              <>
                {" "}
                ·{" "}
                <Link href={`/animals/${it.animalSlug}`} className="underline">
                  {it.animalName}
                </Link>
              </>
            )}
          </p>
        </li>
      ))}
    </ul>
  );
}
