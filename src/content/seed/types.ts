/**
 * Seed content format. Historical content lives here as plain data, separate
 * from presentation. References between records use slugs; the seed script
 * resolves them to database ids.
 */
import type { EvidenceStatus, KnowledgeLayer, PublicationStatus, ResearchStatus } from "@/domain/editorial";

export type Cite =
  | { source: string; locator?: string; passage?: string; note?: string }
  | { bib: string; locator?: string; note?: string }
  | { manuscript: string; locator?: string; note?: string };

export interface SeedClaim {
  key: string;
  text: string;
  layer: KnowledgeLayer;
  evidence: EvidenceStatus;
  cites?: Cite[];
}

export interface SeedInterpretation {
  layer: KnowledgeLayer;
  tradition?: string;
  symbol?: string;
  interpretation: string;
  context?: string;
  evidence: EvidenceStatus;
  claims?: SeedClaim[];
}

export interface SeedAnimal {
  slug: string;
  canonicalName: string;
  latinName?: string;
  greekName?: string;
  group: string;
  modernIdentification?: string;
  scientificName?: string;
  identificationUncertainty?: EvidenceStatus;
  identificationNote?: string;
  medievalClassification?: string;
  summary: string;
  description: string;
  iconographicAttributes: string[];
  traditions: string[];
  names?: { name: string; kind: "alternative" | "latin" | "greek" | "vernacular" | "hebrew" | "other"; language?: string; note?: string }[];
  symbols?: { slug: string; evidence: EvidenceStatus; note?: string }[];
  related?: string[];
  claims: SeedClaim[];
  interpretations?: SeedInterpretation[];
  publication?: PublicationStatus;
  research?: ResearchStatus;
}

export interface SeedLegend {
  slug: string;
  title: string;
  animals: string[];
  summary: string;
  narrative: string;
  transmission?: string;
  evidence: EvidenceStatus;
  sources: { source: string; locator?: string }[];
  symbols?: string[];
  variants?: { title: string; description: string; source?: string; evidence: EvidenceStatus }[];
  interpretations?: SeedInterpretation[];
  claims?: SeedClaim[];
}
