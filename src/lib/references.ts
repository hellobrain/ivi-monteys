/**
 * Internal reference tokens used in editorial Markdown:
 *   [[animal:lion|the lion]] → [the lion](/animals/lion)
 * Unknown kinds are left as plain text so authors notice them.
 */
export const referenceKinds = {
  animal: (s: string) => `/animals/${s}`,
  legend: (s: string) => `/legends/${s}`,
  symbol: (s: string) => `/symbols/${s}`,
  manuscript: (s: string) => `/atlas/manuscripts/${s}`,
  artwork: (s: string) => `/atlas/artworks/${s}`,
  comparison: (s: string) => `/atlas/compare/${s}`,
  source: (s: string) => `/library/sources#${s}`,
  bib: (s: string) => `/library/bibliography#${s}`,
  glossary: (s: string) => `/library/glossary#${s}`,
} as const;

export type ReferenceKind = keyof typeof referenceKinds;

const TOKEN = /\[\[([a-z]+):([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g;

export function expandReferences(markdown: string): string {
  return markdown.replace(TOKEN, (whole, kind: string, slug: string, label?: string) => {
    const make = (referenceKinds as Record<string, (s: string) => string>)[kind];
    const text = (label ?? slug).replace(/[[\]]/g, "");
    if (!make) return text;
    return `[${text}](${make(slug)})`;
  });
}

export function extractReferences(markdown: string): { kind: string; slug: string }[] {
  return [...markdown.matchAll(TOKEN)].map((m) => ({ kind: m[1], slug: m[2] }));
}
