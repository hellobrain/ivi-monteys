import { describe, expect, it } from "vitest";
import { iiifImageUrl, iiifThumbnailUrl, parseManifest } from "@/lib/iiif";

describe("IIIF helpers", () => {
  it("builds Image API URLs", () => {
    expect(iiifImageUrl("https://example.org/iiif/abc/info.json")).toBe("https://example.org/iiif/abc/full/max/0/default.jpg");
    expect(iiifThumbnailUrl("https://example.org/iiif/abc/", 400)).toBe("https://example.org/iiif/abc/full/400,/0/default.jpg");
  });

  it("parses Presentation 3 manifests", () => {
    const m = {
      label: { en: ["Bestiary"] },
      items: [{ id: "c1", label: { none: ["1r"] }, width: 10, height: 20, items: [{ items: [{ body: { service: [{ id: "https://example.org/iiif/p1" }] } }] }] }],
    };
    expect(parseManifest(m)).toEqual({ label: "Bestiary", canvases: [{ id: "c1", label: "1r", imageService: "https://example.org/iiif/p1", width: 10, height: 20 }] });
  });

  it("parses Presentation 2 manifests", () => {
    const m = { label: "Old", sequences: [{ canvases: [{ "@id": "c1", label: "1v", images: [{ resource: { service: { "@id": "https://example.org/s" } } }] }] }] };
    expect(parseManifest(m).canvases[0]).toMatchObject({ id: "c1", label: "1v", imageService: "https://example.org/s" });
  });
});
