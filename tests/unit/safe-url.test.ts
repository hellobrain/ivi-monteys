import { describe, expect, it } from "vitest";
import { isAllowedImageUrl, isSafeExternalUrl, safeRedirectPath } from "@/lib/safe-url";

describe("URL safety", () => {
  it("accepts only http(s) external links", () => {
    expect(isSafeExternalUrl("https://www.abdn.ac.uk/bestiary/")).toBe(true);
    expect(isSafeExternalUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeExternalUrl("data:text/html,hi")).toBe(false);
    expect(isSafeExternalUrl("https://user:pw@example.org")).toBe(false);
  });

  it("allows images only from local paths or allow-listed https hosts", () => {
    const allow = ["iiif.bodleian.ox.ac.uk"];
    expect(isAllowedImageUrl("/art/procession.png", allow)).toBe(true);
    expect(isAllowedImageUrl("https://iiif.bodleian.ox.ac.uk/iiif/image/x/full/max/0/default.jpg", allow)).toBe(true);
    expect(isAllowedImageUrl("http://iiif.bodleian.ox.ac.uk/x.jpg", allow)).toBe(false);
    expect(isAllowedImageUrl("https://evil.example/x.jpg", allow)).toBe(false);
    expect(isAllowedImageUrl("//evil.example/x.jpg", allow)).toBe(false);
  });

  it("keeps post-login redirects on this site", () => {
    expect(safeRedirectPath("/learn")).toBe("/learn");
    expect(safeRedirectPath("https://evil.example")).toBe("/account");
    expect(safeRedirectPath("//evil.example")).toBe("/account");
    expect(safeRedirectPath("/\\evil.example")).toBe("/account");
  });
});
