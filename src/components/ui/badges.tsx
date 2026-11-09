import { evidenceLabels, layerLabels, type EvidenceStatus, type KnowledgeLayer, type ResearchStatus } from "@/domain/editorial";

const evidenceTone: Record<EvidenceStatus, string> = {
  attested: "border-paper text-paper",
  supported: "border-moss text-moss",
  plausible: "border-stone text-stone",
  disputed: "border-vermilion text-vermilion",
  unverified: "border-dashed border-stone text-stone",
};

export function EvidenceBadge({ status }: { status: EvidenceStatus }) {
  const info = evidenceLabels[status];
  return (
    <span
      className={`inline-flex items-center border px-2 py-0.5 font-ui text-[0.75rem] uppercase leading-tight tracking-wide ${evidenceTone[status]}`}
      title={info.description}
    >
      <span className="sr-only">Evidence: </span>
      {info.label}
    </span>
  );
}

export function LayerBadge({ layer }: { layer: KnowledgeLayer }) {
  return (
    <span className="inline-flex items-center bg-graphite px-2 py-0.5 font-ui text-[0.75rem] uppercase leading-tight tracking-wide text-paper">
      <span className="sr-only">Layer: </span>
      {layerLabels[layer].label}
    </span>
  );
}

export function ProvisionalNotice({ status, kind = "entry" }: { status: ResearchStatus; kind?: string }) {
  if (status === "verified") return null;
  return (
    <aside role="note" className="border border-vermilion/60 px-4 py-3 font-ui text-[0.95rem] text-paper">
      <strong className="mr-2 font-normal uppercase text-vermilion">{status === "stub" ? "Stub" : "Provisional"}</strong>
      This {kind} was drafted from standard editions and modern scholarship and has not yet been reviewed by a specialist against the
      primary sources. Evidence labels show how firm each statement is.
    </aside>
  );
}
