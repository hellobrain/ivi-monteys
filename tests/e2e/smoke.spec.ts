import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const pages = ["/", "/animals", "/animals/lion", "/symbols/christ", "/learn", "/learn/how-to-read-a-bestiary/how-to-read-a-beast", "/atlas", "/atlas/compare/the-lion-four-ways", "/library/sources", "/search?q=castor"];

test("homepage shows the Big Letter composition with live lessons and comparison", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Feral Folio");
  await expect(page.getByRole("link", { name: /How to read a beast/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "One beast, many hands" })).toBeVisible();
  await expect(page.getByText("Hand A")).toBeVisible();
  await page.getByRole("link", { name: /How to read a beast/ }).click();
  await expect(page).toHaveURL(/\/learn\/how-to-read-a-bestiary\/how-to-read-a-beast/);
});

for (const path of pages) {
  test(`no serious accessibility violations on ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator("h1").first()).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious.map((v) => `${v.id}: ${v.nodes.length} nodes`)).toEqual([]);
  });
}
