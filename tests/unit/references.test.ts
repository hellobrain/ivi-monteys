import { describe, expect, it } from "vitest";
import { expandReferences, extractReferences } from "@/lib/references";

describe("reference tokens", () => {
  it("expands known kinds to internal links", () => {
    expect(expandReferences("See [[animal:lion|the lion]].")).toBe("See [the lion](/animals/lion).");
    expect(expandReferences("[[source:pliny-natural-history|Pliny]]")).toBe("[Pliny](/library/sources#pliny-natural-history)");
    expect(expandReferences("[[comparison:the-lion-four-ways]]")).toBe("[the-lion-four-ways](/atlas/compare/the-lion-four-ways)");
  });

  it("leaves unknown kinds as plain text instead of inventing a link", () => {
    expect(expandReferences("[[folio:7r|fol. 7r]]")).toBe("fol. 7r");
  });

  it("extracts references for link checking", () => {
    expect(extractReferences("[[animal:lion|x]] and [[bib:clark-2006|y]]")).toEqual([
      { kind: "animal", slug: "lion" },
      { kind: "bib", slug: "clark-2006" },
    ]);
  });
});
