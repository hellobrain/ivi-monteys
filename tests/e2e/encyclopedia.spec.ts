import { expect, test } from "@playwright/test";

test("search and filters narrow the animal index", async ({ page }) => {
  await page.goto("/animals");
  await page.getByLabel("Name or keyword").fill("castor");
  await page.getByRole("button", { name: "Apply" }).click();
  await expect(page.getByRole("link", { name: /Beaver/ })).toBeVisible();
  await expect(page.getByText("1 creature match")).toBeVisible();

  await page.goto("/animals?group=fantastic");
  await expect(page.getByRole("link", { name: /Unicorn/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /^Lion/ })).toHaveCount(0);
});

test("an animal entry separates layers, cites sources and flags provisional content", async ({ page }) => {
  await page.goto("/animals/lion");
  await expect(page.getByRole("heading", { level: 1, name: "Lion" })).toBeVisible();
  await expect(page.getByRole("note")).toContainText("Provisional");
  await expect(page.getByRole("heading", { name: "Evidence" })).toBeVisible();
  await expect(page.getByText("Bestiary allegory").first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Isidore of Seville, Etymologiae/ }).first()).toBeVisible();
  await expect(page.getByText("Citation needed").first()).toBeVisible();
});

test("unpublished records never appear publicly", async ({ page }) => {
  await page.goto("/symbols/redemption");
  await expect(page.getByRole("heading", { name: "Not in this book" })).toBeVisible();
  await page.goto("/symbols");
  await expect(page.getByRole("link", { name: /Redemption/ })).toHaveCount(0);
});

test("optional exercise is graded on the server", async ({ page }) => {
  await page.goto("/learn/how-to-read-a-bestiary/how-to-read-a-beast");
  const groups = page.locator("fieldset");
  const n = await groups.count();
  for (let i = 0; i < n; i++) await groups.nth(i).locator("input[type=radio]").first().check();
  await page.getByRole("button", { name: "Check answers" }).click();
  await expect(page.getByText(/4 of 4 correct/)).toBeVisible();
});
