import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page, email: string, password: string, next = "/account") {
  await page.goto(`/account/sign-in?next=${encodeURIComponent(next)}`);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(`**${next}`);
}

test("a reader registers, bookmarks a creature and completes a lesson", async ({ page }) => {
  const email = `reader-${Date.now()}@example.org`;
  await page.goto("/account/register");
  await page.getByLabel("Name").fill("Test Reader");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel(/Password/).fill("a-long-password-1");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText("Signed in as Test Reader")).toBeVisible();

  await page.goto("/animals/beaver");
  await page.getByRole("button", { name: "Bookmark" }).click();
  await expect(page.getByRole("button", { name: "Bookmarked" })).toBeVisible();

  await page.goto("/learn/foundations/what-is-a-bestiary");
  await page.getByRole("button", { name: "Mark lesson complete" }).click();
  await expect(page.getByText("Completed")).toBeVisible();

  await page.goto("/account");
  await expect(page.getByRole("link", { name: "Beaver" })).toBeVisible();
  await expect(page.getByText(/1 of 1 lessons · block complete/)).toBeVisible();

  // Readers cannot reach the editorial desk.
  await page.goto("/admin");
  await expect(page).toHaveURL(/error=forbidden/);
});

test("anonymous visitors are sent to sign in from /admin", async ({ page }) => {
  await page.goto("/admin/animals");
  await expect(page).toHaveURL(/\/account\/sign-in\?next=%2Fadmin%2Fanimals/);
});

test("editorial workflow: editor drafts and reviews, only admin publishes", async ({ browser }) => {
  const slug = `test-beast-${Date.now()}`;
  const editor = await browser.newPage();
  await signIn(editor, "editor@example.org", "local-editor-pass-123", "/admin");
  await editor.goto("/admin/animals/new");
  await editor.getByLabel("Canonical name *").fill("Test beast");
  await editor.getByLabel("Slug *").fill(slug);
  await editor.getByLabel("Summary").fill("A record created by the end-to-end test.");
  await editor.getByRole("button", { name: "Create draft" }).click();
  await expect(editor.getByText("Created as a draft.")).toBeVisible();
  const editUrl = editor.url();

  // Not public while in draft.
  await editor.goto(`/animals/${slug}`);
  await expect(editor.getByRole("heading", { name: "Not in this book" })).toBeVisible();

  await editor.goto(editUrl);
  await editor.getByRole("button", { name: "→ Researching" }).click();
  await expect(editor.getByRole("button", { name: "→ Reviewed" })).toBeVisible();
  await editor.getByRole("button", { name: "→ Reviewed" }).click();
  await expect(editor.getByRole("button", { name: "→ Researching" })).toBeVisible();
  await expect(editor.getByRole("button", { name: "→ Published" })).toHaveCount(0);

  const admin = await browser.newPage();
  await signIn(admin, "admin@example.org", "local-admin-pass-123", "/admin");
  await admin.goto(editUrl);
  await admin.getByRole("button", { name: "→ Published" }).click();
  await expect(admin.getByRole("link", { name: "View public page" })).toBeVisible();
  await admin.goto(`/animals/${slug}`);
  await expect(admin.getByRole("heading", { level: 1, name: "Test beast" })).toBeVisible();

  // Withdraw without deleting; it disappears from the public site again.
  await admin.goto(editUrl);
  await admin.getByRole("button", { name: "→ Withdrawn" }).click();
  await expect(admin.getByText("Not visible on the public site.")).toBeVisible();
  await admin.goto(`/animals/${slug}`);
  await expect(admin.getByRole("heading", { name: "Not in this book" })).toBeVisible();

  // Clean up.
  await admin.goto(editUrl);
  await admin.getByText("Delete permanently").click();
  await admin.locator("input[name=confirm]").fill("delete");
  await admin.getByRole("button", { name: "Delete" }).click();
  await expect(admin).toHaveURL(/\/admin\/animals$/);
});
