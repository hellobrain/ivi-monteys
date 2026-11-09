import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { hashToken, newSessionToken } from "@/server/auth/tokens";
import { parseFields } from "@/server/admin/service";
import { getResource } from "@/server/admin/resources";

describe("passwords and session tokens", () => {
  it("hashes and verifies passwords with scrypt", async () => {
    const h = await hashPassword("correct horse battery");
    expect(h.startsWith("scrypt$")).toBe(true);
    expect(await verifyPassword("correct horse battery", h)).toBe(true);
    expect(await verifyPassword("wrong", h)).toBe(false);
  });

  it("stores only a hash of the session token", () => {
    const t = newSessionToken();
    expect(t.length).toBeGreaterThanOrEqual(43);
    expect(hashToken(t)).toMatch(/^[0-9a-f]{64}$/);
    expect(hashToken(t)).not.toContain(t);
  });
});

describe("CMS form parsing", () => {
  const animals = getResource("animals")!;
  const form = (o: Record<string, string>) => {
    const f = new FormData();
    for (const [k, v] of Object.entries(o)) f.set(k, v);
    return f;
  };

  it("validates required fields, slugs, selects and URLs", () => {
    const { errors } = parseFields(animals.fields, form({ canonicalName: "", slug: "Bad Slug", identificationUncertainty: "certain" }));
    expect(errors.canonicalName).toBe("Required.");
    expect(errors.slug).toMatch(/lowercase/);
    expect(errors.identificationUncertainty).toMatch(/options/);
    const ms = getResource("manuscripts")!;
    expect(parseFields(ms.fields, form({ catalogueUrl: "javascript:alert(1)" })).errors.catalogueUrl).toBeDefined();
  });

  it("never lets publication status through the form", () => {
    const { values } = parseFields(animals.fields, form({ canonicalName: "X", slug: "x", publicationStatus: "published" }));
    expect(values).not.toHaveProperty("publicationStatus");
  });

  it("splits tags by line", () => {
    const { values } = parseFields(animals.fields, form({ canonicalName: "X", slug: "x", iconographicAttributes: "Mane\n\n Tail \n" }));
    expect(values.iconographicAttributes).toEqual(["Mane", "Tail"]);
  });
});
