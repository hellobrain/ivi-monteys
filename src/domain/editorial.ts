/**
 * Editorial vocabulary and workflow rules. Pure functions only, so they can be
 * shared by the CMS, the public site and the tests.
 */

export const PUBLICATION_STATUSES = ["draft", "researching", "reviewed", "published", "withdrawn"] as const;
export type PublicationStatus = (typeof PUBLICATION_STATUSES)[number];

export const RESEARCH_STATUSES = ["stub", "provisional", "verified"] as const;
export type ResearchStatus = (typeof RESEARCH_STATUSES)[number];

export const EVIDENCE_STATUSES = ["attested", "supported", "plausible", "disputed", "unverified"] as const;
export type EvidenceStatus = (typeof EVIDENCE_STATUSES)[number];

export const KNOWLEDGE_LAYERS = [
  "modern_zoology",
  "medieval_description",
  "legend",
  "bestiary_allegory",
  "religious_symbolism",
  "classical_mythology",
  "modern_scholarship",
  "uncertain_connection",
] as const;
export type KnowledgeLayer = (typeof KNOWLEDGE_LAYERS)[number];

export const ROLES = ["reader", "editor", "admin"] as const;
export type Role = (typeof ROLES)[number];

export const publicationLabels: Record<PublicationStatus, string> = {
  draft: "Draft",
  researching: "Researching",
  reviewed: "Reviewed",
  published: "Published",
  withdrawn: "Withdrawn",
};

export const researchLabels: Record<ResearchStatus, string> = {
  stub: "Stub",
  provisional: "Provisional",
  verified: "Verified",
};

export const evidenceLabels: Record<EvidenceStatus, { label: string; description: string }> = {
  attested: {
    label: "Attested",
    description: "Stated directly in a named primary source or surviving object.",
  },
  supported: {
    label: "Supported by scholarship",
    description: "Established in published modern scholarship, not yet checked against the primary text here.",
  },
  plausible: {
    label: "Plausible",
    description: "A reasonable inference from the evidence, but not directly documented.",
  },
  disputed: {
    label: "Disputed",
    description: "Scholars disagree; competing readings are recorded alongside.",
  },
  unverified: {
    label: "Unverified",
    description: "Recorded for research purposes; no source has yet been checked.",
  },
};

export const layerLabels: Record<KnowledgeLayer, { label: string; short: string }> = {
  modern_zoology: { label: "Modern zoology", short: "Zoology" },
  medieval_description: { label: "Medieval description", short: "Medieval account" },
  legend: { label: "Legend", short: "Legend" },
  bestiary_allegory: { label: "Bestiary allegory", short: "Allegory" },
  religious_symbolism: { label: "Wider religious symbolism", short: "Religious symbolism" },
  classical_mythology: { label: "Classical & pagan mythology", short: "Mythology" },
  modern_scholarship: { label: "Modern scholarly interpretation", short: "Scholarship" },
  uncertain_connection: { label: "Uncertain connection", short: "Uncertain" },
};

/**
 * Allowed workflow transitions. Editors move work through research and
 * review; only admins publish or withdraw. Withdrawn work can be reopened.
 */
const transitions: Record<PublicationStatus, Partial<Record<PublicationStatus, Role>>> = {
  draft: { researching: "editor" },
  researching: { draft: "editor", reviewed: "editor" },
  reviewed: { researching: "editor", published: "admin" },
  published: { withdrawn: "admin", reviewed: "admin" },
  withdrawn: { draft: "editor", reviewed: "admin", published: "admin" },
};

const roleRank: Record<Role, number> = { reader: 0, editor: 1, admin: 2 };

export function hasRole(actual: Role, required: Role): boolean {
  return roleRank[actual] >= roleRank[required];
}

export function canTransition(from: PublicationStatus, to: PublicationStatus, role: Role): boolean {
  if (from === to) return hasRole(role, "editor");
  const required = transitions[from][to];
  return required !== undefined && hasRole(role, required);
}

export function allowedTransitions(from: PublicationStatus, role: Role): PublicationStatus[] {
  return PUBLICATION_STATUSES.filter((to) => to !== from && canTransition(from, to, role));
}

/** Only published records may ever be served to the public site. */
export function isPublic(status: PublicationStatus): boolean {
  return status === "published";
}
