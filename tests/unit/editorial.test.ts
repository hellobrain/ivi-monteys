import { describe, expect, it } from "vitest";
import { allowedTransitions, canTransition, hasRole, isPublic } from "@/domain/editorial";

describe("editorial workflow", () => {
  it("only published content is public", () => {
    expect(isPublic("published")).toBe(true);
    for (const s of ["draft", "researching", "reviewed", "withdrawn"] as const) expect(isPublic(s)).toBe(false);
  });

  it("editors move work through research and review but cannot publish", () => {
    expect(canTransition("draft", "researching", "editor")).toBe(true);
    expect(canTransition("researching", "reviewed", "editor")).toBe(true);
    expect(canTransition("reviewed", "published", "editor")).toBe(false);
    expect(canTransition("published", "withdrawn", "editor")).toBe(false);
  });

  it("admins publish and withdraw; nobody skips review", () => {
    expect(canTransition("reviewed", "published", "admin")).toBe(true);
    expect(canTransition("published", "withdrawn", "admin")).toBe(true);
    expect(canTransition("draft", "published", "admin")).toBe(false);
    expect(canTransition("researching", "published", "admin")).toBe(false);
  });

  it("readers cannot change anything", () => {
    expect(allowedTransitions("draft", "reader")).toEqual([]);
    expect(hasRole("reader", "editor")).toBe(false);
    expect(hasRole("admin", "editor")).toBe(true);
  });
});
